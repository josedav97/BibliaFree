import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocalSearch } from '../../hooks/useLocalSearch';
import { useQueryClient } from '@tanstack/react-query';

const NO_CACHE_MESSAGE = 'Navega a algunos capítulos primero para tener datos de búsqueda.';

export default function VerseSearch({ onResultClick, compact = false }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
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

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFocus = useCallback(() => {
    if (query.length >= 2) setShowSuggestions(true);
  }, [query.length]);

  const { results, isLoading } = useLocalSearch(debouncedQuery);

  const hasCacheData = useMemo(() => {
    const cache = queryClient.getQueryCache();
    return cache.getAll().some((e) => Array.isArray(e.queryKey) && e.queryKey[0] === 'verses');
  }, [queryClient]);

  const handleResultClick = useCallback(
    (result) => {
      setQuery('');
      setShowSuggestions(false);
      if (onResultClick) {
        onResultClick(result);
        return;
      }

      const bookId = result.book;
      const chapter = result.chapter;
      const verseNum = result.number;
      if (bookId && chapter && verseNum) {
        navigate(`/passage/${bookId}/${chapter}/${verseNum}`);
      }
    },
    [onResultClick, navigate]
  );

  const showDropdown = showSuggestions && debouncedQuery.length >= 2;
  const noResults = showDropdown && !isLoading && results.length === 0;
  const noData = noResults && !hasCacheData;

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-100/50 dark:text-dark-text/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (e.target.value.length >= 2) setShowSuggestions(true); }}
          onFocus={handleFocus}
          placeholder="Buscar en versículos cargados..."
          className="w-full rounded-xl border border-cream-200 bg-white py-3 pl-10 pr-10 
                     text-sm text-brown placeholder:text-brown-100/40 outline-none 
                     transition-all focus:border-gold focus:ring-2 focus:ring-gold/20
                     dark:border-dark-bg-100 dark:bg-dark-bg-50 dark:text-dark-text 
                     dark:placeholder:text-dark-text/30 dark:focus:border-dark-accent"
          aria-label="Buscar en la Biblia"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setShowSuggestions(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 
                       text-brown-100/50 hover:text-brown-100 dark:text-dark-text/40"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            id="search-suggestions"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto 
                       rounded-xl border border-cream-200 bg-white shadow-xl 
                       dark:border-dark-bg-100 dark:bg-dark-bg-50"
            role="listbox"
          >
            {noData && (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <BookOpen className="h-8 w-8 text-brown-100/30 dark:text-dark-text/20" />
                <p className="text-sm text-brown-100 dark:text-dark-text/60">
                  {NO_CACHE_MESSAGE}
                </p>
              </div>
            )}

            {noResults && !noData && (
              <div className="p-4 text-sm text-brown-100 dark:text-dark-text/60 text-center">
                Sin resultados para "{debouncedQuery}"
              </div>
            )}

            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className="w-full px-4 py-3 text-left transition-colors hover:bg-cream-50 
                           dark:hover:bg-dark-bg border-b border-cream-100 dark:border-dark-bg-100 last:border-0"
                role="option"
                aria-selected={false}
              >
                <span className="text-xs font-semibold text-gold dark:text-dark-accent">
                  {result.reference}
                </span>
                <p className="mt-1 text-sm text-brown-100 dark:text-dark-text/60 line-clamp-2">
                  {result.verse.replace(/<[^>]*>/g, '').substring(0, 120)}
                </p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
