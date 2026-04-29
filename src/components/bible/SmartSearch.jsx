import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, X, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBooks } from '../../hooks/useBibleApi';
import { formatBookName } from '../../services/bibleApi';

function buildBookIndex(bookGroups) {
  const entries = [];
  for (const group of bookGroups) {
    for (const bookId of group.books) {
      const name = formatBookName(bookId);
      entries.push({ bookId, name });
    }
  }
  return entries;
}

function parseReference(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const verseMatch = trimmed.match(/^(.+?)\s+(\d+):(\d+)\s*$/);
  if (verseMatch) {
    return { type: 'verse', book: verseMatch[1], chapter: parseInt(verseMatch[2]), verse: parseInt(verseMatch[3]) };
  }

  const chapterMatch = trimmed.match(/^(.+?)\s+(\d+)\s*$/);
  if (chapterMatch) {
    return { type: 'chapter', book: chapterMatch[1], chapter: parseInt(chapterMatch[2]) };
  }

  return { type: 'keyword', query: trimmed };
}

export default function SmartSearch({ placeholder = 'Busca un libro, capítulo o palabra...' }) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { data: bookGroups } = useBooks();

  const bookIndex = useMemo(() => {
    if (!bookGroups) return [];
    return buildBookIndex(bookGroups);
  }, [bookGroups]);

  const suggestions = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return bookIndex
      .filter((b) => b.name.toLowerCase().includes(q) || b.bookId.includes(q))
      .slice(0, 8)
      .map((b) => {
        const nameIdx = b.name.toLowerCase().indexOf(q);
        return {
          ...b,
          matchStart: nameIdx,
          matchLength: q.length,
        };
      });
  }, [query, bookIndex]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const resolveBookId = useCallback(
    (bookName) => {
      if (!bookName) return '';
      const lower = bookName.toLowerCase().trim();

      const exact = bookIndex.find(
        (b) => b.name.toLowerCase() === lower || b.bookId === lower
      );
      if (exact) return exact.bookId;

      const startsWith = bookIndex.find(
        (b) => b.name.toLowerCase().startsWith(lower) || b.bookId.startsWith(lower)
      );
      if (startsWith) return startsWith.bookId;

      const includes = bookIndex.find(
        (b) => b.name.toLowerCase().includes(lower) || b.bookId.includes(lower)
      );
      if (includes) return includes.bookId;

      const normalized = lower
        .replace(/s$/, '')
        .replace(/es$/, '');
      if (normalized !== lower) {
        const singular = bookIndex.find(
          (b) => {
            const bLower = b.name.toLowerCase();
            return bLower.startsWith(normalized) || bLower.replace(/s$/, '').replace(/es$/, '') === normalized;
          }
        );
        if (singular) return singular.bookId;
      }

      const plural = lower + 's';
      const pluralMatch = bookIndex.find(
        (b) => b.name.toLowerCase() === plural || b.bookId === plural
      );
      if (pluralMatch) return pluralMatch.bookId;

      return lower;
    },
    [bookIndex]
  );

  const handleSubmit = useCallback(
    (input) => {
      const parsed = parseReference(input);
      if (!parsed) return;

      if (parsed.type === 'verse') {
        const bookId = resolveBookId(parsed.book);
        navigate(`/passage/${bookId}/${parsed.chapter}/${parsed.verse}`);
      } else if (parsed.type === 'chapter') {
        const bookId = resolveBookId(parsed.book);
        navigate(`/passage/${bookId}/${parsed.chapter}`);
      } else if (parsed.type === 'keyword') {
        toast('Usa la búsqueda por palabra clave más abajo', { icon: '🔍' });
      }
    },
    [navigate, resolveBookId]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSubmit(suggestions[selectedIndex].name);
        } else {
          handleSubmit(query);
        }
        setShowSuggestions(false);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    },
    [selectedIndex, suggestions, query, handleSubmit]
  );

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      setQuery(suggestion.name);
      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    []
  );

  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  }, []);

  const handleFocus = useCallback(() => {
    if (query.length >= 1) setShowSuggestions(true);
  }, [query.length]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brown-100/50 dark:text-dark-text/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-cream-200 dark:border-dark-bg-100
                     bg-white dark:bg-dark-bg-50 py-4 pl-12 pr-12
                     text-base text-brown dark:text-dark-text
                     placeholder:text-brown-100/40 dark:placeholder:text-dark-text/30
                     outline-none transition-all
                     focus:border-gold dark:focus:border-dark-accent
                     focus:ring-2 focus:ring-gold/20 dark:focus:ring-dark-accent/20"
          aria-label="Buscar en la Biblia"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls="smart-search-suggestions"
          aria-autocomplete="list"
          role="combobox"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setShowSuggestions(false); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1
                       text-brown-100/40 hover:text-brown-100 dark:text-dark-text/30
                       dark:hover:text-dark-text/60 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            id="smart-search-suggestions"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto
                       rounded-2xl border border-cream-200 dark:border-dark-bg-100
                       bg-white dark:bg-dark-bg-50 shadow-xl"
            role="listbox"
          >
            {suggestions.map((s, i) => {
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={s.bookId}
                  onClick={() => handleSuggestionClick(s)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${isSelected
                      ? 'bg-gold-50 dark:bg-dark-accent/10'
                      : 'hover:bg-cream-50 dark:hover:bg-dark-bg/50'
                    }
                    border-b border-cream-100 dark:border-dark-bg-100 last:border-0`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <BookOpen className={`h-4 w-4 flex-shrink-0
                    ${isSelected ? 'text-gold' : 'text-brown-100/40 dark:text-dark-text/30'}`} />
                  <span className={`text-sm font-medium
                    ${isSelected ? 'text-gold dark:text-dark-accent' : 'text-brown dark:text-dark-text'}`}>
                    {s.name}
                  </span>
                </button>
              );
            })}
            <div className="px-4 py-2.5 border-t border-cream-100 dark:border-dark-bg-100
                           bg-cream-50 dark:bg-dark-bg/50">
              <span className="text-xs text-brown-100/60 dark:text-dark-text/40 flex items-center gap-1.5">
                <CornerDownLeft className="h-3 w-3" />
                Presiona Enter para buscar: <span className="text-brown dark:text-dark-text/70 font-medium">"{query}"</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { buildBookIndex, parseReference };
