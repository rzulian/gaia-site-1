import * as createError from 'http-errors';
import Router from 'express-promise-router';
import { Game, User, ChatMessage } from '../../models';
import { loggedIn, queryCount, isAdmin } from '../utils';
import * as _ from "lodash";
import * as assert from "assert";

const router = Router();

router.post('/new-game', loggedIn, async (req , res) => {
  const {gameId} = req.body;
  const players = + req.body.players;
  const join = req.body.join === "true";
  const randomOrder = req.body.randomOrder === "true";
  const unlisted = req.body.unlisted === "true";
  const timePerMove = +req.body.timePerMove;
  const timePerGame = +req.body.timePerGame;

  assert(timePerMove && !isNaN(timePerMove), "Wrong amount of time per move");
  assert(timePerGame && !isNaN(timePerGame), "Wrong amount of time per game");

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
  game.options.randomPlayerOrder = randomOrder;
  game.options.unlisted = unlisted;
  game.options.timePerMove = timePerMove;
  game.options.timePerGame = timePerGame;
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
  res.json(await Game.find({"active": true, "data.round": {$gte: 1}}).sort('-lastMove').limit(queryCount(req)).select(Game.basics()));
});

router.get('/closed', async (req, res) => {
  res.json(await Game.find({active: false}).sort('-lastMove').limit(queryCount(req)).select(Game.basics()));
});

router.get('/open', async (req, res) => {
  res.json(await Game.find({'active': true, 'options.unlisted': {$ne: true}, 'data': {$exists: false}}).sort('-lastMove').limit(queryCount(req)).select(Game.basics().concat(["options.unlisted", "options.timePerMove", "options.timePerGame"])));
});

// Metadata about the game
router.get('/:gameId', (req, res) => {
  res.json(req.game);
});

// Just game data, with 'lastUpdated' and 'nextMoveDeadline' as bonus
router.get('/:gameId/data', (req, res) => {
  res.json(_.assign(req.game.data, {lastUpdated: req.game.updatedAt, nextMoveDeadline: req.game.nextMoveDeadline}));
});

router.get('/:gameId/players', async (req, res) => {
  const ids = req.game.players.concat(req.game.creator);
  const users = await User.find({_id: {$in: ids}}).select("account.username");
  res.json(users.map(user => ({id: user.id, name: user.account.username})));
});

router.post('/:gameId/chat', loggedIn, async (req, res) => {
  assert(req.user && req.game.players.some(pl => pl.equals(req.user._id)), "You must be a player of the game to chat!");
  assert(req.body.type === 'text' || req.body.type === 'emoji');
  assert(_.get(req, 'body.data.text'));

  const doc = new ChatMessage({room: req.game._id, author: req.user._id, data: {text: req.body.data.text}, type: req.body.type});
  await doc.save();

  res.sendStatus(200);
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

  res.json(_.assign(game.data, {lastUpdated: game.updatedAt, nextMoveDeadline: game.nextMoveDeadline}));
});

router.delete('/:gameId', isAdmin, async (req, res) => {
  await req.game.remove();

  res.sendStatus(200);
});

export default router;
