import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePassage, useVerses, useBookChapterCount } from '../hooks/useBibleApi';
import useBibleStore from '../store/useBibleStore';
import { formatBookName } from '../services/bibleApi';
import VerseViewer from '../components/bible/VerseViewer';
import ChapterSelector from '../components/bible/ChapterSelector';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';

export default function PassagePage() {
  const { book, chapter, verse } = useParams();
  const navigate = useNavigate();
  const addToHistory = useBibleStore((state) => state.addToHistory);
  const fontSize = useBibleStore((state) => state.fontSize);

  const decodedBook = book?.toLowerCase();
  const chapterNum = parseInt(chapter, 10);
  const verseNum = verse ? parseInt(verse, 10) : null;

  const hasVerse = verse !== undefined;

  const { data: chapterCount } = useBookChapterCount(decodedBook);

  const {
    data: chapterData,
    isLoading,
    isError,
    error,
    refetch,
  } = useVerses(decodedBook, chapterNum);

  const { data: verseData } = usePassage(
    hasVerse ? decodedBook : null,
    hasVerse ? chapterNum : null,
    hasVerse ? verseNum : null,
    null
  );

  const passageData = hasVerse && verseData ? verseData : chapterData;

  useEffect(() => {
    if (passageData) {
      addToHistory({
        reference: passageData.reference,
        book: decodedBook,
        chapter: chapterNum,
        verse: verseNum,
        text: passageData.text,
      });
    }
  }, [passageData, decodedBook, chapterNum, verseNum, addToHistory]);

  const handleChapterChange = useCallback(
    (newChapter) => {
      navigate(`/passage/${decodedBook}/${newChapter}`);
    },
    [navigate, decodedBook]
  );

  const goToPrev = useCallback(() => {
    if (chapterNum > 1) navigate(`/passage/${decodedBook}/${chapterNum - 1}`);
  }, [navigate, decodedBook, chapterNum]);

  const goToNext = useCallback(() => {
    if (chapterCount && chapterNum < chapterCount) {
      navigate(`/passage/${decodedBook}/${chapterNum + 1}`);
    }
  }, [navigate, decodedBook, chapterNum, chapterCount]);

  const bookDisplayName = useMemo(
    () => (decodedBook ? formatBookName(decodedBook) : ''),
    [decodedBook]
  );

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowRight' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        goToNext();
      }
      if (e.key === 'ArrowLeft' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        goToPrev();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  if (!decodedBook || !chapterNum) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <EmptyState
          title="Selecciona un pasaje"
          description="Usa la búsqueda o navega por los libros para encontrar un pasaje bíblico."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-brown dark:text-dark-text">
            {bookDisplayName}
          </h1>
          <p className="text-sm text-brown-100 dark:text-dark-text/50 mt-1">
            Capítulo {chapterNum}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            disabled={chapterNum <= 1}
            className="flex items-center gap-1 rounded-lg border border-cream-200 dark:border-dark-bg-100 
                       px-3 py-2 text-sm font-medium text-brown-100 dark:text-dark-text/60
                       hover:bg-cream-100 dark:hover:bg-dark-bg-50 transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Capítulo anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            onClick={goToNext}
            disabled={chapterCount ? chapterNum >= chapterCount : false}
            className="flex items-center gap-1 rounded-lg border border-cream-200 dark:border-dark-bg-100 
                       px-3 py-2 text-sm font-medium text-brown-100 dark:text-dark-text/60
                       hover:bg-cream-100 dark:hover:bg-dark-bg-50 transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Capítulo siguiente"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ChapterSelector
          bookId={decodedBook}
          selectedChapter={chapterNum}
          onSelect={handleChapterChange}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {isLoading && <SkeletonLoader lines={10} />}
        {isError && (
          <ErrorMessage
            message={error?.message || 'No se pudo cargar el pasaje'}
            onRetry={refetch}
          />
        )}
        {passageData && (
          <VerseViewer
            verses={passageData.verses}
            reference={passageData.reference}
            text={passageData.text}
            highlightVerses={verseNum ? [String(verseNum)] : []}
          />
        )}
      </motion.div>
    </div>
  );
}
