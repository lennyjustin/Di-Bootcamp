const form = document.getElementById("libform");
const nounInput = document.getElementById("noun");
const adjectiveInput = document.getElementById("adjective");
const personInput = document.getElementById("person");
const verbInput = document.getElementById("verb");
const placeInput = document.getElementById("place");
const storyDiv = document.getElementById("story");
const storyText = document.getElementById("storyText");
const shuffleBtn = document.getElementById("shuffleBtn");

// Store the current values
let currentValues = {};

// Array of story templates
const storyTemplates = [
    function (noun, adjective, person, verb, place) {
        return `One day, ${person} went to ${place} and saw a ${adjective} ${noun}. Everyone started ${verb} because it was so surprising!`;
    },
    function (noun, adjective, person, verb, place) {
        return `In ${place}, there was a famous ${adjective} ${noun}. ${person} loved to go there just for ${verb} all day long.`;
    },
    function (noun, adjective, person, verb, place) {
        return `${person} decided to bring a ${adjective} ${noun} to ${place}. The whole town started ${verb} in celebration!`;
    },
    function (noun, adjective, person, verb, place) {
        return `While ${verb} in ${place}, ${person} found a ${adjective} ${noun} hidden under a rock. It was the best day ever!`;
    }
];

let currentStoryIndex = 0;

function generateStory() {
    const noun = nounInput.value.trim();
    const adjective = adjectiveInput.value.trim();
    const person = personInput.value.trim();
    const verb = verbInput.value.trim();
    const place = placeInput.value.trim();

    // Validate inputs
    if (!noun || !adjective || !person || !verb || !place) {
        alert("Please fill in all fields before generating the story!");
        return false;
    }

    // Store current values
    currentValues = { noun, adjective, person, verb, place };

    // Generate a random story
    currentStoryIndex = Math.floor(Math.random() * storyTemplates.length);
    const story = storyTemplates[currentStoryIndex](noun, adjective, person, verb, place);

    // Display the story
    storyText.textContent = story;
    storyDiv.classList.add("visible");

    return true;
}

function shuffleStory() {
    // Check if we have values
    if (Object.keys(currentValues).length === 0) {
        alert("Please fill in the form and generate a story first!");
        return;
    }

    // Generate a different random story
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * storyTemplates.length);
    } while (newIndex === currentStoryIndex && storyTemplates.length > 1);

    currentStoryIndex = newIndex;

    const story = storyTemplates[currentStoryIndex](
        currentValues.noun,
        currentValues.adjective,
        currentValues.person,
        currentValues.verb,
        currentValues.place
    );

    storyText.textContent = story;
}

// Handle form submission
form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page reload
    generateStory();
});

// Handle shuffle button
shuffleBtn.addEventListener("click", shuffleStory);