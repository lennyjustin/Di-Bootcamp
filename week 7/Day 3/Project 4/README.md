# Mini Project — Terminal Notes App

A Node.js command-line app using Yargs, Lodash, and `fs.readFileSync` / `fs.writeFileSync`. Notes are stored in `notes.json`.

## Install

Run `npm install` in this folder. Then use `node app` (or `node app.js`) from this directory.

## Commands

- `node app add --title="Note Title" --body="Note body"`
- `node app list`
- `node app read --title="Note Title"`
- `node app remove --title="Note Title"`

Note titles are unique (case-insensitively). Duplicate adds print `Note already exists`; missing reads/removals print `Note not found`; unknown commands print `command not recognized`. `NOTES_FILE` may be set to use a different JSON file.

Run the CLI integration tests with `npm test`.
