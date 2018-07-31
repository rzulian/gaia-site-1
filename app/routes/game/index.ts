import * as createError from 'http-errors';
import Router from 'express-promise-router';
import { User, Game } from '../../models';
import { loggedIn } from '../utils';

const router = Router();

router.post('/new-game', loggedIn, async (req , res) => {
  const {gameId} = req.body;
  const players = + req.body.players;
  const join = !!(req.body.join === "true");
  const randomOrder = !!(req.body.randomOrder === "true");

  if (!/^[A-z0-9-]+$/.test(gameId)) {
    throw createError(400, "Wrong format for game id");
  }
  if (![2, 3, 4].includes(players)) {
    throw createError(400, "Wrong number of players");
  }

  if (await Game.findById(gameId)) {
    throw createError(400, `A game with the id '${gameId}' already exists`);
  }

  const game = new Game();

  game.options.nbPlayers = players;
  game.options.randomPlayerOrder = !!randomOrder;
  game._id = gameId;

  if (join) {
    game.players.push(req.user._id);
  }

  await game.save();

  res.sendStatus(200);
});

export default router;
