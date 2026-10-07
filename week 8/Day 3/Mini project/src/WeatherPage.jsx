import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useFavorites } from "./FavoritesContext.jsx";
import { getWeatherDescription, getWeatherIcon, searchCityWeather } from "./weather.js";

function formatDay(date) {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${date}T12:00:00`));
}

export default function WeatherPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityQuery = searchParams.get("city")?.trim() || "Nairobi";
  const [searchText, setSearchText] = useState(cityQuery);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setSearchText(cityQuery);
    const controller = new AbortController();

    async function loadWeather() {
      setStatus("loading");
      setErrorMessage("");
      try {
        const result = await searchCityWeather(cityQuery, controller.signal);
        setWeather(result);
        setStatus("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        setWeather(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We couldn’t load the weather right now. Please try again.",
        );
        setStatus("error");
      }
    }

    loadWeather();
    return () => controller.abort();
  }, [cityQuery]);

  function handleSearch(event) {
    event.preventDefault();
    const trimmedCity = searchText.trim();
    if (!trimmedCity) return;
    setSearchParams({ city: trimmedCity });
  }

  const location = weather?.location;
  const current = weather?.current;
  const favorite = location ? isFavorite(location) : false;

  return (
    <main className="main-content weather-page">
      <section className="page-intro">
        <p className="eyebrow"><span /> A MOMENT OUTSIDE</p>
        <h1>
          Wherever you are,
          <br />
          <span>find your atmosphere.</span>
        </h1>
        <p>One little search to see what the sky has planned.</p>
      </section>

      <form className="search-form" onSubmit={handleSearch} role="search">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <label className="visually-hidden" htmlFor="city-search">Search city</label>
        <input
          id="city-search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search for a city..."
          autoComplete="off"
        />
        <button type="submit" disabled={!searchText.trim()}>Search <span aria-hidden="true">↗</span></button>
      </form>

      {status === "loading" && (
        <div className="loading-card" role="status">
          <span className="loading-sun" aria-hidden="true">☼</span>
          <span>Looking up the sky over {cityQuery}...</span>
        </div>
      )}

      {status === "error" && (
        <div className="error-card" role="alert">
          <span className="error-icon" aria-hidden="true">!</span>
          <div>
            <strong>We couldn’t find that forecast.</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {status === "ready" && weather && (
        <>
          <section className="weather-card" aria-label={`Current weather in ${location.name}`}>
            <div className="weather-card-top">
              <div>
                <p className="location-label">YOUR SKY RIGHT NOW</p>
                <h2>
                  {location.name}
                  {location.country && <span>, {location.country}</span>}
                </h2>
                <p className="location-detail">
                  {location.admin1 ? `${location.admin1} · ` : ""}
                  {location.timezone.replaceAll("_", " ")}
                </p>
              </div>
              <button
                className={`favorite-button${favorite ? " is-favorite" : ""}`}
                type="button"
                onClick={() => toggleFavorite(location)}
                aria-pressed={favorite}
              >
                <span aria-hidden="true">{favorite ? "♥" : "♡"}</span>
                {favorite ? "Saved to favorites" : "Save favorite"}
              </button>
            </div>

            <div className="current-weather">
              <div className="weather-symbol" aria-hidden="true">
                {getWeatherIcon(current.weather_code)}
              </div>
              <div className="temperature">
                {Math.round(current.temperature_2m)}
                <span>°C</span>
              </div>
              <div className="weather-summary">
                <strong>{getWeatherDescription(current.weather_code)}</strong>
                <span>Feels like {Math.round(current.apparent_temperature)}°</span>
              </div>
              <div className="weather-stats">
                <div>
                  <span className="stat-icon" aria-hidden="true">↗</span>
                  <span>WIND</span>
                  <strong>{Math.round(current.wind_speed_10m)} <small>km/h</small></strong>
                </div>
                <div>
                  <span className="stat-icon" aria-hidden="true">◌</span>
                  <span>HUMIDITY</span>
                  <strong>{Math.round(current.relative_humidity_2m)}<small>%</small></strong>
                </div>
              </div>
            </div>
            <p className="updated-at">
              LOCAL OBSERVATION · {new Date(current.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </section>

          <section className="forecast-section" aria-labelledby="forecast-title">
            <div className="section-heading">
              <div>
                <p className="location-label">A LITTLE LOOK AHEAD</p>
                <h2 id="forecast-title">Next five days</h2>
              </div>
              <span className="section-note">THE WEEK, AT A GLANCE</span>
            </div>
            <div className="forecast-grid">
              {weather.daily.time.map((day, index) => (
                <article className="forecast-day" key={day}>
                  <span className="forecast-name">{index === 0 ? "Today" : formatDay(day)}</span>
                  <span className="forecast-icon" aria-hidden="true">
                    {getWeatherIcon(weather.daily.weather_code[index])}
                  </span>
                  <span className="forecast-condition">
                    {getWeatherDescription(weather.daily.weather_code[index])}
                  </span>
                  <span className="forecast-temperatures">
                    <strong>{Math.round(weather.daily.temperature_2m_max[index])}°</strong>
                    <span>{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                  </span>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
