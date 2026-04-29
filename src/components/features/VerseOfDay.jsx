import { memo } from 'react';
import { motion } from 'framer-motion';
import { useVerseOfDay } from '../../hooks/useBibleApi';
import { formatBookName } from '../../services/bibleApi';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../ui/SkeletonLoader';
import ErrorMessage from '../ui/ErrorMessage';

const VerseOfDay = memo(function VerseOfDay() {
  const { data: verseData, isLoading, isError, refetch } = useVerseOfDay();
  const navigate = useNavigate();

  if (isLoading) return <SkeletonLoader type="card" />;
  if (isError) return <ErrorMessage message="No se pudo cargar el versículo del día" onRetry={refetch} />;
  if (!verseData) return null;

  const bookName = formatBookName(verseData.book);
  const reference = `${bookName} ${verseData.chapter}:${verseData.verse}`;

  const handleClick = () => {
    navigate(`/passage/${verseData.book}/${verseData.chapter}/${verseData.verse}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl card"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold-50 via-white to-cream-50
                      dark:from-dark-bg-50 dark:via-dark-bg dark:to-dark-bg-100" />

      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gold-50 dark:bg-dark-accent/10">
            <Sparkles className="h-4 w-4 text-gold dark:text-dark-accent" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold dark:text-dark-accent">
            Versículo del día
          </span>
        </div>

        <blockquote className="font-serif text-xl md:text-2xl text-brown dark:text-dark-text
                               leading-relaxed italic mb-6 pl-4 border-l-2 border-gold/30
                               dark:border-dark-accent/30">
          {verseData.text}
        </blockquote>

        <div className="flex items-center justify-between">
          <cite className="not-italic text-sm font-semibold text-brown-100 dark:text-dark-text/70">
            — {reference}
          </cite>
          <button
            onClick={handleClick}
            className="text-sm font-medium text-gold hover:text-gold-400 dark:text-dark-accent
                       dark:hover:text-dark-accent/80 transition-colors hover:underline"
            aria-label={`Leer ${reference} completo`}
          >
            Leer contexto
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default VerseOfDay;
