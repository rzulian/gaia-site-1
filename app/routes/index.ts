import Router from 'express-promise-router';

import account from './account';
import admin from './admin';

const router = Router();

router.use('/api/account', account);
router.use('/api/admin', admin);

export default router;
