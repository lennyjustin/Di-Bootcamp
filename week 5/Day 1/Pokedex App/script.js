const API_URL = "https://pokeapi.co/api/v2/pokemon";
const MAX_POKEMON = 1025;

const form = document.querySelector("#search-form");
const input = document.querySelector("#search-input");
const randomButton = document.querySelector("#random-button");
const previousButton = document.querySelector("#previous-button");
const nextButton = document.querySelector("#next-button");
const card = document.querySelector("#pokemon-card");
let currentPokemonId = null;

function titleCase(value) {
  return value.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function showLoading() {
  card.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Searching the Pokédex...</p></div>';
  form.querySelector("button").disabled = true;
  randomButton.disabled = true;
  previousButton.disabled = true;
  nextButton.disabled = true;
}

function showError(message = "That Pokémon could not be found.") {
  card.innerHTML = `<div class="error-state"><span>!</span><h2>Oops!</h2><p>${message}</p></div>`;
}

function finishLoading() {
  form.querySelector("button").disabled = false;
  randomButton.disabled = false;
  updateNavigationButtons();
}

function updateNavigationButtons() {
  previousButton.disabled = currentPokemonId === null || currentPokemonId <= 1;
  nextButton.disabled = currentPokemonId === null || currentPokemonId >= MAX_POKEMON;
}

function displayPokemon(pokemon) {
  currentPokemonId = pokemon.id;
  const types = pokemon.types.map(({ type }) => `<span class="type type-${type.name}">${titleCase(type.name)}</span>`).join("");
  const abilities = pokemon.abilities.map(({ ability }) => titleCase(ability.name)).join(", ");
  const image = pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default;

  card.innerHTML = `
    <div class="pokemon-top">
      <span class="pokemon-number">#${String(pokemon.id).padStart(4, "0")}</span>
      <div class="types">${types}</div>
    </div>
    <img class="pokemon-image" src="${image}" alt="${titleCase(pokemon.name)}">
    <h2>${titleCase(pokemon.name)}</h2>
    <dl class="details">
      <div><dt>Height</dt><dd>${(pokemon.height / 10).toFixed(1)} m</dd></div>
      <div><dt>Weight</dt><dd>${(pokemon.weight / 10).toFixed(1)} kg</dd></div>
      <div class="wide"><dt>Abilities</dt><dd>${abilities}</dd></div>
    </dl>`;
}

async function fetchPokemon(identifier) {
  showLoading();
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(identifier)}`);
    if (!response.ok) throw new Error("not found");
    displayPokemon(await response.json());
  } catch (error) {
    showError("Check the spelling or try a Pokédex number from 1 to 1025.");
  } finally {
    finishLoading();
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const query = input.value.trim().toLowerCase();
  if (query) fetchPokemon(query);
});

randomButton.addEventListener("click", () => {
  const randomId = Math.floor(Math.random() * MAX_POKEMON) + 1;
  fetchPokemon(randomId);
});

previousButton.addEventListener("click", () => {
  if (currentPokemonId > 1) fetchPokemon(currentPokemonId - 1);
});

nextButton.addEventListener("click", () => {
  if (currentPokemonId < MAX_POKEMON) fetchPokemon(currentPokemonId + 1);
});

fetchPokemon(Math.floor(Math.random() * MAX_POKEMON) + 1);
