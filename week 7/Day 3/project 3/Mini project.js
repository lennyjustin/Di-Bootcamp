const express = require('express');
const path = require('node:path');
const { randomBytes, randomUUID, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const scryptAsync = promisify(scrypt);
const PORT = Number(process.env.PORT || 3000);
const GRID_SIZE = 10;
const OBSTACLES = [
  [1, 3], [2, 3], [3, 3], [5, 1], [5, 2], [5, 3],
  [6, 6], [6, 7], [7, 6], [3, 7], [4, 7], [5, 7],
];

function createGameServer() {
  const app = express();
  const server = require('node:http').createServer(app);
  const usersByName = new Map();
  const usersById = new Map();
  const tokens = new Map();
  const games = new Map();

  app.use(express.json({ limit: '32kb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  function fail(status, message) {
    const error = new Error(message);
    error.status = status;
    throw error;
  }

  function asyncRoute(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
  }

  function authenticate(req, res, next) {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const userId = tokens.get(token);
    const user = userId && usersById.get(userId);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });
    req.user = user;
    next();
  }

  function safeUser(user) {
    return { id: user.id, username: user.username };
  }

  function makeToken(user) {
    const token = randomBytes(32).toString('hex');
    tokens.set(token, user.id);
    return token;
  }

  function getGameForPlayer(gameId, userId) {
    const game = games.get(gameId);
    if (!game) fail(404, 'Game not found.');
    const player = game.players.find((entry) => entry.id === userId);
    if (!player) fail(403, 'You are not a player in this game.');
    return game;
  }

  function publicGame(game) {
    return {
      id: game.id,
      status: game.status,
      players: game.players.map((player) => ({
        ...safeUser(usersById.get(player.id)),
        position: { ...player.position },
        base: { ...player.base },
      })),
      obstacles: game.obstacles.map(([row, col]) => ({ row, col })),
      currentTurn: game.currentTurn,
      currentTurnUsername: game.currentTurn ? usersById.get(game.currentTurn)?.username : null,
      turnNumber: game.turnNumber,
      winner: game.winner ? safeUser(usersById.get(game.winner)) : null,
      recentMoves: game.moves.slice(-12),
    };
  }

  function findOpponent(game, userId) {
    return game.players.find((player) => player.id !== userId);
  }

  function ensureActiveTurn(game, userId) {
    if (game.status !== 'active') fail(409, 'This game is not active.');
    if (game.currentTurn !== userId) fail(409, 'It is not your turn.');
  }

  function nextTurn(game, currentPlayer) {
    const opponent = findOpponent(game, currentPlayer.id);
    game.currentTurn = opponent.id;
    game.turnNumber += 1;
  }

  app.post('/api/register', asyncRoute(async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = req.body?.password;
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      fail(400, 'Username must be 3–20 characters (letters, numbers, _ or -).');
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      fail(400, 'Password must be between 8 and 128 characters.');
    }
    const nameKey = username.toLowerCase();
    if (usersByName.has(nameKey)) fail(409, 'That username is already registered.');

    const salt = randomBytes(16);
    const passwordHash = await scryptAsync(password, salt, 64);
    const user = { id: randomUUID(), username, salt: salt.toString('hex'), passwordHash: passwordHash.toString('hex') };
    usersByName.set(nameKey, user);
    usersById.set(user.id, user);
    const token = makeToken(user);
    res.status(201).json({ user: safeUser(user), token });
  }));

  app.post('/api/login', asyncRoute(async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = req.body?.password;
    if (typeof password !== 'string' || password.length > 128) fail(400, 'Enter a valid username and password.');
    const user = usersByName.get(username.toLowerCase());
    if (!user) fail(401, 'Username or password is incorrect.');
    const hash = await scryptAsync(password, Buffer.from(user.salt, 'hex'), 64);
    if (!timingSafeEqual(hash, Buffer.from(user.passwordHash, 'hex'))) {
      fail(401, 'Username or password is incorrect.');
    }
    const token = makeToken(user);
    res.json({ user: safeUser(user), token });
  }));

  app.get('/api/me', authenticate, (req, res) => res.json({ user: safeUser(req.user) }));

  app.get('/api/games', authenticate, (req, res) => {
    const visibleGames = [...games.values()]
      .filter((game) => game.status === 'waiting' || game.players.some((player) => player.id === req.user.id))
      .map((game) => ({
        id: game.id,
        status: game.status,
        players: game.players.map((player) => safeUser(usersById.get(player.id))),
        createdAt: game.createdAt,
      }));
    res.json({ games: visibleGames });
  });

  app.post('/api/games', authenticate, (req, res) => {
    const game = {
      id: randomUUID(),
      status: 'waiting',
      players: [
        { id: req.user.id, position: { row: 0, col: 0 }, base: { row: 0, col: 0 } },
      ],
      obstacles: OBSTACLES.map((point) => [...point]),
      currentTurn: null,
      turnNumber: 0,
      winner: null,
      moves: [],
      createdAt: new Date().toISOString(),
    };
    games.set(game.id, game);
    res.status(201).json({ game: publicGame(game) });
  });

  app.post('/api/games/:id/join', authenticate, (req, res) => {
    const game = games.get(req.params.id);
    if (!game) fail(404, 'Game not found.');
    if (game.players.some((player) => player.id === req.user.id)) fail(409, 'You are already in this game.');
    if (game.status !== 'waiting') fail(409, 'This game is no longer waiting for a player.');
    game.players.push({
      id: req.user.id,
      position: { row: GRID_SIZE - 1, col: GRID_SIZE - 1 },
      base: { row: GRID_SIZE - 1, col: GRID_SIZE - 1 },
    });
    game.status = 'active';
    game.currentTurn = game.players[0].id;
    game.turnNumber = 1;
    res.json({ game: publicGame(game) });
  });

  app.get('/api/games/:id', authenticate, (req, res) => {
    res.json({ game: publicGame(getGameForPlayer(req.params.id, req.user.id)) });
  });

  app.post('/api/games/:id/moves', authenticate, (req, res) => {
    const game = getGameForPlayer(req.params.id, req.user.id);
    ensureActiveTurn(game, req.user.id);
    const directions = {
      up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
    };
    const delta = directions[req.body?.direction];
    if (!delta) fail(400, 'Direction must be up, down, left, or right.');

    const player = game.players.find((entry) => entry.id === req.user.id);
    const opponent = findOpponent(game, req.user.id);
    const destination = { row: player.position.row + delta[0], col: player.position.col + delta[1] };
    if (destination.row < 0 || destination.row >= GRID_SIZE || destination.col < 0 || destination.col >= GRID_SIZE) {
      fail(400, 'That move is outside the board.');
    }
    if (game.obstacles.some(([row, col]) => row === destination.row && col === destination.col)) {
      fail(400, 'An obstacle blocks that space.');
    }
    if (destination.row === opponent.position.row && destination.col === opponent.position.col) {
      fail(400, 'You cannot move onto your opponent.');
    }

    player.position = destination;
    game.moves.push({
      username: req.user.username,
      direction: req.body.direction,
      to: { ...destination },
      turn: game.turnNumber,
      type: 'move',
    });
    if (destination.row === opponent.base.row && destination.col === opponent.base.col) {
      game.status = 'finished';
      game.winner = req.user.id;
      game.currentTurn = null;
    } else {
      nextTurn(game, player);
    }
    res.json({ game: publicGame(game) });
  });

  app.post('/api/games/:id/attack', authenticate, (req, res) => {
    const game = getGameForPlayer(req.params.id, req.user.id);
    ensureActiveTurn(game, req.user.id);
    const player = game.players.find((entry) => entry.id === req.user.id);
    const opponent = findOpponent(game, req.user.id);
    const distance = Math.abs(player.position.row - opponent.base.row) + Math.abs(player.position.col - opponent.base.col);
    if (distance !== 1) fail(400, 'Move next to the enemy base before attacking.');

    game.status = 'finished';
    game.winner = player.id;
    game.currentTurn = null;
    game.moves.push({ username: req.user.username, type: 'attack', turn: game.turnNumber });
    res.json({ game: publicGame(game) });
  });

  app.get('/api/games/:id/winner', authenticate, (req, res) => {
    const game = getGameForPlayer(req.params.id, req.user.id);
    res.json({ winner: game.winner ? safeUser(usersById.get(game.winner)) : null, status: game.status });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500);
    if (status >= 500) console.error(error);
    res.status(status).json({ error: status < 500 ? error.message : 'Internal server error.' });
  });

  return { app, server, state: { usersByName, usersById, tokens, games } };
}

if (require.main === module) {
  const { server } = createGameServer();
  server.listen(PORT, () => console.log(`Gridline is ready at http://localhost:${PORT}`));
}

module.exports = { createGameServer, GRID_SIZE, OBSTACLES };
