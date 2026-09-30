const express = require('express');
const path = require('node:path');
const authRoutes = require('./server/routes/authRoutes');
const usersRoutes = require('./server/routes/usersRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(authRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => res.redirect('/login.html'));
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status < 500 ? error.message : 'Internal server error.' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`User API is running at http://localhost:${PORT}`));
}

module.exports = app;
