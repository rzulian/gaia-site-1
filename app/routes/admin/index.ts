import * as diskusage from 'diskusage';
import * as os from 'os';
import * as createError from 'http-errors';
import Router from 'express-promise-router';
import { promisify } from 'util';
import { User } from '../../models';
import { isAdmin } from '../utils';

const router = Router();

router.use(isAdmin);

router.get('/serverinfo', async (req, res) => {
  const check = promisify(diskusage.check);

  res.json({
    disk: await check(os.platform() === 'win32' ? 'c:' : '/home'),
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

export default router;
