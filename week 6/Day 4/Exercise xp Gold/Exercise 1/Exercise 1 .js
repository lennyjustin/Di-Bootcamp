const path = require('path');
const fs = require('fs');

function getFileInfo() {
  const filePath = path.join(__dirname, 'data', 'example.txt');
  const exists = fs.existsSync(filePath);

  console.log(`File Exists: ${exists}`);

  if (exists) {
    const stats = fs.statSync(filePath);
    console.log(`File Size: ${stats.size} bytes`);
    console.log(`Creation Time: ${stats.birthtime}`);
  }
}

module.exports = getFileInfo;