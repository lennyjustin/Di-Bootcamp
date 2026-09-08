s
// Exercise 1: Sum elements
function sumArray(arr) {
  return arr.reduce((sum, num) => sum + num, 0);
}

// Exercise 2: Remove Duplicates
function removeDuplicates(arr) {
  return [...new Set(arr)];
}

// Exercise 3: Remove certain values
function removeFalsyAndSpecial(arr) {
  return arr.filter(
    val => val !== null && val !== 0 && val !== "" && val !== false && val !== undefined && !Number.isNaN(val)
  );
}

// Exercise 4: Repeat please!
function repeat(str, n = 1) {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += str;
  }
  return result;
}

// Exercise 5: Turtle & Rabbit
const startLine = '     ||<- Start line';
let turtle = 'B';
let rabbit = 'R';

turtle = turtle.trim().padEnd(9, '=');
rabbit = rabbit.trim().padEnd(9, '=');

// To line them visually under the start line as in the expected output:
turtle = 'B';
rabbit = 'R';
