const emailForm = document.getElementById("emailForm");
const emailInput = document.getElementById("email");
const emailResult = document.getElementById("emailResult");

// ========== Method 1: With Regex ==========
function validateEmailWithRegex(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========== Method 2: Without Regex ==========
function validateEmailWithoutRegex(email) {
    if (email.length === 0) {
        return false;
    }

    const atSymbol = email.indexOf("@");
    const dotSymbol = email.lastIndexOf(".");

    // Must contain @
    if (atSymbol === -1) {
        return false;
    }

    // @ cannot be first
    if (atSymbol === 0) {
        return false;
    }

    // Must contain a dot after @
    if (dotSymbol === -1 || dotSymbol < atSymbol + 1) {
        return false;
    }

    // Dot cannot be last
    if (dotSymbol === email.length - 1) {
        return false;
    }

    // No spaces
    if (email.indexOf(" ") !== -1) {
        return false;
    }

    // No consecutive dots
    if (email.indexOf("..") !== -1) {
        return false;
    }

    return true;
}

emailForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailValue = emailInput.value.trim();

    const isValidWithRegex = validateEmailWithRegex(emailValue);
    const isValidWithoutRegex = validateEmailWithoutRegex(emailValue);

    if (isValidWithRegex && isValidWithoutRegex) {
        emailResult.textContent = `Valid email: ${emailValue}`;
        emailResult.style.color = "green";
    } else {
        emailResult.textContent = "Invalid email address. Please check the format.";
        emailResult.style.color = "red";
    }
});