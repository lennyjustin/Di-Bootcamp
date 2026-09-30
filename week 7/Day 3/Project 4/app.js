const _ = require('lodash');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const notes = require('./notes');

const argv = yargs(hideBin(process.argv))
  .option('title', { type: 'string', describe: 'Title of the note' })
  .option('body', { type: 'string', describe: 'Body of the note' })
  .help(false)
  .version(false)
  .parse();

const command = _.first(argv._);

function requireTitle() {
  if (typeof argv.title !== 'string' || !argv.title.trim()) {
    console.log('Please provide a note title with --title.');
    return false;
  }
  return true;
}

switch (command) {
  case 'add': {
    if (!requireTitle()) break;
    if (typeof argv.body !== 'string' || !argv.body.trim()) {
      console.log('Please provide a note body with --body.');
      break;
    }
    if (!notes.addNote(argv.title.trim(), argv.body.trim())) {
      console.log('Note already exists');
      break;
    }
    console.log('New note created');
    break;
  }
  case 'list': {
    const allNotes = notes.getNotes();
    if (allNotes.length === 0) {
      console.log('No notes found');
      break;
    }
    console.log('Your notes:');
    allNotes.forEach((note) => console.log(`- ${note.title}`));
    break;
  }
  case 'read': {
    if (!requireTitle()) break;
    const note = notes.findNote(argv.title.trim());
    if (!note) {
      console.log('Note not found');
      break;
    }
    console.log(`Title: ${note.title}`);
    console.log(`Body: ${note.body}`);
    break;
  }
  case 'remove': {
    if (!requireTitle()) break;
    if (!notes.removeNote(argv.title.trim())) {
      console.log('Note not found');
      break;
    }
    console.log('Note removed');
    break;
  }
  default:
    console.log('command not recognized');
}
