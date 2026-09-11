const apiKey = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";
const searchTerm = "cats";

async function appendRandomGif() {
    const container = document.querySelector("#gif-container");

    if (!container) {
        console.error("GIF container was not found");
        return;
    }

    const params = new URLSearchParams({
        api_key: apiKey,
        q: searchTerm,
        limit: "10",
    });

    try {
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`);

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data.length) {
            throw new Error("No GIFs were found");
        }

        const randomIndex = Math.floor(Math.random() * data.data.length);
        const randomGif = data.data[randomIndex];
        const gifImage = document.createElement("img");

        gifImage.src = randomGif.images.original.url;
        gifImage.alt = randomGif.title || "Random cat GIF";
        gifImage.width = 480;

        container.appendChild(gifImage);
    } catch (error) {
        console.error("Error:", error.message);

        const errorMessage = document.createElement("p");
        errorMessage.textContent = `Unable to load a GIF right now (${error.message}). Please try again later.`;
        container.replaceChildren(errorMessage);
    }
}

if (typeof document !== "undefined") {
    appendRandomGif();
}

const urls = [
    "https://jsonplaceholder.typicode.com/users",
    "https://jsonplaceholder.typicode.com/posts-invalid",
    "https://jsonplaceholder.typicode.com/albums",
];

async function getData() {
    try {
        const responses = await Promise.all(
            urls.map(async function (url) {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Request failed");
                }

                return await response.json();
            }),
        );

        const [users, posts, albums] = responses;

        console.log("users", users);
        console.log("posts", posts);
        console.log("albums", albums);
    } catch (error) {
        console.log("ooooooops");
    }
}

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

async function concurrentStart() {
    console.log("==CONCURRENT START with await==");
    const slow = resolveAfter2Seconds();
    const fast = resolveAfter1Second();
    console.log(await slow);
    console.log(await fast);
}

async function sequentialStart() {
    console.log("==SEQUENTIAL START==");
    const slow = await resolveAfter2Seconds();
    console.log(slow);
    const fast = await resolveAfter1Second();
    console.log(fast);
}

async function runExercises() {
    await getData();
    await concurrentStart();
    await sequentialStart();
}

runExercises();
