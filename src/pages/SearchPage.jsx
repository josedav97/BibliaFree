import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookSelector from '../components/bible/BookSelector';
import ChapterSelector from '../components/bible/ChapterSelector';
import VerseSearch from '../components/bible/VerseSearch';
import useBibleStore from '../store/useBibleStore';
import { bookChapters, formatBookName } from '../services/bibleApi';

export default function SearchPage() {
  const navigate = useNavigate();
  const { setBook, setChapter } = useBibleStore();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const handleBookSelect = useCallback(
    (book) => {
      setSelectedBook(book);
      setSelectedChapter(null);
      setBook(book);
    },
    [setBook]
  );

  const handleChapterSelect = useCallback(
    (chapter) => {
      setSelectedChapter(chapter);
      setChapter(chapter);
    },
    [setChapter]
  );

  const handleGoToPassage = useCallback(() => {
    if (selectedBook && selectedChapter) {
      navigate(`/passage/${selectedBook}/${selectedChapter}`);
    }
  }, [selectedBook, selectedChapter, navigate]);

  const handleSearchResult = useCallback(
    (result) => {
      const bookId = result.book || result.book_name || result.book_id;
      const chapter = result.chapter;
      const verseNum = result.number || result.verse;
      if (bookId && chapter && verseNum) {
        navigate(`/passage/${bookId}/${chapter}/${verseNum}`);
      }
    },
    [navigate]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-3xl font-bold text-brown dark:text-dark-text mb-2">
          Búsqueda avanzada
        </h1>
        <p className="text-brown-100 dark:text-dark-text/60">
          Busca por libro, capítulo, versículo o palabra clave.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-cream-200 bg-white/80 dark:border-dark-bg-100 
                   dark:bg-dark-bg-50/80 p-6 shadow-sm space-y-5"
      >
        <h2 className="font-serif text-lg font-semibold text-brown dark:text-dark-text flex items-center gap-2">
          <Search className="h-5 w-5 text-gold" />
          Buscar por libro y capítulo
        </h2>

        <div>
          <label className="block text-sm font-medium text-brown-100 dark:text-dark-text/70 mb-2">
            Libro
          </label>
          <BookSelector selectedBook={selectedBook} onSelect={handleBookSelect} />
        </div>

        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className="block text-sm font-medium text-brown-100 dark:text-dark-text/70 mb-2">
              Capítulo
            </label>
            <ChapterSelector
              bookId={selectedBook}
              selectedChapter={selectedChapter}
              onSelect={handleChapterSelect}
            />
          </motion.div>
        )}

        {selectedBook && selectedChapter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <button
              onClick={handleGoToPassage}
              className="w-full rounded-xl bg-gold py-3 text-white font-medium 
                         shadow-lg shadow-gold/20 hover:bg-gold-400 transition-all text-sm"
              aria-label={`Ir a ${formatBookName(selectedBook)} capítulo ${selectedChapter}`}
            >
              Leer {formatBookName(selectedBook)} {selectedChapter}
            </button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-cream-200 bg-white/80 dark:border-dark-bg-100 
                   dark:bg-dark-bg-50/80 p-6 shadow-sm space-y-4"
      >
        <h2 className="font-serif text-lg font-semibold text-brown dark:text-dark-text">
          Buscar por palabra clave
        </h2>
        <VerseSearch onResultClick={handleSearchResult} compact />
      </motion.div>
    </div>
  );
}
