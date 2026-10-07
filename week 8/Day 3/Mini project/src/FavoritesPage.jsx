import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "./FavoritesContext.jsx";

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <main className="main-content favorites-page">
      <section className="page-intro">
        <p className="eyebrow"><span /> YOUR PERSONAL ATLAS</p>
        <h1>
          Places you love,
          <br />
          <span>always close by.</span>
        </h1>
        <p>Your saved cities, gathered in one sunny little spot.</p>
      </section>

      {favorites.length > 0 ? (
        <section className="favorites-grid" aria-label="Favorite cities">
          {favorites.map((city) => (
            <article
              className="favorite-city-card"
              key={`${city.latitude},${city.longitude}`}
            >
              <div className="city-card-art" aria-hidden="true">
                <span>☼</span>
                <i />
                <b />
              </div>
              <div className="city-card-content">
                <p className="location-label">SAVED PLACE</p>
                <h2>{city.name}</h2>
                <p className="location-detail">
                  {[city.admin1, city.country].filter(Boolean).join(" · ") ||
                    `${city.latitude.toFixed(2)}, ${city.longitude.toFixed(2)}`}
                </p>
                <div className="city-card-actions">
                  <Link
                    className="view-weather-link"
                    to={`/?city=${encodeURIComponent(city.name)}`}
                  >
                    View weather <span aria-hidden="true">↗</span>
                  </Link>
                  <button
                    type="button"
                    className="remove-favorite"
                    onClick={() => toggleFavorite(city)}
                    aria-label={`Remove ${city.name} from favorites`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="favorites-empty">
          <span className="empty-sky" aria-hidden="true">☼</span>
          <p className="location-label">NOTHING SAVED JUST YET</p>
          <h2>Your favorite places will live here.</h2>
          <p>Find a city’s forecast and tap “Save favorite” to keep it close.</p>
          <Link className="primary-link" to="/">
            Explore the weather <span aria-hidden="true">↗</span>
          </Link>
        </section>
      )}
    </main>
  );
}
