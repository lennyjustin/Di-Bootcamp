const { readFile, writeFile } = require('./fileManager');

const content = readFile('./Hello World.txt');
console.log('Read Content:', content);

writeFile('./Bye World.txt', 'Writing to the file');
