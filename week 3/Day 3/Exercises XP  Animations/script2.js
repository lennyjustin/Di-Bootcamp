const container = document.getElementById("container");
const animateBox = document.getElementById("animate");
const moveButton = document.getElementById("moveBtn");

let animationId = null;
let position = 0;

function myMove() {
    // Prevent multiple intervals if button is clicked again
    if (animationId !== null) {
        return;
    }

    position = 0;
    animateBox.style.left = position + "px";

    animationId = setInterval(function () {
        position += 1; // Move 1px to the right
        animateBox.style.left = position + "px";

        // Stop when the box reaches the right edge
        // Container width (400) - Box width (50) = 350px max movement
        if (position >= 350) {
            clearInterval(animationId);
            animationId = null;
        }
    }, 1); // Every 1 millisecond
}

moveButton.addEventListener("click", myMove);