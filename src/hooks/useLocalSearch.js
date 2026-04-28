import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useLocalSearch(query) {
  const queryClient = useQueryClient();
  const enabled = typeof query === 'string' && query.trim().length >= 2;

  return useMemo(() => {
    if (!enabled) return { results: [], isLoading: false };

    const cache = queryClient.getQueryCache();
    const allQueries = cache.getAll();
    const q = query.toLowerCase().trim();
    const matches = [];

    for (const entry of allQueries) {
      const key = entry.queryKey;
      if (!Array.isArray(key) || key[0] !== 'verses') continue;

      const data = entry.state?.data;
      if (!data?.verses?.length) continue;

      const bookId = key[1];
      const chapter = key[2];

      for (const verse of data.verses) {
        if (verse.text && verse.text.toLowerCase().includes(q)) {
          matches.push({
            book: bookId,
            chapter,
            number: verse.verse,
            verse: verse.text,
            reference: `${data.book || bookId} ${chapter}:${verse.verse}`,
          });
        }
      }
    }

    matches.sort((a, b) => a.book.localeCompare(b.book) || a.chapter - b.chapter || a.number - b.number);

    return { results: matches.slice(0, 20), isLoading: false };
  }, [query, queryClient, enabled]);
}
