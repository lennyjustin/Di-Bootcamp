import { useEffect, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { searchRecipes } from "./features/dataSlice";
import { DataFetcher } from "./components/DataFetcher";
import type { Recipe } from "./types/types";
import "./App.css";

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="recipe-card">
      {recipe.image ? (
        <img
          className="recipe-image"
          src={recipe.image}
          alt=""
          loading="lazy"
        />
      ) : (
        <div className="recipe-image image-placeholder" aria-hidden="true">
          <span>G&amp;T</span>
        </div>
      )}
      <div className="recipe-card-content">
        <p className="recipe-kicker">RECIPE No. {recipe.id}</p>
        <h3>{recipe.title}</h3>
        <div className="recipe-meta">
          {recipe.readyInMinutes !== undefined && (
            <span>{recipe.readyInMinutes} min</span>
          )}
          {recipe.servings !== undefined && <span>{recipe.servings} servings</span>}
        </div>
        {recipe.sourceUrl && (
          <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
            View recipe <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.recipes);
  const [input, setInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!submittedQuery) {
      return;
    }

    const request = dispatch(searchRecipes(submittedQuery));
    return () => request.abort();
  }, [dispatch, retryCount, submittedQuery]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = input.trim();
    if (query) {
      setSubmittedQuery(query);
    }
  }

  function retrySearch() {
    if (submittedQuery) {
      setRetryCount((count) => count + 1);
    }
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Gather and Table home">
          <span className="brand-mark">G<span>&amp;</span>T</span>
          <span className="brand-name">Gather <i>&amp;</i> Table</span>
        </a>
        <span className="header-note">A little inspiration for your next meal</span>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">FIND YOUR NEXT FAVORITE</p>
          <h1 id="page-title">Good things<br />are <em>cooking.</em></h1>
          <p className="hero-description">
            Browse a world of recipes, then bring something wonderful to your table.
          </p>
          <form className="search-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="recipe-search">Search recipes</label>
            <input
              id="recipe-search"
              type="search"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Try “lemon pasta” or “mushroom”"
              required
            />
            <button type="submit" disabled={!input.trim()}>
              Search <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="search-hint">A good meal is just a search away.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-circle">
            <span className="art-leaf leaf-one">✳</span>
            <span className="art-leaf leaf-two">✳</span>
            <div className="art-plate">
              <div className="art-food">
                <span>✳</span><span>•</span><span>✦</span><span>•</span>
                <span>•</span><span>✳</span><span>•</span><span>✦</span>
                <span>✦</span><span>•</span><span>✳</span><span>•</span>
              </div>
            </div>
            <span className="art-caption">MADE TO BE SHARED</span>
          </div>
          <span className="art-spark spark-one">✳</span>
          <span className="art-spark spark-two">✦</span>
        </div>
      </section>

      <section className="results-section" aria-labelledby="results-heading">
        <div className="results-heading">
          <div>
            <p className="eyebrow">FROM OUR RECIPE BOX</p>
            <h2 id="results-heading">
              {submittedQuery ? `Recipes for “${submittedQuery}”` : "A table of possibilities"}
            </h2>
          </div>
          {status === "succeeded" && (
            <span className="result-count">{items.length} recipes</span>
          )}
        </div>

        <DataFetcher<Recipe>
          items={items}
          status={status}
          error={error}
          getKey={(recipe) => recipe.id}
          renderItem={(recipe) => <RecipeCard recipe={recipe} />}
          idleMessage="Search above to discover recipes to make and share."
          emptyMessage="No recipes found. Try another ingredient or dish."
          onRetry={retrySearch}
        />
      </section>

      <footer className="site-footer">
        <span>Gather &amp; Table</span>
        <span>Recipes powered by Spoonacular</span>
      </footer>
    </main>
  );
}

export default App;
