// ======================================
// EXERCISE 1: Numbers Divisible by 23
// ======================================

function displayNumbersDivisible(divisor = 23) {
    let numbers = [];
    let sum = 0;

    for (let number = 0; number <= 500; number++) {
        if (number % divisor === 0) {
            numbers.push(number);
            sum += number;
        }
    }

    console.log(numbers.join(" "));
    console.log(`Sum: ${sum}`);
}

displayNumbersDivisible();

// Bonus
displayNumbersDivisible(3);
displayNumbersDivisible(45);


// ======================================
// EXERCISE 2: Shopping List
// ======================================

const stock = {
    banana: 6,
    apple: 0,
    pear: 12,
    orange: 32,
    blueberry: 1
};

const prices = {
    banana: 4,
    apple: 2,
    pear: 1,
    orange: 1.5,
    blueberry: 10
};

const shoppingList = ["banana", "orange", "apple"];

function myBill() {
    let total = 0;

    for (const item of shoppingList) {
        if (item in stock && stock[item] > 0) {
            total += prices[item];

            // Bonus: decrease stock by 1
            stock[item]--;
        }
    }

    return total;
}

console.log(`Shopping total: $${myBill().toFixed(2)}`);


// ======================================
// EXERCISE 3: What's in My Wallet?
// ======================================

function changeEnough(itemPrice, amountOfChange) {
    const quarters = amountOfChange[0];
    const dimes = amountOfChange[1];
    const nickels = amountOfChange[2];
    const pennies = amountOfChange[3];

    const total =
        quarters * 0.25 +
        dimes * 0.10 +
        nickels * 0.05 +
        pennies * 0.01;

    return total >= itemPrice;
}

console.log(changeEnough(4.25, [25, 20, 5, 0]));
console.log(changeEnough(14.11, [2, 100, 0, 0]));
console.log(changeEnough(0.75, [0, 0, 20, 5]));


// ======================================
// EXERCISE 4: Vacation Costs
// ======================================

function safePrompt(message) {
    if (typeof prompt === "function") {
        return prompt(message);
    }

    if (message.toLowerCase().includes("nights")) return "10";
    if (message.toLowerCase().includes("days")) return "10";
    if (message.toLowerCase().includes("destination")) return "london";

    return "0";
}

function safeAlert(message) {
    if (typeof alert === "function") {
        alert(message);
        return;
    }

    console.log(message);
}

function getNumberInput(message) {
    while (true) {
        const answer = safePrompt(message);

        if (answer !== null && answer.trim() !== "") {
            const number = Number(answer);

            if (!isNaN(number) && number >= 0) {
                return number;
            }
        }

        safeAlert("Please enter a valid number.");
    }
}

function hotelCost() {
    const nights = getNumberInput(
        "How many nights would you like to stay?"
    );

    return nights * 140;
}

function planeRideCost() {
    while (true) {
        const destination = safePrompt("What is your destination?");

        if (destination !== null && destination.trim() !== "") {
            const location = destination.trim().toLowerCase();

            if (location === "london") {
                return 183;
            }

            if (location === "paris") {
                return 220;
            }

            return 300;
        }

        safeAlert("Please enter a destination.");
    }
}

function rentalCarCost() {
    const days = getNumberInput(
        "How many days would you like to rent the car?"
    );

    let cost = days * 40;

    if (days > 10) {
        cost *= 0.95;
    }

    return cost;
}

function totalVacationCost() {
    const hotel = hotelCost();
    const plane = planeRideCost();
    const car = rentalCarCost();

    const total = hotel + plane + car;

    console.log(`Hotel cost: $${hotel.toFixed(2)}`);
    console.log(`Plane ticket cost: $${plane.toFixed(2)}`);
    console.log(`Rental car cost: $${car.toFixed(2)}`);
    console.log(`Total vacation cost: $${total.toFixed(2)}`);

    return total;
}

totalVacationCost();


// ======================================
// EXERCISE 5: Users
// ======================================

if (typeof document !== "undefined") {
    const container = document.getElementById("container");
    console.log(container);

    const lists = document.querySelectorAll(".list");

    // Change Pete to Richard
    lists[0].children[1].textContent = "Richard";

    // Delete the second li of the second ul
    lists[1].children[1].remove();

    // Change the first li of each ul to your name
    lists.forEach(function (list) {
        list.firstElementChild.textContent = "Lenny";
    });

    // Add student_list to both ul elements
    lists.forEach(function (list) {
        list.classList.add("student_list");
    });

    // Add university and attendance to the first ul
    lists[0].classList.add("university", "attendance");

    // Style the div
    container.style.backgroundColor = "lightblue";
    container.style.padding = "20px";

    // Hide Dan
    document.querySelectorAll(".list li").forEach(function (item) {
        if (item.textContent.trim() === "Dan") {
            item.style.display = "none";
        }
    });

    // Add border to Richard
    document.querySelectorAll(".list li").forEach(function (item) {
        if (item.textContent.trim() === "Richard") {
            item.style.border = "2px solid black";
        }
    });

    // Change body font size
    document.body.style.fontSize = "18px";
} else {
    console.log("DOM exercise skipped because document is not available in Node.");
}

// Bonus
if (typeof document !== "undefined") {
    const firstUser = lists[0].children[0].textContent;
    const secondUser = lists[0].children[1].textContent;

    if (getComputedStyle(container).backgroundColor === "rgb(173, 216, 230)") {
        alert(`Hello ${firstUser} and ${secondUser}`);
    }
}


// ======================================
// EXERCISE 6: Change the Navbar
// ======================================

if (typeof document !== "undefined") {
    const navBar = document.getElementById("navBar");

    // Change the id using setAttribute
    navBar.setAttribute("id", "socialNetworkNavigation");

    const navList = navBar.querySelector("ul");

    // Create a new li
    const logoutItem = document.createElement("li");

    // Create a text node
    const logoutText = document.createTextNode("Logout");

    // Append the text node to the li
    logoutItem.appendChild(logoutText);

    // Append the li to the ul
    navList.appendChild(logoutItem);

    // Display first and last items
    const firstItem = navList.firstElementChild;
    const lastItem = navList.lastElementChild;

    console.log("First item:", firstItem.textContent);
    console.log("Last item:", lastItem.textContent);
}


// ======================================
// EXERCISE 7: My Book List
// ======================================

if (typeof document !== "undefined") {
    const allBooks = [
        {
            title: "The Alchemist",
            author: "Paulo Coelho",
            image: "https://covers.openlibrary.org/isbn/9780062315007-M.jpg",
            alreadyRead: true
        },
        {
            title: "Atomic Habits",
            author: "James Clear",
            image: "https://covers.openlibrary.org/isbn/9780735211292-M.jpg",
            alreadyRead: false
        }
    ];

    const bookSection = document.querySelector(".listBooks");

    allBooks.forEach(function (book) {
        const bookDiv = document.createElement("div");
        const bookImage = document.createElement("img");
        const bookDetails = document.createElement("p");

        bookImage.src = book.image;
        bookImage.alt = book.title;
        bookImage.style.width = "100px";

        bookDetails.textContent = `${book.title} written by ${book.author}`;

        if (book.alreadyRead === true) {
            bookDetails.style.color = "red";
        }

        bookDiv.appendChild(bookImage);
        bookDiv.appendChild(bookDetails);
        bookSection.appendChild(bookDiv);
    });
}