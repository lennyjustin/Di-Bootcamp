const fs = require('node:fs');
const path = require('node:path');

const notesFile = path.resolve(process.env.NOTES_FILE || path.join(__dirname, 'notes.json'));

function readNotes() {
  try {
    const content = fs.readFileSync(notesFile, 'utf8');
    const notes = JSON.parse(content);
    if (!Array.isArray(notes)) throw new Error('Notes file must contain a JSON array.');
    return notes;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function writeNotes(notes) {
  fs.writeFileSync(notesFile, `${JSON.stringify(notes, null, 2)}\n`, 'utf8');
}

function addNote(title, body) {
  const notes = readNotes();
  if (notes.some((note) => note.title.toLowerCase() === title.toLowerCase())) return false;
  notes.push({ title, body });
  writeNotes(notes);
  return true;
}

function getNotes() {
  return readNotes();
}

function findNote(title) {
  return readNotes().find((note) => note.title.toLowerCase() === title.toLowerCase());
}

function removeNote(title) {
  const notes = readNotes();
  const remaining = notes.filter((note) => note.title.toLowerCase() !== title.toLowerCase());
  const removed = remaining.length !== notes.length;
  if (removed) writeNotes(remaining);
  return removed;
}

module.exports = { addNote, getNotes, findNote, removeNote };
