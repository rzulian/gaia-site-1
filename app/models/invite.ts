import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import {env, sendmail} from '../config';

const Schema = mongoose.Schema;

interface InviteDocument extends mongoose.Document {
  email: string;
  code: string;

  sendEmail(): Promise<void>;
}

const inviteSchema = new Schema({
  email: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  code: {
    type: String,
    required: true,
    default: () => crypto.randomBytes(6).toString("base64")
  }
});

inviteSchema.method('sendEmail', function(this: InviteDocument) {
  const url = `http://${env.domain}/signup?code=${encodeURIComponent(this.code)}&user=${this.email}`;

  return sendmail({
    from: env.noreply,
    to: this.email,
    subject: "Invitation to play Gaia Project online",
    html: `
    <p>Hello, you've been invited to create an account at ${env.domain}!</p>
    <p>This will allow you to play gaia-project online with other registered members. We're not able to launch full-scale for quite a long time, so invites are precious.</p>
    <p>To create your account, click <a href='${url}'>here</a>.</p>

    <p>This email should really not be sent to the wrong person. But you can complain at ${env.contact} if it was.</p>`,
  });
});

export default mongoose.model<InviteDocument>("Invite", inviteSchema);
