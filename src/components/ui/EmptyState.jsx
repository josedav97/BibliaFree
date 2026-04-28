import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'No hay contenido',
  description = 'Selecciona un libro y capítulo para comenzar a leer.',
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="mb-6 rounded-full bg-gold-50 dark:bg-dark-bg-50 p-5">
        <Icon className="h-12 w-12 text-gold dark:text-dark-accent" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-brown dark:text-dark-text mb-3">
        {title}
      </h3>
      <p className="text-brown-100 dark:text-dark-text/60 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
