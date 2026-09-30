const test = require('node:test');
const assert = require('node:assert/strict');
const { createGameServer } = require('../Mini project');

async function startServer(t) {
  const context = createGameServer();
  await new Promise((resolve) => context.server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${context.server.address().port}`;
  t.after(() => new Promise((resolve) => context.server.close(resolve)));
  return { ...context, baseUrl };
}

async function request(baseUrl, path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: await response.json() };
}

async function register(baseUrl, username) {
  const result = await request(baseUrl, '/api/register', {
    method: 'POST', body: { username, password: 'secure-pass-123' },
  });
  assert.equal(result.status, 201);
  return result.data;
}

test('registration, login, and authenticated player profile work', async (t) => {
  const { baseUrl } = await startServer(t);
  const registered = await register(baseUrl, 'northstar');
  assert.equal(registered.user.username, 'northstar');
  assert.ok(registered.token);

  const duplicate = await request(baseUrl, '/api/register', {
    method: 'POST', body: { username: 'NorthStar', password: 'secure-pass-123' },
  });
  assert.equal(duplicate.status, 409);

  const wrongPassword = await request(baseUrl, '/api/login', {
    method: 'POST', body: { username: 'northstar', password: 'incorrect-pass' },
  });
  assert.equal(wrongPassword.status, 401);

  const login = await request(baseUrl, '/api/login', {
    method: 'POST', body: { username: 'NORTHSTAR', password: 'secure-pass-123' },
  });
  assert.equal(login.status, 200);
  assert.equal(login.data.user.id, registered.user.id);

  const profile = await request(baseUrl, '/api/me', { token: registered.token });
  assert.equal(profile.status, 200);
  assert.equal(profile.data.user.username, 'northstar');
});

test('players join games, take turns, and cannot pass obstacles', async (t) => {
  const { baseUrl } = await startServer(t);
  const first = await register(baseUrl, 'northstar');
  const second = await register(baseUrl, 'redfox');

  const created = await request(baseUrl, '/api/games', { token: first.token, method: 'POST', body: {} });
  assert.equal(created.status, 201);
  const gameId = created.data.game.id;
  assert.equal(created.data.game.status, 'waiting');
  assert.deepEqual(created.data.game.players[0].position, { row: 0, col: 0 });

  const joined = await request(baseUrl, `/api/games/${gameId}/join`, { token: second.token, method: 'POST', body: {} });
  assert.equal(joined.status, 200);
  assert.equal(joined.data.game.status, 'active');
  assert.equal(joined.data.game.currentTurn, first.user.id);
  assert.deepEqual(joined.data.game.players[1].base, { row: 9, col: 9 });

  const wrongTurn = await request(baseUrl, `/api/games/${gameId}/moves`, {
    token: second.token, method: 'POST', body: { direction: 'left' },
  });
  assert.equal(wrongTurn.status, 409);

  const outsideBoard = await request(baseUrl, `/api/games/${gameId}/moves`, {
    token: first.token, method: 'POST', body: { direction: 'up' },
  });
  assert.equal(outsideBoard.status, 400);

  const move = async (token, direction) => request(baseUrl, `/api/games/${gameId}/moves`, {
    token, method: 'POST', body: { direction },
  });
  assert.equal((await move(first.token, 'right')).status, 200);
  assert.equal((await move(second.token, 'left')).status, 200);
  assert.equal((await move(first.token, 'down')).status, 200);
  assert.equal((await move(second.token, 'left')).status, 200);
  assert.equal((await move(first.token, 'right')).status, 200);
  assert.equal((await move(second.token, 'left')).status, 200);

  const obstacle = await move(first.token, 'right');
  assert.equal(obstacle.status, 400);
  assert.match(obstacle.data.error, /obstacle/);
  assert.equal((await request(baseUrl, `/api/games/${gameId}/winner`, { token: first.token })).data.winner, null);
});

test('adjacent base attack ends the match with a winner', async (t) => {
  const { baseUrl, state } = await startServer(t);
  const first = await register(baseUrl, 'northstar');
  const second = await register(baseUrl, 'redfox');
  const created = await request(baseUrl, '/api/games', { token: first.token, method: 'POST', body: {} });
  const gameId = created.data.game.id;
  await request(baseUrl, `/api/games/${gameId}/join`, { token: second.token, method: 'POST', body: {} });

  const game = state.games.get(gameId);
  game.players[0].position = { row: 9, col: 8 };
  game.players[1].position = { row: 8, col: 8 };
  game.currentTurn = first.user.id;

  const attack = await request(baseUrl, `/api/games/${gameId}/attack`, {
    token: first.token, method: 'POST', body: {},
  });
  assert.equal(attack.status, 200);
  assert.equal(attack.data.game.status, 'finished');
  assert.equal(attack.data.game.winner.id, first.user.id);

  const result = await request(baseUrl, `/api/games/${gameId}/winner`, { token: second.token });
  assert.equal(result.data.winner.username, 'northstar');
});

test('reaching an undefended base wins and the server serves the game UI', async (t) => {
  const { app, baseUrl, state } = await startServer(t);
  const first = await register(baseUrl, 'northstar');
  const second = await register(baseUrl, 'redfox');
  const created = await request(baseUrl, '/api/games', { token: first.token, method: 'POST', body: {} });
  const gameId = created.data.game.id;
  await request(baseUrl, `/api/games/${gameId}/join`, { token: second.token, method: 'POST', body: {} });

  const game = state.games.get(gameId);
  game.players[0].position = { row: 9, col: 8 };
  game.players[1].position = { row: 8, col: 8 };
  game.currentTurn = first.user.id;

  const capture = await request(baseUrl, `/api/games/${gameId}/moves`, {
    token: first.token, method: 'POST', body: { direction: 'right' },
  });
  assert.equal(capture.status, 200);
  assert.equal(capture.data.game.status, 'finished');
  assert.equal(capture.data.game.winner.id, first.user.id);

  const page = await fetch(`${baseUrl}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Gridline/);
});
