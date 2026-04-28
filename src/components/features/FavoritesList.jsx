import { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, BookOpen, Edit3, Check, X, MessageSquare } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';

const FavoriteItem = memo(function FavoriteItem({ favorite, onRemove, onNavigate, onSaveNote }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(favorite.note || '');

  const cleanText = (favorite.text || '').replace(/<[^>]*>/g, '').substring(0, 200);

  const handleSave = () => {
    onSaveNote(favorite.reference, note);
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-cream-200 bg-white/80 dark:border-dark-bg-100 
                 dark:bg-dark-bg-50/80 p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onNavigate(favorite)}
          className="text-left group flex-1"
        >
          <h4 className="font-serif text-sm font-semibold text-gold dark:text-dark-accent 
                         group-hover:underline">
            {favorite.reference}
          </h4>
          <p className="mt-1.5 text-sm text-brown-100 dark:text-dark-text/70 leading-relaxed line-clamp-3">
            "{cleanText}"
          </p>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-lg p-1.5 text-brown-100/50 hover:text-gold hover:bg-cream-100 
                       dark:text-dark-text/40 dark:hover:text-dark-accent dark:hover:bg-dark-bg"
            aria-label="Editar nota"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onRemove(favorite.reference)}
            className="rounded-lg p-1.5 text-brown-100/50 hover:text-red-500 hover:bg-red-50 
                       dark:text-dark-text/40 dark:hover:text-red-400 dark:hover:bg-red-900/20"
            aria-label="Eliminar de favoritos"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {favorite.note && !editing && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-brown-100/70 dark:text-dark-text/50">
          <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span className="italic">{favorite.note}</span>
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 overflow-hidden"
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Añade una nota personal..."
              rows={2}
              className="w-full rounded-lg border border-cream-200 bg-cream-50 p-2.5 text-xs 
                         text-brown placeholder:text-brown-100/40 outline-none resize-none
                         focus:border-gold dark:border-dark-bg-100 dark:bg-dark-bg 
                         dark:text-dark-text dark:placeholder:text-dark-text/30"
              aria-label="Nota personal"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setEditing(false); setNote(favorite.note || ''); }}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-brown-100/60 
                           hover:bg-cream-100 dark:hover:bg-dark-bg"
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default function FavoritesList() {
  const { favorites, removeFavorite, addNote } = useFavorites();
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (fav) => {
      const parts = fav.reference.split(' ');
      const chapterVerse = parts[parts.length - 1];
      const book = parts.slice(0, -1).join(' ').toLowerCase();
      const [chapter, verse] = chapterVerse.includes(':')
        ? chapterVerse.split(':')
        : [chapterVerse, null];
      const path = verse
        ? `/passage/${book}/${chapter}/${verse}`
        : `/passage/${book}/${chapter}`;
      navigate(path);
    },
    [navigate]
  );

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No tienes favoritos"
        description="Guarda tus versículos favoritos haciendo clic en el icono de corazón al leer un pasaje."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-brown-100/70 dark:text-dark-text/50 mb-4">
        {favorites.length} versículo{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
      </p>
      <AnimatePresence mode="popLayout">
        {favorites.map((fav) => (
          <FavoriteItem
            key={fav.reference}
            favorite={fav}
            onRemove={removeFavorite}
            onNavigate={handleNavigate}
            onSaveNote={addNote}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
