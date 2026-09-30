(() => {
  const socket = io();
  const welcome = document.querySelector('#welcome');
  const chat = document.querySelector('#chat');
  const joinForm = document.querySelector('#join-form');
  const joinError = document.querySelector('#join-error');
  const messages = document.querySelector('#messages');
  const messageForm = document.querySelector('#message-form');
  const messageInput = document.querySelector('#message-input');
  const roomNames = {
    general: 'The place for everyday conversations.',
    random: 'Unexpected stuff, delightful detours.',
    help: 'Ask a question. Someone has your back.',
  };
  const colors = ['#6c7ee8', '#df9865', '#46aa92', '#b076c2', '#cf6b7a', '#5793bd'];
  let username = '';
  let room = 'general';
  let toastTimer;
  let unread = 0;
  let currentDay = '';

  function avatarColor(name) {
    let hash = 0;
    for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    return colors[hash % colors.length];
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  }

  function toast(text) {
    const element = document.querySelector('#toast');
    element.textContent = text;
    element.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('visible'), 2600);
  }

  function updateRoom(nextRoom) {
    room = nextRoom;
    document.querySelector('#room-title').textContent = room;
    document.querySelector('#room-description').textContent = roomNames[room];
    messageInput.placeholder = `Message #${room}`;
    document.querySelectorAll('#room-nav button').forEach((button) => {
      button.classList.toggle('active', button.dataset.room === room);
    });
    currentDay = '';
  }

  function dayDivider(timestamp) {
    const date = new Date(timestamp);
    const day = date.toLocaleDateString();
    if (day === currentDay) return;
    currentDay = day;
    const divider = document.createElement('div');
    divider.className = 'date-divider';
    divider.textContent = day === new Date().toLocaleDateString() ? 'TODAY' : day;
    messages.append(divider);
  }

  function addMessage(message, notify = false) {
    messages.querySelector('.room-welcome')?.remove();
    dayDivider(message.createdAt);
    const row = document.createElement('article');
    row.className = 'message';
    const avatar = document.createElement('span');
    avatar.className = 'message-avatar';
    avatar.style.backgroundColor = avatarColor(message.username);
    avatar.textContent = initials(message.username);
    const body = document.createElement('div');
    body.className = 'message-body';
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const name = document.createElement('b');
    name.textContent = message.username;
    const time = document.createElement('time');
    time.dateTime = message.createdAt;
    time.textContent = new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const text = document.createElement('p');
    text.textContent = message.text;
    meta.append(name, time);
    body.append(meta, text);
    row.append(avatar, body);
    messages.append(row);
    messages.scrollTop = messages.scrollHeight;
    if (notify && message.username !== username) {
      toast(`${message.username} sent a message`);
      if (document.hidden) {
        unread += 1;
        document.title = `(${unread}) #${room} · Gather`;
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${message.username} in #${room}`, { body: message.text });
        }
      }
    }
  }

  function addNotice(notice) {
    const item = document.createElement('div');
    item.className = 'notice';
    item.textContent = notice.text;
    messages.append(item);
    messages.scrollTop = messages.scrollHeight;
    if (notice.text.includes('joined')) toast(notice.text);
  }

  function updateUsers(users) {
    document.querySelector('#member-total').textContent = users.length;
    document.querySelector('#member-small').textContent = users.length;
    document.querySelector('#online-total').textContent = `${users.length} online`;
    const list = document.querySelector('#user-list');
    list.replaceChildren();
    users.forEach((name) => {
      const item = document.createElement('li');
      const avatar = document.createElement('span');
      avatar.className = 'user-avatar';
      avatar.style.color = avatarColor(name);
      avatar.style.backgroundColor = `${avatarColor(name)}25`;
      avatar.textContent = initials(name);
      const label = document.createElement('span');
      label.textContent = name;
      item.append(avatar, label);
      list.append(item);
    });
  }

  function showRoom({ room: nextRoom, users, messages: history }) {
    updateRoom(nextRoom);
    welcome.classList.add('hidden');
    chat.classList.remove('hidden');
    document.querySelector('#my-name').textContent = username;
    document.querySelector('#my-avatar').textContent = initials(username);
    document.querySelector('#my-avatar').style.backgroundColor = `${avatarColor(username)}35`;
    messages.innerHTML = `<div class="room-welcome"><span>✳</span><div><b>Welcome to #${nextRoom}</b><p>This is the beginning of something good. Say hello!</p></div></div>`;
    history.forEach((message) => addMessage(message));
    updateUsers(users);
    messageInput.focus();
  }

  joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    username = document.querySelector('#username').value.trim().replace(/\s+/g, ' ');
    room = new FormData(joinForm).get('room');
    joinError.textContent = '';
    socket.emit('chat:join', { username, room });
  });

  socket.on('room:state', showRoom);
  socket.on('room:users', updateUsers);
  socket.on('chat:message', (message) => addMessage(message, true));
  socket.on('chat:notice', addNotice);
  socket.on('chat:error', (message) => {
    if (welcome.classList.contains('hidden')) toast(message);
    else joinError.textContent = message;
  });
  socket.on('connect_error', () => toast('Connection interrupted; reconnecting…'));
  socket.on('connect', () => {
    if (username && !welcome.classList.contains('hidden')) socket.emit('chat:join', { username, room });
  });

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    socket.emit('chat:send', { text });
    messageInput.value = '';
    messageInput.focus();
  });

  document.querySelectorAll('#room-nav button').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.room === room) return;
      room = button.dataset.room;
      messages.innerHTML = `<div class="room-welcome"><span>✳</span><div><b>Welcome to #${room}</b><p>This is the beginning of something good. Say hello!</p></div></div>`;
      socket.emit('chat:join', { username, room });
    });
  });

  document.querySelector('#leave-button').addEventListener('click', () => {
    socket.emit('chat:leave');
    username = '';
    chat.classList.add('hidden');
    welcome.classList.remove('hidden');
    joinForm.reset();
    document.title = 'Gather — Real-time chat';
  });

  document.querySelector('#members-toggle').addEventListener('click', () => {
    document.querySelector('#members').classList.toggle('collapsed');
    chat.classList.toggle('members-hidden');
  });

  document.querySelector('#notifications').addEventListener('click', async () => {
    if (!('Notification' in window)) return toast('Browser notifications are not supported.');
    const permission = await Notification.requestPermission();
    toast(permission === 'granted' ? 'Browser notifications enabled.' : 'Notifications were not enabled.');
  });

  document.querySelector('#emoji').addEventListener('click', () => {
    messageInput.setRangeText('😊', messageInput.selectionStart, messageInput.selectionEnd, 'end');
    messageInput.focus();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      unread = 0;
      document.title = `#${room} · Gather`;
    }
  });
})();
