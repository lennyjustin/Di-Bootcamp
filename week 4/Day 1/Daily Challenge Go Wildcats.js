const gameInfo = [
  {
    username: "john",
    team: "red",
    score: 5,
    items: ["ball", "book", "pen"]
  },
  {
    username: "becky",
    team: "blue",
    score: 10,
    items: ["tape", "backpack", "pen"]
  },
  {
    username: "susy",
    team: "red",
    score: 55,
    items: ["ball", "eraser", "pen"]
  },
  {
    username: "tyson",
    team: "green",
    score: 1,
    items: ["book", "pen"]
  }
];

// 1. Usernames with "!" using forEach
const usernames = [];
gameInfo.forEach(player => {
  usernames.push(player.username + "!");
});

// 2. Winners (score > 5) using forEach
const winners = [];
gameInfo.forEach(player => {
  if (player.score > 5) {
    winners.push(player.username);
  }
});

// 3. Total score of all users
let totalScore = 0;
gameInfo.forEach(player => {
  totalScore += player.score;
});