const form = document.getElementById("userForm");
const fnameInput = document.getElementById("fname");
const lnameInput = document.getElementById("lname");
const fnameByName = document.getElementsByName("firstname")[0];
const lnameByName = document.getElementsByName("lastname")[0];
const usersAnswerList = document.querySelector(".usersAnswer");

// 1. Retrieve the form and console.log it
console.log(form);

// 2. Retrieve the inputs by their id and console.log them
console.log(fnameInput);
console.log(lnameInput);

// 3. Retrieve the inputs by their name attribute and console.log them
console.log(fnameByName);
console.log(lnameByName);

// 4. Handle form submission
form.addEventListener("submit", function (event) {
    // Prevent the page from reloading
    event.preventDefault();

    const firstNameValue = fnameInput.value.trim();
    const lastNameValue = lnameInput.value.trim();

    // Make sure they are not empty
    if (firstNameValue === "" || lastNameValue === "") {
        alert("Please fill in both fields.");
        return;
    }

    // Clear previous answers
    usersAnswerList.innerHTML = "";

    // Create an li per input value
    const firstNameLi = document.createElement("li");
    firstNameLi.textContent = firstNameValue;

    const lastNameLi = document.createElement("li");
    lastNameLi.textContent = lastNameValue;

    // Append them to the ul
    usersAnswerList.appendChild(firstNameLi);
    usersAnswerList.appendChild(lastNameLi);
});