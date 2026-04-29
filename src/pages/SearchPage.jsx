import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SmartSearch from '../components/bible/SmartSearch';
import VerseSearch from '../components/bible/VerseSearch';

export default function SearchPage() {
  const navigate = useNavigate();

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
        <h1 className="font-serif text-3xl font-bold text-brown dark:text-dark-text mb-2">
          Búsqueda
        </h1>
        <p className="text-brown-100 dark:text-dark-text/60">
          Escribe un libro, capítulo, versículo o palabra clave.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SmartSearch />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs text-brown-100/50 dark:text-dark-text/30 text-center mb-4">
          Ejemplos: <span className="text-brown-100/70 dark:text-dark-text/40">"Salmo 91"</span>,{' '}
          <span className="text-brown-100/70 dark:text-dark-text/40">"Juan 3:16"</span>,{' '}
          <span className="text-brown-100/70 dark:text-dark-text/40">"Génesis 1"</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
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
