// Exercise 1: is_Blank

function isBlank(str) {
    return str.trim() === "";
}

console.log(isBlank(""));      // true
console.log(isBlank("abc"));   // false
console.log(isBlank("   "));   // true


// Exercise 2: Abbrev_name

function abbrevName(fullName) {
    const names = fullName.trim().split(/\s+/);

    if (names.length === 1) {
        return names[0];
    }

    const firstName = names[0];
    const lastName = names[names.length - 1];

    return `${firstName} ${lastName[0]}.`;
}

console.log(abbrevName("Robin Singh")); // Robin S.


// Exercise 3: SwapCase

function swapCase(str) {
    return str
        .split("")
        .map(function (character) {
            if (character >= "a" && character <= "z") {
                return character.toUpperCase();
            }

            if (character >= "A" && character <= "Z") {
                return character.toLowerCase();
            }

            return character;
        })
        .join("");
}

console.log(swapCase("The Quick Brown Fox"));
// tHE qUICK bROWN fOX


// Exercise 4: Omnipresent value

function isOmnipresent(array, value) {
    return array.every(function (subArray) {
        return subArray.includes(value);
    });
}

console.log(
    isOmnipresent(
        [[1, 1], [1, 3], [5, 1], [6, 1]],
        1
    )
); // true

console.log(
    isOmnipresent(
        [[1, 1], [1, 3], [5, 1], [6, 1]],
        6
    )
); // false

console.log(
    isOmnipresent(
        [[3, 4], [8, 3, 2], [3], [9, 3], [5, 3], [4, 3]],
        3
    )
); // true
<script src="./Exercise xp Gold.html"></script>