// Exercises XP: Variables, Conditionals, Loops, and Objects

// Exercise 1: List of people
const people = ["Greg", "Mary", "Devon", "James"];

// Remove Greg.
people.splice(0, 1);

// Replace James with Jason.
people[people.indexOf("James")] = "Jason";

// Replace this placeholder with your name.
const myName = "Yourname";
people.push(myName);

console.log("People:", people);
console.log("Mary's index:", people.indexOf("Mary"));

// Copy without Mary or myName.
const peopleCopy = people.slice(1, 3);
console.log("Copy:", peopleCopy);

const fooIndex = people.indexOf("Foo");
console.log("Foo's index:", fooIndex);
console.log("-1 means Foo is not in the array.");

const last = people[people.length - 1];
console.log("Last person:", last);

for (const person of people) {
  console.log(person);
}

for (const person of people) {
  console.log(person);
  if (person === "Devon") {
    break;
  }
}

// Exercise 2: Your favorite colors
const colors = ["blue", "green", "purple", "red", "orange"];
const suffixes = ["st", "nd", "rd", "th", "th"];

for (let index = 0; index < colors.length; index += 1) {
  const choiceNumber = index + 1;
  console.log(`My #${choiceNumber} choice is ${colors[index]}`);
  console.log(`My ${choiceNumber}${suffixes[index]} choice is ${colors[index]}`);
}

// Exercise 3: Repeat the question
function repeatQuestion() {
  let number = Number(prompt("Enter a number:"));

  while (number < 10) {
    number = Number(prompt("Enter a new number:"));
  }

  console.log("Your number is:", number);
}

repeatQuestion();

// Exercise 4: Building Management
const building = {
  numberOfFloors: 4,
  numberOfAptByFloor: {
    firstFloor: 3,
    secondFloor: 4,
    thirdFloor: 9,
    fourthFloor: 2,
  },
  nameOfTenants: ["Sarah", "Dan", "David"],
  numberOfRoomsAndRent: {
    sarah: [3, 990],
    dan: [4, 1000],
    david: [1, 500],
  },
};

console.log("Number of floors:", building.numberOfFloors);
console.log(
  "Apartments on floors 1 and 3:",
  building.numberOfAptByFloor.firstFloor + building.numberOfAptByFloor.thirdFloor,
);
console.log(
  "Second tenant:",
  building.nameOfTenants[1],
  "has",
  building.numberOfRoomsAndRent.dan[0],
  "rooms.",
);

const sarahRent = building.numberOfRoomsAndRent.sarah[1];
const danRent = building.numberOfRoomsAndRent.dan[1];
const davidRent = building.numberOfRoomsAndRent.david[1];

if (sarahRent + davidRent > danRent) {
  building.numberOfRoomsAndRent.dan[1] = 1200;
}
console.log("Dan's updated rent:", building.numberOfRoomsAndRent.dan[1]);

// Exercise 5: Family
const family = {
  parent1: "Alice",
  parent2: "Bob",
  child1: "Charlie",
  child2: "Diana",
};

for (const key in family) {
  console.log("Family key:", key);
}

for (const key in family) {
  console.log("Family value:", family[key]);
}

// Exercise 6: Rudolf
const details = {
  my: "name",
  is: "Rudolf",
  the: "reindeer",
};

const detailKeys = Object.keys(details);
const sentenceParts = [];
for (let index = 0; index < detailKeys.length; index += 1) {
  sentenceParts.push(detailKeys[index], details[detailKeys[index]]);
}
console.log(sentenceParts.join(" "));

// Exercise 7: Secret Group
const names = ["Jack", "Philip", "Sarah", "Amanda", "Bernard", "Kyle"];
const secretSociety = names
  .map((name) => name[0])
  .sort()
  .join("");

console.log("Secret society:", secretSociety); // ABJKPS