import React from 'react';
import { motion } from 'framer-motion';
import { HistoryEntry } from '../types';
import { CloseIcon, TrashIcon } from './icons';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onClearHistory }) => {
  if (!isOpen) return null;

  const handleClearHistory = () => {
    onClearHistory();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex items-center justify-between border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Session History</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg">
            <CloseIcon className="w-6 h-6 text-light-text dark:text-dark-text" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length > 0 ? (
            <ul className="space-y-3">
              {history.map((entry) => (
                <li key={entry.id} className="p-3 bg-light-subtle-bg dark:bg-dark-subtle-bg rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-light-text dark:text-dark-text">{entry.label}</p>
                    <p className="text-sm text-light-text/70 dark:text-dark-text/70">{entry.date}</p>
                  </div>
                  <span className="font-mono text-lg text-light-text dark:text-dark-text">{formatDuration(entry.duration)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-light-text/70 dark:text-dark-text/70 py-8">No sessions completed yet.</p>
          )}
        </div>

        {history.length > 0 && (
          <footer className="p-4 border-t border-light-border dark:border-dark-border">
            <button
              onClick={handleClearHistory}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <TrashIcon className="w-4 h-4" /> Clear History
            </button>
          </footer>
        )}
      </motion.div>
    </motion.div>
  );
};

export default HistoryModal;
