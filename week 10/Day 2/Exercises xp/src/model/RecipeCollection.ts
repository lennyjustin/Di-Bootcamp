import { RecipeItem, type RecipeData } from "./RecipeItem";

const STORAGE_KEY = "recipe-book-recipes";

export class RecipeCollection {
  private recipes: RecipeItem[] = [];

  getAllRecipes(): readonly RecipeItem[] {
    return [...this.recipes];
  }

  addRecipe(data: RecipeData): RecipeItem {
    const recipe = new RecipeItem(data);
    const nextRecipes = [...this.recipes, recipe];
    this.saveToLocalStorage(nextRecipes);
    this.recipes = nextRecipes;
    return recipe;
  }

  removeRecipe(id: string): boolean {
    const nextRecipes = this.recipes.filter((recipe) => recipe.id !== id);
    if (nextRecipes.length === this.recipes.length) {
      return false;
    }

    this.saveToLocalStorage(nextRecipes);
    this.recipes = nextRecipes;
    return true;
  }

  toggleFavorite(id: string): boolean {
    const index = this.recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) {
      return false;
    }

    const recipe = this.recipes[index];
    const updatedRecipe = new RecipeItem({
      id: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      isFavorite: !recipe.isFavorite,
    });
    const nextRecipes = [...this.recipes];
    nextRecipes[index] = updatedRecipe;
    this.saveToLocalStorage(nextRecipes);
    this.recipes = nextRecipes;
    return true;
  }

  clearRecipes(): void {
    this.saveToLocalStorage([]);
    this.recipes = [];
  }

  saveToLocalStorage(recipes: readonly RecipeItem[] = this.recipes): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }

  loadFromLocalStorage(): void {
    const savedRecipes = window.localStorage.getItem(STORAGE_KEY);
    if (savedRecipes === null) {
      this.recipes = [];
      return;
    }

    const parsed: unknown = JSON.parse(savedRecipes);
    if (!Array.isArray(parsed)) {
      throw new Error("Saved recipe data must be a list.");
    }

    const recipes = parsed.map((recipe) => RecipeItem.fromStorage(recipe));
    const ids = new Set(recipes.map((recipe) => recipe.id));
    if (ids.size !== recipes.length) {
      throw new Error("Saved recipe data contains duplicate IDs.");
    }

    this.recipes = recipes;
  }
}
