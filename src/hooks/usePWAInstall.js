import { useState, useEffect, useCallback } from 'react';
import { Download, Share2, Check } from 'lucide-react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('pwa-installed')) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const onInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setInstalled(true);
      setAvailable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'La Biblia',
            text: 'Explora las Sagradas Escrituras en esta app',
            url: window.location.href,
          });
        } catch {}
      }
      return;
    }
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
      setInstalled(true);
      setAvailable(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const label = installed ? 'Instalada' : available ? 'Instalar' : 'Compartir';
  const Icon = installed ? Check : available ? Download : Share2;

  return { install, available, installed, label, Icon };
}
