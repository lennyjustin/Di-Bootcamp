(() => {
  const grid = document.querySelector('#note-grid');
  const dialog = document.querySelector('#note-dialog');
  const form = document.querySelector('#note-form');
  const titleInput = document.querySelector('#note-title');
  const contentInput = document.querySelector('#note-content');
  const searchInput = document.querySelector('#search-input');
  const emptyState = document.querySelector('#empty-state');
  const toast = document.querySelector('#toast');
  let notes = [];
  let activeNote = null;
  let selectedColor = 'sage';
  let toastTimer;

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
    if (response.status === 204) return null;
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Something went wrong.');
    return result;
  }

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function relativeDate(value) {
    const date = new Date(value);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function renderNotes() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = notes.filter((note) => !query || `${note.title} ${note.content}`.toLowerCase().includes(query));
    grid.replaceChildren();
    document.querySelector('#note-count').textContent = notes.length;
    document.querySelector('#pinned-count').textContent = notes.filter((note) => note.pinned).length;
    document.querySelector('#heading-count').textContent = filtered.length;
    document.querySelector('#list-heading').firstChild.textContent = query ? 'Search results ' : 'All notes ';
    emptyState.classList.toggle('visible', filtered.length === 0);
    emptyState.querySelector('h3').textContent = query ? 'No matching notes' : 'No notes just yet';
    emptyState.querySelector('p').textContent = query ? 'Try another word or clear your search.' : 'Start with a thought, a plan, or a tiny reminder to yourself.';
    document.querySelector('#empty-create').classList.toggle('hidden', Boolean(query));

    for (const note of filtered) {
      const card = document.createElement('article');
      card.className = `note-card ${note.color}`;
      card.tabIndex = 0;
      const top = document.createElement('div');
      top.className = 'note-card-top';
      const date = document.createElement('span');
      date.className = 'note-date';
      date.textContent = relativeDate(note.updatedAt);
      const actions = document.createElement('div');
      actions.className = 'note-actions';
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.title = note.pinned ? 'Unpin note' : 'Pin note';
      pin.setAttribute('aria-label', pin.title);
      pin.textContent = note.pinned ? '★' : '☆';
      pin.addEventListener('click', (event) => { event.stopPropagation(); updateNote(note.id, { pinned: !note.pinned }); });
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.title = 'Edit note';
      edit.setAttribute('aria-label', edit.title);
      edit.textContent = '↗';
      edit.addEventListener('click', (event) => { event.stopPropagation(); openEditor(note); });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.title = 'Delete note';
      remove.setAttribute('aria-label', remove.title);
      remove.textContent = '×';
      remove.addEventListener('click', async (event) => {
        event.stopPropagation();
        if (window.confirm(`Delete “${note.title}”?`)) await deleteNote(note.id);
      });
      actions.append(pin, edit, remove);
      top.append(date, actions);
      const title = document.createElement('h3');
      title.className = 'note-title';
      title.textContent = note.title;
      const content = document.createElement('p');
      content.className = 'note-preview';
      content.textContent = note.content || 'No additional details.';
      const updated = document.createElement('div');
      updated.className = 'note-updated';
      updated.textContent = note.pinned ? '★  Pinned note' : 'Personal note';
      card.append(top, title, content, updated);
      card.addEventListener('click', () => openEditor(note));
      card.addEventListener('keydown', (event) => { if (event.key === 'Enter') openEditor(note); });
      grid.append(card);
    }
  }

  async function loadNotes() {
    try {
      notes = await api('/api/notes');
      renderNotes();
    } catch (error) {
      notify(error.message);
    }
  }

  function openEditor(note = null) {
    activeNote = note;
    selectedColor = note?.color || 'sage';
    document.querySelector('#dialog-label').textContent = note ? 'EDIT YOUR THOUGHT' : 'A NEW THOUGHT';
    document.querySelector('#save-note').innerHTML = note ? 'Save changes <span>↗</span>' : 'Save note <span>↗</span>';
    titleInput.value = note?.title || '';
    contentInput.value = note?.content || '';
    document.querySelectorAll('.color-options button').forEach((button) => button.classList.toggle('selected', button.dataset.color === selectedColor));
    dialog.showModal();
    titleInput.focus();
  }

  async function saveNote(event) {
    event.preventDefault();
    const body = { title: titleInput.value.trim(), content: contentInput.value.trim(), color: selectedColor };
    try {
      const saved = activeNote
        ? await api(`/api/notes/${activeNote.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : await api('/api/notes', { method: 'POST', body: JSON.stringify(body) });
      if (activeNote) notes = notes.map((note) => note.id === saved.id ? saved : note);
      else notes.unshift(saved);
      dialog.close();
      renderNotes();
      notify(activeNote ? 'Changes saved.' : 'Note created.');
    } catch (error) {
      notify(error.message);
    }
  }

  async function updateNote(id, changes) {
    try {
      const saved = await api(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
      notes = notes.map((note) => note.id === saved.id ? saved : note);
      renderNotes();
      notify(saved.pinned ? 'Note pinned.' : 'Note unpinned.');
    } catch (error) { notify(error.message); }
  }

  async function deleteNote(id) {
    try {
      await api(`/api/notes/${id}`, { method: 'DELETE' });
      notes = notes.filter((note) => note.id !== id);
      renderNotes();
      notify('Note deleted.');
    } catch (error) { notify(error.message); }
  }

  document.querySelector('#new-note').addEventListener('click', () => openEditor());
  document.querySelector('#empty-create').addEventListener('click', () => openEditor());
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  form.addEventListener('submit', saveNote);
  searchInput.addEventListener('input', renderNotes);
  document.querySelectorAll('.color-options button').forEach((button) => button.addEventListener('click', () => {
    selectedColor = button.dataset.color;
    document.querySelectorAll('.color-options button').forEach((item) => item.classList.toggle('selected', item === button));
  }));
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInput.focus(); }
    if (event.key === 'Escape' && dialog.open) dialog.close();
  });

  loadNotes();
})();
