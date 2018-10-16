import * as mongoose from 'mongoose';
import * as crypto from 'crypto';

export interface OAuthCode extends mongoose.Document {
  _id: string;
  client: mongoose.Types.ObjectId;
  redirectUrl: string;
  user: mongoose.Types.ObjectId;
}

const schema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => crypto.randomBytes(16).toString('base64')
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  redirectUrl: {
    type: String,
    required: true
  }
});

export default mongoose.model<OAuthCode>("oauth-code", schema);
