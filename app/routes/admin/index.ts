import * as diskusage from 'diskusage';
import * as os from 'os';
import Router from 'express-promise-router';
import { promisify } from 'util';
import { User } from '../../models';

const router = Router();

router.get('/serverinfo', async (req, res) => {
  const check = promisify(diskusage.check);

  res.json({
    disk: await check(os.platform() === 'win32' ? 'c:' : '/'),
    nbUsers: await User.count( {} )
  });
});

export default router;
