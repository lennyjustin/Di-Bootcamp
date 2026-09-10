// 1st daily challenge: play with words
function makeAllCaps(words) {
	return new Promise((resolve, reject) => {
		if (!Array.isArray(words) || !words.every((word) => typeof word === "string")) {
			reject("Every item in the array must be a string.");
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

		resolve([...words].sort((firstWord, secondWord) =>
			firstWord.localeCompare(secondWord)
		));
	});
}

makeAllCaps([1, "pear", "banana"])
	.then((words) => sortWords(words))
	.then((result) => console.log(result))
	.catch((error) => console.log(error));

makeAllCaps(["apple", "pear", "banana"])
	.then((words) => sortWords(words))
	.then((result) => console.log(result))
	.catch((error) => console.log(error));

makeAllCaps(["apple", "pear", "banana", "melon", "kiwi"])
	.then((words) => sortWords(words))
	.then((result) => console.log(result))
	.catch((error) => console.log(error));

/
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
		if (typeof prompt !== "function") {
			reject("User input is only available in a browser.");
			return;
		}

		const userInput = prompt("Enter a word or sentence:");

		if (typeof userInput !== "string" || userInput.length === 0) {
			reject("Please enter a word or sentence.");
			return;
		}

		const translation = [];

		for (const character of userInput.toLowerCase()) {
			if (/\s/.test(character)) {
				translation.push("");
			} else if (!Object.prototype.hasOwnProperty.call(morseJS, character)) {
				reject(`The character "${character}" is not in the Morse object.`);
				return;
			} else {
				translation.push(morseJS[character]);
			}
		}

		resolve(translation);
	});
}

function joinWords(morseTranslation) {
	const translatedText = morseTranslation.join("\n");

	if (typeof document !== "undefined") {
		let output = document.getElementById("morse-output");

		if (!output) {
			output = document.createElement("pre");
			output.id = "morse-output";
			document.body.appendChild(output);
		}

		output.textContent = translatedText;
	}

	return translatedText;
}

if (typeof window !== "undefined") {
	toJs()
		.then((morseJS) => toMorse(morseJS))
		.then((morseTranslation) => joinWords(morseTranslation))
		.catch((error) => console.log(error));
}
