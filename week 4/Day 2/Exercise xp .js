//  Exercise 1 : Location
const person = {
    name: 'John Doe',
    age: 25,
    location: {
        country: 'Canada',
        city: 'Vancouver',
        coordinates: [49.2827, -123.1207]
    }
}

const {name, location: {country, city, coordinates: [lat, lng]}} = person;

console.log(`I am ${name} from ${city}, ${country}. Latitude(${lat}), Longitude(${lng})`);
// Output: I am John Doe from Vancouver, Canada. Latitude(49.2827), Longitude(-123.1207)


// Exercise 2: Display Student Info
function displayStudentInfo(objUser){
    const {first, last} = objUser;
    return `Your full name is ${first} ${last}`;
}

console.log(displayStudentInfo({first: 'Elie', last:'Schoppik'}));
// Output: 'Your full name is Elie Schoppik'


//  Exercise 3: User & id
const users = { user1: 18273, user2: 92833, user3: 90315 };

// Part 1
const usersArray = Object.entries(users);
console.log(usersArray);
// Output: [ [ 'user1', 18273 ], [ 'user2', 92833 ], [ 'user3', 90315 ] ]

// Part 2
const usersArrayMultiplied = Object.entries(users).map(([key, value]) => [key, value * 2]);
console.log(usersArrayMultiplied);
// Output: [ [ 'user1', 36546 ], [ 'user2', 185666 ], [ 'user3', 180630 ] ]


// Exercise 4 : Person class
class Person {
  constructor(name) {
    this.name = name;
  }
}

const member = new Person('John');
console.log(typeof member);
// Output: 'object'


// Exercise 5 : Dog class
class Dog {
  constructor(name) {
    this.name = name;
  }
};

// Correct constructor: Option 2
class Labrador extends Dog {
  constructor(name, size) {
    super(name);
    this.size = size;
  }
};

//  Exercise 6 : Challenges
// Evaluate these (ie True or Falsez)
console.log([2]==[2]); // false - references two separate array instances in memory
console.log({}=={});   // false - references two separate object instances in memory

// To evaluate as true, both variables must reference the exact same object/array instance:
const arr = [2];
console.log(arr === arr); // true

const obj = {};
console.log(obj === obj); // true

// What is, for each object below, the value of the property number and why?
const object1 = { number: 5 }; 
const object2 = object1; 
const object3 = object2; 
const object4 = { number: 5};

object1.number = 4;
console.log(object2.number);  // 4 (object2 references same object as object1)
console.log(object3.number);  // 4 (object3 references same object as object1)
console.log(object4.number);  // 5 (object4 is a separate object)


// Create classes Animal and Mammal
class Animal {
  constructor(name, type, color) {
    this.name = name;
    this.type = type;
    this.color = color;
  }
}

class Mammal extends Animal {
  sound(soundMade) {
    return `${soundMade} I'm a ${this.type}, named ${this.name} and I'm ${this.color}`;
  }
}

const farmerCow = new Mammal('Lily', 'cow', 'brown and white');
console.log(farmerCow.sound('Moooo'));
// Output: Moooo I'm a cow, named Lily and I'm brown and white