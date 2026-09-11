// Exercises XP: Fetch API and Async/Await

const GIPHY_API_KEY = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";

async function getJson(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return response.json();
}

// Exercise 1: retrieve hilarious GIFs rated G.
async function exercise1() {
	const url = `https://api.giphy.com/v1/gifs/search?q=hilarious&rating=g&api_key=${GIPHY_API_KEY}`;

	try {
		const gifs = await getJson(url);
		console.log("Exercise 1:", gifs);
	} catch (error) {
		console.error("Exercise 1 error:", error.message);
	}
}

// Exercise 2: retrieve 10 GIFs about the sun, starting at result 2.
async function exercise2() {
	const params = new URLSearchParams({
		q: "sun",
		limit: "10",
		offset: "2",
		api_key: GIPHY_API_KEY,
	});

	try {
		const gifs = await getJson(`https://api.giphy.com/v1/gifs/search?${params}`);
		console.log("Exercise 2:", gifs);
	} catch (error) {
		console.error("Exercise 2 error:", error.message);
	}
}

// Exercise 3: retrieve the starship using async/await without then().
async function exercise3() {
	try {
		const starship = await getJson("https://www.swapi.tech/api/starships/9/");
		console.log("Exercise 3:", starship.result);
	} catch (error) {
		console.error("Exercise 3 error:", error.message);
	}
}

// Exercise 4: the first message is logged immediately. After two seconds,
// the promise resolves and the awaited result is logged.
function resolveAfter2Seconds() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve("resolved");
		}, 2000);
	});
}

async function exercise4() {
	console.log("Exercise 4: calling");
	const result = await resolveAfter2Seconds();
	console.log("Exercise 4:", result);
}

async function runExercises() {
	await exercise1();
	await exercise2();
	await exercise3();
	await exercise4();
}

runExercises();
