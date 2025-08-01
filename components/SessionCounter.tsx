import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionCounterProps {
  current: number;
  total: number;
  isFinished: boolean;
}

const SessionCounter: React.FC<SessionCounterProps> = ({ current, total, isFinished }) => {
  return (
    <div className="h-10 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isFinished && (
          <motion.div
            key={`${current}-${total}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 text-lg font-medium text-light-text/80 dark:text-dark-text/80"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-light-accent dark:bg-dark-accent text-white dark:text-dark-bg font-bold">
              <span>{current}</span>
            </div>
            <span className="opacity-70">/</span>
            <span className="opacity-70">{total}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionCounter;
