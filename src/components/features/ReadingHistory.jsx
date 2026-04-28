import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, ChevronRight, ChevronDown } from 'lucide-react';
import useBibleStore from '../../store/useBibleStore';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 3600 * 24) return `Hace ${Math.floor(seconds / 3600)} h`;
  return `Hace ${Math.floor(seconds / 86400)} d`;
}

function HistoryRow({ entry, onClick, isLatest }) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
        group rounded-lg
        ${isLatest
          ? 'bg-cream-200/60 dark:bg-dark-bg-100/80 border border-cream-200 dark:border-dark-bg-100'
          : 'hover:bg-cream-100/60 dark:hover:bg-dark-bg/60 border border-transparent'
        }`}
    >
      <div className={`flex-shrink-0 rounded-md p-1.5 transition-colors
        ${isLatest
          ? 'bg-gold-50 dark:bg-dark-accent/10'
          : 'bg-cream-100 dark:bg-dark-bg group-hover:bg-gold-50/50 dark:group-hover:bg-dark-accent/5'
        }`}>
        <BookOpen className={`h-3.5 w-3.5 transition-colors
          ${isLatest ? 'text-gold' : 'text-brown-100/60 dark:text-dark-text/50'}
          group-hover:text-gold`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate transition-colors
          ${isLatest
            ? 'font-semibold text-brown dark:text-dark-text'
            : 'font-medium text-brown-200 dark:text-dark-text/80'
          }
          group-hover:text-gold dark:group-hover:text-dark-accent`}
        >
          {entry.reference || `${entry.book || ''} ${entry.chapter || ''}`}
        </p>
        {entry.timestamp && (
          <p className="text-[11px] text-brown-100/50 dark:text-dark-text/40 mt-0.5">
            {timeAgo(entry.timestamp)}
          </p>
        )}
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-brown-100/20 dark:text-dark-text/20
                                group-hover:text-gold transition-colors" />
    </motion.button>
  );
}

const ReadingHistory = memo(function ReadingHistory() {
  const readingHistory = useBibleStore((state) => state.readingHistory);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

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

  const latest = readingHistory[0];
  const older = readingHistory.slice(1);
  const hasMore = older.length > 0;

  return (
    <div className="rounded-2xl border border-cream-200 bg-white/80 dark:border-dark-bg-100
                    dark:bg-dark-bg-50/80 shadow-sm overflow-hidden">
      <button
        onClick={() => hasMore && setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left
                   transition-colors hover:bg-cream-50/50 dark:hover:bg-dark-bg/50"
        aria-expanded={expanded}
        aria-controls="history-list"
      >
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-gold dark:text-dark-accent" />
          <span className="font-serif text-sm font-semibold text-brown dark:text-dark-text">
            Historial de lectura
          </span>
          <span className="text-[11px] text-brown-100/50 dark:text-dark-text/40 font-normal">
            ({readingHistory.length})
          </span>
        </div>
        {hasMore && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="text-brown-100/50 dark:text-dark-text/40"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )}
      </button>

      <div className="px-4 pb-1">
        <HistoryRow
          entry={latest}
          onClick={() => handleClick(latest)}
          isLatest
        />
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasMore && (
          <motion.div
            id="history-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1">
              <div className="pt-2 mb-1">
                <div className="h-px bg-cream-200 dark:bg-dark-bg-100" />
              </div>
              {older.map((entry, i) => (
                <motion.div
                  key={entry.reference || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <HistoryRow
                    entry={entry}
                    onClick={() => handleClick(entry)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ReadingHistory;
