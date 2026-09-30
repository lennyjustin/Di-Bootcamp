(() => {
  const state = { token: localStorage.getItem('gridline-token') || '', user: null, game: null, mode: 'login' };
  const $ = (selector) => document.querySelector(selector);
  const authView = $('#auth');
  const lobbyView = $('#lobby');
  const gameView = $('#game');
  let toastTimer;

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}) },
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) logout(false);
      throw new Error(data.error || 'Request failed.');
    }
    return data;
  }

  function show(view) {
    [authView, lobbyView, gameView].forEach((element) => element.classList.add('hidden'));
    view.classList.remove('hidden');
    $('#logout').classList.toggle('hidden', view === authView);
  }

  function notice(message, kind = '') {
    const toast = $('#toast');
    toast.textContent = message;
    toast.className = `toast show ${kind}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3000);
  }

  function initials(name) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }

  async function submitAuth(event) {
    event.preventDefault();
    const username = $('#username').value.trim();
    const password = $('#password').value;
    const endpoint = state.mode === 'register' ? '/api/register' : '/api/login';
    try {
      $('#auth-submit').textContent = 'Connecting…';
      const result = await api(endpoint, { method: 'POST', body: JSON.stringify({ username, password }) });
      state.user = result.user;
      state.token = result.token;
      localStorage.setItem('gridline-token', state.token);
      await loadLobby();
    } catch (error) {
      $('#auth-error').textContent = error.message;
    } finally {
      $('#auth-submit').textContent = state.mode === 'register' ? 'Create commander' : 'Enter the arena';
    }
  }

  async function loadLobby() {
    show(lobbyView);
    $('#commander-name').textContent = state.user.username;
    $('#commander-avatar').textContent = initials(state.user.username);
    try {
      const { games } = await api('/api/games');
      renderGames(games.filter((item) => item.status === 'waiting'));
    } catch (error) { notice(error.message, 'error'); }
  }

  function renderGames(games) {
    const list = $('#games-list');
    list.replaceChildren();
    if (!games.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<b>No open matches</b><small>Start a game and invite an opponent.</small>';
      list.append(empty);
      return;
    }
    games.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'open-game';
      const title = document.createElement('b');
      title.textContent = `${item.players[0]?.username || 'Commander'}’s match`;
      const join = document.createElement('button');
      join.className = 'primary';
      join.textContent = 'Join';
      join.addEventListener('click', () => joinGame(item.id));
      row.append(title, join);
      list.append(row);
    });
  }

  async function createGame() {
    try {
      const { game } = await api('/api/games', { method: 'POST', body: '{}' });
      await openGame(game.id);
    } catch (error) { notice(error.message, 'error'); }
  }

  async function joinGame(id) {
    try {
      await api(`/api/games/${id}/join`, { method: 'POST', body: '{}' });
      await openGame(id);
    } catch (error) {
      notice(error.message, 'error');
      await loadLobby();
    }
  }

  async function openGame(id) {
    try {
      const { game } = await api(`/api/games/${id}`);
      state.game = game;
      show(gameView);
      renderGame();
    } catch (error) { notice(error.message, 'error'); }
  }

  function renderGame() {
    const game = state.game;
    if (!game) return;
    const me = game.players.find((player) => player.id === state.user.id);
    const opponent = game.players.find((player) => player.id !== state.user.id);
    const waiting = game.status === 'waiting';
    const finished = game.status === 'finished';
    const myTurn = !waiting && !finished && game.currentTurn === state.user.id;
    $('#game-id').textContent = game.id.slice(0, 8).toUpperCase();
    $('#game-title').textContent = finished ? (game.winner?.id === state.user.id ? 'Victory secured' : 'The base has fallen') : waiting ? 'Waiting for opponent' : myTurn ? 'Your move, commander' : `${game.currentTurnUsername} is thinking…`;
    $('#turn-badge').textContent = finished ? 'MATCH OVER' : waiting ? 'WAITING' : myTurn ? 'YOUR TURN' : 'ENEMY TURN';
    $('#turn-badge').className = `badge${!myTurn && !waiting && !finished ? ' enemy' : ''}`;
    $('#turn-number').textContent = waiting ? 'TURN —' : `TURN ${game.turnNumber}`;
    $('#move-hint').textContent = waiting ? 'Share this game ID or wait for a commander to join.' : finished ? 'The match is complete.' : myTurn ? 'Choose an adjacent tile or attack next to the enemy base.' : 'Opponent turn. Plan your next move.';
    const players = $('#players');
    players.replaceChildren();
    game.players.forEach((player, index) => {
      const item = document.createElement('div');
      item.className = 'player-card';
      const avatar = document.createElement('span');
      avatar.className = `player-disc${index === 1 ? ' red' : ''}`;
      avatar.textContent = initials(player.username);
      const name = document.createElement('b');
      name.textContent = player.username;
      item.append(avatar, name);
      if (game.currentTurn === player.id) {
        const turn = document.createElement('small');
        turn.textContent = 'ACTIVE';
        item.append(turn);
      }
      players.append(item);
    });
    renderBoard(me, opponent, myTurn);
    renderLog(game.recentMoves);
    document.querySelector('.winner-banner')?.remove();
    if (finished) {
      const banner = document.createElement('div');
      banner.className = 'winner-banner';
      banner.textContent = game.winner.id === state.user.id ? 'You captured the base. You win!' : `${game.winner.username} captured the base.`;
      $('#board').before(banner);
    }
  }

  function renderBoard(me, opponent, myTurn) {
    const board = $('#board');
    board.replaceChildren();
    const game = state.game;
    const obstacles = new Set(game.obstacles.map(({ row, col }) => `${row},${col}`));
    const last = game.recentMoves.at(-1)?.to;
    for (let row = 0; row < 10; row += 1) {
      for (let col = 0; col < 10; col += 1) {
        const key = `${row},${col}`;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}`);
        if (obstacles.has(key)) { cell.classList.add('obstacle'); cell.disabled = true; cell.title = 'Obstacle'; }
        if (row === me.base.row && col === me.base.col) { cell.classList.add('blue-base'); cell.title = 'Your base'; cell.insertAdjacentText('afterbegin', '⌂'); }
        if (opponent && row === opponent.base.row && col === opponent.base.col) { cell.classList.remove('obstacle'); cell.classList.add('red-base'); cell.title = 'Enemy base'; cell.insertAdjacentText('afterbegin', '⌂'); }
        if (last?.row === row && last?.col === col) cell.classList.add('last');
        const occupant = game.players.find((player) => player.position.row === row && player.position.col === col);
        if (occupant) {
          const unit = document.createElement('span');
          unit.className = `unit${occupant.id === game.players[1]?.id ? ' red' : ''}`;
          unit.textContent = initials(occupant.username);
          unit.title = occupant.username;
          cell.append(unit);
        } else if (myTurn && !obstacles.has(key)) {
          cell.addEventListener('click', () => {
            const dr = row - me.position.row;
            const dc = col - me.position.col;
            const direction = dr === -1 && dc === 0 ? 'up' : dr === 1 && dc === 0 ? 'down' : dr === 0 && dc === -1 ? 'left' : dr === 0 && dc === 1 ? 'right' : null;
            if (direction) move(direction);
          });
        }
        board.append(cell);
      }
    }
    document.querySelectorAll('[data-direction]').forEach((button) => { button.disabled = !myTurn; });
    $('#attack').disabled = !myTurn;
    $('#attack-action').disabled = !myTurn;
  }

  function renderLog(moves) {
    const list = $('#move-log');
    list.replaceChildren();
    if (!moves.length) {
      const empty = document.createElement('li');
      empty.textContent = 'No moves yet.';
      list.append(empty);
      return;
    }
    [...moves].reverse().forEach((move) => {
      const row = document.createElement('li');
      row.textContent = move.type === 'attack' ? `${move.username} attacked the base` : `${move.username} moved ${move.direction}`;
      list.append(row);
    });
  }

  async function refreshGame() {
    if (!state.game) return;
    try {
      const { game } = await api(`/api/games/${state.game.id}`);
      state.game = game;
      renderGame();
    } catch (error) { notice(error.message, 'error'); }
  }

  async function move(direction) {
    try {
      const { game } = await api(`/api/games/${state.game.id}/moves`, { method: 'POST', body: JSON.stringify({ direction }) });
      state.game = game;
      renderGame();
      if (game.winner) notice('Base captured. Victory!', 'success');
    } catch (error) { notice(error.message, 'error'); }
  }

  async function attack() {
    try {
      const { game } = await api(`/api/games/${state.game.id}/attack`, { method: 'POST', body: '{}' });
      state.game = game;
      renderGame();
      notice('Enemy base captured!', 'success');
    } catch (error) { notice(error.message, 'error'); }
  }

  function logout() {
    state.token = '';
    state.user = null;
    state.game = null;
    localStorage.removeItem('gridline-token');
    show(authView);
  }

  document.querySelectorAll('.tabs button').forEach((tab) => tab.addEventListener('click', () => {
    state.mode = tab.dataset.mode;
    document.querySelectorAll('.tabs button').forEach((button) => button.classList.toggle('active', button === tab));
    $('#auth-title').textContent = state.mode === 'register' ? 'Create your commander' : 'Welcome back, commander';
    $('#auth-subtitle').textContent = state.mode === 'register' ? 'Choose a callsign and enter the arena.' : 'Sign in and return to the front.';
    $('#auth-submit').textContent = state.mode === 'register' ? 'Create commander' : 'Enter the arena';
    $('#password').autocomplete = state.mode === 'register' ? 'new-password' : 'current-password';
    $('#auth-error').textContent = '';
  }));
  $('#auth-form').addEventListener('submit', submitAuth);
  $('#create-game').addEventListener('click', createGame);
  $('#refresh').addEventListener('click', loadLobby);
  $('#back').addEventListener('click', loadLobby);
  $('#logout').addEventListener('click', logout);
  document.querySelectorAll('[data-direction]').forEach((button) => button.addEventListener('click', () => move(button.dataset.direction)));
  $('#attack').addEventListener('click', attack);
  $('#attack-action').addEventListener('click', attack);
  document.addEventListener('keydown', (event) => {
    if (gameView.classList.contains('hidden') || event.target instanceof HTMLInputElement) return;
    const directions = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
    const direction = directions[event.key] || directions[event.key.toLowerCase()];
    if (direction) { event.preventDefault(); move(direction); }
  });
  setInterval(() => {
    if (!gameView.classList.contains('hidden') && state.game) refreshGame();
  }, 1600);

  (async () => {
    if (!state.token) return;
    try {
      const { user } = await api('/api/me');
      state.user = user;
      await loadLobby();
    } catch { logout(); }
  })();
})();
