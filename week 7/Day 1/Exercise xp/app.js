const express = require('express');
const homeRouter = require('routes');
const todosRouter = require('routes/todos');
const booksRouter = require('routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/', homeRouter);
app.use('/todos', todosRouter);
app.use('/books', booksRouter);

app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ error: 'Request body must contain valid JSON.' });
    }

    return res.status(error.status || 500).json({ error: error.message || 'Internal server error.' });
});

app.listen(PORT, () => {
    console.log(`Express exercises are running at http://localhost:${PORT}`);
});
