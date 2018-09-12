import * as _ from 'lodash';
import * as passport from 'passport';
import { env } from '../../config';
import Router from 'express-promise-router';
import { loggedOut, loggedIn } from '../utils';
import { User, Invite } from '../../models';
import * as createError from 'http-errors';
import { promisify } from 'util';
import { NextFunction, Request, Response } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({user: req.user, sessionID: req.sessionID});
});

router.post('/', loggedIn, async (req, res) => {
  _.merge(req.user, _.pick(req.body, ['settings']));
  await req.user.save();
  res.json({user: req.user, sessionID: req.sessionID});
});

router.post('/signup', loggedOut, checkInvite, passport.authenticate('local-signup'), (req, res) => {
  res.json({user: req.user, sessionID: req.sessionID});
});

router.post('/login', loggedOut, passport.authenticate('local-login'), (req, res) => {
  res.json({user: req.user, sessionID: req.sessionID});
});

router.post('/signout', (req, res) => {
  req.logout();
  res.send('ok');
});

router.post('/confirm', async (req, res, next) => {
  const user = await User.findByEmail(req.body.email);

  if (!user) {
    throw createError(404, "Can't find user: " + req.body.email);
  }

  await user.confirm(req.body.key);

  const login = promisify(req.login.bind(req));

  await login(user);

  res.json({user, sessionID: req.sessionID});
});

router.post('/reset', loggedOut, passport.authenticate('local-reset'), (req, res) => {
  res.json({user: req.user, sessionID: req.sessionID});
});

router.post('/forget', loggedOut, async (req, res) => {
  const { email } = req.body;
  const user = await User.findByEmail(email);

  if (!user) {
    throw createError(404, "Utilisateur introuvable: " + req.body.email);
  }

  await user.generateResetLink();
  await user.sendResetEmail();

  res.send('ok');
});

async function checkInvite(req: Request, res: Response, next: NextFunction) {
  if (!env.inviteOnly) {
    next();
    return;
  }

  const {email, inviteCode} = req.body;

  if (!inviteCode) {
    next(createError(401, "Please specify an invite code"));
  }

  const invite = await Invite.findOne({email, code: inviteCode});

  if (!invite) {
    next(createError(401, "No matching invitation, you cannot create an account"));
  }

  next();
}

export default router;
