import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, Heart, Menu, Type, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useBibleStore from '../../store/useBibleStore';
import { useState, useEffect, useRef } from 'react';

const fontSizeLabels = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };

export default function Header({ onToggleSidebar }) {
  const { fontSize, setFontSize, readingMode } = useBibleStore();
  const location = useLocation();
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const fontRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (fontRef.current && !fontRef.current.contains(e.target)) {
        setFontMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (readingMode) return null;

  const navLinks = [
    { to: '/', label: 'Inicio', icon: BookOpen },
    { to: '/search', label: 'Buscar', icon: Search },
    { to: '/favorites', label: 'Favoritos', icon: Heart },
    { to: '/notes', label: 'Notas', icon: Pin },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream/90 backdrop-blur-md 
                       dark:border-dark-bg-100 dark:bg-dark-bg/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-brown-100 transition-colors hover:bg-cream-200 
                       dark:text-dark-text/60 dark:hover:bg-dark-bg-50 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 group" aria-label="Ir al inicio">
            <BookOpen className="h-7 w-7 text-gold transition-transform group-hover:scale-110" />
            <span className="font-serif text-xl font-bold text-brown dark:text-dark-text hidden sm:block">
              Página Bíblica
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Navegación principal">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-gold'
                    : 'text-brown-100 hover:text-brown hover:bg-cream-200 dark:text-dark-text/60 dark:hover:text-dark-text dark:hover:bg-dark-bg-50'
                  }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <div className="relative" ref={fontRef}>
            <button
              onClick={() => setFontMenuOpen(!fontMenuOpen)}
              className="rounded-lg p-2 text-brown-100 transition-colors hover:bg-cream-200 
                         dark:text-dark-text/60 dark:hover:bg-dark-bg-50"
              aria-label="Cambiar tamaño de fuente"
              aria-expanded={fontMenuOpen}
              aria-haspopup="true"
            >
              <Type className="h-5 w-5" />
            </button>

            <AnimatePresence>
              {fontMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-dark-bg-50 
                             border border-cream-200 dark:border-dark-bg-100 shadow-lg py-2"
                  role="menu"
                >
                  {Object.entries(fontSizeLabels).map(([size, label]) => (
                    <button
                      key={size}
                      onClick={() => { setFontSize(size); setFontMenuOpen(false); }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors
                        hover:bg-cream-100 dark:hover:bg-dark-bg ${fontSize === size ? 'text-gold font-semibold' : 'text-brown-100 dark:text-dark-text/60'}`}
                      role="menuitem"
                    >
                      {label}
                      {fontSize === size && <span className="text-gold text-xs">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
