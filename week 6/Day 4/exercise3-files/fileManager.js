const fs = require('fs');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err.message);
    return undefined;
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully written to ${filePath}`);
  } catch (err) {
    console.error(`Error writing to file ${filePath}:`, err.message);
  }
}

module.exports = { readFile, writeFile };
