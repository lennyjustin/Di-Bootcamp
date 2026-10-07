import React from "react";
import { useTheme } from "./ThemeContext.jsx";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === "light" ? "☾" : "☀"}
      </span>
      <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}
