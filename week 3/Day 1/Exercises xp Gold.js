// Exercise 1: Divisible by three

let numbers = [123, 8409, 100053, 333333333, 7];

for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] % 3 === 0) {
    console.log(true);
  } else {
    console.log(false);
  }
}


// Exercise 2: Attendance

let guestList = {
  randy: "Germany",
  karla: "France",
  wendy: "Japan",
  norman: "England",
  sam: "Argentina"
};

let name = prompt("What is your name?");

if (name in guestList) {
  console.log(`Hi! I'm ${name}, and I'm from ${guestList[name]}.`);
} else {
  console.log("Hi! I'm a guest.");
}


// Exercise 3: Playing with numbers

let age = [20, 5, 12, 43, 98, 55];

let sum = 0;
let highestAge = age[0];

for (let i = 0; i < age.length; i++) {
  sum += age[i];

  if (age[i] > highestAge) {
    highestAge = age[i];
  }
}

console.log("The sum is:", sum);
console.log("The highest age is:", highestAge);

