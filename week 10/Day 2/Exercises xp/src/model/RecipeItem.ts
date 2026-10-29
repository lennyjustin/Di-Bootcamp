import { v4 as uuidv4 } from "uuid";

export interface RecipeData {
  id?: string;
  title: string;
  ingredients: string[];
  instructions: string;
  isFavorite?: boolean;
}

export class RecipeItem {
  readonly id: string;
  readonly title: string;
  readonly ingredients: string[];
  readonly instructions: string;
  readonly isFavorite: boolean;

  constructor(data: RecipeData) {
    const title = data.title.trim();
    const ingredients = data.ingredients.map((ingredient) => ingredient.trim()).filter(Boolean);
    const instructions = data.instructions.trim();

    if (!title) {
      throw new Error("Enter a recipe title.");
    }
    if (ingredients.length === 0) {
      throw new Error("Add at least one ingredient.");
    }
    if (!instructions) {
      throw new Error("Enter the cooking instructions.");
    }

    this.id = data.id?.trim() || uuidv4();
    this.title = title;
    this.ingredients = ingredients;
    this.instructions = instructions;
    this.isFavorite = data.isFavorite ?? false;
  }

  static fromStorage(value: unknown): RecipeItem {
    if (typeof value !== "object" || value === null) {
      throw new Error("A saved recipe is not a valid object.");
    }

    const recipe = value as Record<string, unknown>;
    if (
      typeof recipe.id !== "string" ||
      typeof recipe.title !== "string" ||
      !Array.isArray(recipe.ingredients) ||
      !recipe.ingredients.every((ingredient) => typeof ingredient === "string") ||
      typeof recipe.instructions !== "string" ||
      (recipe.isFavorite !== undefined && typeof recipe.isFavorite !== "boolean")
    ) {
      throw new Error("A saved recipe has invalid or missing fields.");
    }

    return new RecipeItem({
      id: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      isFavorite: recipe.isFavorite,
    });
  }
}
