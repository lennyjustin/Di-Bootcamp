const fs = require('fs');

fs.readFile('source.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading source.txt:', err.message);
    return;
  }

  fs.writeFile('destination.txt', data, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing to destination.txt:', writeErr.message);
      return;
    }
    console.log('Content successfully copied from source.txt to destination.txt!');
  });
});
