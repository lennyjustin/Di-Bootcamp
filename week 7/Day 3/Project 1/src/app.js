const express = require('express');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use('/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: status < 500 ? error.message : 'Internal server error while accessing task storage.',
  });
});

module.exports = app;
