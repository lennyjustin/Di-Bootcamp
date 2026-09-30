const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const dataFile = path.resolve(process.env.NOTES_FILE || path.join(__dirname, '../../notes.json'));
let writeQueue = Promise.resolve();

async function readNotes() {
  try {
    const notes = JSON.parse(await fs.readFile(dataFile, 'utf8'));
    if (!Array.isArray(notes)) throw new Error('Notes data must be a JSON array.');
    return notes;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, '[]\n', 'utf8');
    return [];
  }
}

async function writeNotes(notes) {
  const tempFile = `${dataFile}.${randomUUID()}.tmp`;
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.writeFile(tempFile, `${JSON.stringify(notes, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, dataFile);
  } catch (error) {
    await fs.rm(tempFile, { force: true }).catch(() => {});
    throw error;
  }
}

function mutate(operation) {
  const result = writeQueue.then(operation);
  writeQueue = result.catch(() => {});
  return result;
}

function sortNotes(notes) {
  return notes.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
}

function findAll(query = '') {
  const term = query.trim().toLowerCase();
  return readNotes().then((notes) => sortNotes(notes.filter((note) => !term || `${note.title} ${note.content}`.toLowerCase().includes(term))));
}

function findById(id) {
  return readNotes().then((notes) => notes.find((note) => note.id === id));
}

function create(fields) {
  return mutate(async () => {
    const notes = await readNotes();
    const timestamp = new Date().toISOString();
    const note = {
      id: randomUUID(),
      title: fields.title,
      content: fields.content,
      color: fields.color || 'sage',
      pinned: Boolean(fields.pinned),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    notes.push(note);
    await writeNotes(notes);
    return note;
  });
}

function update(id, changes) {
  return mutate(async () => {
    const notes = await readNotes();
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) return undefined;
    notes[index] = { ...notes[index], ...changes, id, updatedAt: new Date().toISOString() };
    await writeNotes(notes);
    return notes[index];
  });
}

function remove(id) {
  return mutate(async () => {
    const notes = await readNotes();
    const index = notes.findIndex((note) => note.id === id);
    if (index < 0) return undefined;
    const [note] = notes.splice(index, 1);
    await writeNotes(notes);
    return note;
  });
}

module.exports = { findAll, findById, create, update, remove };
