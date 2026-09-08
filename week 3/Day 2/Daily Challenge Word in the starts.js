function getInput() {
    if (typeof prompt === "function") {
        return prompt("Enter several words separated by commas:");
    }

    return "hello, world, programming";
}

const input = getInput();

const words = input
    .split(",")
    .map(function (word) {
        return word.trim();
    })
    .filter(function (word) {
        return word.length > 0;
    });

if (words.length === 0) {
    console.log("No words were entered.");
} else {
    let longestWordLength = 0;

    for (let i = 0; i < words.length; i++) {
        if (words[i].length > longestWordLength) {
            longestWordLength = words[i].length;
        }
    }

    const border = "*".repeat(longestWordLength + 4);

    console.log(border);

    for (let i = 0; i < words.length; i++) {
        const paddedWord = words[i].padEnd(longestWordLength, " ");
        console.log(`* ${paddedWord} *`);
    }

    console.log(border);
}