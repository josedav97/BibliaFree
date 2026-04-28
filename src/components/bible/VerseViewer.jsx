import { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Heart, Share2, Volume2, Check, Pause, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import useBibleStore from '../../store/useBibleStore';
import { useFavorites } from '../../hooks/useFavorites';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import ShareModal from '../features/ShareModal';

const VerseViewer = memo(function VerseViewer({ verses, reference, text, highlightVerses, showActions = true }) {
  const { fontSize, toggleReadingMode, readingMode, theme } = useBibleStore();
  const { toggleFavorite, isFavorite } = useFavorites();
  const tts = useTextToSpeech();
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

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

  const speakVerse = useCallback(() => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    const lang = 'es-MX';
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      toast.success('Reproduciendo audio...');
    } else {
      toast.error('Tu navegador no soporta texto a voz');
    }
  }, [text]);

  const favorited = isFavorite(reference);

  const versesToShow = verses || [];
  const highlightedRefs = new Set(highlightVerses || []);

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
            onClick={speakVerse}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium 
                       transition-all bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200 
                       dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60"
            aria-label="Escuchar versículo"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Audio
          </button>

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

      <div className="rounded-2xl border border-cream-200 bg-white/80 dark:border-dark-bg-100 dark:bg-dark-bg-50/80 p-6 md:p-8 backdrop-blur-sm">
        <div className={`font-serif text-brown dark:text-dark-text ${fontSizeClass} passage-text`}>
          {versesToShow.map((verse, index) => {
            const verseRef = `${verse.book_name || ''} ${verse.chapter}:${verse.verse}`;
            const isHighlighted = highlightedRefs.has(String(verse.verse));
            return (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`mb-2 transition-colors duration-200 px-2 py-1 rounded
                  ${isHighlighted ? 'verse-highlight' : 'hover:bg-cream-100/50 dark:hover:bg-dark-bg/50'}`}
              >
                <sup className="text-gold dark:text-dark-accent mr-1">{verse.verse}</sup>
                {verse.text}
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
    </motion.div>
  );
});

export default VerseViewer;
