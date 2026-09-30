const express = require('express');
const path = require('node:path');

// Keep the JSON store beside this project; tests can override it with TASKS_FILE.
if (!process.env.TASKS_FILE) {
	process.env.TASKS_FILE = path.join(__dirname, 'tasks.json');
}

const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '100kb' }));
app.use('/tasks', taskRoutes);

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
	if (!error.status || error.status >= 500) console.error(error);
	if (res.headersSent) return next(error);
	res.status(error.status || 500).json({
		error: error.status && error.status < 500 ? error.message : 'Internal server error',
	});
});

if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`Task API is running at http://localhost:${PORT}`);
	});
}

module.exports = app;
