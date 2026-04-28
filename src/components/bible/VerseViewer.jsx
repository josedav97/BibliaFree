import { useState, useMemo, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Heart, Share2, Volume2, Check, Pause, Play, Pin, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useBibleStore from '../../store/useBibleStore';
import { useFavorites } from '../../hooks/useFavorites';
import { useHighlights } from '../../hooks/useHighlights';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import HighlightToolbar from '../features/HighlightToolbar';
import ShareModal from '../features/ShareModal';

const highlightBg = {
  yellow: 'bg-yellow-200/60 dark:bg-yellow-500/20 rounded-sm',
  green: 'bg-green-200/60 dark:bg-green-500/20 rounded-sm',
  blue: 'bg-blue-200/60 dark:bg-blue-400/20 rounded-sm',
  pink: 'bg-pink-200/60 dark:bg-pink-400/20 rounded-sm',
};

function renderVerseText(verseText, highlights) {
  if (!verseText || !highlights || highlights.length === 0) {
    return <>{verseText}</>;
  }

  const sorted = highlights
    .filter((h) => h.text && verseText.includes(h.text))
    .sort((a, b) => verseText.indexOf(a.text) - verseText.indexOf(b.text));

  if (sorted.length === 0) return <>{verseText}</>;

  const segments = [];
  let lastIndex = 0;

  for (const h of sorted) {
    const idx = verseText.indexOf(h.text, lastIndex);
    if (idx === -1) continue;

    if (idx > lastIndex) {
      segments.push({ text: verseText.slice(lastIndex, idx), color: null });
    }

    segments.push({ text: h.text, color: h.color, note: h.note });
    lastIndex = idx + h.text.length;
  }

  if (lastIndex < verseText.length) {
    segments.push({ text: verseText.slice(lastIndex), color: null });
  }

  return (
    <>
      {segments.map((seg, i) =>
        seg.color ? (
          <span
            key={i}
            className={highlightBg[seg.color] || ''}
            title={seg.note || undefined}
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

const VerseViewer = memo(function VerseViewer({ verses, reference, text, highlightVerses, showActions = true }) {
  const { fontSize, toggleReadingMode, readingMode } = useBibleStore();
  const verseContainerRef = useRef(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addHighlight, getHighlightsForVerse } = useHighlights();
  const tts = useTextToSpeech();
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarText, setToolbarText] = useState('');
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [activeVerse, setActiveVerse] = useState(null);
  const [activeBook, setActiveBook] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [showNote, setShowNote] = useState(null);

  const fontSizeClass = useMemo(() => {
    switch (fontSize) {
      case 'small': return 'text-lg leading-relaxed';
      case 'large': return 'text-2xl leading-relaxed';
      default: return 'text-xl leading-relaxed';
    }
  }, [fontSize]);

  const handleCopy = useCallback(() => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(`${reference}\n${cleanText}`).then(() => {
      setCopied(true);
      toast.success('Versículo copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text, reference]);

  const handleFavorite = useCallback(() => {
    toggleFavorite({
      reference,
      text,
      bookId: verses?.[0]?.book_id,
      book: verses?.[0]?.book_name,
      chapter: verses?.[0]?.chapter,
    });
  }, [toggleFavorite, reference, text, verses]);

  const handleAudio = useCallback(() => {
    if (tts.isSpeaking && !tts.isPaused) {
      tts.pause();
    } else if (tts.isPaused) {
      tts.resume();
    } else {
      const cleanText = text.replace(/<[^>]*>/g, '');
      if ('speechSynthesis' in window) {
        tts.speak(cleanText);
        toast.success('Reproduciendo audio...');
      } else {
        toast.error('Tu navegador no soporta texto a voz');
      }
    }
  }, [text, tts]);

  const handleAudioStop = useCallback(() => {
    tts.stop();
  }, [tts]);

  const handlePointerUp = useCallback(() => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      const selectedText = sel.toString().trim();
      if (!selectedText) return;

      const range = sel.getRangeAt(0);
      const container = verseContainerRef.current;
      if (!container || !container.contains(range.commonAncestorContainer)) {
        return;
      }

      let node = range.commonAncestorContainer;
      let verseNum = null;
      let bookId = null;
      let chapterNum = null;
      while (node && node !== container) {
        const vNum = node.dataset?.verse;
        const bId = node.dataset?.bookId;
        const ch = node.dataset?.chapter;
        if (vNum) {
          verseNum = Number(vNum);
          bookId = bId || null;
          chapterNum = ch ? Number(ch) : null;
          break;
        }
        node = node.parentElement;
      }

      if (!verseNum) return;

      try {
        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - containerRect.left + (container.scrollLeft || 0);
        const y = rect.top - containerRect.top + (container.scrollTop || 0);

        setActiveVerse(verseNum);
        setActiveBook(bookId);
        setActiveChapter(chapterNum);
        setToolbarText(selectedText);
        setToolbarPosition({ x: x - 90, y: y - 52 });
        setToolbarVisible(true);
      } catch {
        // position calculation failed, still show toolbar
        setActiveVerse(verseNum);
        setActiveBook(bookId);
        setActiveChapter(chapterNum);
        setToolbarText(selectedText);
        setToolbarVisible(true);
      }
    }, 10);
  }, []);

  const handleHighlight = useCallback(
    (data) => {
      if (!activeBook || !activeChapter || !activeVerse || !data.text) return;
      const fullVerse = verses?.find((v) => v.verse === activeVerse);
      addHighlight({
        book: activeBook,
        chapter: activeChapter,
        verse: activeVerse,
        text: data.text,
        verseText: fullVerse?.text || '',
        color: data.color,
        note: data.note,
      });
      toast.success('Subrayado guardado');
      window.getSelection()?.removeAllRanges();
    },
    [activeBook, activeChapter, activeVerse, addHighlight, verses]
  );

  const handleCloseToolbar = useCallback(() => {
    setToolbarVisible(false);
    window.getSelection()?.removeAllRanges();
  }, []);

  const favorited = isFavorite(reference);
  const versesToShow = verses || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {showActions && !readingMode && (
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium 
                       transition-all bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200 
                       dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60"
            aria-label="Copiar versículo"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>

          <button
            onClick={handleFavorite}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all
              ${favorited
                ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200 dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60'
              }`}
            aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-current' : ''}`} />
            {favorited ? 'Guardado' : 'Favorito'}
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium 
                       transition-all bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200 
                       dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60"
            aria-label="Compartir versículo"
          >
            <Share2 className="h-3.5 w-3.5" />
            Compartir
          </button>

          <button
            onClick={handleAudio}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium 
                       transition-all relative
                       ${tts.isSpeaking && !tts.isPaused
                         ? 'bg-gold-50 text-gold dark:bg-dark-accent/10 dark:text-dark-accent ring-2 ring-gold/30 dark:ring-dark-accent/30'
                         : 'bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200 dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60'
                       }`}
            aria-label={tts.isSpeaking && !tts.isPaused ? 'Pausar audio' : tts.isPaused ? 'Reanudar audio' : 'Reproducir audio'}
          >
            {tts.isSpeaking && !tts.isPaused ? (
              <>
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/40 dark:bg-dark-accent/40 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold dark:bg-dark-accent" />
                </span>
                Pausar
              </>
            ) : tts.isPaused ? (
              <>
                <Play className="h-3.5 w-3.5" />
                Reanudar
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                Audio
              </>
            )}
          </button>

          {(tts.isSpeaking || tts.isPaused) && (
            <button
              onClick={handleAudioStop}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium 
                         transition-all bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400
                         hover:bg-red-100 dark:hover:bg-red-900/30"
              aria-label="Detener audio"
            >
              <StopCircle className="h-3.5 w-3.5" />
              Detener
            </button>
          )}

          <button
            onClick={toggleReadingMode}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium 
                       transition-all bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200 
                       dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60"
            aria-label="Modo lectura sin distracciones"
          >
            {readingMode ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {readingMode ? 'Salir modo lectura' : 'Modo lectura'}
          </button>
        </div>
      )}

      <div
        ref={verseContainerRef}
        onPointerUp={handlePointerUp}
        className="rounded-2xl border border-cream-200 bg-white/80 dark:border-dark-bg-100 dark:bg-dark-bg-50/80 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className={`font-serif text-brown dark:text-dark-text ${fontSizeClass} passage-text`}>
          {versesToShow.map((verse, index) => {
            const bookId = verse.book_id || '';
            const chapter = verse.chapter;
            const verseNum = verse.verse;
            const verseHighlights = getHighlightsForVerse(bookId, chapter, verseNum);
            const hasNote = verseHighlights.some((h) => h.note);

            return (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="mb-2 transition-colors duration-200 px-2 py-1 rounded
                  hover:bg-cream-100/50 dark:hover:bg-dark-bg/50 passage-text relative"
              >
                <sup
                  className="text-gold dark:text-dark-accent mr-1"
                  data-verse={verseNum}
                  data-book-id={bookId}
                  data-chapter={chapter}
                >
                  {verseNum}
                </sup>
                <span
                  data-verse={verseNum}
                  data-book-id={bookId}
                  data-chapter={chapter}
                >
                  {renderVerseText(verse.text, verseHighlights)}
                </span>
                {hasNote && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNote(showNote === verseNum ? null : verseNum);
                    }}
                    className="inline-flex items-center ml-2 text-gold hover:text-gold-400 
                               dark:text-dark-accent dark:hover:text-dark-accent/80 
                               transition-colors align-middle"
                    aria-label="Ver nota"
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                )}
                {showNote === verseNum && hasNote && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-8 mt-1 p-2.5 rounded-lg bg-gold-50 dark:bg-dark-accent/10 
                               border border-gold-100 dark:border-dark-accent/20"
                  >
                    {verseHighlights
                      .filter((h) => h.note)
                      .map((h, i) => (
                        <p key={i} className="text-xs text-brown-100 dark:text-dark-text/70 font-sans leading-relaxed">
                          {h.note}
                        </p>
                      ))}
                  </motion.div>
                )}
              </motion.p>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-cream-200 dark:border-dark-bg-100">
          <span className="text-xs text-brown-100/60 dark:text-dark-text/40">
            {reference || 'Selecciona un pasaje'}
          </span>
        </div>
      </div>

      {readingMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={toggleReadingMode}
          className="fixed bottom-8 right-8 z-50 rounded-full bg-gold p-3 text-white shadow-lg 
                     hover:bg-gold-400 transition-colors"
          aria-label="Salir del modo lectura"
        >
          <Play className="h-5 w-5" />
        </motion.button>
      )}

      <AnimatePresence>
        {showShare && (
          <ShareModal
            reference={reference}
            text={text.replace(/<[^>]*>/g, '')}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>

      {toolbarVisible && (
        <HighlightToolbar
          selectedText={toolbarText}
          position={toolbarPosition}
          onHighlight={handleHighlight}
          onClose={handleCloseToolbar}
        />
      )}
    </motion.div>
  );
});

export default VerseViewer;
