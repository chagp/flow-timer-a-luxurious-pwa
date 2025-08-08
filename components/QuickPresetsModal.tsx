import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickPresets from './QuickPresets';
import { CloseIcon, SparklesIcon } from './icons';
import { Settings } from '../types';

interface QuickPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (settings: Settings) => void;
}

const QuickPresetsModal: React.FC<QuickPresetsModalProps> = ({ isOpen, onClose, onApply }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-full max-w-lg bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2 text-light-text dark:text-dark-text font-semibold">
                <SparklesIcon className="w-5 h-5" /> Presets
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <QuickPresets onApply={(s) => { onApply(s); onClose(); }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickPresetsModal;


