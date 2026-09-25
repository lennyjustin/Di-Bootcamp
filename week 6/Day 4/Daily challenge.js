
    import chalk from 'chalk';
    import fs from 'fs';
    import path from 'path';

    function greet(name) {
      return `Hello, ${name}! Welcome to the Node.js Daily Challenge.`;
    }

    function displayColorfulMessage() {
      const message = chalk.bold.magenta(
        ' This is a vibrant, colorful message powered by Chalk!'
      );
      console.log(message);
      return message;
    }

    function readFileContent() {
      const filePath = path.join(process.cwd(), 'files', 'file-data.txt');

      try {
        const data = fs.readFileSync(filePath, 'utf-8');
        console.log('--- File Content ---');
        console.log(data);
        return data;
      } catch (error) {
        console.error('Error reading file:', error.message);
        return null;
      }
    }

    function runChallenge() {
      console.log(chalk.bold.yellow('=========================================='));
      console.log(chalk.bold.cyan('  INTEGRATED DAILY CHALLENGE OUTPUT '));
      console.log(chalk.bold.yellow('==========================================\n'));

      console.log(chalk.green(greet('Developer')));
      console.log();

      displayColorfulMessage();
      console.log();

      console.log(chalk.blue('Reading content from file system:'));
      readFileContent();

      console.log(chalk.bold.yellow('\n=========================================='));
    }

    runChallenge();