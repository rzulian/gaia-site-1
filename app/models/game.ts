import * as mongoose from 'mongoose';
import { ObjectID, ObjectId } from 'bson';
import { Player } from '@gaia-project/engine';
const Schema = mongoose.Schema;

interface Game extends mongoose.Document {
  _id: string;

  /** Ids of the players in the website */
  players: ObjectID[];
  /** Game data */
  data: {
    players: Player[]
  };

  options: {
    randomPlayerOrder: boolean;
    nbPlayers: number;
  };

  active: boolean;

  updatedAt: Date;
  createdAt: Date;
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
}, {timestamps: true, collation: { locale: 'en', strength: 2 } });

gameSchema.static("findWithPlayer", function(this: GameModel, playerId: ObjectId) {
  return this.find({players: playerId});
});

export default mongoose.model<Game, GameModel>('Game', gameSchema);
