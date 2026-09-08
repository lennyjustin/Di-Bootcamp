let sentence = "The movie is not that bad, I like it";

let wordNot = sentence.indexOf("not");
let wordBad = sentence.indexOf("bad");

if (wordNot !== -1 && wordBad !== -1 && wordBad > wordNot) {
  sentence =
    sentence.slice(0, wordNot) +
    "good" +
    sentence.slice(wordBad + 3);
}

console.log(sentence);

