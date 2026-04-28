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
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold-50 via-cream to-cream-100 
                      dark:from-dark-bg-50 dark:via-dark-bg dark:to-dark-bg-100" />

      <div className="absolute inset-0 opacity-5 dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' fill='%23b8860b' fill-opacity='0.8'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-gold" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wider text-gold">
            Versículo del día
          </span>
        </div>

        <blockquote className="font-serif text-xl md:text-2xl text-brown dark:text-dark-text 
                               leading-relaxed italic mb-4">
          "{verseData.text}"
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
