const express = require('express');
const session = require('express-session');
const quizRouter = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'development-only-change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
    },
}));

app.use('/quiz', quizRouter);

app.use((_req, res) => {
    res.status(404).send('Page not found. Go to <a href="/quiz">start the quiz</a>.');
});

app.listen(PORT, () => {
    console.log(`Trivia Quiz is running at http://localhost:${PORT}/quiz`);
});
