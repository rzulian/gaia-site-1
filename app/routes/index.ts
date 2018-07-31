import Router from 'express-promise-router';

import account from './account';
import admin from './admin';
import game from './game';
import user from './user';

const router = Router();

router.use('/api/account', account);
router.use('/api/admin', admin);
router.use('/api/game', game);
router.use('/api/user', user);

export default router;
