require('dotenv').config();

const express = require('express');
const db = require('./server/config/database');
const postsRouter = require('./server/routes/postsRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '100kb' }));
app.use('/posts', postsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (!error.status || error.status >= 500) console.error(error);
  if (res.headersSent) return next(error);

  res.status(error.status || 500).json({
    error: error.status ? error.message : 'Internal server error',
  });
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Blog API is running at http://localhost:${PORT}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await db.destroy();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;
