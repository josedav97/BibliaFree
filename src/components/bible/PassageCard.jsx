import { memo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const PassageCard = memo(function PassageCard({ reference, text, book, chapter, onClick }) {
  const cleanText = text?.replace(/<[^>]*>/g, '') || '';
  const snippet = cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left group rounded-2xl border border-cream-200 
                 bg-white/80 dark:border-dark-bg-100 dark:bg-dark-bg-50/80 
                 p-5 shadow-sm transition-all duration-200 hover:shadow-md
                 hover:border-gold/30 dark:hover:border-dark-accent/30"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 rounded-lg bg-gold-50 dark:bg-dark-accent/10 p-2 
                        group-hover:bg-gold-100 dark:group-hover:bg-dark-accent/20 transition-colors">
          <BookOpen className="h-5 w-5 text-gold dark:text-dark-accent" />
        </div>
        <div>
          <h4 className="font-serif text-base font-semibold text-brown dark:text-dark-text 
                         group-hover:text-gold dark:group-hover:text-dark-accent transition-colors">
            {reference}
          </h4>
        </div>
      </div>

      <p className="font-serif text-sm text-brown-100 dark:text-dark-text/70 leading-relaxed">
        {snippet}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-brown-100/50 dark:text-dark-text/40">
          {book?.name || ''}
        </span>
        <span className="text-xs text-gold opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          Leer →
        </span>
      </div>
    </motion.button>
  );
});

export default PassageCard;
