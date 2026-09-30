const path = require('node:path');

// Keep task data next to this entry point. Tests can set TASKS_FILE before loading the app.
if (!process.env.TASKS_FILE) {
  process.env.TASKS_FILE = path.join(__dirname, 'tasks.json');
}

const app = require('./src/app');
const PORT = Number(process.env.PORT || 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task Management API is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
