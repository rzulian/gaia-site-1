import locks from "mongo-locks";
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as assert from 'assert';
import * as randomstring from 'randomstring';
import {env, sendmail} from '../config';
import { ObjectId } from 'bson';
import { IAbstractUser } from 'lib/user';
import * as _ from "lodash";
import { Game } from ".";

const Schema = mongoose.Schema;

interface User extends IAbstractUser, mongoose.Document {
  isAdmin(): boolean;

  generateHash(password: string): Promise<string>;
  validPassword(password: string): Promise<boolean>;
  resetPassword(password: string): Promise<any>;
  email(): string;
  // Filtered user for public consumption
  publicInfo(): User;
  changeEmail(email: string): Promise<any>;
  getLink(): string;
  generateResetLink(): Promise<any>;
  resetKey(): string;
  validateResetKey(key: string): void;
  generateConfirmKey(): Promise<any>;
  confirmKey(): string;
  confirm(key: string): Promise<any>;
  confirmed(): boolean;
  sendConfirmationEmail(): Promise<any>;
  sendResetEmail(): Promise<any>;
  sendGameNotificationEmail(): Promise<any>;
  updateGameNotification(): Promise<void>;
  fillInSecurity(ip: string): void;
  isSocialAccount(): boolean;
  notifyLogin(ip: string): Promise<any>;
  notifyLastIp(ip: string): void;
}

export {User as UserDocument};

interface UserModel extends mongoose.Model<User> {
  findByEmail(email: string): Promise<User>;
  findByUsername(name: string): Promise<User>;
  findByUrl(urlComponent: string): Promise<User>;
}

// define the schema for our user model
const userSchema = new Schema({
  account: {
    username: {type: String, maxlength: [20, 'Pick a shorter username'], minlength: [2, 'Pick a longer username'], trim: true, unique: true, sparse: true},
    email: { type: String, unique: true, maxlength: [50, 'Too long email'], trim: true, lowercase: true },
    password: String
  },
  settings: {
    mailing: {
      newsletter: Boolean,
      game: {
        delay: Number,
        activated: Boolean
      }
    },
    game: {
      noFactionFill: Boolean,
      researchIllustrations: {
        type: Boolean,
        default: true
      }
    }
  },
  security: {
    lastIp: { type: String, index: true },
    lastLogin: {
      ip: String,
      date: Date
    },
    confirmed: Boolean,
    confirmKey: String,
    reset: {
      key: String,
      issued: Date
    }
  },
  meta: {
    nextGameNotification: Date
  },
  authority: String,
}, { toJSON: {transform: (doc, ret) => {
  delete ret.account.password;
  delete ret.security.confirmKey;
  delete (ret.security.reset || {}).key;
  return ret;
}}, collation: { locale: 'en', strength: 2 } });

// methods ======================
// generating a hash
userSchema.method('generateHash', function(this: User, password: string) {
  return bcrypt.hash(password, 8);
});

// checking if password is valid
userSchema.method('validPassword', function(this: User, password: string) {
  return bcrypt.compare(password, this.account.password);
});

userSchema.method('resetPassword', function(this: User, password: string) {
  return this.generateHash(password).then((hash: string) => {
    return this.update({
      "account.password": hash,
      "security.reset": null
    });
  });
});

userSchema.method('email', function(this: User, ) {
  return this.account.email;
});

userSchema.method('changeEmail', async function(this: User, email: string) {
  assert(!this.isSocialAccount(), "You can't change the email of a social account.");

  assert(!(await User.findByEmail(email)), "User with this email already exists.");

  this.account.email = email;
  this.security.confirmed = false;
  this.security.confirmKey = randomstring.generate();

  await this.update({
    "account.email": email,
    "security.confirmed": false,
    "security.confirmKey": this.security.confirmKey
  });
});

userSchema.method('getLink', function(this: User) {
  return "/user/" + this.account.username;
});

userSchema.method('publicInfo', function(this: User) {
  return _.pick(this, ["_id", "account.username"]);
});

userSchema.method('generateResetLink', function(this: User) {
  this.security.reset = {
    key: randomstring.generate(),
    issued: new Date()
  };

  return this.update({ "security.reset": this.security.reset });
});

userSchema.method('resetKey', function(this: User) {
  return this.security.reset.key;
});

userSchema.method('validateResetKey', function(this: User, key: string) {
  if (!this.security.reset || !this.security.reset.key) {
    throw new Error("This user didn't ask for a password reset.");
  }
  if (this.security.reset.key !== key) {
    throw new Error("The reset password link is wrong.");
  }
  const resetIssued = new Date(this.security.reset.issued);
  if (Date.now() - resetIssued.getTime() > 24 * 3600 * 1000) {
    throw new Error("The reset link has expired.");
  }
});

userSchema.method('generateConfirmKey', function(this: User) {
  this.security.confirmKey = randomstring.generate();

  return this.update({ "security.confirmKey": this.security.confirmKey }).exec();
});

userSchema.method('confirmKey', function(this: User) {
  return this.security.confirmKey;
});

userSchema.method('confirm', function(this: User, key: string) {
  if (this.confirmed()) {
    return;
  }
  assert(key && this.confirmKey() === key, `Wrong confirm link.`);
  this.security.confirmed = true;
  this.security.confirmKey = null;

  return this.update({
    "security.confirmed": true,
    "security.confirmKey": null,
  }).exec();
});

userSchema.method('confirmed', function(this: User) {
  return this.security.confirmed;
});

userSchema.method('sendConfirmationEmail', function(this: User) {
  return sendmail({
    from: env.noreply,
    to: this.email(),
    subject: "Confirm your account",
    html: `
    <p>Hello, we're delighted to have a new Gaia Project player among us!</p>
    <p>To finish your registration and confirm your account with us at ${env.domain},
     click <a href='http://${env.domain}/confirm?key=${this.confirmKey()}&user=${this.email()}'>here</a>.</p>

    <p>If you didn't create an account with us, ignore this email.</p>`,
  });
});

userSchema.method('sendResetEmail', function(this: User) {
  return sendmail({
    from: env.noreply,
    to: this.email(),
    subject: 'Forgotten password',
    html: `
    <p>A password reset was asked for your account,
    click <a href='http://${env.domain}/reset?key=${this.resetKey()}&user=${this.email()}'>here</a> to reset your password.</p>

    <p>If this didn't come from you, ignore this email.</p>`,
  });
});

userSchema.method('sendGameNotificationEmail', async function(this: User) {
  const free = await locks.lock("game-notification", this.id);
  try {
    // Inside the lock, reload the user
    const user = await User.findById(this.id);

    if (!user.settings.mailing.game.activated) {
      user.meta.nextGameNotification = undefined;
      await user.save();
      return;
    }

    if (!user.meta.nextGameNotification) {
      return;
    }

    if (user.meta.nextGameNotification > new Date()) {
      return;
    }

    const activeGames = await Game.findWithPlayersTurn(user.id).select('-data').lean(true);

    if (activeGames.length === 0) {
      user.meta.nextGameNotification = undefined;
      await user.save();
      return;
    }

    /* Check the oldest game where it's your turn */
    let lastMove: Date = new Date();
    for (const game of activeGames) {
      if (!game.lastMove) {
        continue;
      }
      if (game.lastMove < lastMove) {
        lastMove = game.lastMove;
      }
    }

    /* Test if we're sending the notification too early */
    const notificationDate = new Date(lastMove.getTime() + (user.settings.mailing.game.delay || 30 * 60) * 1000);

    if (notificationDate > new Date()) {
      user.meta.nextGameNotification = notificationDate;
      await user.save();
      return;
    }

    const gameString = activeGames.length > 1 ? `${activeGames.length} games` : 'one game';

    // Send email
    sendmail({
      from: env.noreply,
      to: this.email(),
      subject: `Your turn`,
      html: `
      <p>Hello ${this.account.username}</p>

      <p>It's your turn on ${gameString},
      click <a href='http://${env.domain}/user/${encodeURIComponent(this.account.username)}'>here</a> to see your active games.</p>

      <p>You can also change your email settings and unsubscribe <a href='http://${env.domain}/account'>here</a> with a simple click.</p>`,
    });

    user.meta.nextGameNotification = new Date(Date.now() + (this.settings.mailing.game.delay || 30 * 60) * 1000);
    await user.save();
  } catch (err) {
    console.error(err);
  } finally {
    free();
  }
});

userSchema.method('updateGameNotification', async function(this: User) {
  if (!this.settings.mailing.game.activated) {
    return;
  }
  const date = new Date(Date.now() + (this.settings.mailing.game.delay || 30 * 60) * 1000);
  if (!this.meta.nextGameNotification || this.meta.nextGameNotification > date) {
    this.meta.nextGameNotification = date;
    await this.save();
  }
});

userSchema.method('fillInSecurity', function(this: User, ip: string) {
  Object.assign(this.security, {
    lastLogin: {
      date: new Date(),
      ip
    },
    lastIp: ip
  });

  /* No need to confirm social accounts */
  if (this.isSocialAccount()) {
    this.security.confirmed = true;
  } else {
    this.security.confirmKey = randomstring.generate();
  }
});

userSchema.method('isSocialAccount', function(this: User) {
  return false;
});

userSchema.method('notifyLogin', function(this: User, ip: string) {
  return this.update({
    "security.lastLogin.date": Date.now(),
    "security.lastLogin.ip": ip,
    "security.lastIp": ip
  });
});

userSchema.method('notifyLastIp', function(this: User, ip: string) {
  if (this.security.lastIp !== ip) {
    this.security.lastIp = ip;
    this.update({ "security.lastIp": ip }).exec();
  }
});

userSchema.method('isAdmin', function(this: User) {
  return this.authority === "admin";
});

userSchema.static('findByUrl', function(this: UserModel, urlComponent: string) {
  return this.findById(new ObjectId(urlComponent));
});

userSchema.static('findByUsername', function(this: UserModel, username: string) {
  return this.findOne({'account.username': username});
});

userSchema.static('findByEmail', function(this: UserModel, email: string) {
  return this.findOne({ 'account.email': email.toLowerCase() });
});

const User = mongoose.model<User, UserModel>('User', userSchema);

// create the model for users and expose it to our app
export default User;

/* Check move deadlines every 10 seconds - only on one thread of the server */
import * as cluster from "cluster";
if (cluster.isMaster && env.automatedEmails) {
  setInterval(async () => {
    try {
      const toEmail = await User.find({'meta.nextGameNotification': {$lte: new Date()}});

      for (const user of toEmail) {
        user.sendGameNotificationEmail().catch(err => console.error(err));
      }
    } catch (err) {
      console.error(err);
    }
  }, 60000);
}
