//Exercise 1
js
[1, 2, 3].map(num => {
  if (typeof num === 'number') return num * 2;
  return ;
});
//Exercise 2
js
[[0, 1], [2, 3]].reduce(
  (acc, cur) => {
    return acc.concat(cur);
  },
  [1, 2],
);
//Exercise 3
js
const arrayNum = [1, 2, 4, 5, 8, 9];
const newArray = arrayNum.map((num, i) => {
    console.log(num, i);
    alert(num);
    return num * 2;
});

// i is the index: 0, 1, 2, 3, 4, 5
//Exercise 4
//Part 1
js
const array = [[1],[2],[3],[[[4]]],[[[5]]]];
const transformed = array.map(item => item.flat());
//Part 2
js
const greeting = [
  ["Hello", "young", "grasshopper!"],
  ["you", "are"],
  ["learning", "fast!"]
];

const joinedGreeting = greeting.map(words => words.join(" "));
const sentence = joinedGreeting.join(" ");
// Trapped number
js
const trapped = [[[[[[[[[[[[[[[[[[[[[[[[[[3]]]]]]]]]]]]]]]]]]]]]]]]]];
const freed = trapped.flat(Infinity);
