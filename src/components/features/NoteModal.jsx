import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Trash2, ExternalLink, Share2, Check, Pin, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatBookName } from '../../services/bibleApi';
import toast from 'react-hot-toast';

const highlightBgFull = {
  yellow: 'bg-yellow-100/80 dark:bg-yellow-500/15',
  green: 'bg-green-100/80 dark:bg-green-500/15',
  blue: 'bg-blue-100/80 dark:bg-blue-400/15',
  pink: 'bg-pink-100/80 dark:bg-pink-400/15',
};

const highlightBorder = {
  yellow: 'border-l-yellow-400',
  green: 'border-l-green-400',
  blue: 'border-l-blue-400',
  pink: 'border-l-pink-400',
};

const months = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatDate(timestamp) {
  const d = new Date(timestamp);
  return `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function renderHighlightedVerse(verseText, highlightText, color) {
  if (!verseText || !highlightText || !verseText.includes(highlightText)) {
    return <span>{verseText}</span>;
  }

  const idx = verseText.indexOf(highlightText);
  return (
    <>
      {verseText.slice(0, idx)}
      <span className={`${highlightBgFull[color] || ''} rounded-sm`}>
        {highlightText}
      </span>
      {verseText.slice(idx + highlightText.length)}
    </>
  );
}

export default function NoteModal({ highlight, onClose, onRemove, onUpdateNote }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(highlight ? (highlight.note || '') : '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = useCallback(() => {
    onUpdateNote(highlight.id, noteText.trim());
    setEditing(false);
    toast.success('Nota actualizada');
  }, [highlight, noteText, onUpdateNote]);

  const handleCancel = useCallback(() => {
    setNoteText(highlight?.note || '');
    setEditing(false);
  }, [highlight]);

  const handleDelete = useCallback(() => {
    onRemove(highlight.id);
    toast.success('Nota eliminada');
    onClose();
  }, [highlight, onRemove, onClose]);

  const handleNavigate = useCallback(() => {
    navigate(`/passage/${highlight.book}/${highlight.chapter}/${highlight.verse}`);
  }, [highlight, navigate]);

  const handleShare = useCallback(() => {
    const ref = `${formatBookName(highlight.book)} ${highlight.chapter}:${highlight.verse}`;
    const text = `${ref}: "${highlight.verseText}" — Página Bíblica`;

    if (navigator.share) {
      navigator.share({ title: ref, text }).catch(() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          toast.success('Versículo copiado');
          setTimeout(() => setCopied(false), 2000);
        });
      });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        toast.success('Versículo copiado');
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [highlight]);

  if (!highlight) return null;

  const displayName = formatBookName(highlight.book);
  const reference = `${displayName} ${highlight.chapter}:${highlight.verse}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl
                   bg-white dark:bg-dark-bg-50 border border-cream-200 dark:border-dark-bg-100
                   shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={`Nota: ${reference}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-brown-100/40
                     dark:text-dark-text/30 hover:bg-cream-100 dark:hover:bg-dark-bg
                     hover:text-brown dark:hover:text-dark-text transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className={`rounded-t-2xl border-l-4 ${highlightBorder[highlight.color] || 'border-l-gold'} p-6 pb-4`}>
          <div className="flex items-center gap-2 mb-3 pr-8">
            <Pin className="h-4 w-4 text-gold dark:text-dark-accent flex-shrink-0" />
            <h2 className="font-serif text-lg font-bold text-brown dark:text-dark-text leading-tight">
              {reference}
            </h2>
          </div>

          <div className={`font-serif text-base md:text-lg leading-relaxed text-brown dark:text-dark-text
                           px-3 py-3 rounded-xl ${highlightBgFull[highlight.color] || 'bg-cream-50 dark:bg-dark-bg/50'}
                           border border-cream-200/50 dark:border-dark-bg-100/50`}>
            {renderHighlightedVerse(highlight.verseText, highlight.text, highlight.color)}
          </div>

          <span className="text-[10px] text-brown-100/50 dark:text-dark-text/30 mt-2 block">
            {formatDate(highlight.createdAt)}
          </span>
        </div>

        <div className="px-6 pb-2">
          {editing ? (
            <div className="flex flex-col gap-2 pt-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-cream-200 dark:border-dark-bg-100
                           bg-cream-50 dark:bg-dark-bg p-3 text-sm text-brown
                           dark:text-dark-text placeholder:text-brown-100/40
                           dark:placeholder:text-dark-text/30 outline-none resize-none
                           focus:border-gold dark:focus:border-dark-accent font-sans"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs
                             text-brown-100/60 hover:bg-cream-100 dark:hover:bg-dark-bg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 rounded-lg bg-gold px-3 py-1.5 text-xs
                             text-white hover:bg-gold-400 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  Guardar
                </button>
              </div>
            </div>
          ) : highlight.note ? (
            <div className="flex items-start gap-2 py-3">
              <Pin className="h-3.5 w-3.5 text-gold dark:text-dark-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brown-100 dark:text-dark-text/70 font-sans leading-relaxed italic">
                {highlight.note}
              </p>
            </div>
          ) : null}
        </div>

        <div className="px-6 pb-6 pt-2 border-t border-cream-100 dark:border-dark-bg-100">
          {confirmDelete ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>¿Eliminar esta nota y subrayado?</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs
                             text-brown-100/60 hover:bg-cream-100 dark:hover:bg-dark-bg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs
                             text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => {
                  setNoteText(highlight.note || '');
                  setEditing(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                           transition-all bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200
                           dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60"
                aria-label="Editar nota"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Editar
              </button>

              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                           transition-all bg-cream-100 dark:bg-dark-bg-100 hover:bg-red-50
                           dark:hover:bg-red-900/20 text-brown-100 dark:text-dark-text/60
                           hover:text-red-500 dark:hover:text-red-400"
                aria-label="Eliminar nota"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>

              <button
                onClick={handleNavigate}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                           transition-all bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200
                           dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60"
                aria-label="Ir al versículo"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ir al versículo
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                           transition-all bg-cream-100 dark:bg-dark-bg-100 hover:bg-cream-200
                           dark:hover:bg-dark-bg text-brown-100 dark:text-dark-text/60"
                aria-label="Compartir versículo"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
                {copied ? 'Copiado' : 'Compartir'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
