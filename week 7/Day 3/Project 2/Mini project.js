const express = require('express');
const http = require('node:http');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT || 3001);
const ROOMS = ['general', 'random', 'help'];
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 60;

function createChatServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);
  const users = new Map();
  const histories = new Map(ROOMS.map((room) => [room, []]));

  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  function listUsers(room) {
    return [...users.values()]
      .filter((user) => user.room === room)
      .map((user) => user.username)
      .sort((a, b) => a.localeCompare(b));
  }

  function broadcastUsers(room) {
    io.to(room).emit('room:users', listUsers(room));
  }

  function leave(socket, announce = true) {
    const user = users.get(socket.id);
    if (!user) return;
    socket.leave(user.room);
    users.delete(socket.id);
    broadcastUsers(user.room);
    if (announce) {
      io.to(user.room).emit('chat:notice', {
        id: randomUUID(), text: `${user.username} left #${user.room}`, createdAt: new Date().toISOString(),
      });
    }
  }

  io.on('connection', (socket) => {
    socket.on('chat:join', (payload = {}) => {
      const username = typeof payload.username === 'string' ? payload.username.trim().replace(/\s+/g, ' ') : '';
      const room = payload.room;
      if (username.length < 2 || username.length > 24 || /[\u0000-\u001f\u007f]/.test(username)) {
        socket.emit('chat:error', 'Choose a name between 2 and 24 characters.');
        return;
      }
      if (!ROOMS.includes(room)) {
        socket.emit('chat:error', 'That room does not exist.');
        return;
      }

      const previous = users.get(socket.id);
      if (previous) leave(socket);
      users.set(socket.id, { username, room });
      socket.join(room);
      socket.emit('room:state', { room, users: listUsers(room), messages: histories.get(room) });
      broadcastUsers(room);
      socket.to(room).emit('chat:notice', {
        id: randomUUID(), text: `${username} joined #${room}`, createdAt: new Date().toISOString(),
      });
    });

    socket.on('chat:leave', () => leave(socket));

    socket.on('chat:send', (payload = {}) => {
      const user = users.get(socket.id);
      if (!user) {
        socket.emit('chat:error', 'Join a room before sending a message.');
        return;
      }
      const text = typeof payload.text === 'string' ? payload.text.trim() : '';
      if (!text || text.length > MAX_MESSAGE_LENGTH) {
        socket.emit('chat:error', `Messages must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`);
        return;
      }
      const message = {
        id: randomUUID(), username: user.username, room: user.room,
        text, createdAt: new Date().toISOString(),
      };
      const history = histories.get(user.room);
      history.push(message);
      if (history.length > MAX_HISTORY) history.shift();
      io.to(user.room).emit('chat:message', message);
    });

    socket.on('disconnect', () => leave(socket));
  });

  return { app, server, io };
}

if (require.main === module) {
  const { server } = createChatServer();
  server.listen(PORT, () => console.log(`Real-time chat is running at http://localhost:${PORT}`));
}

module.exports = { createChatServer, ROOMS };
