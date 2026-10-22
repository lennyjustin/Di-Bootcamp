const authForm = document.querySelector("#auth-form");
const profileForm = document.querySelector("#profile-form");
const statusMessage = document.querySelector("#status");
const signedOut = document.querySelector("#signed-out");
const signedIn = document.querySelector("#signed-in");
const authIndicator = document.querySelector("#auth-indicator");
const usernameLabel = document.querySelector("#profile-username");
const usernameInput = document.querySelector("#new-username");
const profileId = document.querySelector("#profile-id");
const avatar = document.querySelector("#avatar");
const submitLabel = document.querySelector("#submit-label");
const passwordInput = document.querySelector("#password");
const tabs = [...document.querySelectorAll(".tab")];

let authMode = "register";

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.dataset.state = isError ? "error" : "success";
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || "The request could not be completed.");
  }
  return body;
}

function renderUser(user) {
  if (!user) {
    signedOut.hidden = false;
    signedIn.hidden = true;
    authIndicator.textContent = "SIGNED OUT";
    authIndicator.classList.remove("is-signed-in");
    return;
  }

  signedOut.hidden = true;
  signedIn.hidden = false;
  authIndicator.textContent = "AUTHENTICATED";
  authIndicator.classList.add("is-signed-in");
  usernameLabel.textContent = user.username;
  usernameInput.value = user.username;
  avatar.textContent = user.username.slice(0, 1).toUpperCase();
  profileId.textContent = `User ID · ${user.id.slice(0, 8)}`;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    authMode = tab.dataset.mode;
    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    submitLabel.textContent = authMode === "register" ? "Create account" : "Sign in";
    passwordInput.autocomplete = authMode === "register" ? "new-password" : "current-password";
  });
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(authForm);
  try {
    const result = await request(`/api/auth/${authMode}`, {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });
    renderUser(result.user);
    authForm.reset();
    showStatus(authMode === "register" ? "Account created. Your protected profile is now unlocked." : "You are signed in. Your protected profile is now unlocked.");
  } catch (error) {
    showStatus(error.message, true);
  }
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(profileForm);
  try {
    const result = await request("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ username: formData.get("username") }),
    });
    renderUser(result.user);
    showStatus("Your profile was updated.");
  } catch (error) {
    showStatus(error.message, true);
  }
});

document.querySelector("#refresh-button").addEventListener("click", async () => {
  try {
    const result = await request("/api/auth/refresh", { method: "POST" });
    renderUser(result.user);
    showStatus("Session refreshed. A new access and refresh token have been issued.");
  } catch (error) {
    renderUser(null);
    showStatus(error.message, true);
  }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await request("/api/auth/logout", { method: "POST" });
    renderUser(null);
    showStatus("Signed out. The refresh session has been revoked.");
  } catch (error) {
    showStatus(error.message, true);
  }
});

request("/api/auth/me")
  .then(({ user }) => renderUser(user))
  .catch((error) => {
    renderUser(null);
    if (error.message !== "Authentication required." && !error.message.includes("session has expired")) {
      showStatus(`Could not check your current session: ${error.message}`, true);
    }
  });
