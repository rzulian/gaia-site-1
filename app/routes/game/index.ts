import * as createError from 'http-errors';
import Router from 'express-promise-router';
import { Game } from '../../models';
import { loggedIn } from '../utils';
import * as _ from "lodash";

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

  game.creator = req.user._id;
  game.options.nbPlayers = players;
  game.options.randomPlayerOrder = !!randomOrder;
  game._id = gameId;

  if (join) {
    game.players.push(req.user._id);
  }

  await game.save();

  res.sendStatus(200);
});

router.param('gameId', async (req, res, next, gameId) => {
  req.game = await Game.findById(gameId);

  if (!req.game) {
    throw createError(404, "Game not found");
  }

  next();
});

// Give last 10 active games
router.get('/active', async (req, res) => {
  res.json(await Game.find({"active": true, "data.round": {$gte: 1}}).sort('-updatedAt').limit(10).select(Game.basics()));
});

// Metadata about the game
router.get('/:gameId', (req, res) => {
  res.json(req.game);
});

// Just game data, with 'lastUpdated' as bonus
router.get('/:gameId/data', (req, res) => {
  res.json(_.assign(req.game.data, {lastUpdated: req.game.updatedAt}));
});

router.get('/:gameId/status', (req, res) => {
  res.json({lastUpdated: req.game.updatedAt});
});

router.post('/:gameId/join', loggedIn, async (req, res) => {
  req.game = await req.game.join(req.user._id);
  res.json(req.game);
});

router.post('/:gameId/move', loggedIn, async (req, res) => {
  const {move} = req.body;
  const auth = req.user.id;

  const game = await req.game.move(move, auth);

  res.json(_.assign(game.data, {lastUpdated: req.game.updatedAt}));
});

export default router;
