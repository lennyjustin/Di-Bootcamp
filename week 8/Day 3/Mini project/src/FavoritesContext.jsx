import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "atmos-favorite-cities";
const FavoritesContext = createContext(null);

function readFavorites() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (city) =>
          typeof city.name === "string" &&
          typeof city.latitude === "number" &&
          typeof city.longitude === "number",
      )
    ) {
      return parsed;
    }
    console.error("Saved favorite cities have an unexpected format.");
  } catch (error) {
    console.error("Could not load saved favorite cities.", error);
  }
  return [];
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Could not save favorite cities.", error);
    }
  }, [favorites]);

  const value = useMemo(() => {
    function isFavorite(city) {
      return favorites.some(
        (favorite) =>
          favorite.latitude === city.latitude &&
          favorite.longitude === city.longitude,
      );
    }

    function toggleFavorite(city) {
      setFavorites((current) =>
        current.some(
          (favorite) =>
            favorite.latitude === city.latitude &&
            favorite.longitude === city.longitude,
        )
          ? current.filter(
              (favorite) =>
                favorite.latitude !== city.latitude ||
                favorite.longitude !== city.longitude,
            )
          : [...current, city],
      );
    }

    return { favorites, isFavorite, toggleFavorite };
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside a FavoritesProvider.");
  }
  return context;
}
