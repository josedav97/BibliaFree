import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';
import ToastProvider from './components/ui/Toast';
import useBibleStore from './store/useBibleStore';
import SkeletonLoader from './components/ui/SkeletonLoader';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const PassagePage = lazy(() => import('./pages/PassagePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SkeletonLoader lines={6} />
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useBibleStore((state) => state.theme);
  const readingMode = useBibleStore((state) => state.readingMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        useBibleStore.getState().toggleTheme();
      }
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className={`min-h-screen flex flex-col transition-colors duration-300 
          ${theme === 'dark' ? 'dark' : ''}
          ${theme === 'light'
            ? 'bg-cream text-brown'
            : 'bg-dark-bg text-dark-text'
          }`}>
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className={`flex-1 transition-all duration-300 ${readingMode ? 'pt-0' : ''}`}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/passage/:book/:chapter/:verse?" element={<PassagePage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/notes" element={<NotesPage />} />
              </Routes>
            </Suspense>
          </main>

          {!readingMode && <Footer />}

          <ToastProvider />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
