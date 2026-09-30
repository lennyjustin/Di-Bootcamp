const test = require('node:test');
const assert = require('node:assert/strict');
const { createGameServer } = require('../Mini project');

async function start(t) {
  const instance = createGameServer();
  await new Promise((resolve) => instance.server.listen(0, resolve));
  const base = `http://127.0.0.1:${instance.server.address().port}`;
  t.after(() => new Promise((resolve) => instance.server.close(resolve)));
  return { ...instance, base };
}

async function call(base, url, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${base}${url}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: await response.json() };
}

async function register(base, username) {
  const result = await call(base, '/api/register', { method: 'POST', body: { username, password: 'secure-pass-123' } });
  assert.equal(result.status, 201);
  return result.data;
}

test('registers/logs in securely and authenticates profile requests', async (t) => {
  const { base } = await start(t);
  const created = await register(base, 'northstar');
  assert.ok(created.token);
  assert.equal(created.user.username, 'northstar');
  const badLogin = await call(base, '/api/login', { method: 'POST', body: { username: 'northstar', password: 'not-correct' } });
  assert.equal(badLogin.status, 401);
  const login = await call(base, '/api/login', { method: 'POST', body: { username: 'NORTHSTAR', password: 'secure-pass-123' } });
  assert.equal(login.status, 200);
  assert.equal((await call(base, '/api/me', { token: created.token })).data.user.id, created.user.id);
  assert.equal((await call(base, '/api/me')).status, 401);
});

test('creates two-player games and enforces turns, obstacles, and bounds', async (t) => {
  const { base } = await start(t);
  const blue = await register(base, 'northstar');
  const red = await register(base, 'redfox');
  const created = await call(base, '/api/games', { token: blue.token, method: 'POST', body: {} });
  const id = created.data.game.id;
  assert.equal(created.data.game.status, 'waiting');
  assert.deepEqual(created.data.game.players[0].base, { row: 0, col: 0 });
  const joined = await call(base, `/api/games/${id}/join`, { token: red.token, method: 'POST', body: {} });
  assert.equal(joined.data.game.status, 'active');
  assert.deepEqual(joined.data.game.players[1].base, { row: 9, col: 9 });

  assert.equal((await call(base, `/api/games/${id}/moves`, { token: red.token, method: 'POST', body: { direction: 'left' } })).status, 409);
  assert.equal((await call(base, `/api/games/${id}/moves`, { token: blue.token, method: 'POST', body: { direction: 'up' } })).status, 400);
  const move = (token, direction) => call(base, `/api/games/${id}/moves`, { token, method: 'POST', body: { direction } });
  assert.equal((await move(blue.token, 'right')).status, 200);
  assert.equal((await move(red.token, 'left')).status, 200);
  assert.equal((await move(blue.token, 'down')).status, 200);
  assert.equal((await move(red.token, 'left')).status, 200);
  assert.equal((await move(blue.token, 'right')).status, 200);
  assert.equal((await move(red.token, 'left')).status, 200);
  assert.match((await move(blue.token, 'right')).data.error, /obstacle/);
});

test('adjacent attack and reaching an undefended base determine the winner', async (t) => {
  const { base, state } = await start(t);
  const blue = await register(base, 'northstar');
  const red = await register(base, 'redfox');
  const created = await call(base, '/api/games', { token: blue.token, method: 'POST', body: {} });
  const id = created.data.game.id;
  await call(base, `/api/games/${id}/join`, { token: red.token, method: 'POST', body: {} });
  const game = state.games.get(id);
  game.players[0].position = { row: 9, col: 8 };
  game.currentTurn = blue.user.id;
  const attack = await call(base, `/api/games/${id}/attack`, { token: blue.token, method: 'POST', body: {} });
  assert.equal(attack.data.game.winner.id, blue.user.id);
  assert.equal((await call(base, `/api/games/${id}/winner`, { token: red.token })).data.status, 'finished');

  const secondCreated = await call(base, '/api/games', { token: blue.token, method: 'POST', body: {} });
  const secondId = secondCreated.data.game.id;
  await call(base, `/api/games/${secondId}/join`, { token: red.token, method: 'POST', body: {} });
  const secondGame = state.games.get(secondId);
  secondGame.players[0].position = { row: 9, col: 8 };
  secondGame.players[1].position = { row: 8, col: 8 };
  secondGame.currentTurn = blue.user.id;
  const capture = await call(base, `/api/games/${secondId}/moves`, { token: blue.token, method: 'POST', body: { direction: 'right' } });
  assert.equal(capture.data.game.status, 'finished');
  assert.equal(capture.data.game.winner.id, blue.user.id);
});
