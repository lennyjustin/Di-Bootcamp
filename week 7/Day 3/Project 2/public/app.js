(() => {
  const socket = io();
  const joinScreen = document.querySelector('#join-screen');
  const chatScreen = document.querySelector('#chat-screen');
  const joinForm = document.querySelector('#join-form');
  const joinError = document.querySelector('#join-error');
  const usernameInput = document.querySelector('#username');
  const roomTitle = document.querySelector('#current-room');
  const roomDescription = document.querySelector('#room-description');
  const messageList = document.querySelector('#message-list');
  const messageForm = document.querySelector('#message-form');
  const messageInput = document.querySelector('#message-input');
  const userList = document.querySelector('#user-list');
  const memberCount = document.querySelector('#member-count');
  const onlineCount = document.querySelector('#online-count');
  const onlineCountSmall = document.querySelector('#online-count-small');
  const toast = document.querySelector('#toast');
  const roomDescriptions = {
    general: 'The place for everyday conversations.',
    random: 'Unexpected stuff, delightful detours.',
    help: 'Ask a question. Someone has your back.',
  };
  const colors = ['#6878e8', '#e59b62', '#46ad99', '#b27ac4', '#d16d7d', '#568fc4'];
  let username = '';
  let currentRoom = 'general';
  let unread = 0;
  let toastTimeout;
  let currentDay = '';

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  function colorFor(name) {
    let value = 0;
    for (const character of name) value = (value * 31 + character.charCodeAt(0)) >>> 0;
    return colors[value % colors.length];
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function setRoom(room) {
    currentRoom = room;
    roomTitle.textContent = room;
    roomDescriptions[room] && (roomDescription.textContent = roomDescriptions[room]);
    document.querySelector('#welcome-room').textContent = `#${room}`;
    messageInput.placeholder = `Message #${room}`;
    document.querySelectorAll('.nav-room').forEach((button) => {
      button.classList.toggle('active', button.dataset.room === room);
      button.setAttribute('aria-current', button.dataset.room === room ? 'page' : 'false');
    });
    currentDay = '';
  }

  function addDayDivider(date) {
    const dateKey = new Date(date).toLocaleDateString();
    if (dateKey === currentDay) return;
    currentDay = dateKey;
    const divider = document.createElement('div');
    divider.className = 'chat-date';
    divider.textContent = dateKey === new Date().toLocaleDateString() ? 'TODAY' : dateKey;
    messageList.append(divider);
  }

  function appendMessage(message, { notify = false } = {}) {
    const welcome = messageList.querySelector('.welcome-message');
    if (welcome) welcome.remove();
    addDayDivider(message.createdAt);

    const row = document.createElement('article');
    row.className = 'message';
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.style.backgroundColor = colorFor(message.username);
    avatar.textContent = initials(message.username);
    const content = document.createElement('div');
    content.className = 'message-content';
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const name = document.createElement('span');
    name.className = 'message-name';
    name.textContent = message.username;
    const time = document.createElement('time');
    time.className = 'message-time';
    time.dateTime = message.createdAt;
    time.textContent = new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const text = document.createElement('p');
    text.className = 'message-text';
    text.textContent = message.text;
    meta.append(name, time);
    content.append(meta, text);
    row.append(avatar, content);
    messageList.append(row);
    messageList.scrollTop = messageList.scrollHeight;

    if (notify && message.username !== username) {
      showToast(`${message.username} sent a message`);
      if (document.hidden) {
        unread += 1;
        document.title = `(${unread}) #${currentRoom} · Gather`;
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${message.username} in #${currentRoom}`, { body: message.text });
        }
      }
    }
  }

  function appendNotice(notice) {
    const row = document.createElement('div');
    row.className = 'notice';
    row.textContent = notice.text;
    messageList.append(row);
    messageList.scrollTop = messageList.scrollHeight;
    if (notice.text.includes('joined')) showToast(notice.text);
  }

  function renderUsers(users) {
    memberCount.textContent = users.length;
    onlineCount.textContent = `${users.length} online`;
    onlineCountSmall.textContent = users.length;
    userList.replaceChildren();
    for (const name of users) {
      const item = document.createElement('li');
      const avatar = document.createElement('span');
      avatar.className = 'avatar';
      avatar.style.backgroundColor = `${colorFor(name)}20`;
      avatar.style.color = colorFor(name);
      avatar.textContent = initials(name);
      const label = document.createElement('span');
      label.className = 'member-name';
      label.textContent = name;
      item.append(avatar, label);
      userList.append(item);
    }
  }

  joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    username = usernameInput.value.trim().replace(/\s+/g, ' ');
    currentRoom = new FormData(joinForm).get('room');
    if (username.length < 2 || username.length > 24) {
      joinError.textContent = 'Your name should be between 2 and 24 characters.';
      usernameInput.focus();
      return;
    }
    joinError.textContent = '';
    socket.emit('chat:join', { username, room: currentRoom });
  });

  socket.on('room:state', ({ room, users, messages }) => {
    setRoom(room);
    joinScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    document.querySelector('#my-name').textContent = username;
    document.querySelector('#my-avatar').textContent = initials(username);
    document.querySelector('#my-avatar').style.backgroundColor = `${colorFor(username)}35`;
    document.querySelector('#my-avatar').style.color = colorFor(username);
    messageList.innerHTML = '<div class="welcome-message"><div class="welcome-icon">✳</div><div><strong>Welcome to <span id="welcome-room"></span></strong><p>This is the beginning of something good. Say hello!</p></div></div>';
    messages.forEach((message) => appendMessage(message));
    renderUsers(users);
    messageInput.focus();
  });

  socket.on('room:users', renderUsers);
  socket.on('chat:message', (message) => appendMessage(message, { notify: true }));
  socket.on('chat:notice', appendNotice);
  socket.on('chat:error', (message) => {
    if (joinScreen.classList.contains('hidden')) showToast(message);
    else joinError.textContent = message;
  });
  socket.on('connect_error', () => showToast('Connection lost. Trying to reconnect…'));
  socket.on('connect', () => {
    if (username) {
      socket.emit('chat:join', { username, room: currentRoom });
    }
  });

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    socket.emit('chat:send', { text });
    messageInput.value = '';
    messageInput.focus();
  });

  document.querySelectorAll('.nav-room').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.room === currentRoom) return;
      currentRoom = button.dataset.room;
      messageList.innerHTML = '<div class="welcome-message"><div class="welcome-icon">✳</div><div><strong>Welcome to <span id="welcome-room"></span></strong><p>This is the beginning of something good. Say hello!</p></div></div>';
      socket.emit('chat:join', { username, room: currentRoom });
    });
  });

  document.querySelector('#leave-button').addEventListener('click', () => {
    socket.emit('chat:leave');
    username = '';
    chatScreen.classList.add('hidden');
    joinScreen.classList.remove('hidden');
    usernameInput.value = '';
    usernameInput.focus();
    document.title = 'Gather — Real-time chat';
  });

  document.querySelector('#members-toggle').addEventListener('click', () => {
    document.querySelector('#members-panel').classList.toggle('collapsed');
    chatScreen.classList.toggle('members-hidden');
  });

  document.querySelector('#notify-button').addEventListener('click', async () => {
    if (!('Notification' in window)) return showToast('Desktop notifications are not supported in this browser.');
    const permission = await Notification.requestPermission();
    showToast(permission === 'granted' ? 'Desktop notifications enabled.' : 'Notifications were not enabled.');
  });

  document.querySelector('#emoji-button').addEventListener('click', () => {
    const start = messageInput.selectionStart;
    const end = messageInput.selectionEnd;
    messageInput.setRangeText('😊', start, end, 'end');
    messageInput.focus();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      unread = 0;
      document.title = `#${currentRoom} · Gather`;
    }
  });
})();
