// 1st daily challenge: Play with words

function makeAllCaps(words) {
	return new Promise((resolve, reject) => {
		if (!Array.isArray(words) || !words.every((word) => typeof word === "string")) {
			reject("All items in the array must be strings.");
			return;
		}

		resolve(words.map((word) => word.toUpperCase()));
	});
}

function sortWords(words) {
	return new Promise((resolve, reject) => {
		if (!Array.isArray(words) || words.length <= 4) {
			reject("The array must contain more than four words.");
			return;
		}

		resolve([...words].sort());
	});
}

// Examples:
// makeAllCaps([1, "pear", "banana"])
//   .then((words) => sortWords(words))
//   .then((result) => console.log(result))
//   .catch((error) => console.log(error));

// makeAllCaps(["apple", "pear", "banana", "melon", "kiwi"])
//   .then((words) => sortWords(words))
//   .then((result) => console.log(result))
//   .catch((error) => console.log(error));


// 2nd daily challenge: Morse code

function toJs() {
	return new Promise((resolve, reject) => {
		try {
			const morseJS = JSON.parse(morse);

			if (Object.keys(morseJS).length === 0) {
				reject("The Morse object is empty.");
				return;
			}

			resolve(morseJS);
		} catch (error) {
			reject("The Morse JSON could not be converted to an object.");
		}
	});
}

function toMorse(morseJS) {
	return new Promise((resolve, reject) => {
		const userInput = prompt("Enter a word or sentence to translate into Morse code:");

		if (userInput === null) {
			reject("No text was entered.");
			return;
		}

		const characters = userInput.toLowerCase().split("");
		const unknownCharacter = characters.find((character) => !morseJS[character]);

		if (unknownCharacter) {
			reject(`The character "${unknownCharacter}" does not exist in the Morse object.`);
			return;
		}

		resolve(characters.map((character) => morseJS[character]));
	});
}

function joinWords(morseTranslation) {
	const translation = morseTranslation.join("\n");
	const output = document.querySelector("#morse-output") || document.createElement("pre");

	output.id = "morse-output";
	output.textContent = translation;

	if (!output.parentElement) {
		document.body.appendChild(output);
	}

	return translation;
}

toJs()
	.then((morseJS) => toMorse(morseJS))
	.then((morseTranslation) => joinWords(morseTranslation))
	.catch((error) => {
		console.error(error);
	});
