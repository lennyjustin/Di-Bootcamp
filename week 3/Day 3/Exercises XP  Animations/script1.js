const container = document.getElementById("container");
const clearButton = document.getElementById("clear");

// ========== Part I ==========
// Alert "Hello World" after 2 seconds
setTimeout(function () {
    alert("Hello World");
}, 2000);

// ========== Part II ==========
// Add a new paragraph after 2 seconds
setTimeout(function () {
    const paragraph = document.createElement("p");
    paragraph.textContent = "Hello World";
    container.appendChild(paragraph);
}, 2000);

// ========== Part III ==========
// Add a new paragraph every 2 seconds
let intervalId = setInterval(function () {
    const paragraph = document.createElement("p");
    paragraph.textContent = "Hello World";
    container.appendChild(paragraph);

    // Clear interval when there are 5 paragraphs
    if (container.children.length >= 5) {
        clearInterval(intervalId);
    }
}, 2000);

// Clear interval when the user clicks the button
clearButton.addEventListener("click", function () {
    clearInterval(intervalId);
});