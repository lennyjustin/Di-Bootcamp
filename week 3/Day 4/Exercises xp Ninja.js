// Exercise XP Ninja
// Exercise 1: Merge Words

const mergeWords = firstWord => nextWord => {
    if (nextWord === undefined) {
        return firstWord;
    }

    return mergeWords(`${firstWord} ${nextWord}`);
};

// Example usage:
console.log(mergeWords("There")("is")("no")("spoon.")());