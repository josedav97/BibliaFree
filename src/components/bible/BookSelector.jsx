import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronDown, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooks } from '../../hooks/useBibleApi';
import { formatBookName } from '../../services/bibleApi';

export default function BookSelector({ selectedBook, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: bookGroups, isLoading } = useBooks();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredGroups = useMemo(() => {
    if (!bookGroups) return [];
    if (!searchTerm) return bookGroups;

    return bookGroups
      .map((group) => ({
        ...group,
        books: group.books.filter(
          (book) =>
            book.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formatBookName(book).toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((group) => group.books.length > 0);
  }, [bookGroups, searchTerm]);

  const handleSelect = useCallback(
    (book) => {
      onSelect(book);
      setIsOpen(false);
      setSearchTerm('');
    },
    [onSelect]
  );

  const displayName = selectedBook ? formatBookName(selectedBook) : 'Seleccionar libro';

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left 
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
          dark:focus:ring-offset-dark-bg
          ${selectedBook
            ? 'border-gold/30 bg-gold-50/50 dark:border-dark-accent/20 dark:bg-dark-accent/5'
            : 'border-cream-200 bg-white dark:border-dark-bg-100 dark:bg-dark-bg-50'
          }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Seleccionar libro de la Biblia"
      >
        <span className={`text-sm ${selectedBook ? 'font-semibold text-brown dark:text-dark-text' : 'text-brown-100/50 dark:text-dark-text/40'}`}>
          {displayName}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-brown-100 dark:text-dark-text/60" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-hidden rounded-xl 
                       border border-cream-200 bg-white shadow-xl dark:border-dark-bg-100 dark:bg-dark-bg-50"
          >
            <div className="sticky top-0 z-10 border-b border-cream-200 dark:border-dark-bg-100 bg-white dark:bg-dark-bg-50 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-100/50 dark:text-dark-text/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar libro..."
                  className="w-full rounded-lg border border-cream-200 bg-cream-50 py-2 pl-10 pr-3 
                             text-sm text-brown placeholder:text-brown-100/40 outline-none 
                             focus:border-gold dark:border-dark-bg-100 dark:bg-dark-bg 
                             dark:text-dark-text dark:placeholder:text-dark-text/30"
                  aria-label="Buscar libro"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-60 scrollbar-thin scrollbar-gold" ref={listRef} role="listbox" aria-label="Libros de la Biblia">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-brown-100">Cargando libros...</div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-4 text-center text-sm text-brown-100">No se encontraron libros.</div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.group}>
                    <div className="sticky top-0 bg-cream-50/95 dark:bg-dark-bg-100/95 px-4 py-2 
                                    text-xs font-semibold uppercase tracking-wider text-gold backdrop-blur-sm">
                      {group.group}
                    </div>
                    <div className="grid grid-cols-2 gap-px">
                      {group.books.map((book) => {
                        const isSelected = selectedBook === book;
                        return (
                          <button
                            key={book}
                            onClick={() => handleSelect(book)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors
                              hover:bg-cream-100 dark:hover:bg-dark-bg
                              ${isSelected ? 'bg-gold-50 text-brown font-semibold dark:bg-dark-accent/10 dark:text-dark-accent' : 'text-brown-100 dark:text-dark-text/70'}
                            `}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <BookOpen className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? 'text-gold' : 'text-brown-100/40'}`} />
                            {formatBookName(book)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
