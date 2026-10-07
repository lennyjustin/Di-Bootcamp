import React from "react";
import CharacterCounter from "./CharacterCounter.jsx";
import { useTheme } from "./ThemeContext.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";

export default function App() {
  const { theme } = useTheme();

  return (
    <main className="app-shell" data-theme={theme}>
      <div className="page-container">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Hooks Lab home">
            <span className="brand-mark" aria-hidden="true">
              h
            </span>
            <span>hooks<span className="brand-light">lab</span></span>
          </a>
          <ThemeSwitcher />
        </header>

        <section className="intro" id="top">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            WEEK 8 <span className="eyebrow-separator">/</span> DAY 3
          </p>
          <h1>
            Small hooks,
            <br />
            <span>big possibilities.</span>
          </h1>
          <p className="intro-copy">
            Two hands-on React exercises exploring shared state and direct DOM
            access.
          </p>
        </section>

        <section className="exercise-grid" aria-label="React hooks exercises">
          <section className="exercise-card theme-card" aria-labelledby="theme-title">
            <div className="card-heading">
              <div className="exercise-icon exercise-icon--lavender" aria-hidden="true">
                <span>◐</span>
              </div>
              <span className="exercise-tag">EXERCISE 01</span>
            </div>

            <h2 id="theme-title">Theme switcher</h2>
            <p className="card-description">
              One shared context keeps the whole page in sync. Try the toggle
              above to change the mood.
            </p>

            <div className="theme-preview">
              <span className="preview-orbit preview-orbit--one" />
              <span className="preview-orbit preview-orbit--two" />
              <div className="preview-sun" aria-hidden="true">
                {theme === "light" ? "☀" : "☾"}
              </div>
              <div className="preview-caption">
                <span className="preview-status">
                  <span />
                  ACTIVE THEME
                </span>
                <strong>{theme === "light" ? "Daylight" : "Midnight"}</strong>
              </div>
              <span className="preview-stars" aria-hidden="true">
                ✦ &nbsp; · &nbsp; ✧
              </span>
            </div>

            <div className="card-note">
              <span className="note-indicator" />
              <span>
                Built with <code>useContext</code> + <code>useState</code>
              </span>
            </div>
          </section>

          <CharacterCounter />
        </section>

        <footer className="page-footer">
          <span>Made for learning, one hook at a time.</span>
          <span className="footer-status">
            <span /> ALL SYSTEMS CURIOUS
          </span>
        </footer>
      </div>
    </main>
  );
}
