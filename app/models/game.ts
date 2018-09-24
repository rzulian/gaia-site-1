import locks from "mongo-locks";
import * as mongoose from 'mongoose';
import * as assert from 'assert';
import { ObjectId } from 'bson';
import { IAbstractGame } from 'lib/game';
import Engine, { Phase } from '@gaia-project/engine';
import * as _ from 'lodash';
import User from "./user";
import { ChatMessage } from ".";

const Schema = mongoose.Schema;

interface Game extends mongoose.Document, IAbstractGame<ObjectId> {
  _id: string;

  join(player: ObjectId): Promise<Game>;
  unjoin(player: ObjectId): Promise<Game>;
  replay(): Promise<Game>;
  move(move: string, auth: string): Promise<Game>;
  setCurrentPlayer(player: ObjectId): void;
  checkMoveDeadline(): Promise<void>;
  /** Update current player, game status & next move deadline */
  afterMove(engine: Engine, oldRound: number);
  /** Handle dropped players' moves */
  autoMove(engine: Engine);
}

export { Game as GameDocument };

export interface GameModel extends mongoose.Model<Game> {
  findWithPlayer(playerId: ObjectId): mongoose.DocumentQuery<Game[], Game>;
  findWithPlayersTurn(playerId: ObjectId): mongoose.DocumentQuery<Game[], Game>;
  checkMoveDeadlines(): Promise<void>;

  /** Basics projection */
  basics(): string[];
}

const gameSchema = new Schema({
  _id: {
    type: String,
    trim: true,
    minlength: [2, "A game id must be at least 2 characters"],
    maxlength: [25, "A game id must be at most 25 characters"]
  },
  players: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    default: [],
    index: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    index: true
  },
  currentPlayer: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  nextMoveDeadline: {
    type: Date,
    sparse: true
  },
  lastMove: {
    type: Date,
    index: true
  },
  data: {},
  active: {
    type: Boolean,
    default: true
  },
  options: {
    randomPlayerOrder: {
      type: Boolean,
      default: true
    },
    advancedRules: {
      type: Boolean,
      default: false
    },
    nbPlayers: {
      type: Number,
      default: 2,
      enum: [2, 3, 4]
    },
    unlisted: Boolean,
    timePerMove: {
      type: Number,
      default: 15 * 60,
      min: 0,
      max: 12 * 3600
    },
    timePerGame: {
      type: Number,
      default: 15 * 24 * 3600,
      enum: [24 * 3600, 3 * 24 * 3600, 5 * 24 * 3600, 15 * 24 * 3600]
    }
  },
  // TODO: If another array is added, change players to {_id: playerId, remainingTime: number, ...}
  remainingTime: [Number]
}, {timestamps: true, collation: { locale: 'en', strength: 2 }, toJSON: {transform: (doc, ret) => {
  // No need to load all game data in most cases
  if (ret.data) {
    ret.data = _.pick(ret.data, ["round", "phase", "players.faction"]);
  }
  return ret;
}} });

gameSchema.static("findWithPlayer", function(this: GameModel, playerId: ObjectId) {
  return this.find({players: playerId}).sort('-lastMove');
});

gameSchema.static("findWithPlayersTurn", function(this: GameModel, playerId: ObjectId) {
  return this.find({players: playerId, active: true, currentPlayer: playerId}).sort('-lastMove');
});

gameSchema.static("basics", () => {
  return ["players", "currentPlayer", "options.nbPlayers", "active", "creator", "data.round", "data.phase"];
});

gameSchema.method("join", async function(this: Game, player: ObjectId) {
  // Prevent multiple joins being executed at the same time
  const free = await locks.lock("join-game", this._id);

  try {
    // Once inside the lock, refresh the game
    const game = await Game.findById(this._id);

    assert(game.active && game.players.length <= game.options.nbPlayers, "This game can't be joined");
    assert(!game.players.some(id => id.equals(player)), "Player already joined this game");

    game.players.push(player);

    const start = game.players.length === game.options.nbPlayers;

    // If all the players have joined, we launch the game!
    if (start) {
      if (game.options.randomPlayerOrder) {
        game.players = _.shuffle(game.players);
      }

      const engine = new Engine([`init ${game.options.nbPlayers} ${game._id}`], {advancedRules: !!game.options.advancedRules});
      engine.generateAvailableCommands();

      game.data = JSON.parse(JSON.stringify(engine));

      for (let i = 0; i < game.data.players.length; i++) {
        game.data.players[i].name = (await User.findById(game.players[i], "account.username")).account.username;
        game.data.players[i].auth = game.players[i].toHexString();
      }

      // TODO: remove OR condition when migration is over
      game.remainingTime = game.players.map(pl => game.options.timePerGame || 15 * 24 * 3600);

      game.setCurrentPlayer(new ObjectId(game.data.players[engine.playerToMove].auth));
    }

    await game.save();

    if (start) {
      ChatMessage.create({room: game.id, type: "system", data: {text: "Game started"}});
    }

    return game;
  } finally {
    free();
  }
});


gameSchema.method("unjoin", async function(this: Game, player: ObjectId) {
  // Prevent multiple joins being executed at the same time
  const free = await locks.lock("join-game", this._id);

  try {
    // Once inside the lock, refresh the game
    const game = await Game.findById(this._id);

    assert(game.active && game.players.length <= game.options.nbPlayers, "This game can't be joined");
    assert(game.players.some(id => id.equals(player)), "Player is not in this game");

    game.players = game.players.filter(id => !id.equals(player));
    await game.save();

    return game;
  } finally {
    free();
  }
});

gameSchema.method("move", async function(this: Game, move: string, auth: string) {
  // Prevent multiple moves being executed at the same time
  const free = await locks.lock("move-game", this._id);

  try {
    // Once inside the lock, refresh the game
    const game = await Game.findById(this._id);
    const gameData = game.data;

    assert(game.players.length === game.options.nbPlayers, "Wait for everybody to join");
    assert(gameData.availableCommands.length > 0 && gameData.players[gameData.availableCommands[0].player].auth === auth, "It's the turn of " + gameData.players[gameData.availableCommands[0].player].name);

    const engine = Engine.fromData(gameData);

    const oldRound = engine.round;

    engine.move(move);
    engine.generateAvailableCommandsIfNeeded();

    if (engine.newTurn) {
      game.afterMove(engine, oldRound);
      game.autoMove(engine);
    }

    game.data = JSON.parse(JSON.stringify(engine));

    if (engine.newTurn) {
      await game.save();
    }

    return game;
  } finally {
    free();
  }
});

gameSchema.method("replay", async function(this: Game) {
  // Prevent multiple moves being executed at the same time
  const free = await locks.lock("move-game", this._id);

  try {
    // Once inside the lock, refresh the game
    const game = await Game.findById(this._id);
    const gameData = game.data;

    assert(game.players.length === game.options.nbPlayers, "Wait for everybody to join");

    const engine = new Engine(gameData.moveHistory, gameData.options);

    engine.generateAvailableCommandsIfNeeded();

    assert(engine.newTurn, "Last move of the game is incomplete");

    game.afterMove(engine, engine.round);
    game.autoMove(engine);

    game.data = JSON.parse(JSON.stringify(engine));

    await game.save();

    return game;
  } finally {
    free();
  }
});

gameSchema.method('afterMove', function(this: Game, engine: Engine, oldRound: number) {
  if (engine.phase === Phase.EndGame) {
    this.active = false;
    this.setCurrentPlayer(null);

    ChatMessage.create({room: this.id, type: "system", data: {text: "Game ended"}});
  } else {
    this.setCurrentPlayer(new ObjectId(engine.player(engine.playerToMove).auth));

    if (engine.round > oldRound && engine.round > 0) {
      ChatMessage.create({room: this.id, type: "system", data: {text: "Round " + engine.round}});
    }
  }
});

gameSchema.method('autoMove', function(this: Game, engine: Engine) {
  let modified: boolean;
  do {
    modified = false;
    let oldRound = engine.round;

    while (this.active && engine.player(engine.playerToMove).dropped) {
      engine.autoPass();

      this.afterMove(engine, oldRound);
      modified = true;
      oldRound = engine.round;
    }

    oldRound = engine.round;

    while (engine.autoChargePower()) {
      this.afterMove(engine, oldRound);
      modified = true;
      oldRound = engine.round;
    }
  } while (modified);
});

gameSchema.method('setCurrentPlayer', function(this: Game, player: ObjectId) {
  if (this.currentPlayer && this.currentPlayer.equals(player)) {
    return;
  }

  // TODO: Remove when migration over
  if (!this.options.timePerMove) {
    this.options.timePerMove = 7 * 24 * 3600;
  }

  // TODO: Remove when migration over
  if (this.remainingTime.length === 0) {
    this.remainingTime = this.players.map(pl => (this.options.timePerGame || 15 * 24 * 3600));
  }

  if (this.currentPlayer && this.lastMove) {
    const diff = Math.floor((Date.now() - this.lastMove.getTime()) / 1000);
    const idx = this.players.findIndex(pl => pl.equals(this.currentPlayer));

    this.remainingTime[idx] = Math.min(this.options.timePerGame, this.remainingTime[idx] - diff + this.options.timePerMove);
    this.markModified('remainingTime');
  }

  this.currentPlayer = player;

  if (this.currentPlayer) {
    const idx = this.players.findIndex(pl => pl.equals(this.currentPlayer));
    this.nextMoveDeadline = new Date(Date.now() + this.remainingTime[idx] * 1000);
  } else {
    this.nextMoveDeadline = undefined;
  }
  this.lastMove = new Date();
});

gameSchema.static('checkMoveDeadlines', async function(this: GameModel) {
  try {
    const gamesToCheck = await this.find({
      active: true,
      nextMoveDeadline: {$lt: new Date()}
    }).select("active nextMoveDeadline");

    for (const game of gamesToCheck) {
      game.checkMoveDeadline().catch(err => console.error(err));
    }
  } catch (err) {
    console.error(err);
  }
});

gameSchema.method('checkMoveDeadline', async function(this: Game) {
  // Prevent multiple moves being executed at the same time
  const free = await locks.lock("move-game", this._id);

  try {
    // Once inside the lock, refresh the game
    const game = await Game.findById(this._id);

    if (!game.active || !game.nextMoveDeadline) {
      return;
    }

    if ((new Date()) <= game.nextMoveDeadline) {
      return;
    }

    console.log("move deadline expired for game", game.id);

    const engine = Engine.fromData(game.data);

    const pl = engine.player(engine.playerToMove);
    pl.dropped = true;
    await ChatMessage.create({room: game.id, type: "system", data: {text: `${pl.name} dropped for inactivity`}});

    if (engine.round <= 0) {
      ChatMessage.create({room: game.id, type: "system", data: {text: "Game cancelled"}});
      game.currentPlayer = undefined;
      game.active = false;
      engine.currentPlayer = undefined;
    } else {
      game.autoMove(engine);
    }

    game.data = JSON.parse(JSON.stringify(engine));
    await game.save();

    return game;
  } finally {
    free();
  }
});

gameSchema.pre("validate", async function(this: Game) {
  if (!this.options.timePerMove) {
    this.options.timePerMove = 15 * 60;
  } else if (this.options.timePerMove > 12 * 3600) {
    this.options.timePerMove = 12 * 3600;
  }

  if (!this.options.timePerGame) {
    this.options.timePerGame = 15 * 24 * 3600;
  }
});

gameSchema.post("save", async (game: Game) => {
  try {
    if (game.active && game.currentPlayer) {
      const user = await User.findById(game.currentPlayer);

      await user.updateGameNotification();
    }
  } catch (err) {
    console.error(err);
  }
});

const Game = mongoose.model<Game, GameModel>('Game', gameSchema);
export default Game;

/* Check move deadlines every 10 seconds - only on one thread of the server */
import * as cluster from "cluster";
if (cluster.isMaster) {
  setInterval(() => Game.checkMoveDeadlines(), 10000);
}
