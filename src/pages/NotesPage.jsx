import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trash2, Edit3, Check, X, MessageSquare, Pin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHighlights } from '../hooks/useHighlights';
import { formatBookName } from '../services/bibleApi';
import EmptyState from '../components/ui/EmptyState';
import NoteModal from '../components/features/NoteModal';

const highlightBorder = {
  yellow: 'border-l-yellow-400',
  green: 'border-l-green-400',
  blue: 'border-l-blue-400',
  pink: 'border-l-pink-400',
};

const highlightBgLight = {
  yellow: 'bg-yellow-50',
  green: 'bg-green-50',
  blue: 'bg-blue-50',
  pink: 'bg-pink-50',
};

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
  return `Hace ${Math.floor(seconds / 86400)} d`;
}

const NoteItem = memo(function NoteItem({ highlight, onRemove, onUpdateNote, onClick }) {
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(highlight.note || '');
  const navigate = useNavigate();

  const handleSave = () => {
    onUpdateNote(highlight.id, noteText.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setNoteText(highlight.note || '');
    setEditing(false);
  };

  const handleNavigate = () => {
    navigate(`/passage/${highlight.book}/${highlight.chapter}/${highlight.verse}`);
  };

  const displayName = formatBookName(highlight.book);
  const reference = `${displayName} ${highlight.chapter}:${highlight.verse}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={() => onClick?.(highlight)}
      className={`rounded-xl border border-cream-200 dark:border-dark-bg-100 
        bg-white/80 dark:bg-dark-bg-50/80 border-l-4 ${highlightBorder[highlight.color] || 'border-l-gold'}
        ${highlightBgLight[highlight.color] || ''} dark:bg-dark-bg-50/80 overflow-hidden
        cursor-pointer hover:shadow-md transition-shadow`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <button onClick={(e) => { e.stopPropagation(); handleNavigate(); }} className="text-left group">
              <h4 className="font-serif text-sm font-semibold text-gold dark:text-dark-accent 
                             group-hover:underline">
                {reference}
              </h4>
            </button>
            <p className="mt-1.5 font-serif text-sm text-brown dark:text-dark-text leading-relaxed italic px-2 py-1 rounded
                          bg-cream-50 dark:bg-dark-bg/50 border-l-2 border-gold/30 dark:border-dark-accent/30">
              "{highlight.text}"
            </p>
            {(highlight.note || editing) && (
              <div className="mt-2">
                {editing ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-cream-200 dark:border-dark-bg-100 
                                 bg-cream-50 dark:bg-dark-bg p-2 text-xs text-brown 
                                 dark:text-dark-text outline-none resize-none
                                 focus:border-gold dark:focus:border-dark-accent font-sans"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs 
                                   text-brown-100/60 hover:bg-cream-100 dark:hover:bg-dark-bg"
                      >
                        <X className="h-3 w-3" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-1 rounded-lg bg-gold px-2.5 py-1 text-xs 
                                   text-white hover:bg-gold-400 transition-colors"
                      >
                        <Check className="h-3 w-3" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5">
                    <Pin className="h-3 w-3 text-gold dark:text-dark-accent flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-brown-100 dark:text-dark-text/70 font-sans leading-relaxed">
                      {highlight.note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-brown-100/50 hover:text-gold hover:bg-cream-100 
                         dark:text-dark-text/40 dark:hover:text-dark-accent dark:hover:bg-dark-bg"
              aria-label="Editar nota"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onRemove(highlight.id)}
              className="rounded-lg p-1.5 text-brown-100/50 hover:text-red-500 hover:bg-red-50 
                         dark:text-dark-text/40 dark:hover:text-red-400 dark:hover:bg-red-900/20"
              aria-label="Eliminar nota"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-brown-100/40 dark:text-dark-text/30">
            {timeAgo(highlight.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default function NotesPage() {
  const { groupHighlightsByBook, removeHighlight, updateHighlightNote } = useHighlights();
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const grouped = useMemo(() => groupHighlightsByBook(), [groupHighlightsByBook]);
  const bookNames = useMemo(() => Object.keys(grouped).sort(), [grouped]);
  const totalCount = useMemo(
    () => Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0),
    [grouped]
  );

  if (totalCount === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <EmptyState
          icon={Pin}
          title="Sin notas ni subrayados"
          description="Selecciona texto en un versículo para subrayarlo o agregarle una nota personal."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Pin className="h-7 w-7 text-gold dark:text-dark-accent" />
          <h1 className="font-serif text-3xl font-bold text-brown dark:text-dark-text">
            Mis Notas
          </h1>
        </div>
        <p className="text-brown-100 dark:text-dark-text/60">
          {totalCount} nota{totalCount !== 1 ? 's' : ''} y subrayado{totalCount !== 1 ? 's' : ''} guardado{totalCount !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {bookNames.map((book) => {
        const items = grouped[book];
        const displayName = formatBookName(book);
        return (
          <motion.div
            key={book}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gold dark:text-dark-accent" />
              <h2 className="font-serif text-lg font-semibold text-brown dark:text-dark-text">
                {displayName}
              </h2>
              <span className="text-xs text-brown-100/50 dark:text-dark-text/40">
                ({items.length})
              </span>
            </div>
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <NoteItem
                  key={item.id}
                  highlight={item}
                  onRemove={removeHighlight}
                  onUpdateNote={updateHighlightNote}
                  onClick={setSelectedHighlight}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {selectedHighlight && (
          <NoteModal
            highlight={selectedHighlight}
            onClose={() => setSelectedHighlight(null)}
            onRemove={removeHighlight}
            onUpdateNote={updateHighlightNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
