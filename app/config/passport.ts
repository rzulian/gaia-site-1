import * as passport from "passport";
import * as validator from 'validator';
import * as createError from "http-errors";
import env from './env';

import {Strategy as LocalStrategy} from 'passport-local';

// load up the user model
import { User } from '../models';

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
passport.serializeUser((user: User, done) => done(null, user.id));

// used to deserialize the user
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  async (req, email, password, done) => {
    try {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      if (!validator.isEmail(email)) {
        throw createError(422, 'Wrong email format');
      }

      if (password.length < env.minPasswordLength) {
        throw createError(422, 'Password is too short');
      }

      // check to see if there's already a user with that email
      if (await User.findByEmail(email)) {
        throw createError(409, 'Email is already taken');
      }

      // if there is no user with that email
      // create the user
      const newUser            = new User();

      // set the user's local credentials
      newUser.account.email    = email;
      newUser.account.password = await newUser.generateHash(password);
      newUser.account.newsletter = !!req.body.newsletter;
      newUser.fillInSecurity(req.ip);

      // save the user
      await newUser.save();

      newUser.sendConfirmationEmail();

      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  })
);

passport.use('local-reset', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  async (req, email, password, done) => {
    try {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists

      if (password.length < env.minPasswordLength) {
        throw createError(422, 'Password too short');
      }

      const user = await User.findByEmail(email);

      // check to see if theres already a user with that email
      if (!user) {
        throw createError(404, "No user with this email");
      }

      user.validateResetKey(req.body.resetKey);

      // set the user's local credentials
      await user.resetPassword(password);

      await user.notifyLogin(req.ip);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  async (req, email, password, done) => {
    try {
      const user = await User.findByEmail(email);
      // if no user is found, return the message
      if (!user) {
        throw createError(404, `${email} isn't registered`);
      }

      // if the user is found but the password is wrong
      if (!await user.validPassword(password)) {
        throw createError(401, 'Oops! Wrong password');
      }

      // all is well, return successful user
      await user.notifyLogin(req.ip);

      done(null, user);
    } catch (err) {
      done(err);
    }
  })
);
