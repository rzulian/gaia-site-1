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
    nbPlayers: {
      type: Number,
      default: 2,
      enum: [2, 3, 4]
    },
    unlisted: Boolean,
    timePerMove: {
      type: Number,
      default: 7 * 24 * 3600,
      enum: [15 * 60, 12 * 3600, 24 * 3600, 48 * 3600, 7 * 24 * 3600]
    }
  }
}, {timestamps: true, collation: { locale: 'en', strength: 2 }, toJSON: {transform: (doc, ret) => {
  // No need to load all game data in most cases
  if (ret.data) {
    ret.data = _.pick(ret.data, ["round", "phase", "players.faction"]);
  }
  return ret;
}} });

// To sort games by last played
gameSchema.index('updatedAt');

gameSchema.static("findWithPlayer", function(this: GameModel, playerId: ObjectId) {
  return this.find({players: playerId}).sort('-updatedAt');
});

gameSchema.static("basics", () => {
  return ["players", "currentPlayer", "options.nbPlayers", "active", "creator", "data.round", "data.phase"];
});

gameSchema.method("join", async function(this: Game, player: ObjectId) {
  // Prevent multiple joins being executed at the same time
  const free = await locks.lock(this._id, "join-game");

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
        _.shuffle(game.players);
      }

      const engine = new Engine([`init ${game.options.nbPlayers} ${game._id}`]);
      engine.generateAvailableCommands();

      game.data = JSON.parse(JSON.stringify(engine));

      for (let i = 0; i < game.data.players.length; i++) {
        game.data.players[i].name = (await User.findById(game.players[i], "account.username")).account.username;
        game.data.players[i].auth = game.players[i].toHexString();
      }

      game.setCurrentPlayer(game.players[0]);
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

gameSchema.method("move", async function(this: Game, move: string, auth: string) {
  // Prevent multiple moves being executed at the same time
  const free = await locks.lock(this._id, "move-game");

  try {
    // Once inside the lock, refresh the game
    const game = await Game.findById(this._id);
    const gameData = game.data;

    assert(game.players.length === game.options.nbPlayers, "Wait for everybody to join");
    assert(gameData.availableCommands.length > 0 && gameData.players[gameData.availableCommands[0].player].auth === auth, "It's the turn of " + gameData.players[gameData.availableCommands[0].player].name);

    const engine = Engine.fromData(gameData);

    const oldRound = engine.round;

    engine.move(move);
    if (!engine.availableCommands) {
      engine.generateAvailableCommands();
    }

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
  while (this.active && engine.player(engine.playerToMove).dropped) {
    const oldRound = engine.round;

    engine.autoPass();

    this.afterMove(engine, oldRound);
  }
});

gameSchema.method('setCurrentPlayer', function(this: Game, player: ObjectId) {
  if (this.currentPlayer && this.currentPlayer.equals(player)) {
    return;
  }
  this.currentPlayer = player;

  if (!this.options.timePerMove) {
    this.options.timePerMove = 7 * 24 * 3600;
  }

  if (this.currentPlayer) {
    this.nextMoveDeadline = new Date(Date.now() + this.options.timePerMove * 1000);
  } else {
    this.nextMoveDeadline = undefined;
  }
});

gameSchema.static('checkMoveDeadlines', async function(this: GameModel) {
  const gamesToCheck = await this.find({
    active: true,
    nextMoveDeadline: {$lt: new Date()}
  }).select("active nextMoveDeadline");

  for (const game of gamesToCheck) {
    game.checkMoveDeadline().catch(err => console.error(err));
  }
});

gameSchema.method('checkMoveDeadline', async function(this: Game) {
  // Prevent multiple moves being executed at the same time
  const free = await locks.lock(this._id, "move-game");

  try {
    // Once inside the lock, refresh the game
    const game = await Game.findById(this._id);

    if (!game.active || !game.nextMoveDeadline) {
      return;
    }

    if ((new Date()) <= game.nextMoveDeadline) {
      return;
    }

    const engine = Engine.fromData(game.data);

    const pl = engine.player(engine.playerToMove);
    pl.dropped = true;
    await ChatMessage.create({room: game.id, type: "system", data: {text: `${pl.name} dropped for inactivity`}});

    if (engine.round <= 0) {
      ChatMessage.create({room: game.id, type: "system", data: {text: "Game cancelled"}});
      game.active = false;
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

const Game = mongoose.model<Game, GameModel>('Game', gameSchema);
export default Game;

/* Check move deadlines every 10 seconds - only on one thread of the server */
import * as cluster from "cluster";
if (cluster.isMaster) {
  setInterval(() => Game.checkMoveDeadlines(), 10000);
}
