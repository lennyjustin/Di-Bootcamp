export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
}

export interface RecipeSearchResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export type FetchStatus = "idle" | "loading" | "succeeded" | "failed";

export interface DataState<T> {
  items: T[];
  status: FetchStatus;
  error: string | null;
  currentRequestId?: string;
}
