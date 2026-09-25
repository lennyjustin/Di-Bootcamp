const prompt = require('prompt-sync')();

function validateName(fullName) {
  // Regex pattern enforcing:
  // - Capitalized First Name: [A-Z][a-z]*
  // - Single Space: \s
  // - Capitalized Last Name: [A-Z][a-z]*
  const nameRegex = /^[A-Z][a-z]*\s[A-Z][a-z]*$/;
  return nameRegex.test(fullName);
}

const userName = prompt('Please enter your full name (e.g., "John Doe"): ');

if (validateName(userName)) {
  console.log('Valid full name!');
} else {
  console.log('Invalid name. Must contain exactly two words, separated by a single space, and each word must start with an uppercase letter.');
}