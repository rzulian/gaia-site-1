import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

const Schema = mongoose.Schema;

interface ChatDocument extends mongoose.Document {
  room: ObjectId;
  source: ObjectId;
  text: string;
  type: string;
}

const chatSchema = new Schema({
  room: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true
  },
  source: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    minlength: [1, "You can't send empty messages"],
    maxlength: [300, "You can't send messages too long"]
  },
  type: {
    type: String,
    required: true,
    default: "text",
    enum: ["text", "emoji"]
  }
}, {
  // We only keep 100MB of chat logs
  capped: 100 * 1024 * 1024
});

export default mongoose.model<ChatDocument>("chat", chatSchema);
