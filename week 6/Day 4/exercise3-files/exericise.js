const { faker } = require('@faker-js/faker');
const prompt = require('prompt-sync')();

const users = [];

// Function to add auto-generated fake users
function addFakeUser() {
  const user = {
    name: faker.person.fullName(),
    addressStreet: faker.location.streetAddress(),
    country: faker.location.country(),
  };
  users.push(user);
}

// Bonus: Prompt user for input and add to users array
function addCustomUser() {
  console.log('\n--- Enter Custom User Details ---');
  const name = prompt('Enter full name: ');
  const addressStreet = prompt('Enter street address: ');
  const country = prompt('Enter country: ');

  users.push({ name, addressStreet, country });
}

// Populate with fake users
addFakeUser();
addFakeUser();

// Prompt for custom user
addCustomUser();

console.log('\nUsers List:', users);
