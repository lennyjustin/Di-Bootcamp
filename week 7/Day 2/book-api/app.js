const express = require('express');
const config = require('./server/config/appConfig');
const booksRouter = require('./server/routes/booksRoutes');

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use('/api/books', booksRouter);

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
  app.listen(config.port, () => {
    console.log(`Book API is running at http://localhost:${config.port}`);
  });
}

module.exports = app;
