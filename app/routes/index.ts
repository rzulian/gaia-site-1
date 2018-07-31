import Router from 'express-promise-router';

import account from './account';
import admin from './admin';
import game from './game';

const router = Router();

router.use('/api/account', account);
router.use('/api/admin', admin);
router.use('/api/game', game);

export default router;
