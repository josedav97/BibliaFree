import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Heart, ArrowRight } from 'lucide-react';
import VerseOfDay from '../components/features/VerseOfDay';
import VerseSearch from '../components/bible/VerseSearch';
import ReadingHistory from '../components/features/ReadingHistory';
import useBibleStore from '../store/useBibleStore';
import { bookChapters, formatBookName } from '../services/bibleApi';
import { useVerses } from '../hooks/useBibleApi';

const popularBooks = [
  { id: 'salmos', name: 'Salmos' },
  { id: 'mateo', name: 'Mateo' },
  { id: 'genesis', name: 'Génesis' },
  { id: 'juan', name: 'Juan' },
  { id: 'romanos', name: 'Romanos' },
  { id: 'proverbios', name: 'Proverbios' },
  { id: 'isaias', name: 'Isaías' },
  { id: 'hechos', name: 'Hechos' },
];

function SearchPreloader() {
  useVerses('salmos', 1);
  useVerses('salmos', 23);
  useVerses('mateo', 5);
  useVerses('mateo', 6);
  useVerses('genesis', 1);
  useVerses('juan', 3);
  useVerses('juan', 14);
  useVerses('proverbios', 3);
  useVerses('isaias', 40);
  useVerses('romanos', 8);
  useVerses('hechos', 2);
  return null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const addToHistory = useBibleStore((state) => state.addToHistory);

  const handleBookClick = useCallback(
    (bookId) => {
      const chapter = 1;
      navigate(`/passage/${bookId}/${chapter}`);
    },
    [navigate]
  );

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
        className="text-center"
      >
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-brown dark:text-dark-text mb-3">
          La Biblia
        </h1>
        <p className="text-brown-100 dark:text-dark-text/60 max-w-md mx-auto">
          Explora las Sagradas Escrituras, busca pasajes y guarda tus versículos favoritos.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <VerseSearch onResultClick={handleSearchResult} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <VerseOfDay />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-serif text-xl font-semibold text-brown dark:text-dark-text mb-4">
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {popularBooks.map((book) => (
            <motion.button
              key={book.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleBookClick(book.id)}
              className="flex items-center gap-3 rounded-xl border border-dark-bg-100 
                         bg-dark-bg-50/70 backdrop-blur-sm
                         p-4 text-left shadow-sm transition-all hover:shadow-md
                         hover:border-dark-accent/30 group"
            >
              <BookOpen className="h-5 w-5 text-gold dark:text-dark-accent 
                                  group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-brown dark:text-dark-text">
                {book.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="font-serif text-xl font-semibold text-brown dark:text-dark-text mb-4">
          Historial de lectura
        </h2>
        <ReadingHistory />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center pb-8"
      >
        <button
          onClick={() => navigate('/search')}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-white 
                     font-medium shadow-lg shadow-gold/20 hover:bg-gold-400 
                     transition-all hover:shadow-xl hover:shadow-gold/30"
        >
          <Search className="h-4 w-4" />
          Búsqueda avanzada
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
      <SearchPreloader />
    </div>
  );
}
