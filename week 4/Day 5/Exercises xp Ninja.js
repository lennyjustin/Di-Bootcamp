const GIPHY_API_KEY = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";
const gifForm = document.querySelector("#gif-form");
const categoryInput = document.querySelector("#search-input");
const gifContainer = document.querySelector("#gif-container");
const deleteButton = document.querySelector("#delete-button");
const statusMessage = document.querySelector("#status");

// Exercise 1: search for GIFs in the category entered by the user.
async function searchGifs(category) {
    const params = new URLSearchParams({
        api_key: GIPHY_API_KEY,
        q: category,
        limit: "10",
        rating: "g",
    });

    const response = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`);

    if (!response.ok) {
        throw new Error(`Giphy request failed with status ${response.status}`);
    }

    return response.json();
}

function appendGifs(data) {
    data.data.forEach((gif) => {
        const card = document.createElement("article");
        const image = document.createElement("img");
        const deleteGifButton = document.createElement("button");

        card.className = "gif-card";
        image.src = gif.images.original.url;
        image.alt = gif.title || "Giphy result";
        deleteGifButton.type = "button";
        deleteGifButton.textContent = "Delete";
        deleteGifButton.addEventListener("click", () => {
            card.remove();
        });

        card.appendChild(image);
        card.appendChild(deleteGifButton);
        gifContainer.appendChild(card);
    });
}

gifForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const category = categoryInput.value.trim();

    if (!category) {
        return;
    }

    statusMessage.textContent = "Loading GIFs...";
    statusMessage.className = "";

    try {
        const data = await searchGifs(category);
        gifContainer.replaceChildren();

        if (!data.data.length) {
            statusMessage.textContent = "No GIFs found for that category.";
            return;
        }

        appendGifs(data);
        statusMessage.textContent = `${data.data.length} GIFs loaded.`;
    } catch (error) {
        statusMessage.textContent = `Unable to load GIFs: ${error.message}`;
        statusMessage.className = "error";
        console.error(error);
    }
});

deleteButton.addEventListener("click", () => {
    gifContainer.replaceChildren();
    statusMessage.textContent = "GIFs deleted.";
    statusMessage.className = "";
});

// Exercises 2–4: promise timing analysis.
function resolveAfter2Seconds() {
    console.log("starting slow promise");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("slow");
            console.log("slow promise is done");
        }, 2000);
    });
}

function resolveAfter1Second() {
    console.log("starting fast promise");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("fast");
            console.log("fast promise is done");
        }, 1000);
    });
}

// Exercise 2: both promises start after one second. Promise.all preserves
// input order, so slow is printed before fast even though fast finishes first.
async function concurrentPromise() {
    console.log("==CONCURRENT START with Promise.all==");
    const messages = await Promise.all([
        resolveAfter2Seconds(),
        resolveAfter1Second(),
    ]);
    console.log(messages[0]);
    console.log(messages[1]);
}

// Exercise 3: both async jobs start together after five seconds. Each job
// prints its own result when its promise resolves, so fast appears first.
async function parallel() {
    console.log("==PARALLEL with await Promise.all==");
    await Promise.all([
        (async () => console.log(await resolveAfter2Seconds()))(),
        (async () => console.log(await resolveAfter1Second()))(),
    ]);
}

// Exercise 4: both promises start after thirteen seconds. Promise handlers
// print results as each promise resolves, so fast appears before slow.
function parallelPromise() {
    console.log("==PARALLEL with Promise handlers==");
    resolveAfter2Seconds().then((message) => console.log(message));
    resolveAfter1Second().then((message) => console.log(message));
}

setTimeout(concurrentPromise, 1000);
setTimeout(parallel, 5000);
setTimeout(parallelPromise, 13000);
