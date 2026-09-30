const express = require('express');
const http = require('node:http');
const path = require('node:path');
const { randomBytes, randomUUID, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const scryptAsync = promisify(scrypt);
const PORT = Number(process.env.PORT || 3002);
const GRID_SIZE = 10;
const OBSTACLES = [
  [1, 3], [2, 3], [3, 3], [5, 1], [5, 2], [5, 3],
  [6, 6], [6, 7], [7, 6], [3, 7], [4, 7], [5, 7],
];

function createGameServer() {
  const app = express();
  const server = http.createServer(app);
  const usersByName = new Map();
  const usersById = new Map();
  const tokens = new Map();
  const games = new Map();

  app.use(express.json({ limit: '32kb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  function error(status, message) {
    const result = new Error(message);
    result.status = status;
    throw result;
  }

  function asyncRoute(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
  }

  function authenticate(req, res, next) {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const user = usersById.get(tokens.get(token));
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });
    req.user = user;
    next();
  }

  function publicUser(user) {
    return { id: user.id, username: user.username };
  }

  function makeToken(user) {
    const token = randomBytes(32).toString('hex');
    tokens.set(token, user.id);
    return token;
  }

  function getGame(gameId, userId) {
    const game = games.get(gameId);
    if (!game) error(404, 'Game not found.');
    if (!game.players.some((player) => player.id === userId)) error(403, 'You are not a player in this game.');
    return game;
  }

  function serializeGame(game) {
    return {
      id: game.id,
      status: game.status,
      players: game.players.map((player) => ({
        ...publicUser(usersById.get(player.id)),
        position: { ...player.position },
        base: { ...player.base },
      })),
      obstacles: game.obstacles.map(([row, col]) => ({ row, col })),
      currentTurn: game.currentTurn,
      currentTurnUsername: game.currentTurn ? usersById.get(game.currentTurn)?.username : null,
      turnNumber: game.turnNumber,
      winner: game.winner ? publicUser(usersById.get(game.winner)) : null,
      recentMoves: game.moves.slice(-15),
    };
  }

  function opponentOf(game, playerId) {
    return game.players.find((player) => player.id !== playerId);
  }

  function checkTurn(game, playerId) {
    if (game.status !== 'active') error(409, 'This game is not active.');
    if (game.currentTurn !== playerId) error(409, 'It is not your turn.');
  }

  function finishGame(game, winnerId) {
    game.status = 'finished';
    game.winner = winnerId;
    game.currentTurn = null;
  }

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.post('/api/register', asyncRoute(async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = req.body?.password;
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) error(400, 'Username must be 3–20 characters (letters, numbers, _ or -).');
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) error(400, 'Password must be between 8 and 128 characters.');
    const key = username.toLowerCase();
    if (usersByName.has(key)) error(409, 'That username is already taken.');
    const salt = randomBytes(16);
    const hash = await scryptAsync(password, salt, 64);
    const user = { id: randomUUID(), username, salt: salt.toString('hex'), hash: hash.toString('hex') };
    usersByName.set(key, user);
    usersById.set(user.id, user);
    res.status(201).json({ user: publicUser(user), token: makeToken(user) });
  }));

  app.post('/api/login', asyncRoute(async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = req.body?.password;
    if (typeof password !== 'string' || password.length > 128) error(400, 'Enter a valid username and password.');
    const user = usersByName.get(username.toLowerCase());
    if (!user) error(401, 'Username or password is incorrect.');
    const candidate = await scryptAsync(password, Buffer.from(user.salt, 'hex'), 64);
    if (!timingSafeEqual(candidate, Buffer.from(user.hash, 'hex'))) error(401, 'Username or password is incorrect.');
    res.json({ user: publicUser(user), token: makeToken(user) });
  }));

  app.get('/api/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }));

  app.get('/api/games', authenticate, (req, res) => {
    const result = [...games.values()]
      .filter((game) => game.status === 'waiting' || game.players.some((player) => player.id === req.user.id))
      .map((game) => ({
        id: game.id,
        status: game.status,
        players: game.players.map((player) => publicUser(usersById.get(player.id))),
        createdAt: game.createdAt,
      }));
    res.json({ games: result });
  });

  app.post('/api/games', authenticate, (req, res) => {
    const game = {
      id: randomUUID(),
      status: 'waiting',
      players: [{ id: req.user.id, position: { row: 0, col: 0 }, base: { row: 0, col: 0 } }],
      obstacles: OBSTACLES.map(([row, col]) => [row, col]),
      currentTurn: null,
      turnNumber: 0,
      winner: null,
      moves: [],
      createdAt: new Date().toISOString(),
    };
    games.set(game.id, game);
    res.status(201).json({ game: serializeGame(game) });
  });

  app.post('/api/games/:id/join', authenticate, (req, res) => {
    const game = games.get(req.params.id);
    if (!game) error(404, 'Game not found.');
    if (game.players.some((player) => player.id === req.user.id)) error(409, 'You are already in this game.');
    if (game.status !== 'waiting') error(409, 'This game is not open to new players.');
    game.players.push({
      id: req.user.id,
      position: { row: GRID_SIZE - 1, col: GRID_SIZE - 1 },
      base: { row: GRID_SIZE - 1, col: GRID_SIZE - 1 },
    });
    game.status = 'active';
    game.currentTurn = game.players[0].id;
    game.turnNumber = 1;
    res.json({ game: serializeGame(game) });
  });

  app.get('/api/games/:id', authenticate, (req, res) => {
    res.json({ game: serializeGame(getGame(req.params.id, req.user.id)) });
  });

  app.post('/api/games/:id/moves', authenticate, (req, res) => {
    const game = getGame(req.params.id, req.user.id);
    checkTurn(game, req.user.id);
    const directions = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const delta = directions[req.body?.direction];
    if (!delta) error(400, 'Direction must be up, down, left, or right.');

    const player = game.players.find((entry) => entry.id === req.user.id);
    const opponent = opponentOf(game, req.user.id);
    const destination = { row: player.position.row + delta[0], col: player.position.col + delta[1] };
    if (destination.row < 0 || destination.row >= GRID_SIZE || destination.col < 0 || destination.col >= GRID_SIZE) error(400, 'That move is outside the board.');
    if (game.obstacles.some(([row, col]) => row === destination.row && col === destination.col)) error(400, 'An obstacle blocks that space.');
    if (destination.row === opponent.position.row && destination.col === opponent.position.col) error(400, 'You cannot move onto the other player.');

    player.position = destination;
    game.moves.push({ username: req.user.username, type: 'move', direction: req.body.direction, to: destination, turn: game.turnNumber });
    if (destination.row === opponent.base.row && destination.col === opponent.base.col) {
      finishGame(game, req.user.id);
    } else {
      game.currentTurn = opponent.id;
      game.turnNumber += 1;
    }
    res.json({ game: serializeGame(game) });
  });

  app.post('/api/games/:id/attack', authenticate, (req, res) => {
    const game = getGame(req.params.id, req.user.id);
    checkTurn(game, req.user.id);
    const player = game.players.find((entry) => entry.id === req.user.id);
    const opponent = opponentOf(game, req.user.id);
    const distance = Math.abs(player.position.row - opponent.base.row) + Math.abs(player.position.col - opponent.base.col);
    if (distance !== 1) error(400, 'Move next to the enemy base before attacking.');
    game.moves.push({ username: req.user.username, type: 'attack', turn: game.turnNumber });
    finishGame(game, req.user.id);
    res.json({ game: serializeGame(game) });
  });

  app.get('/api/games/:id/winner', authenticate, (req, res) => {
    const game = getGame(req.params.id, req.user.id);
    res.json({ status: game.status, winner: game.winner ? publicUser(usersById.get(game.winner)) : null });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status < 500 ? err.message : 'Internal server error.' });
  });

  return { app, server, state: { usersByName, usersById, tokens, games } };
}

if (require.main === module) {
  const { server } = createGameServer();
  server.listen(PORT, () => console.log(`Strategy game is running at http://localhost:${PORT}`));
}

module.exports = { createGameServer, GRID_SIZE, OBSTACLES };
