import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';
import useBibleStore from '../../store/useBibleStore';
import { formatBookName } from '../../services/bibleApi';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} hrs`;
  return `Hace ${Math.floor(seconds / 86400)} días`;
}

const ReadingHistory = memo(function ReadingHistory() {
  const readingHistory = useBibleStore((state) => state.readingHistory);
  const addToHistory = useBibleStore((state) => state.addToHistory);
  const navigate = useNavigate();

  const handleClick = useCallback(
    (entry) => {
      if (entry.book && entry.chapter) {
        navigate(`/passage/${entry.book}/${entry.chapter}${entry.verse ? `/${entry.verse}` : ''}`);
      }
    },
    [navigate]
  );

  if (readingHistory.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Sin historial de lectura"
        description="Los pasajes que leas aparecerán aquí para que puedas retomarlos fácilmente."
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-brown-100/70 dark:text-dark-text/50 mb-3">
        Últimas {readingHistory.length} lecturas
      </p>
      <AnimatePresence mode="popLayout">
        {readingHistory.map((entry, index) => (
          <motion.button
            key={entry.reference || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleClick(entry)}
            className="w-full flex items-center gap-3 rounded-xl border border-cream-200 
                       bg-white/80 dark:border-dark-bg-100 dark:bg-dark-bg-50/80 
                       p-3 text-left transition-all hover:border-gold/30 
                       dark:hover:border-dark-accent/30 hover:shadow-sm group"
          >
            <div className="flex-shrink-0 rounded-lg bg-cream-100 dark:bg-dark-bg p-2 
                            group-hover:bg-gold-50 dark:group-hover:bg-dark-accent/10 transition-colors">
              <BookOpen className="h-4 w-4 text-brown-100 dark:text-dark-text/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brown dark:text-dark-text truncate">
                {entry.reference || `${entry.book || ''} ${entry.chapter || ''}`}
              </p>
              {entry.timestamp && (
                <p className="text-xs text-brown-100/50 dark:text-dark-text/40">
                  {timeAgo(entry.timestamp)}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-brown-100/30 dark:text-dark-text/20 
                                     group-hover:text-gold transition-colors" />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
});

export default ReadingHistory;
