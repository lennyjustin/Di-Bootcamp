const test = require('node:test');
const assert = require('node:assert/strict');
const { createChatServer } = require('../Mini project');
const { io: createClient } = require('socket.io-client');

function waitFor(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve));
}

async function connect(url) {
  const client = createClient(url, { transports: ['websocket'], forceNew: true });
  await waitFor(client, 'connect');
  return client;
}

test('room users update and messages are delivered in real time', async (t) => {
  const { server, io } = createChatServer();
  server.listen(0);
  await waitFor(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  const clients = [];
  t.after(async () => {
    clients.forEach((client) => client.close());
    await new Promise((resolve) => io.close(resolve));
  });

  const first = await connect(url);
  clients.push(first);
  first.emit('chat:join', { username: 'Alex', room: 'general' });
  assert.deepEqual((await waitFor(first, 'room:state')).users, ['Alex']);

  const second = await connect(url);
  clients.push(second);
  const presenceUpdate = waitFor(first, 'room:users');
  second.emit('chat:join', { username: 'Taylor', room: 'general' });
  assert.deepEqual((await waitFor(second, 'room:state')).users, ['Alex', 'Taylor']);
  assert.deepEqual(await presenceUpdate, ['Alex', 'Taylor']);

  const incoming = waitFor(second, 'chat:message');
  first.emit('chat:send', { text: 'Hello, everyone!' });
  const message = await incoming;
  assert.equal(message.username, 'Alex');
  assert.equal(message.text, 'Hello, everyone!');
  assert.equal(message.room, 'general');

  const left = waitFor(second, 'room:users');
  first.emit('chat:leave');
  assert.deepEqual(await left, ['Taylor']);
});

test('invalid joins and messages are rejected', async (t) => {
  const { server, io } = createChatServer();
  server.listen(0);
  await waitFor(server, 'listening');
  const client = await connect(`http://127.0.0.1:${server.address().port}`);
  t.after(async () => {
    client.close();
    await new Promise((resolve) => io.close(resolve));
  });

  const badRoom = waitFor(client, 'chat:error');
  client.emit('chat:join', { username: 'Alex', room: 'unknown' });
  assert.match(await badRoom, /room does not exist/);

  const noJoin = waitFor(client, 'chat:error');
  client.emit('chat:send', { text: 'Hi' });
  assert.match(await noJoin, /Join a room/);
});
