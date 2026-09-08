// =====================================
// Exercise 1: Random Number
// =====================================

const randomNumber = Math.floor(Math.random() * 100) + 1;

console.log("Random number:", randomNumber);

for (let number = 0; number <= randomNumber; number += 2) {
    console.log(number);
}


// =====================================
// Exercise 2: Capitalized Letters
// =====================================

function capitalize(str) {
    let evenIndexes = "";
    let oddIndexes = "";

    for (let i = 0; i < str.length; i++) {
        if (i % 2 === 0) {
            evenIndexes += str[i].toUpperCase();
            oddIndexes += str[i];
        } else {
            evenIndexes += str[i];
            oddIndexes += str[i].toUpperCase();
        }
    }

    return [evenIndexes, oddIndexes];
}

console.log(capitalize("abcdef"));
// ["AbCdEf", "aBcDeF"]


// =====================================
// Exercise 3: Is Palindrome?
// =====================================

function isPalindrome(str) {
    const cleanedString = str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const reversedString = cleanedString
        .split("")
        .reverse()
        .join("");

    return cleanedString === reversedString;
}

console.log(isPalindrome("madam")); // true
console.log(isPalindrome("bob"));   // true
console.log(isPalindrome("kayak")); // true
console.log(isPalindrome("hello")); // false


// =====================================
// Exercise 4: Biggest Number
// =====================================

function biggestNumberInArray(arrayNumber) {
    if (arrayNumber.length === 0) {
        return 0;
    }

    const numbers = arrayNumber
        .map(function (value) {
            if (typeof value === "number") {
                return value;
            }

            if (typeof value === "string" && value.trim() !== "") {
                return Number(value);
            }

            return NaN;
        })
        .filter(function (value) {
            return Number.isFinite(value);
        });

    if (numbers.length === 0) {
        return 0;
    }

    return Math.max(...numbers);
}

const array = [-1, 0, 3, 100, 99, 2, 99];
const array2 = ["a", 3, 4, 2];
const array3 = [];

console.log(biggestNumberInArray(array));  // 100
console.log(biggestNumberInArray(array2)); // 4
console.log(biggestNumberInArray(array3)); // 0


// =====================================
// Exercise 5: Unique Elements
// =====================================

function uniqueElements(array) {
    const newArray = [];

    for (let i = 0; i < array.length; i++) {
        if (!newArray.includes(array[i])) {
            newArray.push(array[i]);
        }
    }

    return newArray;
}

const list = [1, 2, 3, 3, 3, 3, 4, 5];

console.log(uniqueElements(list));
// [1, 2, 3, 4, 5]


// =====================================
// Exercise 6: Calendar
// =====================================

function createCalendar(year, month) {
    // Remove an existing calendar if the function is called again
    const oldCalendar = document.querySelector("#calendar");

    if (oldCalendar) {
        oldCalendar.remove();
    }

    // Create the table
    const table = document.createElement("table");
    table.id = "calendar";

    // Create the table header
    const headerRow = document.createElement("tr");
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    weekdays.forEach(function (weekday) {
        const headerCell = document.createElement("th");
        headerCell.textContent = weekday;
        headerRow.appendChild(headerCell);
    });

    table.appendChild(headerRow);

    // JavaScript getDay() returns:
    // Sunday = 0, Monday = 1, ..., Saturday = 6
    const firstDay = new Date(year, month - 1, 1).getDay();

    // Convert Sunday-first format to Monday-first format
    const mondayBasedFirstDay = (firstDay + 6) % 7;

    // Get the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();

    let currentDay = 1;

    while (currentDay <= daysInMonth) {
        const weekRow = document.createElement("tr");

        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const dayCell = document.createElement("td");

            if (
                (currentDay === 1 && dayOfWeek < mondayBasedFirstDay) ||
                currentDay > daysInMonth
            ) {
                dayCell.textContent = "";
            } else {
                dayCell.textContent = currentDay;
                currentDay++;
            }

            weekRow.appendChild(dayCell);
        }

        table.appendChild(weekRow);
    }

    // Add simple styling using JavaScript
    const style = document.createElement("style");

    style.textContent = `
        #calendar {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            margin: 20px;
        }

        #calendar th,
        #calendar td {
            border: 1px solid black;
            width: 45px;
            height: 35px;
            text-align: center;
            padding: 5px;
        }

        #calendar th {
            background-color: #333;
            color: white;
        }

        #calendar td {
            background-color: #f2f2f2;
        }

        #calendar td:hover {
            background-color: #add8e6;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(table);

    return table;
}

// Month is between 1 and 12.
// September is month 9.
createCalendar(2012, 9);