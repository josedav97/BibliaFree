import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50 dark:border-dark-bg-100 dark:bg-dark-bg-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
            <span className="font-serif text-lg font-semibold text-brown dark:text-dark-text">
              Página Bíblica
            </span>
          </div>

          <p className="text-sm text-brown-100 dark:text-dark-text/50">
            &copy; {new Date().getFullYear()} Página Bíblica. La Palabra de Dios para todos.
          </p>

          <div className="flex items-center gap-1 text-xs text-brown-100 dark:text-dark-text/40">
            <span>Datos proporcionados por</span>
            <a
              href="https://bible-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Bible API
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
