
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
    window.a = "hello";
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
    // Output: in the if block 5
}

console.log(`outside of the if block ${aFive}`);

// Exercise 2: Ternary Operator
// js
const winBattle = () => {
    return true;
};

const experiencePoints = winBattle() ? 10 : 1;

console.log(experiencePoints);
// 10
// A shorter version of the arrow function is:

// js
const winBattleShort = () => true;
// Exercise 3: Is It a String?
// js
const isString = value => typeof value === "string";

console.log(isString("hello"));
// true

console.log(isString([1, 2, 4, 0]));
// false

console.log(isString(123));
// false
// Exercise 4: Find the Sum
// js
const sum = (numberOne, numberTwo) => numberOne + numberTwo;

console.log(sum(4, 6));
// 10
// Exercise 5: Kilograms and Grams
// js
// Function declaration
function kilogramsToGrams(weightInKilograms) {
    return weightInKilograms * 1000;
}

console.log(kilogramsToGrams(3));
// 3000


// Function expression
const kilogramsToGramsExpression = function (weightInKilograms) {
    return weightInKilograms * 1000;
};

console.log(kilogramsToGramsExpression(5));
// 5000


// Function declarations are hoisted, while function expressions are assigned to variables.


// Arrow function
const kilogramsToGramsArrow = weightInKilograms =>
    weightInKilograms * 1000;

console.log(kilogramsToGramsArrow(2));
// 2000
// Function declarations are hoisted with their function body, whereas a function expression is assigned to a variable and should be called after that assignment.

// Exercise 6: Fortune Teller
(function (
    numberOfChildren,
    partnerName,
    geographicLocation,
    jobTitle
) {
    const message = `You will be a ${jobTitle} in ${geographicLocation}, and married to ${partnerName} with ${numberOfChildren} kids.`;

    console.log(message);
})(3, "Amina", "Nairobi", "software builder");
// You will be a software builder in Nairobi, and married to Amina with 3 kids.
// Exercise 7: Welcome
// HTML
// xml
<nav id="navbar"></nav>
// JavaScript
// js
(function (userName) {
    const userDiv = document.createElement("div");

    userDiv.innerHTML = `
        <img
            src="https://i.pravatar.cc/50?u=${encodeURIComponent(userName)}"
            alt="${userName}'s profile picture"
            width="50"
            height="50"
        >
        <span>Welcome, ${userName}!</span>
    `;

    document.querySelector("#navbar").appendChild(userDiv);
})("John");
// This adds a new div to the navbar containing John’s name and a profile image.


<div id="juice"></div>
JavaScript
js
function makeJuice(size) {
    function addIngredients(
        firstIngredient,
        secondIngredient,
        thirdIngredient
    ) {
        const message = `
            The client wants a ${size} juice, containing
            ${firstIngredient}, ${secondIngredient}, and ${thirdIngredient}.
        `;

        document.querySelector("#juice").textContent = message;
    }

    addIngredients("apple", "orange", "ginger");
}

makeJuice("large");
// Part II
js
function makeJuice(size) {
    const ingredients = [];

    function addIngredients(
        firstIngredient,
        secondIngredient,
        thirdIngredient
    ) {
        ingredients.push(
            firstIngredient,
            secondIngredient,
            thirdIngredient
        );
    }

    function displayJuice() {
        const message = `
            The client wants a ${size} juice, containing
            ${ingredients.join(", ")}.
        `;

        document.querySelector("#juice").textContent = message;
    }

    addIngredients("apple", "orange", "ginger");
    addIngredients("pineapple", "mint", "lemon");

    displayJuice();
}

makeJuice("large");