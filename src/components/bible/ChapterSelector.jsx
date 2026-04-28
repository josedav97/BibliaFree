import { useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useChapters } from '../../hooks/useBibleApi';

const ChapterSelector = memo(function ChapterSelector({ bookId, selectedChapter, onSelect }) {
  const { data: chapters, isLoading } = useChapters(bookId);

  const displayedChapters = useMemo(() => {
    if (!chapters) return [];
    const total = chapters.length;
    const selected = selectedChapter || 1;

    if (total <= 10) return chapters;

    const start = Math.max(1, selected - 4);
    const end = Math.min(total, selected + 5);
    let result = [];
    if (start > 1) result.push('prev');
    for (let i = start; i <= end; i++) result.push(i);
    if (end < total) result.push('next');
    return result;
  }, [chapters, selectedChapter]);

  const handlePrevChapter = () => {
    if (selectedChapter > 1) onSelect(selectedChapter - 1);
  };

  const handleNextChapter = () => {
    if (chapters && selectedChapter < chapters.length) onSelect(selectedChapter + 1);
  };

  if (!bookId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-9 rounded-lg bg-cream-200 dark:bg-dark-bg-100" />
        ))}
      </div>
    );
  }

  if (!chapters || chapters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={handlePrevChapter}
        disabled={!selectedChapter || selectedChapter <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-all
                   text-brown-100 hover:bg-cream-200 dark:text-dark-text/60 dark:hover:bg-dark-bg-100
                   disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Capítulo anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex flex-wrap gap-1" role="group" aria-label="Seleccionar capítulo">
        {displayedChapters.map((chap) => {
          if (chap === 'prev') {
            return (
              <span key="ellipsis-start" className="flex h-9 w-9 items-center justify-center text-xs text-brown-100/50">
                ...
              </span>
            );
          }
          if (chap === 'next') {
            return (
              <span key="ellipsis-end" className="flex h-9 w-9 items-center justify-center text-xs text-brown-100/50">
                ...
              </span>
            );
          }

          const isSelected = chap === selectedChapter;
          return (
            <button
              key={chap}
              onClick={() => onSelect(chap)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-gold text-white shadow-md shadow-gold/20'
                  : 'text-brown-100 hover:bg-cream-200 dark:text-dark-text/60 dark:hover:bg-dark-bg-100'
                }`}
              aria-label={`Capítulo ${chap}`}
              aria-current={isSelected ? 'true' : undefined}
            >
              {chap}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNextChapter}
        disabled={!chapters || selectedChapter >= chapters.length}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-all
                   text-brown-100 hover:bg-cream-200 dark:text-dark-text/60 dark:hover:bg-dark-bg-100
                   disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Capítulo siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
});

export default ChapterSelector;
