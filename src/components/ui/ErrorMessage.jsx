import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ErrorMessage({ message = 'Ha ocurrido un error', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900/20 p-3">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-brown dark:text-dark-text mb-2">
        Error
      </h3>
      <p className="text-brown-100 dark:text-dark-text/70 mb-6 max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-white 
                     font-medium transition-colors hover:bg-gold-400 focus:outline-none focus:ring-2 
                     focus:ring-gold focus:ring-offset-2 dark:focus:ring-offset-dark-bg"
          aria-label="Reintentar"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      )}
    </motion.div>
  );
}
