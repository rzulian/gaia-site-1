import * as mongoose from 'mongoose';

export interface OAuthClientDocument extends mongoose.Document {

}

const schema = new mongoose.Schema({

});

export default mongoose.model<OAuthClientDocument>("oauth-client", schema);
