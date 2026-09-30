(() => {
  const state = { token: localStorage.getItem('gridline-token') || '', user: null, game: null, authMode: 'login' };
  const $ = (selector) => document.querySelector(selector);
  const authView = $('#auth-view');
  const lobbyView = $('#lobby-view');
  const gameView = $('#game-view');
  const toast = $('#game-toast');
  let toastTimer;

  async function api(url, { method = 'GET', body } = {}) {
    const response = await fetch(url, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = response.status === 204 ? {} : await response.json();
    if (!response.ok) {
      if (response.status === 401) logout(false);
      throw new Error(data.error || 'Request failed.');
    }
    return data;
  }

  function notify(message, type = '') {
    toast.textContent = message;
    toast.className = `game-toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'game-toast'; }, 3000);
  }

  function showView(view) {
    [authView, lobbyView, gameView].forEach((element) => element.classList.add('hidden'));
    view.classList.remove('hidden');
    $('#logout-button').classList.toggle('hidden', view === authView);
  }

  function initials(username) {
    return username.slice(0, 2).toUpperCase();
  }

  async function authenticate() {
    const username = $('#username').value.trim();
    const password = $('#password').value;
    const endpoint = state.authMode === 'register' ? '/api/register' : '/api/login';
    try {
      $('#auth-submit').textContent = 'Connecting…';
      const result = await api(endpoint, { method: 'POST', body: { username, password } });
      state.token = result.token;
      state.user = result.user;
      localStorage.setItem('gridline-token', state.token);
      await loadLobby();
    } catch (error) {
      $('#auth-error').textContent = error.message;
    } finally {
      $('#auth-submit').textContent = state.authMode === 'register' ? 'Create commander' : 'Enter the arena';
    }
  }

  async function loadLobby() {
    showView(lobbyView);
    $('#commander-name').textContent = state.user.username;
    $('#commander-avatar').textContent = initials(state.user.username);
    try {
      const { games } = await api('/api/games');
      renderGames(games.filter((game) => game.status === 'waiting'));
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function renderGames(games) {
    const list = $('#game-list');
    list.replaceChildren();
    if (!games.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const icon = document.createElement('div');
      icon.textContent = '⌁';
      const heading = document.createElement('strong');
      heading.textContent = 'No open matches';
      const detail = document.createElement('span');
      detail.textContent = 'Start a new game and invite an opponent.';
      empty.append(icon, heading, detail);
      list.append(empty);
      return;
    }
    for (const game of games) {
      const row = document.createElement('article');
      row.className = 'open-game';
      const icon = document.createElement('div');
      icon.className = 'open-game-icon';
      icon.textContent = '⌖';
      const info = document.createElement('div');
      info.className = 'open-game-info';
      const title = document.createElement('strong');
      title.textContent = `${game.players[0]?.username || 'Commander'}’s match`;
      const subtitle = document.createElement('small');
      subtitle.textContent = `Created ${new Date(game.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      const join = document.createElement('button');
      join.className = 'button primary';
      join.textContent = 'Join';
      join.addEventListener('click', () => joinGame(game.id));
      info.append(title, subtitle);
      row.append(icon, info, join);
      list.append(row);
    }
  }

  async function createGame() {
    try {
      const { game } = await api('/api/games', { method: 'POST' });
      await openGame(game.id);
      notify('Match created. Waiting for an opponent…');
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function joinGame(id) {
    try {
      await api(`/api/games/${id}/join`, { method: 'POST' });
      await openGame(id);
    } catch (error) {
      notify(error.message, 'error');
      loadLobby();
    }
  }

  async function openGame(id) {
    try {
      const { game } = await api(`/api/games/${id}`);
      state.game = game;
      showView(gameView);
      renderGame();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function renderGame() {
    const game = state.game;
    if (!game) return;
    $('#match-short-id').textContent = game.id.slice(0, 8).toUpperCase();
    const waiting = game.status === 'waiting';
    const finished = game.status === 'finished';
    const myTurn = game.currentTurn === state.user.id && !waiting && !finished;
    const me = game.players.find((player) => player.id === state.user.id);
    const opponent = game.players.find((player) => player.id !== state.user.id);
    $('#game-title').textContent = finished
      ? (game.winner?.id === state.user.id ? 'Victory secured' : 'The base has fallen')
      : waiting ? 'Waiting for opponent' : myTurn ? 'Your move, commander' : `${game.currentTurnUsername} is thinking…`;
    const turnBadge = $('#turn-badge');
    turnBadge.textContent = finished ? 'MATCH OVER' : waiting ? 'WAITING' : myTurn ? 'YOUR TURN' : 'ENEMY TURN';
    turnBadge.className = `turn-badge${waiting ? ' waiting' : !myTurn && !finished ? ' enemy' : ''}`;
    $('#turn-number').textContent = waiting ? 'TURN —' : `TURN ${game.turnNumber}`;
    $('#move-instruction').textContent = waiting ? 'Share the game ID with a friend, or wait for someone to join.' : finished ? 'This match is complete.' : myTurn ? 'Choose one adjacent tile or attack from beside the enemy base.' : 'Opponent turn. Plan your next move.';
    $('#player-cards').replaceChildren();
    game.players.forEach((player, index) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      const disc = document.createElement('span');
      disc.className = `player-disc${index === 1 ? ' red' : ''}`;
      disc.textContent = initials(player.username);
      const copy = document.createElement('div');
      copy.className = 'player-copy';
      const name = document.createElement('strong');
      name.textContent = player.username;
      const detail = document.createElement('small');
      detail.textContent = index === 0 ? 'BLUE COMMAND' : 'RED COMMAND';
      copy.append(name, detail);
      card.append(disc, copy);
      if (game.currentTurn === player.id) {
        const tag = document.createElement('span');
        tag.className = 'turn-tag';
        tag.textContent = 'ACTIVE';
        card.append(tag);
      }
      $('#player-cards').append(card);
    });
    renderBoard(me, opponent, myTurn);
    renderLog(game.recentMoves);
    if (finished) {
      let banner = document.querySelector('.winner-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.className = 'winner-banner';
        $('#board').before(banner);
      }
      banner.textContent = game.winner?.id === state.user.id ? '✦  Your base-capture plan worked. You win!' : `✦  ${game.winner?.username || 'Your opponent'} captured the base.`;
    } else {
      document.querySelector('.winner-banner')?.remove();
    }
  }

  function renderBoard(me, opponent, myTurn) {
    const board = $('#board');
    board.replaceChildren();
    const game = state.game;
    const lastMove = game.recentMoves.at(-1)?.to;
    const obstacleSet = new Set(game.obstacles.map(({ row, col }) => `${row},${col}`));
    for (let row = 0; row < 10; row += 1) {
      for (let col = 0; col < 10; col += 1) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'tile';
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}`);
        const pointKey = `${row},${col}`;
        if (obstacleSet.has(pointKey)) {
          cell.classList.add('obstacle');
          cell.disabled = true;
          cell.title = 'Obstacle';
        }
        if (row === me.base.row && col === me.base.col) {
          cell.classList.add('base-blue');
          const mark = document.createElement('span');
          mark.className = 'base-mark';
          mark.textContent = '⌂';
          cell.append(mark);
          cell.title = 'Your base';
        }
        if (opponent && row === opponent.base.row && col === opponent.base.col) {
          cell.classList.remove('obstacle');
          cell.classList.add('base-red');
          cell.title = 'Enemy base';
          const mark = document.createElement('span');
          mark.className = 'base-mark';
          mark.textContent = '⌂';
          cell.append(mark);
        }
        if (lastMove && lastMove.row === row && lastMove.col === col) cell.classList.add('last-move');
        const playerHere = game.players.find((player) => player.position.row === row && player.position.col === col);
        if (playerHere) {
          const unit = document.createElement('span');
          unit.className = `unit${playerHere.id === game.players[1]?.id ? ' red' : ''}`;
          unit.textContent = initials(playerHere.username);
          unit.title = `${playerHere.username}${playerHere.id === state.user.id ? ' (you)' : ''}`;
          cell.append(unit);
        } else if (myTurn && !obstacleSet.has(pointKey)) {
          cell.addEventListener('click', () => {
            const deltaRow = row - me.position.row;
            const deltaCol = col - me.position.col;
            const direction = deltaRow === -1 && deltaCol === 0 ? 'up'
              : deltaRow === 1 && deltaCol === 0 ? 'down'
                : deltaRow === 0 && deltaCol === -1 ? 'left'
                  : deltaRow === 0 && deltaCol === 1 ? 'right' : null;
            if (direction) makeMove(direction);
          });
        }
        board.append(cell);
      }
    }
    document.querySelectorAll('[data-direction]').forEach((button) => { button.disabled = !myTurn; });
    $('#attack-button').disabled = !myTurn;
    $('#attack-action').disabled = !myTurn;
  }

  function renderLog(moves) {
    const list = $('#move-log');
    list.replaceChildren();
    if (!moves.length) {
      const empty = document.createElement('li');
      empty.className = 'log-empty';
      empty.textContent = 'No moves recorded yet.';
      list.append(empty);
      return;
    }
    [...moves].reverse().forEach((move) => {
      const item = document.createElement('li');
      const action = move.type === 'attack' ? 'attacked the enemy base' : `moved ${move.direction}`;
      item.textContent = `${move.username} ${action}`;
      list.append(item);
    });
  }

  async function refreshGame() {
    if (!state.game) return;
    try {
      const { game } = await api(`/api/games/${state.game.id}`);
      state.game = game;
      renderGame();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function makeMove(direction) {
    if (!state.game) return;
    try {
      const { game } = await api(`/api/games/${state.game.id}/moves`, { method: 'POST', body: { direction } });
      state.game = game;
      renderGame();
      if (game.winner) notify('Base captured. Victory!', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function attackBase() {
    if (!state.game) return;
    try {
      const { game } = await api(`/api/games/${state.game.id}/attack`, { method: 'POST', body: {} });
      state.game = game;
      renderGame();
      notify('Enemy base captured!', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function logout(showNotice = true) {
    state.token = '';
    state.user = null;
    state.game = null;
    localStorage.removeItem('gridline-token');
    showView(authView);
    if (showNotice) notify('You have logged out.');
  }

  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.authMode = tab.dataset.mode;
      document.querySelectorAll('.auth-tab').forEach((item) => item.classList.toggle('active', item === tab));
      $('#auth-title').textContent = state.authMode === 'register' ? 'Create your commander' : 'Welcome back, commander';
      $('#auth-subtitle').textContent = state.authMode === 'register' ? 'Choose a callsign and enter the arena.' : 'Sign in and get back to the front.';
      $('#auth-submit').textContent = state.authMode === 'register' ? 'Create commander' : 'Enter the arena';
      $('#password').autocomplete = state.authMode === 'register' ? 'new-password' : 'current-password';
      $('#auth-error').textContent = '';
    });
  });

  $('#auth-form').addEventListener('submit', (event) => {
    event.preventDefault();
    $('#auth-error').textContent = '';
    authenticate();
  });
  $('#create-game').addEventListener('click', createGame);
  $('#refresh-games').addEventListener('click', loadLobby);
  $('#back-lobby').addEventListener('click', loadLobby);
  $('#copy-link').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.game.id);
      notify('Game ID copied. Share it with your opponent.', 'success');
    } catch {
      notify(`Game ID: ${state.game.id}`);
    }
  });
  $('#logout-button').addEventListener('click', () => logout());
  document.querySelectorAll('[data-direction]').forEach((button) => button.addEventListener('click', () => makeMove(button.dataset.direction)));
  $('#attack-button').addEventListener('click', attackBase);
  $('#attack-action').addEventListener('click', attackBase);
  document.addEventListener('keydown', (event) => {
    if (gameView.classList.contains('hidden') || event.target instanceof HTMLInputElement) return;
    const keys = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
    const direction = keys[event.key] || keys[event.key.toLowerCase()];
    if (direction) {
      event.preventDefault();
      makeMove(direction);
    }
  });

  // REST polling keeps both players in sync while a match is open.
  setInterval(() => {
    if (!gameView.classList.contains('hidden') && state.game) refreshGame();
  }, 1800);

  (async () => {
    if (!state.token) return;
    try {
      const { user } = await api('/api/me');
      state.user = user;
      await loadLobby();
    } catch {
      logout(false);
    }
  })();
})();
