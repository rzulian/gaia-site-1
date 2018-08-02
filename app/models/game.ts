import locks from "mongo-locks";
import * as mongoose from 'mongoose';
import * as assert from 'assert';
import { ObjectId } from 'bson';
import { IAbstractGame } from 'lib/game';
import Engine from '@gaia-project/engine';
import * as _ from 'lodash';
import User from "./user";

const Schema = mongoose.Schema;

interface Game extends mongoose.Document, IAbstractGame<ObjectId> {
  _id: string;

  join(player: ObjectId): Promise<Game>;
  move(move: string, auth: string): Promise<Game>;
}

export { Game as GameDocument };

export interface GameModel extends mongoose.Model<Game> {
  findWithPlayer(playerId: ObjectId): mongoose.DocumentQuery<Game[], Game>;
}

const gameSchema = new Schema({
  _id: {
    type: String,
    trim: true,
    minlength: [2, "A game id must be at least 2 characters"],
    maxlength: [20, "A game id must be at most 20 characters"]
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
    }
  }
}, {timestamps: true, collation: { locale: 'en', strength: 2 }, toJSON: {transform: (doc, ret) => {
  // No need to load all game data in most cases
  delete ret.data;
  return ret;
}} });

gameSchema.static("findWithPlayer", function(this: GameModel, playerId: ObjectId) {
  return this.find({players: playerId});
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

    // If all the players have joined, we launch the game!
    if (game.players.length === game.options.nbPlayers) {
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
    }

    return await game.save();
  } finally {
    free();
  }
});

gameSchema.method("move", async function(this: Game, move: string, auth: string) {
  // Prevent multiple moves being executed at the same time
  const free = await locks.lock(this._id, "join-game");

  try {
    // Once inside the lock, refresh the game
    const game = await Game.findById(this._id);
    const gameData = game.data;

    assert(game.players.length === game.options.nbPlayers, "Wait for everybody to join");
    assert(gameData.availableCommands.length > 0 && gameData.players[gameData.availableCommands[0].player].auth === auth, "It's the turn of " + gameData.players[gameData.availableCommands[0].player].name);

    const engine = Engine.fromData(gameData);

    engine.move(move);
    if (!engine.availableCommands) {
      engine.generateAvailableCommands();
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

const Game = mongoose.model<Game, GameModel>('Game', gameSchema);
export default Game;
