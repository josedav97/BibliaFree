import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bibleApi from '../services/bibleApi';

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: bibleApi.getBooks,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}

export function useChapters(bookId) {
  return useQuery({
    queryKey: ['chapters', bookId],
    queryFn: () => bibleApi.getChapters(bookId),
    enabled: !!bookId,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useVerses(bookId, chapter) {
  return useQuery({
    queryKey: ['verses', bookId, chapter],
    queryFn: () => bibleApi.getVerses(bookId, chapter),
    enabled: !!bookId && !!chapter,
  });
}

export function usePassage(bookId, chapter, startVerse, endVerse) {
  return useQuery({
    queryKey: ['passage', bookId, chapter, startVerse, endVerse],
    queryFn: () => bibleApi.getPassage(bookId, chapter, startVerse, endVerse),
    enabled: !!bookId && !!chapter && !!startVerse,
  });
}

export function useVerseOfDay() {
  return useQuery({
    queryKey: ['verseOfDay'],
    queryFn: bibleApi.getVerseOfDay,
    staleTime: 60 * 60 * 1000,
  });
}

export function useBookChapterCount(bookId) {
  return useQuery({
    queryKey: ['chapterCount', bookId],
    queryFn: () => Promise.resolve(bibleApi.bookChapters[bookId?.toLowerCase()] || 0),
    enabled: !!bookId,
    staleTime: Infinity,
  });
}

export function useRecentReadings() {
  const queryClient = useQueryClient();
  const favorites = JSON.parse(localStorage.getItem('bible-favorites') || '[]');

  return useMutation({
    mutationFn: async ({ book, chapter, verse, reference }) => {
      const data = await bibleApi.getVerses(book, chapter);
      return { ...data, startVerse: verse, reference: reference || data.reference };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['recentReading'], data);
    },
  });
}
