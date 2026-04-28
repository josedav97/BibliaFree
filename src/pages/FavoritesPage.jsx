import { motion } from 'framer-motion';
import { Heart, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FavoritesList from '../components/features/FavoritesList';

export default function FavoritesPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-7 w-7 text-gold dark:text-dark-accent" />
          <h1 className="font-serif text-3xl font-bold text-brown dark:text-dark-text">
            Mis Favoritos
          </h1>
        </div>
        <p className="text-brown-100 dark:text-dark-text/60">
          Tus versículos guardados con notas personales.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FavoritesList />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center pt-4"
      >
      </motion.div>
    </div>
  );
}
