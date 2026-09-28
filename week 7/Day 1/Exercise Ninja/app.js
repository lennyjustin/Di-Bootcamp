const express = require('express');
const greetingRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.urlencoded({ extended: false }));
app.use('/', greetingRouter);

app.use((_req, res) => {
    res.status(404).send('Page not found.');
});

app.listen(PORT, () => {
    console.log(`Emoji Greeting is running at http://localhost:${PORT}`);
});
