import * as createError from 'http-errors';
import Router from 'express-promise-router';
import { User, Game } from '../../models';
import { queryCount, skipCount } from '../utils';

const router = Router();

router.param('userId', async (req, res, next, userId) => {
  req.foundUser = await User.findById(userId);

  if (!req.foundUser) {
    throw createError(404, "User not found");
  }

  next();
});

router.param('userName', async (req, res, next, userName) => {
  req.foundUser = await User.findByUsername(decodeURIComponent(userName));

  if (!req.foundUser) {
    throw createError(404, "User not found");
  }

  next();
});

router.get('/infoByName/:userName', async (req, res) => {
  res.json(req.foundUser.publicInfo());
});

router.get('/:userId/games/active', async (req , res) => {
  res.json(await Game.findWithPlayer(req.foundUser._id).where({active: true}).skip(skipCount(req)).limit(queryCount(req)).select(Game.basics()));
});

router.get('/:userId/games/current-turn', async (req , res) => {
  res.json(await Game.findWithPlayer(req.foundUser._id).where({active: true, currentPlayer: req.foundUser._id}).limit(queryCount(req)).select(Game.basics()));
});

router.get('/:userId/games/closed', async (req , res) => {
  res.json(await Game.findWithPlayer(req.foundUser._id).where({active: false}).skip(skipCount(req)).limit(queryCount(req)).select(Game.basics()));
});

export default router;
