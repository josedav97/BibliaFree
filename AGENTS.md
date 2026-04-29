# Página Bíblica — Agent Notes

## Commands
- `npm run dev` — start dev server (HMR)
- `npm run build` — production build (Vite)
- `npm run preview` — preview production build
- `npm run lint` — ESLint

## Tech Stack
- React 19 + Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- React Router v7 (routes in `src/App.jsx`)
- TanStack React Query v5 (data fetching/caching)
- Zustand v5 with `persist` middleware (theme, fontSize, readingHistory)
- Framer Motion (animations), Axios (HTTP), Lucide React (icons), react-hot-toast

## Architecture
```
src/
├── services/bibleApi.js   — Axios instance + all API functions
├── store/useBibleStore.js — Zustand (theme, fontSize, readingHistory)
├── hooks/                 — useBibleApi, useFavorites, useHighlights,
│                            useLocalSearch, useTextToSpeech
├── components/
│   ├── layout/  — Header, Footer, MobileNav
│   ├── bible/   — BookSelector, ChapterSelector, VerseViewer, VerseSearch, PassageCard
│   ├── features/— FavoritesList, VerseOfDay, ReadingHistory, ShareModal,
│   │              HighlightToolbar, NoteModal
│   └── ui/      — SkeletonLoader, ErrorMessage, EmptyState, Toast
└── pages/       — HomePage, SearchPage, PassagePage, FavoritesPage, NotesPage
```

## API (`bible-api.deno.dev`)
- **Base:** `https://bible-api.deno.dev/api` (CORS: `*`, no proxy needed)
- **Version:** `rv1960` (Reina Valera 1960, Spanish)
- **Endpoints:**
  - `GET /api/books` → array of `{ names, abrev, chapters, testament }`
  - `GET /api/read/rv1960/<book>/<chapter>` → chapter object with `{ vers: [...] }`
  - `GET /api/read/rv1960/<book>/<chapter>/<verse>` → single verse `{ verse, number, study, id }`
  - `GET /api/read/rv1960/<book>/<chapter>/<start>-<end>` → array of verses (only when start ≠ end)
  - `GET /api/read/rv1960/search?q=<query>` → `{ data: [...], meta: {...} }` (not used by app; search is local)

## Critical Rules

### Book names — MUST be unaccented in API URLs
- Internal book IDs use API format: `genesis`, `salmos`, `isaias`, `josue`, `jeremias`, `exodo`, etc.
- `formatBookName()` maps any input to accented display (e.g., `"genesis"` → `"Génesis"`)
- Strip accents before sending to API: `.normalize('NFD').replace(/[\u0300-\u036f]/g, '')`
- Display names map is in `bibleApi.js` `displayNames` object (keys: both English and unaccented Spanish)

### Single verse URLs — NEVER send `1-1` range
- `getPassage(book, ch, verse, null)` → URL: `/read/rv1960/book/ch/verse` (correct)
- `getPassage(book, ch, x, y)` where `x === y` → must produce single verse, not range
- Range format only when `endVerse && endVerse !== startVerse` → `start-end`

### Search is LOCAL (not API-based)
- `useLocalSearch` hook searches React Query cache for `['verses', ...]` keys
- `SearchPreloader` on HomePage loads ~11 popular chapters into cache silently
- VerseSearch component UI is in `VerseSearch.jsx` — no server calls

### localStorage keys
- `bible-store` — Zustand persist (theme, fontSize, readingHistory)
- `bible-favorites` — `[{ reference, text, bookId, book, chapter, note?, savedAt }]`
- `bible-highlights` — `[{ id, book, chapter, verse, text, verseText, color, note, createdAt }]`

### Dark mode
- Tailwind v4 dark mode via `.dark` class on `<html>` (no `darkMode: 'class'` config needed)
- Toggled by Zustand `toggleTheme()` → `document.documentElement.classList.toggle('dark')`

### Theme colors (light)
- Background: `cream` (#FFF8F0), Text: `brown` (#1A1A1A), Secondary text: `brown-100` (#4A3728)
- Accent: `gold` (#B8860B), Cards: white with border `cream-200` (#FFEDD5)
- Inputs: forced `color: #1A1A1A` / `placeholder: #8B7355` via CSS rules in `index.css`

### SpeechSynthesis
- `useTextToSpeech` hook manages `isSpeaking`/`isPaused` state
- Audio button has 3 states: idle (Volume2), playing (pulsing dot + Pause), paused (Play + Resume)
- Stop button appears alongside when speaking/paused — calls `tts.stop()` → `speechSynthesis.cancel()`

### Highlight/Note system
- Text selection captured as snapshot string (NOT live Selection object) before passing to toolbar
- `HighlightToolbar` receives `selectedText` (string) + `position` props, not a Selection
- Opening note textarea would destroy live selection — snapshot approach prevents data loss
- Full verse text (`verseText`) stored at highlight creation for NoteModal display
- Guard `!verseText || ...` before calling `.includes()` — old highlights may lack `verseText`
