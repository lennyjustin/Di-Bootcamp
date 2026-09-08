// Exercise XP - Node.js Compatible Version
// (Browser-based HTML exercises removed)

// Exercise 1: Functions
function funcOne() {
    let a = 5;

    if (a > 1) {
        a = 3;
    }

    console.log(`inside the funcOne function ${a}`);
}

funcOne();

let aTwo = 0;

function funcTwo() {
    aTwo = 5;
}

function funcThree() {
    console.log(`inside the funcThree function ${aTwo}`);
}

funcThree();

funcTwo();

funcThree();

function funcFour() {
    global.a = "hello";
}

function funcFive() {
    console.log(`inside the funcFive function ${a}`);
}

funcFour();
funcFive();

let aFour = 1;

function funcSix() {
    let localA = "test";

    console.log(`inside the funcSix function ${localA}`);
}

funcSix();

let aFive = 2;

if (true) {
    let blockA = 5;

    console.log(`in the if block ${blockA}`);
}

console.log(`outside of the if block ${aFive}`);

// Exercise 2: Ternary Operator
const winBattle = () => {
    return true;
};

const experiencePoints = winBattle() ? 10 : 1;

console.log(experiencePoints);

// Exercise 3: Is It a String?
const isString = value => typeof value === "string";

console.log(isString("hello"));
console.log(isString([1, 2, 4, 0]));
console.log(isString(123));

// Exercise 4: Find the Sum
const sum = (numberOne, numberTwo) => numberOne + numberTwo;

console.log(sum(4, 6));

// Exercise 5: Kilograms and Grams
function kilogramsToGrams(weightInKilograms) {
    return weightInKilograms * 1000;
}

console.log(kilogramsToGrams(3));

// Function expression
const kilogramsToGramsExpression = function (weightInKilograms) {
    return weightInKilograms * 1000;
};

console.log(kilogramsToGramsExpression(5));

// Arrow function
const kilogramsToGramsArrow = weightInKilograms =>
    weightInKilograms * 1000;

console.log(kilogramsToGramsArrow(2));

// Exercise 6: Fortune Teller (Console version)
(function (
    numberOfChildren,
    partnerName,
    geographicLocation,
    jobTitle
) {
    const message = `You will be a ${jobTitle} in ${geographicLocation}, and married to ${partnerName} with ${numberOfChildren} kids.`;

    console.log(message);
})(3, "Amina", "Nairobi", "software builder");

// Exercise 8: Juice (Console version)
function makeJuice(size) {
    function addIngredients(
        firstIngredient,
        secondIngredient,
        thirdIngredient
    ) {
        const message = `The client wants a ${size} juice, containing ${firstIngredient}, ${secondIngredient}, and ${thirdIngredient}.`;

        console.log(message);
    }

    addIngredients("orange", "banana", "coconut");
}

makeJuice("large");
