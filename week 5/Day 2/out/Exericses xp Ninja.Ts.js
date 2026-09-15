"use strict";
// Exercise 1: Conditional Types
function mapType(value) {
    if (typeof value === "number") {
        return (value * value);
    }
    return value.length;
}
console.log(mapType(4));
console.log(mapType("hello"));
// Exercise 2: Keyof and Lookup Types
function getProperty(obj, key) {
    return obj[key];
}
const user = {
    name: "Alice",
    age: 30,
    city: "Paris",
};
console.log(getProperty(user, "name"));
console.log(getProperty(user, "age"));
console.log(getProperty(user, "city"));
function multiplyProperty(obj, key, factor) {
    return obj[key] * factor;
}
const stats = {
    price: 20,
    quantity: 3,
    discount: 2,
};
console.log(multiplyProperty(stats, "price", 2));
console.log(multiplyProperty(stats, "quantity", 5));
console.log(multiplyProperty(stats, "discount", 10));
