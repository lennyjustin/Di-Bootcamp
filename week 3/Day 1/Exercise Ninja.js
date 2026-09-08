let person1 = {
  fullName: "John Doe",
  mass: 70,      // kilograms
  height: 1.75,  // metres

  calculateBMI: function () {
    return this.mass / (this.height * this.height);
  }
};

let person2 = {
  fullName: "Jane Smith",
  mass: 85,      // kilograms
  height: 1.65,  // metres

  calculateBMI: function () {
    return this.mass / (this.height * this.height);
  }
};

function compareBMI(personA, personB) {
  let bmiA = personA.calculateBMI();
  let bmiB = personB.calculateBMI();

  console.log(`${personA.fullName}'s BMI: ${bmiA.toFixed(2)}`);
  console.log(`${personB.fullName}'s BMI: ${bmiB.toFixed(2)}`);

  if (bmiA > bmiB) {
    console.log(`${personA.fullName} has the largest BMI.`);
  } else if (bmiB > bmiA) {
    console.log(`${personB.fullName} has the largest BMI.`);
  } else {
    console.log("Both people have the same BMI.");
  }
}

compareBMI(person1, person2);

// Exercise 2: Grade Average
function calculateAverage(gradesList) {
  let total = 0;

  for (let i = 0; i < gradesList.length; i++) {
    total = total + gradesList[i];
  }

  return total / gradesList.length;
}

function findAvg(gradesList) {
  let average = calculateAverage(gradesList);

  console.log("Average:", average);

  if (average > 65) {
    console.log("You passed the course!");
  } else if (average < 65) {
    console.log("You failed and must repeat the course.");
  } else {
    console.log("Your average is exactly 65.");
  }
}

findAvg([75, 80, 60, 70]);