import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'bible-favorites';

function loadFavorites() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const addFavorite = useCallback((verse) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.reference === verse.reference
      );
      if (exists) return prev;
      return [{ ...verse, note: '', savedAt: Date.now() }, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((reference) => {
    setFavorites((prev) => prev.filter((f) => f.reference !== reference));
  }, []);

  const toggleFavorite = useCallback(
    (verse) => {
      const exists = favorites.some((f) => f.reference === verse.reference);
      if (exists) {
        removeFavorite(verse.reference);
      } else {
        addFavorite(verse);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const addNote = useCallback((reference, note) => {
    setFavorites((prev) =>
      prev.map((f) => (f.reference === reference ? { ...f, note } : f))
    );
  }, []);

  const isFavorite = useCallback(
    (reference) => {
      return favorites.some((f) => f.reference === reference);
    },
    [favorites]
  );

  const getFavorite = useCallback(
    (reference) => {
      return favorites.find((f) => f.reference === reference);
    },
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    addNote,
    isFavorite,
    getFavorite,
  };
}
