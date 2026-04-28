import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBibleStore = create(
  persist(
    (set) => ({
      currentBook: null,
      currentChapter: null,
      currentVersion: 'rvr60',
      theme: 'light',
      fontSize: 'medium',
      readingMode: false,
      readingHistory: [],

      setBook: (book) => set({ currentBook: book, currentChapter: null }),
      setChapter: (chapter) => set({ currentChapter: chapter }),
      setVersion: (version) => set({ currentVersion: version }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setFontSize: (size) => set({ fontSize: size }),
      toggleReadingMode: () => set((state) => ({ readingMode: !state.readingMode })),

      addToHistory: (entry) => set((state) => ({
        readingHistory: [
          { ...entry, timestamp: Date.now() },
          ...state.readingHistory.filter((h) => h.reference !== entry.reference),
        ].slice(0, 10),
      })),
    }),
    {
      name: 'bible-store',
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        currentVersion: state.currentVersion,
        readingHistory: state.readingHistory,
      }),
    }
  )
);

export default useBibleStore;
