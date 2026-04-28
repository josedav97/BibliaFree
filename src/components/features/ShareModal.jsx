import { memo } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { getShareText } from '../../services/bibleApi';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ShareModal = memo(function ShareModal({ reference, text, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareText = getShareText(reference, text);
  const encodedText = encodeURIComponent(shareText);
  const encodedRef = encodeURIComponent(reference);

  const shareLinks = [
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(`${reference}: ${text}`)}`,
      color: 'bg-green-500 hover:bg-green-600',
      icon: '💬',
    },
    {
      name: 'Twitter / X',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
      color: 'bg-stone-800 hover:bg-stone-900',
      icon: '𝕏',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: 'f',
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`,
      color: 'bg-sky-500 hover:bg-sky-600',
      icon: '✈',
    },
  ];

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/passage/${encodeURIComponent(reference.toLowerCase().replace(/\s/g, '+'))}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true);
      toast.success('Enlace copiado');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-dark-bg-50 
                   border border-cream-200 dark:border-dark-bg-100 shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Compartir versículo"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-brown dark:text-dark-text">
            Compartir
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-brown-100/50 hover:bg-cream-100 
                       dark:hover:bg-dark-bg dark:text-dark-text/40"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-brown-100 dark:text-dark-text/60 mb-4">
          {reference}
        </p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-white transition-colors ${link.color}`}
              aria-label={`Compartir en ${link.name}`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.name}</span>
            </a>
          ))}
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-cream-200 
                     dark:border-dark-bg-100 py-2.5 text-sm font-medium text-brown-100 
                     dark:text-dark-text/60 hover:bg-cream-50 dark:hover:bg-dark-bg transition-colors"
          aria-label="Copiar enlace"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </button>
      </motion.div>
    </motion.div>
  );
});

export default ShareModal;
