import { motion } from 'framer-motion';

export default function SkeletonLoader({ type = 'text', lines = 4 }) {
  if (type === 'card') {
    return (
      <div className="animate-pulse rounded-xl bg-white/50 dark:bg-dark-bg-50 p-6 shadow-md">
        <div className="h-5 bg-cream-200 dark:bg-dark-bg-100 rounded w-2/3 mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-cream-200 dark:bg-dark-bg-100 rounded w-full" />
          <div className="h-3 bg-cream-200 dark:bg-dark-bg-100 rounded w-5/6" />
          <div className="h-3 bg-cream-200 dark:bg-dark-bg-100 rounded w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="animate-pulse space-y-3 p-4"
    >
      <div className="h-4 bg-cream-200 dark:bg-dark-bg-100 rounded w-1/3 mb-6" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-cream-200 dark:bg-dark-bg-100 rounded"
          style={{ width: `${85 - i * 8}%` }}
        />
      ))}
    </motion.div>
  );
}
