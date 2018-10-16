import * as mongoose from 'mongoose';
import * as crypto from 'crypto';

export interface OAuthToken extends mongoose.Document {
  _id: string;
  client: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

const schema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => crypto.randomBytes(32).toString('base64')
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

export default mongoose.model<OAuthToken>("oauth-token", schema);
