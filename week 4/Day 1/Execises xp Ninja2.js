// Exercise 1: Menu
const menu = [
  { type: "starter", name: "Houmous with Pita" },
  { type: "starter", name: "Vegetable Soup with Houmous peas" },
  { type: "dessert", name: "Chocolate Cake" }
];

// 1. Check if at least one element is a dessert (ternary + array method)
const hasDessert = menu.some(item => item.type === "dessert") ? true : false;

// 2. Check if all elements are starters
const allStarters = menu.every(item => item.type === "starter");

// 3. Check if there is at least one main course; if not, add one
const hasMainCourse = menu.some(item => item.type === "main course");
if (!hasMainCourse) {
  menu.push({ type: "main course", name: "Grilled Chicken with Rice" });
}

// 4. Add "vegetarian" boolean key to each menu item
const vegetarian = ["vegetable", "houmous", "eggs", "vanilla", "potatoes"];

const menuWithVegetarianFlag = menu.map(item => {
  const nameLower = item.name.toLowerCase();
  const isVegetarian = vegetarian.some(
    ingredient => nameLower.includes(ingredient.toLowerCase())
  );
  return { ...item, vegetarian: isVegetarian };
});

// Exercise 2: Chop into chunks
function string_chop(str, chunkSize) {
  const result = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    result.push(str.slice(i, i + chunkSize));
  }
  return result;
}

// Exercise 3: You said string?
function search_word(sentence, word) {
  const regex = new RegExp(`\\b${word}\\b`, "gi");
  const matches = sentence.match(regex);
  const count = matches ? matches.length : 0;
  return `'${word}' was found ${count} times.`;
}

// Exercise 4: Reverse Array (in-place, no new array)
function reverseArray(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
  }
  return arr;
}