import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--color-cream)',
          color: 'var(--color-brown)',
          border: '1px solid var(--color-gold-100)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-gold)',
            secondary: 'var(--color-cream)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

export { Toaster };
