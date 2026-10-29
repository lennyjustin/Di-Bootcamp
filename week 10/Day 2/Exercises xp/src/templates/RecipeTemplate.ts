import type { RecipeItem } from "../model/RecipeItem";

export class RecipeTemplate {
  constructor(
    private readonly container: HTMLElement,
    private readonly recipeCount: HTMLElement,
  ) {}

  render(recipes: readonly RecipeItem[]): void {
    this.recipeCount.textContent = String(recipes.length);
    this.container.replaceChildren();

    if (recipes.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = "No recipes here yet. Add one above to get started.";
      this.container.append(emptyState);
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const recipe of recipes) {
      fragment.append(this.createRecipeCard(recipe));
    }
    this.container.append(fragment);
  }

  private createRecipeCard(recipe: RecipeItem): HTMLElement {
    const card = document.createElement("article");
    card.className = "recipe-card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "recipe-card-header";

    const title = document.createElement("h3");
    title.className = "recipe-title";
    title.textContent = recipe.title;

    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-button";
    favoriteButton.type = "button";
    favoriteButton.dataset.action = "favorite";
    favoriteButton.dataset.recipeId = recipe.id;
    favoriteButton.setAttribute("aria-pressed", String(recipe.isFavorite));
    favoriteButton.setAttribute(
      "aria-label",
      recipe.isFavorite ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`,
    );
    favoriteButton.textContent = recipe.isFavorite ? "★ Favorite" : "☆ Favorite";

    cardHeader.append(title, favoriteButton);

    const detailButton = document.createElement("button");
    detailButton.className = "details-button";
    detailButton.type = "button";
    detailButton.dataset.action = "details";
    detailButton.setAttribute("aria-expanded", "false");
    detailButton.textContent = "Show details";

    const details = document.createElement("div");
    details.className = "recipe-details";
    details.hidden = true;

    const ingredientsHeading = document.createElement("h4");
    ingredientsHeading.textContent = "Ingredients";
    const ingredientList = document.createElement("ul");
    for (const ingredient of recipe.ingredients) {
      const item = document.createElement("li");
      item.textContent = ingredient;
      ingredientList.append(item);
    }

    const instructionsHeading = document.createElement("h4");
    instructionsHeading.textContent = "Instructions";
    const instructions = document.createElement("p");
    instructions.className = "recipe-instructions";
    instructions.textContent = recipe.instructions;
    details.append(ingredientsHeading, ingredientList, instructionsHeading, instructions);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.recipeId = recipe.id;
    deleteButton.textContent = "Delete";

    const cardActions = document.createElement("div");
    cardActions.className = "recipe-card-actions";
    cardActions.append(detailButton, deleteButton);
    card.append(cardHeader, details, cardActions);
    return card;
  }
}
