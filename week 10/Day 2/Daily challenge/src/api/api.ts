import type { RecipeSearchResponse } from "../types/types";

const API_URL =
  "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch";
const API_HOST = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";

export async function fetchRecipes(
  query: string,
  signal?: AbortSignal,
): Promise<RecipeSearchResponse> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY?.trim();
  if (!apiKey || apiKey === "your_rapidapi_key_here") {
    throw new Error(
      "RapidAPI key is missing. Add VITE_RAPIDAPI_KEY to your local .env file and restart the dev server.",
    );
  }

  const url = new URL(API_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("number", "12");
  url.searchParams.set("addRecipeInformation", "true");

  const response = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": API_HOST,
    },
    signal,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Recipe search failed (${response.status} ${response.statusText}).${detail ? ` ${detail}` : ""}`,
    );
  }

  const payload: unknown = await response.json();
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("results" in payload) ||
    !Array.isArray(payload.results)
  ) {
    throw new Error("The recipe API returned an unexpected response.");
  }

  const results = payload.results.filter(
    (recipe): recipe is RecipeSearchResponse["results"][number] =>
      typeof recipe === "object" &&
      recipe !== null &&
      "id" in recipe &&
      typeof recipe.id === "number" &&
      "title" in recipe &&
      typeof recipe.title === "string" &&
      "image" in recipe &&
      typeof recipe.image === "string",
  );

  return {
    results,
    offset: "offset" in payload && typeof payload.offset === "number" ? payload.offset : 0,
    number: "number" in payload && typeof payload.number === "number" ? payload.number : results.length,
    totalResults:
      "totalResults" in payload && typeof payload.totalResults === "number"
        ? payload.totalResults
        : results.length,
  };
}
