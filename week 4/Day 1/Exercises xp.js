 Colors
js
const Colors = ["Blue", "Green", "Red", "Orange", "Violet", "Indigo", "Yellow"];

// 1. Display “1# choice is Blue.” etc.
colors.forEach((color, index) => {
  console.log(`${index + 1}# choice is ${color}.`);
});

// 2. Check if at least one element is "Violet"
const hasViolet = colors.some(color => color === "Violet");
if (hasViolet) {
  console.log("Yeah");
} else {
  console.log("No...");
}

js
const colors = ["Blue", "Green", "Red", "Orange", "Violet", "Indigo", "Yellow"];
const ordinal = ["th", "st", "nd", "rd"];

colors.forEach((color, index) => {
  const n = index + 1;
  // Choose suffix: 1st, 2nd, 3rd, then 4th, 5th...
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : ordinal[n % 10] ?? "th";

  console.log(`${n}${suffix} choice is ${color}.`);
});

js
const fruits = ["apple", "orange"];
const vegetables = ["carrot", "potato"];

const result = ['bread', ...vegetables, 'chicken', ...fruits];
console.log(result);
Output:

js
["bread", "carrot", "potato", "chicken", "apple", "orange"]

js
const country = "USA";
console.log([...country]);
Output:

js
["U", "S", "A"]

Bonus
js
let newArray = [...[,,]];
console.log(newArray);

js
const users = [
  { firstName: 'Bradley', lastName: 'Bouley', role: 'Full Stack Resident' },
  { firstName: 'Chloe', lastName: 'Alnaji', role: 'Full Stack Resident' },
  { firstName: 'Jonathan', lastName: 'Baughn', role: 'Enterprise Instructor' },
  { firstName: 'Michael', lastName: 'Herman', role: 'Lead Instructor' },
  { firstName: 'Robert', lastName: 'Hajek', role: 'Full Stack Resident' },
  { firstName: 'Wes', lastName: 'Reid', role: 'Instructor' },
  { firstName: 'Zach', lastName: 'Klabunde', role: 'Instructor' }
];

// 1. Map to welcome messages
const welcomeStudents = users.map(user => `Hello ${user.firstName}`);
console.log(welcomeStudents);
// ["Hello Bradley", "Hello Chloe", ...]

// 2. Filter only Full Stack Residents
const fullStackResidents = users.filter(
  user => user.role === "Full Stack Resident"
);
console.log(fullStackResidents);

// 3. Bonus: chain filter + map to get lastNames of Full Stack Residents
const fullStackLastNames = users
  .filter(user => user.role === "Full Stack Resident")
  .map(user => user.lastName);
console.log(fullStackLastNames);
// ["Bouley", "Alnaji", "Hajek"]
 Wars (reduce)
js
const epic = ['a', 'long', 'time', 'ago', 'in a', 'galaxy', 'far far', 'away'];

const sentence = epic.reduce((acc, word) => acc + " " + word, "");
console.log(sentence.trim());
// "a long time ago in a galaxy far far away"

js
const students = [
  { name: "Ray", course: "Computer Science", isPassed: true },
  { name: "Liam", course: "Computer Science", isPassed: false },
  { name: "Jenner", course: "Information Technology", isPassed: true },
  { name: "Marco", course: "Robotics", isPassed: true },
  { name: "Kimberly", course: "Artificial Intelligence", isPassed: false },
  { name: "Jamie", course: "Big Data", isPassed: false }
];

// 1. Filter students who passed
const passedStudents = students.filter(student => student.isPassed);
console.log(passedStudents);

// 2. Bonus: filter + forEach to congratulate
students
  .filter(student => student.isPassed)
  .forEach(student => {
    console.log(
      `Good job ${student.name}, you passed the course in ${student.course}`
    );
  });

