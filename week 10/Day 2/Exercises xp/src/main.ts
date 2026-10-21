import "./styles.css";
import { RecipeCollection } from "./model/RecipeCollection";
import { RecipeTemplate } from "./templates/RecipeTemplate";

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required page element was not found: ${selector}`);
  }
  return element;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

const form = getElement<HTMLFormElement>("#recipeEntryForm");
const titleInput = getElement<HTMLInputElement>("#recipeTitle");
const ingredientsInput = getElement<HTMLTextAreaElement>("#ingredients");
const instructionsInput = getElement<HTMLTextAreaElement>("#instructions");
const recipeContainer = getElement<HTMLDivElement>("#recipeContainer");
const recipeCount = getElement<HTMLSpanElement>("#recipeCount");
const statusMessage = getElement<HTMLParagraphElement>("#appStatus");
const clearButton = getElement<HTMLButtonElement>("#clearRecipesButton");
const favoritesButton = getElement<HTMLButtonElement>("#showFavoritesButton");
const collection = new RecipeCollection();
const template = new RecipeTemplate(recipeContainer, recipeCount);

let favoritesOnly = false;
let loadFailed = false;

function showStatus(message: string, isError = false): void {
  statusMessage.textContent = message;
  statusMessage.dataset.state = isError ? "error" : "success";
}

function render(): void {
  const recipes = collection.getAllRecipes();
  const visibleRecipes = favoritesOnly
    ? recipes.filter((recipe) => recipe.isFavorite)
    : recipes;
  template.render(visibleRecipes);
  clearButton.disabled = recipes.length === 0 && !loadFailed;
}

try {
  collection.loadFromLocalStorage();
} catch (error) {
  loadFailed = true;
  showStatus(
    `Saved recipes could not be loaded: ${errorMessage(error)}. Clear all recipes to reset saved data.`,
    true,
  );
}
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (loadFailed) {
    showStatus("Clear saved data before adding recipes.", true);
    return;
  }

  try {
    collection.addRecipe({
      title: titleInput.value,
      ingredients: ingredientsInput.value.split(/\r?\n/),
      instructions: instructionsInput.value,
    });
    form.reset();
    render();
    showStatus("Recipe added to your collection.");
  } catch (error) {
    showStatus(`Recipe was not added: ${errorMessage(error)}`, true);
  }
});

recipeContainer.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest<HTMLButtonElement>("button[data-action]");
  if (!button || !recipeContainer.contains(button)) {
    return;
  }

  if (button.dataset.action === "details") {
    const card = button.closest(".recipe-card");
    const details = card?.querySelector<HTMLDivElement>(".recipe-details");
    if (!details) {
      showStatus("Recipe details could not be displayed.", true);
      return;
    }

    details.hidden = !details.hidden;
    button.setAttribute("aria-expanded", String(!details.hidden));
    button.textContent = details.hidden ? "Show details" : "Hide details";
    return;
  }

  const recipeId = button.dataset.recipeId;
  if (!recipeId) {
    showStatus("This recipe action is missing its recipe ID.", true);
    return;
  }
  if (loadFailed) {
    showStatus("Clear saved data before managing recipes.", true);
    return;
  }

  try {
    if (button.dataset.action === "favorite") {
      if (collection.toggleFavorite(recipeId)) {
        render();
      }
    } else if (button.dataset.action === "delete") {
      if (collection.removeRecipe(recipeId)) {
        render();
        showStatus("Recipe deleted.");
      }
    }
  } catch (error) {
    showStatus(`Recipe was not updated: ${errorMessage(error)}`, true);
  }
});

favoritesButton.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  favoritesButton.setAttribute("aria-pressed", String(favoritesOnly));
  favoritesButton.textContent = favoritesOnly ? "Show all" : "Favorites";
  render();
});

clearButton.addEventListener("click", () => {
  const shouldClear = window.confirm("Clear all saved recipes? This cannot be undone.");
  if (!shouldClear) {
    return;
  }

  try {
    collection.clearRecipes();
    loadFailed = false;
    favoritesOnly = false;
    favoritesButton.setAttribute("aria-pressed", "false");
    favoritesButton.textContent = "Favorites";
    render();
    showStatus("All recipes cleared.");
  } catch (error) {
    showStatus(`Recipes could not be cleared: ${errorMessage(error)}`, true);
  }
});
