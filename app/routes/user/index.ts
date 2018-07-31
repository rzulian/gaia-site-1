import * as createError from 'http-errors';
import Router from 'express-promise-router';
import { User, Game } from '../../models';
import { loggedIn } from '../utils';

const router = Router();

router.param('userId', async (req, res, next, userId) => {
  req.foundUser = await User.findById(userId);

  if (!req.foundUser) {
    throw createError(404, "User not found");
  }

  next();
});

router.get('/:userId/games/active', loggedIn, async (req , res) => {
  res.json(await Game.findWithPlayer(req.foundUser._id).where({active: true}).select("-data"));
});

export default router;
