import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'bible-highlights';

function loadHighlights() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveHighlights(highlights) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(highlights));
}

let idCounter = Date.now();

export function useHighlights() {
  const [highlights, setHighlights] = useState(loadHighlights);

  useEffect(() => {
    saveHighlights(highlights);
  }, [highlights]);

  const addHighlight = useCallback(({ book, chapter, verse, text, color, note, verseText }) => {
    const newHighlight = {
      id: String(++idCounter),
      book: book.toLowerCase(),
      chapter,
      verse,
      text,
      verseText: verseText || '',
      color,
      note: note || '',
      createdAt: Date.now(),
    };
    setHighlights((prev) => [newHighlight, ...prev]);
    return newHighlight;
  }, []);

  const removeHighlight = useCallback((id) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHighlightNote = useCallback((id, note) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, note } : h))
    );
  }, []);

  const updateHighlightColor = useCallback((id, color) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, color } : h))
    );
  }, []);

  const getHighlightsForVerse = useCallback(
    (book, chapter, verse) => {
      const b = book?.toLowerCase();
      return highlights.filter(
        (h) => h.book === b && h.chapter === chapter && h.verse === verse
      );
    },
    [highlights]
  );

  const getHighlightsForChapter = useCallback(
    (book, chapter) => {
      const b = book?.toLowerCase();
      return highlights.filter(
        (h) => h.book === b && h.chapter === chapter
      );
    },
    [highlights]
  );

  const getAllHighlights = useCallback(() => {
    return [...highlights].sort((a, b) => b.createdAt - a.createdAt);
  }, [highlights]);

  const groupHighlightsByBook = useCallback(() => {
    const grouped = {};
    for (const h of highlights) {
      if (!grouped[h.book]) grouped[h.book] = [];
      grouped[h.book].push(h);
    }
    for (const book of Object.keys(grouped)) {
      grouped[book].sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);
    }
    return grouped;
  }, [highlights]);

  return {
    highlights,
    addHighlight,
    removeHighlight,
    updateHighlightNote,
    updateHighlightColor,
    getHighlightsForVerse,
    getHighlightsForChapter,
    getAllHighlights,
    groupHighlightsByBook,
  };
}
