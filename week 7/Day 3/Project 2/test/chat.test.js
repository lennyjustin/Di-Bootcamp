const test = require('node:test');
const assert = require('node:assert/strict');
const { createChatServer } = require('../Exercise');
const { io: createClient } = require('socket.io-client');

function once(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve));
}

function connectClient(url) {
  const client = createClient(url, { transports: ['websocket'], forceNew: true });
  return once(client, 'connect').then(() => client);
}

test('clients join rooms, receive presence updates, and exchange messages', async (t) => {
  const { server, io } = createChatServer();
  server.listen(0);
  await once(server, 'listening');
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}`;
  const clients = [];

  t.after(async () => {
    clients.forEach((client) => client.close());
    await new Promise((resolve) => io.close(resolve));
  });

  const first = await connectClient(url);
  clients.push(first);
  first.emit('chat:join', { username: 'Alex', room: 'general' });
  const firstState = await once(first, 'room:state');
  assert.equal(firstState.room, 'general');
  assert.deepEqual(firstState.users, ['Alex']);

  const second = await connectClient(url);
  clients.push(second);
  const firstPresence = once(first, 'room:users');
  second.emit('chat:join', { username: 'Taylor', room: 'general' });
  const secondState = await once(second, 'room:state');
  assert.deepEqual(secondState.users, ['Alex', 'Taylor']);
  assert.deepEqual(await firstPresence, ['Alex', 'Taylor']);

  const delivered = once(second, 'chat:message');
  first.emit('chat:send', { text: 'Hello, room!' });
  const message = await delivered;
  assert.equal(message.username, 'Alex');
  assert.equal(message.text, 'Hello, room!');
  assert.equal(message.room, 'general');

  const presenceAfterLeave = once(second, 'room:users');
  first.emit('chat:leave');
  assert.deepEqual(await presenceAfterLeave, ['Taylor']);
});

test('server rejects invalid room and message before accepting them', async (t) => {
  const { server, io } = createChatServer();
  server.listen(0);
  await once(server, 'listening');
  const client = await connectClient(`http://127.0.0.1:${server.address().port}`);
  t.after(async () => {
    client.close();
    await new Promise((resolve) => io.close(resolve));
  });

  const invalidRoom = once(client, 'chat:error');
  client.emit('chat:join', { username: 'Alex', room: 'not-a-room' });
  assert.match(await invalidRoom, /valid room/);

  const notJoined = once(client, 'chat:error');
  client.emit('chat:send', { text: 'Hello' });
  assert.match(await notJoined, /Join a room/);
});
