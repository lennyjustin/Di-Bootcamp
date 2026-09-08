let client = "John";

const groceries = {
    fruits: ["pear", "apple", "banana"],
    vegetables: ["tomatoes", "cucumber", "salad"],
    totalPrice: "20$",
    other: {
        paid: true,
        meansOfPayment: ["cash", "creditCard"]
    }
};


// Exercise 1: Display Groceries

const displayGroceries = () => {
    groceries.fruits.forEach(fruit => {
        console.log(fruit);
    });
};

displayGroceries();


// Output:
// pear
// apple
// banana


// Exercise 2: Clone Groceries

const cloneGroceries = () => {
    // client is a string, which is a primitive value.
    // The value "John" is copied into user.
    let user = client;

    client = "Betty";

    console.log("client:", client);
    // Betty

    console.log("user:", user);
    // John

    // user remains "John" because strings are copied by value.
    // Changing client does not change user.


    // groceries is an object.
    // Assignment copies the reference, not a separate object.
    let shopping = groceries;

    shopping.totalPrice = "35$";

    console.log("groceries total price:", groceries.totalPrice);
    // 35$

    console.log("shopping total price:", shopping.totalPrice);
    // 35$

    // Both groceries and shopping refer to the same object.
    // Therefore, changing shopping.totalPrice also changes groceries.totalPrice.


    shopping.other.paid = false;

    console.log("groceries paid status:", groceries.other.paid);
    // false

    console.log("shopping paid status:", shopping.other.paid);
    // false

    // The nested other object is also shared.
    // Changing shopping.other.paid changes groceries.other.paid too.
};

cloneGroceries();