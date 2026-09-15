const API_URL = "https://www.swapi.tech/api/people";
const CHARACTER_COUNT = 83;

function getElements() {
	return {
		button: document.querySelector("#discover-button"),
		content: document.querySelector("#character-content")
	};
}

function showLoading(content, button) {
	button.disabled = true;
	button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i><span>Searching...</span>';
	content.innerHTML = `
		<div class="loading-state">
			<i class="fa-solid fa-jedi fa-spin-pulse" aria-hidden="true"></i>
			<p>Loading character...</p>
		</div>`;
}

function showError(content, button) {
	button.disabled = false;
	button.innerHTML = '<i class="fa-solid fa-shuffle" aria-hidden="true"></i><span>Try Again</span>';
	content.innerHTML = `
		<div class="error-state" role="alert">
			<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
			<h2>Oh no! Something went wrong.</h2>
			<p>We couldn't connect to the galaxy. Please try again.</p>
		</div>`;
}

function formatValue(value, fallback = "Unknown") {
	return value && value !== "unknown" && value !== "n/a" ? value : fallback;
}

function displayCharacter(content, character, homeworld) {
	const properties = character.result.properties;
	const homeworldName = homeworld?.result?.properties?.name || homeworld?.result?.name || "Unknown";

	content.innerHTML = `
		<div class="character-header">
			<span class="character-label">CHARACTER FILE</span>
			<i class="fa-solid fa-user-astronaut" aria-hidden="true"></i>
		</div>
		<h2>${formatValue(properties.name)}</h2>
		<dl class="character-details">
			<div><dt>Height</dt><dd>${formatValue(properties.height)} cm</dd></div>
			<div><dt>Gender</dt><dd>${formatValue(properties.gender)}</dd></div>
			<div><dt>Birth Year</dt><dd>${formatValue(properties.birth_year)}</dd></div>
			<div><dt>Home World</dt><dd>${formatValue(homeworldName)}</dd></div>
		</dl>`;
}

async function getCharacter() {
	const { button, content } = getElements();
	showLoading(content, button);

	try {
		const randomId = Math.floor(Math.random() * CHARACTER_COUNT) + 1;
		const characterResponse = await fetch(`${API_URL}/${randomId}`);

		if (!characterResponse.ok) {
			throw new Error("Character request failed");
		}

		const character = await characterResponse.json();
		const homeworldUrl = character.result.properties.homeworld;
		const homeworldResponse = await fetch(homeworldUrl);
		const homeworld = homeworldResponse.ok ? await homeworldResponse.json() : null;

		displayCharacter(content, character, homeworld);
		button.disabled = false;
		button.innerHTML = '<i class="fa-solid fa-shuffle" aria-hidden="true"></i><span>Find Someone</span>';
	} catch (error) {
		console.error("Unable to retrieve a Star Wars character:", error);
		showError(content, button);
	}
}

const elements = getElements();
elements.button.addEventListener("click", getCharacter);
