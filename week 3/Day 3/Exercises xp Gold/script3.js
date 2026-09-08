const root = document.getElementById("root");

// Create an empty array for the shopping list
let shoppingList = [];

// Create the form
const form = document.createElement("form");

const input = document.createElement("input");
input.type = "text";
input.id = "itemInput";
input.placeholder = "Enter item to buy";

const addItemButton = document.createElement("input");
addItemButton.type = "button";
addItemButton.value = "AddItem";

form.appendChild(input);
form.appendChild(addItemButton);
root.appendChild(form);

// Create the ClearAll button
const clearAllButton = document.createElement("button");
clearAllButton.textContent = "ClearAll";
root.appendChild(clearAllButton);

// Create a list to display items
const list = document.createElement("ul");
list.id = "shoppingListDisplay";
root.appendChild(list);

// Function to add an item
function addItem() {
    const itemValue = input.value.trim();

    if (itemValue === "") {
        alert("Please enter an item.");
        return;
    }

    shoppingList.push(itemValue);

    const listItem = document.createElement("li");
    listItem.textContent = itemValue;
    list.appendChild(listItem);

    input.value = "";
}

// Function to clear all items
function clearAll() {
    shoppingList = [];
    list.innerHTML = "";
}

// Event listeners
addItemButton.addEventListener("click", addItem);
clearAllButton.addEventListener("click", clearAll);