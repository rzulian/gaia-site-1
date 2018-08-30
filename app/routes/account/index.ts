import * as _ from 'lodash';
import * as passport from 'passport';
import Router from 'express-promise-router';
import { loggedOut, loggedIn } from '../utils';
import { User } from '../../models';
import * as createError from 'http-errors';
import { promisify } from 'util';

const router = Router();

router.get('/', (req, res) => {
  res.json({user: req.user, sessionID: req.sessionID});
});

router.post('/', loggedIn, async (req, res) => {
  _.merge(req.user, _.pick(req.body, ['account.newsletter']));
  await req.user.save();
  res.json({user: req.user, sessionID: req.sessionID});
});

router.post('/signup', loggedOut, passport.authenticate('local-signup'), (req, res) => {
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

export default router;
