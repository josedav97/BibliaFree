import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, Heart, Pin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function MobileNav({ isOpen, onClose }) {
  const location = useLocation();
  const pwa = usePWAInstall();

  const links = [
    { to: '/', label: 'Inicio', icon: BookOpen },
    { to: '/search', label: 'Buscar', icon: Search },
    { to: '/favorites', label: 'Favoritos', icon: Heart },
    { to: '/notes', label: 'Notas', icon: Pin },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-cream dark:bg-dark-bg 
                       border-r border-cream-200 dark:border-dark-bg-100 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="flex items-center justify-between p-4 border-b border-cream-200 dark:border-dark-bg-100">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-gold" />
                <span className="font-serif text-lg font-bold text-brown dark:text-dark-text">
                  Página Bíblica
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-brown-100 hover:bg-cream-200 
                           dark:text-dark-text/60 dark:hover:bg-dark-bg-50"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-4" role="navigation" aria-label="Menú móvil">
              {links.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 mb-1 text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-gold-50 text-gold dark:bg-dark-accent/10 dark:text-dark-accent'
                        : 'text-brown-100 hover:bg-cream-200 dark:text-dark-text/60 dark:hover:bg-dark-bg-50'
                      }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                );
              })}

              <button
                onClick={pwa.install}
                className="flex items-center gap-3 rounded-lg px-4 py-3 mb-1 w-full text-sm font-medium 
                           transition-colors text-brown-100 hover:bg-cream-200 
                           dark:text-dark-text/60 dark:hover:bg-dark-bg-50 text-left"
                aria-label={pwa.label}
              >
                <pwa.Icon className="h-5 w-5" />
                {pwa.installed ? 'App instalada ✓' : pwa.available ? 'Instalar app' : 'Compartir app'}
              </button>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-cream-200 dark:border-dark-bg-100 p-4">
              <p className="text-xs text-brown-100 dark:text-dark-text/40 text-center">
                Que la Palabra de Dios habite en abundancia en vosotros.
              </p>
              <p className="text-xs text-brown-100/60 dark:text-dark-text/30 text-center mt-1">
                Colosenses 3:16
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
