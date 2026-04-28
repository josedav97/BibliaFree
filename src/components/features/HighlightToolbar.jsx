import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', ring: 'ring-yellow-400', label: 'Amarillo' },
  { name: 'green', bg: 'bg-green-200', ring: 'ring-green-400', label: 'Verde' },
  { name: 'blue', bg: 'bg-blue-200', ring: 'ring-blue-400', label: 'Azul' },
  { name: 'pink', bg: 'bg-pink-200', ring: 'ring-pink-400', label: 'Rosa' },
];

const HighlightToolbar = memo(function HighlightToolbar({
  selectedText,
  position,
  onHighlight,
  onClose,
}) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');

  const handleColorClick = (color) => {
    onHighlight({
      text: selectedText,
      color: color.name,
      note: note.trim(),
    });
    setNote('');
    setShowNote(false);
    onClose();
  };

  const handleOpenNote = () => {
    setShowNote(true);
  };

  const handleCancelNote = () => {
    setNote('');
    setShowNote(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50"
        style={{ left: position.x, top: position.y }}
      >
        {!showNote ? (
          <div className="flex items-center gap-1 rounded-xl bg-white dark:bg-dark-bg-50
                          border border-cream-200 dark:border-dark-bg-100 shadow-xl px-2 py-1.5">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorClick(color)}
                className={`w-7 h-7 rounded-lg ${color.bg} transition-all
                  hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 ${color.ring}
                  dark:opacity-90`}
                aria-label={`Subrayar en ${color.label}`}
              />
            ))}
            <div className="w-px h-5 bg-cream-200 dark:bg-dark-bg-100 mx-0.5" />
            <button
              onClick={handleOpenNote}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                         text-brown-100/60 dark:text-dark-text/50 hover:bg-cream-100
                         dark:hover:bg-dark-bg hover:text-brown dark:hover:text-dark-text
                         transition-colors"
              aria-label="Agregar nota"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                         text-brown-100/40 dark:text-dark-text/30 hover:bg-cream-100
                         dark:hover:bg-dark-bg hover:text-brown dark:hover:text-dark-text
                         transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-1.5 rounded-xl bg-white dark:bg-dark-bg-50
                          border border-cream-200 dark:border-dark-bg-100 shadow-xl p-2">
            <div className="flex flex-col gap-1">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota personal..."
                rows={2}
                className="w-44 rounded-lg border border-cream-200 dark:border-dark-bg-100
                           bg-cream-50 dark:bg-dark-bg p-2 text-xs text-brown
                           dark:text-dark-text placeholder:text-brown-100/40
                           dark:placeholder:text-dark-text/30 outline-none resize-none
                           focus:border-gold dark:focus:border-dark-accent"
                aria-label="Escribir nota"
              />
              <div className="flex items-center gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorClick(color)}
                    className={`w-6 h-6 rounded-md ${color.bg} transition-all
                      hover:scale-110 focus:outline-none focus:ring-2 ${color.ring}`}
                    aria-label={`Subrayar en ${color.label}`}
                  />
                ))}
                <button
                  onClick={handleCancelNote}
                  className="ml-auto w-6 h-6 flex items-center justify-center rounded-md
                             text-brown-100/40 dark:text-dark-text/30 hover:bg-cream-100
                             dark:hover:bg-dark-bg"
                  aria-label="Cancelar nota"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

export default HighlightToolbar;
