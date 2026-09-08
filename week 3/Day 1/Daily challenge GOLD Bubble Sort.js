const numbers = [5, 0, 9, 1, 7, 4, 2, 6, 3, 8];

// Convert the array to a string using toString()
console.log(numbers.toString());

// Convert the array to strings using join()
console.log(numbers.join("+"));
console.log(numbers.join(" "));
console.log(numbers.join(""));

// Bubble Sort in descending order
for (let i = 0; i < numbers.length - 1; i++) {
  // Compare neighboring values
  for (let j = 0; j < numbers.length - 1 - i; j++) {
    // If the current number is smaller than the next number,
    // swap them so larger numbers move toward the beginning
    if (numbers[j] < numbers[j + 1]) {
      let temporary = numbers[j];

      numbers[j] = numbers[j + 1];
      numbers[j + 1] = temporary;

      console.log(`After swap: ${numbers}`);
    }
  }

  console.log(`End of pass ${i + 1}: ${numbers}`);
}

console.log("Sorted array:", numbers);