// Exercise 1 : print Full Name
function printFullName({first, last}) {
    return `Your full name is ${first} ${last}`;
}

console.log(printFullName({first: 'Elie', last:'Schoppik'}));
// Output: 'Your full name is Elie Schoppik'


// Exercise 2 : keys and values
function keysAndValues(obj) {
    const sortedKeys = Object.keys(obj).sort();
    const values = sortedKeys.map(key => obj[key]);
    return [sortedKeys, values];
}

console.log(keysAndValues({ a: 1, b: 2, c: 3 }));
// ➞ [["a", "b", "c"], [1, 2, 3]]

console.log(keysAndValues({ a: "Apple", b: "Microsoft", c: "Google" }));
// ➞ [["a", "b", "c"], ["Apple", "Microsoft", "Google"]]

console.log(keysAndValues({ key1: true, key2: false, key3: undefined }));
// ➞ [["key1", "key2", "key3"], [true, false, undefined]]


// Exercise 3 : Counter class
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
  }
}

const counterOne = new Counter();
counterOne.increment();
counterOne.increment();

const counterTwo = counterOne;
counterTwo.increment();

console.log(counterOne.count);
// Output: 3
// Explanation: counterTwo is a reference to the same object as counterOne,
// so when counterTwo.increment() is called, it modifies the same count property.
// Total increments: 3 (two from counterOne, one from counterTwo)