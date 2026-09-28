const express = require('express');
const { randomUUID } = require('node:crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const emojis = [
	{ emoji: '😀', name: 'Smile' },
	{ emoji: '🐶', name: 'Dog' },
	{ emoji: '🌮', name: 'Taco' },
	{ emoji: '🚀', name: 'Rocket' },
	{ emoji: '🍕', name: 'Pizza' },
	{ emoji: '🌈', name: 'Rainbow' },
	{ emoji: '🐢', name: 'Turtle' },
	{ emoji: '🎸', name: 'Guitar' },
	{ emoji: '🦋', name: 'Butterfly' },
	{ emoji: '⚽', name: 'Soccer ball' },
	{ emoji: '🍉', name: 'Watermelon' },
	{ emoji: '🦉', name: 'Owl' },
	{ emoji: '🎈', name: 'Balloon' },
	{ emoji: '🌻', name: 'Sunflower' },
	{ emoji: '🐙', name: 'Octopus' },
	{ emoji: '❄️', name: 'Snowflake' },
	{ emoji: '🧁', name: 'Cupcake' },
	{ emoji: '🚲', name: 'Bicycle' },
];

const games = new Map();
const leaderboard = new Map();

function createQuestion(game) {
	if (game.unseenEmojiNames.size === 0) {
		game.unseenEmojiNames = new Set(emojis.map(({ name }) => name));
	}

	const available = emojis.filter(({ name }) => game.unseenEmojiNames.has(name));
	const correctEmoji = available[Math.floor(Math.random() * available.length)];
	game.unseenEmojiNames.delete(correctEmoji.name);

	const distractors = emojis
		.filter(({ name }) => name !== correctEmoji.name)
		.sort(() => Math.random() - 0.5)
		.slice(0, 3);
	const options = [...distractors, correctEmoji]
		.map(({ name }) => name)
		.sort(() => Math.random() - 0.5);

	const question = {
		id: randomUUID(),
		emoji: correctEmoji.emoji,
		options,
		answer: correctEmoji.name,
	};
	game.currentQuestion = question;

	return {
		id: question.id,
		emoji: question.emoji,
		options: question.options,
	};
}

function publicGame(game) {
	return {
		gameId: game.id,
		playerName: game.playerName,
		score: game.score,
		question: createQuestion(game),
	};
}

app.post('/api/games', (req, res) => {
	const playerName = typeof req.body.playerName === 'string'
		? req.body.playerName.trim().slice(0, 24)
		: '';

	if (!playerName) {
		return res.status(400).json({ error: 'Enter a name to start playing.' });
	}

	const game = {
		id: randomUUID(),
		playerName,
		score: 0,
		currentQuestion: null,
		unseenEmojiNames: new Set(emojis.map(({ name }) => name)),
	};
	games.set(game.id, game);

	return res.status(201).json(publicGame(game));
});

app.get('/api/leaderboard', (_req, res) => {
	const scores = [...leaderboard.values()]
		.sort((first, second) => second.score - first.score || first.playerName.localeCompare(second.playerName))
		.slice(0, 5);

	res.json(scores);
});

app.post('/api/guess', (req, res) => {
	const { gameId, questionId, answer } = req.body;
	const game = games.get(gameId);

	if (!game) {
		return res.status(404).json({ error: 'Game not found. Start a new game to play.' });
	}

	if (!game.currentQuestion || game.currentQuestion.id !== questionId) {
		return res.status(409).json({ error: 'That question has already been answered. Continue with the current question.' });
	}

	if (typeof answer !== 'string' || !game.currentQuestion.options.includes(answer)) {
		return res.status(400).json({ error: 'Choose one of the available answers.' });
	}

	const correct = answer === game.currentQuestion.answer;
	if (correct) {
		game.score += 1;
	}

	const playerKey = game.playerName.toLocaleLowerCase();
	const previousBest = leaderboard.get(playerKey);
	if (!previousBest || game.score > previousBest.score) {
		leaderboard.set(playerKey, { playerName: game.playerName, score: game.score });
	}

	const correctAnswer = game.currentQuestion.answer;
	const question = createQuestion(game);

	return res.json({
		correct,
		correctAnswer,
		score: game.score,
		feedback: correct ? 'Correct! Great guess!' : `Not quite — the answer was ${correctAnswer}.`,
		question,
	});
});

app.get('/', (_req, res) => {
	res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="theme-color" content="#f5f3ff">
	<title>Emoji Pop — Guess the emoji</title>
	<style>
		:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #24213a; background: #f5f3ff; }
		* { box-sizing: border-box; }
		body { margin: 0; min-height: 100vh; padding: 36px 18px; background: radial-gradient(circle at 15% 10%, #e8e3ff 0, transparent 30%), radial-gradient(circle at 90% 85%, #ffe9d9 0, transparent 28%), #f8f7fc; }
		main { width: min(920px, 100%); margin: 0 auto; }
		.header { text-align: center; margin-bottom: 26px; }
		.eyebrow { color: #7659d6; font-size: .78rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
		h1 { margin: 8px 0; font-size: clamp(2.35rem, 6vw, 4rem); letter-spacing: -.065em; line-height: 1; }
		.subtitle { color: #716d83; margin: 12px 0 0; }
		.layout { display: grid; grid-template-columns: minmax(0, 1fr) 265px; gap: 20px; align-items: start; }
		.card { background: rgba(255,255,255,.92); border: 1px solid #ece9f5; border-radius: 24px; box-shadow: 0 18px 50px #30215b12; padding: clamp(20px, 4vw, 34px); }
		.score-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #716d83; font-size: .92rem; font-weight: 700; }
		.score { color: #6d4bd1; font-size: 1.1rem; }
		.emoji-stage { display: grid; place-items: center; min-height: 190px; margin: 18px 0; border-radius: 20px; background: linear-gradient(135deg, #f2efff, #fff4e9); }
		#emoji { font-size: clamp(5rem, 15vw, 8rem); filter: drop-shadow(0 8px 5px #37265714); }
		fieldset { border: 0; padding: 0; margin: 0; }
		legend { width: 100%; margin: 0 0 12px; font-size: 1.05rem; font-weight: 800; }
		.options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
		.option { position: relative; }
		.option input { position: absolute; opacity: 0; pointer-events: none; }
		.option label { display: block; padding: 13px 14px; border: 1.5px solid #e9e6f0; border-radius: 13px; color: #454157; cursor: pointer; font-weight: 650; transition: .16s ease; }
		.option label:hover { border-color: #a38ce8; transform: translateY(-1px); }
		.option input:checked + label { color: #5839bb; border-color: #795bdd; background: #f4f0ff; box-shadow: inset 0 0 0 1px #795bdd; }
		.option input:focus-visible + label { outline: 3px solid #c6b8ff; outline-offset: 2px; }
		button { width: 100%; margin-top: 16px; padding: 14px 18px; border: 0; border-radius: 13px; color: white; background: #6e4bd1; font: inherit; font-weight: 800; cursor: pointer; box-shadow: 0 8px 18px #6e4bd13b; transition: .16s ease; }
		button:hover:not(:disabled) { background: #5937bc; transform: translateY(-1px); }
		button:disabled { cursor: not-allowed; opacity: .56; box-shadow: none; }
		.feedback { min-height: 28px; margin: 14px 0 0; font-weight: 750; }
		.feedback.success { color: #218354; }
		.feedback.error { color: #b34b56; }
		.side-card { padding: 24px; }
		.side-card h2 { margin: 0 0 6px; font-size: 1.2rem; }
		.side-copy { margin: 0 0 18px; color: #858093; font-size: .88rem; }
		#leaderboard { list-style: none; padding: 0; margin: 0; }
		#leaderboard li { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 0; border-top: 1px solid #f0edf5; font-size: .92rem; }
		.rank { display: inline-grid; place-items: center; width: 26px; height: 26px; margin-right: 8px; border-radius: 9px; background: #f2efff; color: #7053c8; font-size: .78rem; font-weight: 800; }
		.player-score { color: #6e4bd1; font-weight: 800; white-space: nowrap; }
		.empty { color: #9894a4; font-size: .9rem; }
		.start-overlay { position: fixed; inset: 0; z-index: 2; display: grid; place-items: center; padding: 20px; background: #201a38aa; backdrop-filter: blur(6px); }
		.start-card { width: min(410px, 100%); padding: 30px; border-radius: 24px; background: white; box-shadow: 0 24px 80px #17102955; }
		.start-card h2 { margin: 0 0 8px; font-size: 1.7rem; }
		.start-card p { color: #716d83; }
		.start-card label { display: block; margin: 20px 0 7px; font-weight: 750; }
		.start-card input { width: 100%; padding: 13px 14px; border: 1.5px solid #e6e2ef; border-radius: 12px; font: inherit; }
		.start-card input:focus { outline: 3px solid #ddd4ff; border-color: #795bdd; }
		.start-error { min-height: 20px; color: #b34b56; font-size: .9rem; }
		[hidden] { display: none !important; }
		@media (max-width: 700px) { body { padding: 25px 14px; } .layout { grid-template-columns: 1fr; } .side-card { order: 2; } .emoji-stage { min-height: 155px; } }
		@media (max-width: 420px) { .options { grid-template-columns: 1fr; } .score-row { align-items: flex-start; flex-direction: column; } }
	</style>
</head>
<body>
	<main>
		<header class="header">
			<div class="eyebrow">The little game of big clues</div>
			<h1>Emoji Pop <span aria-hidden="true">✨</span></h1>
			<p class="subtitle">Can you name the emoji? Pick an answer and build your streak.</p>
		</header>
		<div class="layout">
			<section class="card" aria-label="Emoji guessing game">
				<div class="score-row"><span id="player-label">Ready when you are</span><span class="score">Score: <span id="score">0</span></span></div>
				<form id="guess-form">
					<div class="emoji-stage"><span id="emoji" role="img" aria-label="Emoji to guess">❔</span></div>
					<fieldset>
						<legend>What does this emoji mean?</legend>
						<div class="options" id="options"></div>
					</fieldset>
					<button id="submit-button" type="submit" disabled>Lock in my guess</button>
				</form>
				<p class="feedback" id="feedback" role="status" aria-live="polite"></p>
				<button id="next-button" type="button" hidden>Next emoji →</button>
			</section>
			<aside class="card side-card" aria-labelledby="leaderboard-title">
				<h2 id="leaderboard-title">🏆 Top players</h2>
				<p class="side-copy">Best score per player</p>
				<ol id="leaderboard"><li class="empty">No scores yet. Be the first!</li></ol>
			</aside>
		</div>
	</main>

	<section class="start-overlay" id="start-overlay" aria-label="Start a game">
		<form class="start-card" id="start-form">
			<h2>Ready to play?</h2>
			<p>Name the emoji, earn points, and see if you can top the board.</p>
			<label for="player-name">Your name</label>
			<input id="player-name" name="playerName" maxlength="24" autocomplete="nickname" required placeholder="e.g. Emoji Expert">
			<p class="start-error" id="start-error" role="alert"></p>
			<button type="submit">Start guessing 🎉</button>
		</form>
	</section>

	<script>
		const startForm = document.querySelector('#start-form');
		const guessForm = document.querySelector('#guess-form');
		const submitButton = document.querySelector('#submit-button');
		const nextButton = document.querySelector('#next-button');
		const feedback = document.querySelector('#feedback');
		const optionsContainer = document.querySelector('#options');
		let gameId = null;
		let currentQuestion = null;
		let pendingQuestion = null;

		async function request(path, options = {}) {
			const response = await fetch(path, {
				headers: { 'Content-Type': 'application/json' },
				...options,
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
			return data;
		}

		function renderQuestion(question) {
			currentQuestion = question;
			document.querySelector('#emoji').textContent = question.emoji;
			document.querySelector('#emoji').setAttribute('aria-label', 'Mystery emoji');
			optionsContainer.replaceChildren();
			question.options.forEach((option, index) => {
				const wrapper = document.createElement('div');
				wrapper.className = 'option';
				const input = document.createElement('input');
				input.type = 'radio';
				input.name = 'answer';
				input.id = 'answer-' + index;
				input.value = option;
				input.required = true;
				const label = document.createElement('label');
				label.htmlFor = input.id;
				label.textContent = option;
				wrapper.append(input, label);
				optionsContainer.append(wrapper);
			});
			submitButton.disabled = false;
			submitButton.hidden = false;
			nextButton.hidden = true;
			feedback.textContent = '';
			feedback.className = 'feedback';
		}

		async function refreshLeaderboard() {
			const scores = await request('/api/leaderboard');
			const list = document.querySelector('#leaderboard');
			list.replaceChildren();
			if (scores.length === 0) {
				const empty = document.createElement('li');
				empty.className = 'empty';
				empty.textContent = 'No scores yet. Be the first!';
				list.append(empty);
				return;
			}
			scores.forEach((entry, index) => {
				const item = document.createElement('li');
				const name = document.createElement('span');
				const rank = document.createElement('span');
				rank.className = 'rank';
				rank.textContent = String(index + 1);
				name.append(rank, document.createTextNode(entry.playerName));
				const score = document.createElement('span');
				score.className = 'player-score';
				score.textContent = entry.score + (entry.score === 1 ? ' pt' : ' pts');
				item.append(name, score);
				list.append(item);
			});
		}

		startForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			const startError = document.querySelector('#start-error');
			startError.textContent = '';
			const button = startForm.querySelector('button');
			button.disabled = true;
			try {
				const game = await request('/api/games', {
					method: 'POST',
					body: JSON.stringify({ playerName: document.querySelector('#player-name').value }),
				});
				gameId = game.gameId;
				document.querySelector('#player-label').textContent = 'Playing as ' + game.playerName;
				document.querySelector('#score').textContent = game.score;
				renderQuestion(game.question);
				document.querySelector('#start-overlay').hidden = true;
			} catch (error) {
				startError.textContent = error.message;
			} finally {
				button.disabled = false;
			}
		});

		guessForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			const selected = guessForm.querySelector('input[name="answer"]:checked');
			if (!selected || !currentQuestion) return;
			submitButton.disabled = true;
			feedback.textContent = 'Checking your guess…';
			feedback.className = 'feedback';
			try {
				const result = await request('/api/guess', {
					method: 'POST',
					body: JSON.stringify({ gameId, questionId: currentQuestion.id, answer: selected.value }),
				});
				document.querySelector('#score').textContent = result.score;
				feedback.textContent = result.feedback;
				feedback.className = 'feedback ' + (result.correct ? 'success' : 'error');
				pendingQuestion = result.question;
				submitButton.hidden = true;
				nextButton.hidden = false;
				await refreshLeaderboard();
			} catch (error) {
				feedback.textContent = error.message;
				feedback.className = 'feedback error';
				submitButton.disabled = false;
			}
		});

		nextButton.addEventListener('click', () => {
			if (pendingQuestion) renderQuestion(pendingQuestion);
		});

		refreshLeaderboard().catch(() => {});
	</script>
</body>
</html>`);
});

app.listen(PORT, () => {
	console.log(`Emoji Pop is running at http://localhost:${PORT}`);
});
