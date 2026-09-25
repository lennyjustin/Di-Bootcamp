const _ = require('lodash');
const math = require('./math');

console.log(`Sum: ${math.add(15, 25)}`);
console.log(`Product: ${math.multiply(6, 7)}`);

const numbers = [10, 20, 30, 40, 50];
console.log('Mean (via Lodash):', _.mean(numbers));
console.log('Shuffled Numbers (via Lodash):', _.shuffle(numbers));
