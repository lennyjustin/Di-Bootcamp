const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

// Switch to Sign Up panel
signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

// Switch to Sign In panel
signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});