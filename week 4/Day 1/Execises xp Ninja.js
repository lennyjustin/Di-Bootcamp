// Exercise 1: Dog age to Human years
const data = [
  { name: 'Butters', age: 3, type: 'dog' },
  { name: 'Cuty', age: 5, type: 'rabbit' },
  { name: 'Lizzy', age: 6, type: 'dog' },
  { name: 'Red', age: 1, type: 'cat' },
  { name: 'Joey', age: 3, type: 'dog' },
  { name: 'Rex', age: 10, type: 'dog' }
];

// Using a loop
let sumHumanYearsLoop = 0;
for (let i = 0; i < data.length; i++) {
  if (data[i].type === 'dog') {
    sumHumanYearsLoop += data[i].age * 7;
  }
}

// Using reduce()
const sumHumanYearsReduce = data.reduce((sum, animal) => {
  if (animal.type === 'dog') {
    return sum + animal.age * 7;
  }
  return sum;
}, 0);

// Exercise 2: Email
const userEmail3 = ' [cannotfillemailformcorrectly@gmail.com](mailto:cannotfillemailformcorrectly@gmail.com) ';
const cleanedEmail = userEmail3.trim();

// Exercise 3: Employees #3
const users = [
  { firstName: 'Bradley', lastName: 'Bouley', role: 'Full Stack Resident' },
  { firstName: 'Chloe', lastName: 'Alnaji', role: 'Full Stack Resident' },
  { firstName: 'Jonathan', lastName: 'Baughn', role: 'Enterprise Instructor' },
  { firstName: 'Michael', lastName: 'Herman', role: 'Lead Instructor' },
  { firstName: 'Robert', lastName: 'Hajek', role: 'Full Stack Resident' },
  { firstName: 'Wes', lastName: 'Reid', role: 'Instructor' },
  { firstName: 'Zach', lastName: 'Klabunde', role: 'Instructor' }
];

const usersObject = {};
users.forEach(user => {
  const fullName = `${user.firstName} ${user.lastName}`;
  usersObject[fullName] = user.role;
});

// Exercise 4: Array to Object
const letters = ['x', 'y', 'z', 'z'];

// Using a for loop
const lettersCountLoop = {};
for (let i = 0; i < letters.length; i++) {
  const letter = letters[i];
  lettersCountLoop[letter] = (lettersCountLoop[letter] || 0) + 1;
}

// Using reduce()
const lettersCountReduce = letters.reduce((acc, letter) => {
  acc[letter] = (acc[letter] || 0) + 1;
  return acc;
}, {});