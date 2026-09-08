// Exercises XP Gold
// Advanced Functions


// Exercise 1: Nested arrow functions

let landscape = () => {
    let result = "";

    let flat = x => {
        for (let count = 0; count < x; count++) {
            result = result + "_";
        }
    };

    let mountain = x => {
        result = result + "/";

        for (let counter = 0; counter < x; counter++) {
            result = result + "'";
        }

        result = result + "\\";
    };

    flat(4);
    mountain(4);
    flat(4);

    return result;
};

console.log(landscape());


// Exercise 2: Closure

const addTo = x => y => x + y;

const addToTen = addTo(10);

console.log(addToTen(3));


// Exercise 3: Currying

const curriedSum = a => b => a + b;

console.log(curriedSum(30)(1));


// Exercise 4: Currying

const curriedSumTwo = a => b => a + b;

const add5 = curriedSumTwo(5);

console.log(add5(12));


// Exercise 5: Composing

const compose = (f, g) => a => f(g(a));

const add1 = num => num + 1;

const add5Number = num => num + 5;

console.log(compose(add1, add5Number)(10));