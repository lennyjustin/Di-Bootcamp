import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import FavoritesPage from "./FavoritesPage.jsx";
import WeatherPage from "./WeatherPage.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Atmos home">
          <span className="brand-mark" aria-hidden="true">
            a
          </span>
          <span>atmos<span className="brand-period">.</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Weather
          </NavLink>
          <NavLink to="/favorites">
            Favorites
          </NavLink>
        </nav>
        <span className="header-note">
          <span /> YOUR LITTLE WINDOW TO THE WORLD
        </span>
      </header>

      <Routes>
        <Route path="/" element={<WeatherPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<WeatherPage />} />
      </Routes>

      <footer className="site-footer">
        <span>Find your forecast. Follow the feeling.</span>
        <span>WEATHER DATA BY OPEN-METEO</span>
      </footer>
    </div>
  );
}
