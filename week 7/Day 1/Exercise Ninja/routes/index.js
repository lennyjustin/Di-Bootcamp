const express = require('express');

const router = express.Router();
const emojis = ['😀', '🎉', '🌟', '🎈', '👋'];

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
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
    <title>Emoji Greeting</title>
    <style>
        :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #28233d; background: #f7f5ff; }
        * { box-sizing: border-box; }
        body { min-height: 100vh; margin: 0; padding: 24px; display: grid; place-items: center; background: radial-gradient(circle at 15% 15%, #e4dcff, transparent 35%), radial-gradient(circle at 85% 80%, #ffe4d6, transparent 30%), #f8f7fc; }
        main { width: min(520px, 100%); padding: clamp(24px, 7vw, 44px); border: 1px solid #eeeaf8; border-radius: 28px; background: #ffffffed; box-shadow: 0 22px 65px #39256b18; text-align: center; }
        .sparkle { font-size: 2rem; }
        h1 { margin: 8px 0; font-size: clamp(2rem, 8vw, 3rem); letter-spacing: -.055em; }
        .intro { margin: 0 0 26px; color: #777286; line-height: 1.55; }
        label { display: block; margin: 18px 0 8px; text-align: left; font-weight: 750; }
        input[type="text"] { width: 100%; padding: 14px 15px; border: 1.5px solid #e5e0ef; border-radius: 13px; font: inherit; }
        input[type="text"]:focus { outline: 3px solid #e2d9ff; border-color: #8060da; }
        .emoji-list { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .emoji-option { position: relative; }
        .emoji-option input { position: absolute; opacity: 0; }
        .emoji-option span { display: grid; min-height: 56px; place-items: center; border: 1.5px solid #e9e5f0; border-radius: 14px; font-size: 1.8rem; cursor: pointer; transition: .15s ease; }
        .emoji-option span:hover { transform: translateY(-2px); border-color: #a58ee8; }
        .emoji-option input:checked + span { border-color: #795bdd; background: #f2edff; box-shadow: inset 0 0 0 1px #795bdd; }
        .emoji-option input:focus-visible + span { outline: 3px solid #c9bbff; outline-offset: 2px; }
        button, .again { display: inline-block; width: 100%; margin-top: 24px; padding: 14px 18px; border: 0; border-radius: 13px; background: #6e4bd1; color: white; font: inherit; font-weight: 800; text-decoration: none; cursor: pointer; }
        button:hover, .again:hover { background: #5937bc; }
        .greeting { margin: 26px 0 8px; font-size: clamp(2rem, 8vw, 3.3rem); letter-spacing: -.04em; }
        .validation { margin: 12px 0 0; color: #b33e55; font-size: .92rem; }
        .hint { margin: 10px 0 0; color: #888396; font-size: .86rem; }
    </style>
</head>
<body><main>${content}</main></body>
</html>`;
}

router.get('/', (_req, res) => {
    const emojiChoices = emojis.map((emoji, index) => `
        <label class="emoji-option" aria-label="Choose ${emoji}">
            <input type="radio" name="emoji" value="${emoji}" ${index === 0 ? 'checked' : ''}>
            <span aria-hidden="true">${emoji}</span>
        </label>`).join('');

    res.send(renderPage(`
        <div class="sparkle" aria-hidden="true">✨</div>
        <h1>Send a little joy</h1>
        <p class="intro">Add your name, choose a favorite emoji, and get a greeting made just for you.</p>
        <form action="/greet" method="post">
            <label for="name">Your name</label>
            <input id="name" name="name" type="text" maxlength="40" autocomplete="given-name" placeholder="What should we call you?" required>
            <label>Choose your emoji</label>
            <div class="emoji-list">${emojiChoices}
            </div>
            <button type="submit">Make my greeting</button>
        </form>`));
});

router.post('/greet', (req, res) => {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const emoji = typeof req.body.emoji === 'string' ? req.body.emoji : '';

    if (!name) {
        return res.status(400).send(renderPage(`
            <div class="sparkle" aria-hidden="true">✨</div>
            <h1>Almost there!</h1>
            <p class="intro">Please enter your name to make a greeting.</p>
            <p class="validation" role="alert">A name is required.</p>
            <a class="again" href="/">Go back</a>`));
    }
    if (name.length > 40) {
        return res.status(400).send(renderPage(`
            <h1>Name is too long</h1>
            <p class="validation" role="alert">Please use 40 characters or fewer.</p>
            <a class="again" href="/">Go back</a>`));
    }
    if (!emojis.includes(emoji)) {
        return res.status(400).send(renderPage(`
            <h1>Choose an emoji</h1>
            <p class="validation" role="alert">Select one of the emojis in the list.</p>
            <a class="again" href="/">Go back</a>`));
    }

    return res.send(renderPage(`
        <div class="sparkle" aria-hidden="true">A greeting for you</div>
        <h1 class="greeting">${emoji}</h1>
        <h2>Hello, ${escapeHtml(name)}!</h2>
        <p class="intro">Hope your day is full of good things.</p>
        <a class="again" href="/">Make another greeting</a>`));
});

module.exports = router;
