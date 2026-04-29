import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installed = localStorage.getItem('pwa-installed');
    if (installed) setShowButton(false);

    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa-installed', 'true');
      setShowButton(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
      setShowButton(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setShowButton(false);
  }, []);

  if (!showButton || dismissed) return null;

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="flex items-center gap-2 rounded-xl bg-dark-bg-50 border border-gold/30
                          shadow-2xl px-4 py-3 backdrop-blur-md">
            <button
              onClick={handleInstall}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm
                         font-medium text-dark-bg hover:bg-gold-300 transition-colors"
              aria-label="Instalar aplicación"
            >
              <Download className="h-4 w-4" />
              Instalar app
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg p-1.5 text-dark-text/40 hover:text-dark-text/70 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
