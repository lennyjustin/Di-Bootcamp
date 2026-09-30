require('dotenv').config();

const express = require('express');
const database = require('./server/config/database');
const authRoutes = require('./server/routes/authRoutes');
const usersRoutes = require('./server/routes/usersRoutes');
const config = require('./server/config/appConfig');

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(authRoutes);
app.use('/users', usersRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (!error.status || error.status >= 500) console.error(error);
  if (res.headersSent) return next(error);

  if (error.code === '23505') {
    return res.status(409).json({ error: 'Username or email is already registered' });
  }

  res.status(error.status || 500).json({
    error: error.status ? error.message : 'Internal server error',
  });
});

if (require.main === module) {
  const server = app.listen(config.port, () => {
    console.log(`User Auth API is running at http://localhost:${config.port}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await database.destroy();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;
