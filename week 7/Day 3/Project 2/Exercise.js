const express = require('express');
const http = require('node:http');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT || 3000);
const ROOMS = ['general', 'random', 'help'];
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 60;

function createChatServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);
  const participants = new Map();
  const history = new Map(ROOMS.map((room) => [room, []]));

  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  function getUsers(room) {
    return [...participants.values()]
      .filter((participant) => participant.room === room)
      .map(({ username }) => username)
      .sort((a, b) => a.localeCompare(b));
  }

  function publishUsers(room) {
    io.to(room).emit('room:users', getUsers(room));
  }

  function leaveRoom(socket, announce = true) {
    const participant = participants.get(socket.id);
    if (!participant) return;

    socket.leave(participant.room);
    participants.delete(socket.id);
    publishUsers(participant.room);
    if (announce) {
      io.to(participant.room).emit('chat:notice', {
        id: randomUUID(),
        text: `${participant.username} left #${participant.room}`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  io.on('connection', (socket) => {
    socket.on('chat:join', ({ username, room } = {}) => {
      const cleanUsername = typeof username === 'string' ? username.trim().replace(/\s+/g, ' ') : '';
      if (cleanUsername.length < 2 || cleanUsername.length > 24 || /[\u0000-\u001f\u007f]/.test(cleanUsername)) {
        socket.emit('chat:error', 'Choose a username between 2 and 24 characters.');
        return;
      }
      if (!ROOMS.includes(room)) {
        socket.emit('chat:error', 'Choose a valid room.');
        return;
      }

      const previous = participants.get(socket.id);
      if (previous) leaveRoom(socket);

      participants.set(socket.id, { username: cleanUsername, room });
      socket.join(room);
      socket.emit('room:state', {
        room,
        users: getUsers(room),
        messages: history.get(room),
      });
      publishUsers(room);
      socket.to(room).emit('chat:notice', {
        id: randomUUID(),
        text: `${cleanUsername} joined #${room}`,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('chat:leave', () => leaveRoom(socket));

    socket.on('chat:send', (payload = {}) => {
      const participant = participants.get(socket.id);
      if (!participant) {
        socket.emit('chat:error', 'Join a room before sending messages.');
        return;
      }
      const text = typeof payload.text === 'string' ? payload.text.trim() : '';
      if (!text || text.length > MAX_MESSAGE_LENGTH) {
        socket.emit('chat:error', `Messages must contain 1-${MAX_MESSAGE_LENGTH} characters.`);
        return;
      }

      const message = {
        id: randomUUID(),
        username: participant.username,
        text,
        room: participant.room,
        createdAt: new Date().toISOString(),
      };
      const roomHistory = history.get(participant.room);
      roomHistory.push(message);
      if (roomHistory.length > MAX_HISTORY) roomHistory.shift();
      io.to(participant.room).emit('chat:message', message);
    });

    socket.on('disconnect', () => leaveRoom(socket));
  });

  return { app, server, io };
}

if (require.main === module) {
  const { server } = createChatServer();
  server.listen(PORT, () => {
    console.log(`Chat app is running at http://localhost:${PORT}`);
  });
}

module.exports = { createChatServer, ROOMS };
