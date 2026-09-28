const express = require('express');

const router = express.Router();
const triviaQuestions = [
    {
        question: 'What is the capital of France?',
        answer: 'Paris',
        options: ['Paris', 'Rome', 'Lisbon', 'Berlin'],
    },
    {
        question: 'Which planet is known as the Red Planet?',
        answer: 'Mars',
        options: ['Venus', 'Jupiter', 'Mars', 'Mercury'],
    },
    {
        question: 'What is the largest mammal in the world?',
        answer: 'Blue whale',
        options: ['African elephant', 'Giraffe', 'Blue whale', 'Hippopotamus'],
    },
];

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character]);
}

function renderPage(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Quickfire Trivia</title>
    <style>
        :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #25233a; background: #f6f5fb; }
        * { box-sizing: border-box; }
        body { min-height: 100vh; margin: 0; padding: 24px; display: grid; place-items: center; background: radial-gradient(circle at 12% 15%, #e3e0ff, transparent 32%), radial-gradient(circle at 88% 82%, #ffe7dc, transparent 30%), #f8f7fc; }
        main { width: min(620px, 100%); padding: clamp(24px, 6vw, 42px); border: 1px solid #eceaf4; border-radius: 26px; background: #fffefa; box-shadow: 0 24px 70px #28204f16; }
        .eyebrow { color: #7659d6; font-size: .78rem; font-weight: 850; letter-spacing: .15em; text-transform: uppercase; }
        h1 { margin: 10px 0; font-size: clamp(2rem, 7vw, 3.1rem); letter-spacing: -.06em; }
        .subtle { color: #777487; line-height: 1.55; }
        .progress { display: flex; justify-content: space-between; gap: 12px; margin: 24px 0 12px; color: #777487; font-size: .9rem; font-weight: 700; }
        .track { height: 8px; overflow: hidden; border-radius: 99px; background: #eeebf5; }
        .track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #6d4bd1, #ad8aff); }
        .question { margin: 24px 0 16px; font-size: 1.3rem; line-height: 1.35; }
        .answers { display: grid; gap: 10px; }
        .answer { position: relative; }
        .answer input { position: absolute; opacity: 0; }
        .answer label { display: block; padding: 14px 16px; border: 1.5px solid #e8e5ef; border-radius: 14px; color: #454256; cursor: pointer; font-weight: 650; transition: .16s ease; }
        .answer label:hover { border-color: #a38ce8; transform: translateY(-1px); }
        .answer input:checked + label { border-color: #795bdd; color: #5839bb; background: #f4f0ff; box-shadow: inset 0 0 0 1px #795bdd; }
        .answer input:focus-visible + label { outline: 3px solid #c6b8ff; outline-offset: 2px; }
        button, .link-button { display: inline-block; width: 100%; margin-top: 18px; padding: 14px 18px; border: 0; border-radius: 13px; background: #6e4bd1; color: #fff; font: inherit; font-weight: 800; text-align: center; text-decoration: none; cursor: pointer; }
        button:hover, .link-button:hover { background: #5937bc; }
        .feedback { margin: 0 0 18px; padding: 13px 15px; border-radius: 13px; font-weight: 750; }
        .feedback.correct { color: #187349; background: #e9f8ef; }
        .feedback.incorrect { color: #a9404b; background: #fff0f0; }
        .score { margin: 24px 0 8px; color: #6e4bd1; font-size: clamp(3.5rem, 15vw, 5rem); font-weight: 900; letter-spacing: -.07em; text-align: center; }
        .center { text-align: center; }
    </style>
</head>
<body><main>${content}</main></body>
</html>`;
}

function renderQuestion(req, res, message = null) {
    const quiz = req.session.quiz;
    const question = triviaQuestions[quiz.currentIndex];
    const options = question.options.map((option, index) => `
        <div class="answer">
            <input id="answer-${index}" name="answer" type="radio" value="${escapeHtml(option)}" required>
            <label for="answer-${index}">${escapeHtml(option)}</label>
        </div>`).join('');
    const feedback = message
        ? `<p class="feedback ${message.correct ? 'correct' : 'incorrect'}" role="status">${message.text}</p>`
        : '';
    const progress = Math.round((quiz.currentIndex / triviaQuestions.length) * 100);

    return res.send(renderPage(`
        <div class="eyebrow">Quickfire Trivia</div>
        <h1>Let’s play! 🧠</h1>
        <div class="progress"><span>Question ${quiz.currentIndex + 1} of ${triviaQuestions.length}</span><span>Score: ${quiz.score}</span></div>
        <div class="track" aria-hidden="true"><span style="width: ${progress}%"></span></div>
        ${feedback}
        <h2 class="question">${escapeHtml(question.question)}</h2>
        <form action="/quiz" method="post">
            <input type="hidden" name="questionIndex" value="${quiz.currentIndex}">
            <div class="answers">${options}</div>
            <button type="submit">${quiz.currentIndex === triviaQuestions.length - 1 ? 'Finish quiz' : 'Lock in answer'}</button>
        </form>`));
}

router.get('/', (req, res) => {
    req.session.quiz = { currentIndex: 0, score: 0, lastFeedback: null, finished: false };
    return renderQuestion(req, res);
});

router.post('/', (req, res) => {
    const quiz = req.session.quiz;
    if (!quiz) {
        return res.status(400).send(renderPage(`
            <div class="eyebrow">Quickfire Trivia</div>
            <h1>Start a new quiz</h1>
            <p class="subtle">Your quiz session has expired or has not started yet.</p>
            <a class="link-button" href="/quiz">Start quiz</a>`));
    }
    if (quiz.finished) return res.redirect('/quiz/score');

    const submittedIndex = Number(req.body.questionIndex);
    if (submittedIndex !== quiz.currentIndex) {
        return res.status(409).send(renderPage(`
            <div class="eyebrow">Quickfire Trivia</div>
            <h1>Question already submitted</h1>
            <p class="subtle">Please continue with your current quiz question.</p>
            <a class="link-button" href="/quiz">Start a new quiz</a>`));
    }

    const currentQuestion = triviaQuestions[quiz.currentIndex];
    const answer = typeof req.body.answer === 'string' ? req.body.answer.trim() : '';
    if (!currentQuestion.options.includes(answer)) {
        return res.status(400).send(renderQuestion(req, res, {
            correct: false,
            text: 'Choose one of the available answers before continuing.',
        }));
    }

    const correct = answer.toLocaleLowerCase() === currentQuestion.answer.toLocaleLowerCase();
    if (correct) quiz.score += 1;

    quiz.lastFeedback = {
        correct,
        text: correct
            ? `Correct! The answer is ${currentQuestion.answer}.`
            : `Not quite. The correct answer is ${currentQuestion.answer}.`,
    };
    quiz.currentIndex += 1;

    if (quiz.currentIndex >= triviaQuestions.length) {
        quiz.finished = true;
        return res.redirect('/quiz/score');
    }

    return renderQuestion(req, res, quiz.lastFeedback);
});

router.get('/score', (req, res) => {
    const quiz = req.session.quiz;
    if (!quiz || !quiz.finished) {
        return res.status(400).send(renderPage(`
            <div class="eyebrow">Quickfire Trivia</div>
            <h1>Your score is not ready yet</h1>
            <p class="subtle">Answer all ${triviaQuestions.length} questions to see your final score.</p>
            <a class="link-button" href="/quiz">Start quiz</a>`));
    }

    const feedback = quiz.lastFeedback
        ? `<p class="feedback ${quiz.lastFeedback.correct ? 'correct' : 'incorrect'}" role="status">${escapeHtml(quiz.lastFeedback.text)}</p>`
        : '';
    return res.send(renderPage(`
        <div class="eyebrow">Quiz complete</div>
        <h1 class="center">Nice work! 🎉</h1>
        ${feedback}
        <div class="score" aria-label="${quiz.score} out of ${triviaQuestions.length}">${quiz.score}<span style="font-size: 1.8rem; color: #9894a5">/${triviaQuestions.length}</span></div>
        <p class="subtle center">You got ${quiz.score} ${quiz.score === 1 ? 'question' : 'questions'} correct.</p>
        <a class="link-button" href="/quiz">Play again</a>`));
});

module.exports = router;
