const express = require('express');
const postsRouter = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '100kb' }));
app.use('/posts', postsRouter);

app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ error: 'Request body must contain valid JSON.' });
    }

    return res.status(error.status || 500).json({
        error: error.status === 413 ? 'Request body is too large.' : 'Internal server error.',
    });
});

app.listen(PORT, () => {
    console.log(`Blog API is running at http://localhost:${PORT}`);
});
