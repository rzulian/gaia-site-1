import * as checkDiskSpace from 'check-disk-space';
import * as createError from 'http-errors';
import Router from 'express-promise-router';
import { promisify } from 'util';
import { User, Invite } from '../../models';
import { isAdmin } from '../utils';
import * as validator from 'validator';
import * as assert from 'assert';

const router = Router();

router.use(isAdmin);

router.get('/serverinfo', async (req, res) => {
  res.json({
    disk: await checkDiskSpace(process.cwd()),
    nbUsers: await User.count( {} )
  });
});

router.post('/resend-confirmation', async (req , res) => {
  const {email} = req.body;
  const user = await User.findByEmail(email);

  if (!user) {
    throw createError(404, "User not found: " + email);
  }

  await user.sendConfirmationEmail();
  res.sendStatus(200);
});

router.post('/login-as', async (req, res) => {
  const {username} = req.body;
  const user = await User.findByUsername(username);

  if (!user) {
    throw createError(404, "User not found: " + username);
  }

  const login = promisify(req.login.bind(req));

  await login(user);

  res.json({user});
});

router.post('/invite', async (req, res) => {
  const {email} = req.body;

  assert(validator.isEmail(email), "Wrong email format");

  const invite = new Invite({email});
  await invite.save();

  await invite.sendEmail();

  res.sendStatus(200);
});

export default router;
