const lettersInput = document.getElementById("lettersInput");

lettersInput.addEventListener("keypress", function (event) {
    const charCode = event.which || event.keyCode;

    // Allow only letters (A-Z, a-z)
    // A-Z: 65-90, a-z: 97-122
    // Also allow control keys (backspace, tab, etc.)
    if (
        (charCode >= 65 && charCode <= 90) ||   // Uppercase letters
        (charCode >= 97 && charCode <= 122) ||  // Lowercase letters
        charCode === 8 ||   // Backspace
        charCode === 9 ||   // Tab
        charCode === 13 ||  // Enter
        charCode === 46     // Delete
    ) {
        return true; // Allow the character
    } else {
        event.preventDefault(); // Block the character
        return false;
    }
});