import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

const Schema = mongoose.Schema;

export interface RoomMetaDataDocument extends mongoose.Document {
  room: string;
  user: ObjectId;
  notes: string;
  lastChatMessageViewed: Date;
}

const roomDataSchema = new Schema({
  room: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  lastChatMessageViewed: Date
});

roomDataSchema.index({room: 1, user: 1}, {unique: true});

export default mongoose.model<RoomMetaDataDocument>("RoomMetaData", roomDataSchema);
