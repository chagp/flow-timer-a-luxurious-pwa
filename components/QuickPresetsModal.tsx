import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickPresets from './QuickPresets';
import { CloseIcon, SparklesIcon } from './icons';
import { Settings, TimerMode } from '../types';

interface QuickPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (settings: Settings, meta: { title: string; subtitle?: string }) => void;
  onStartPreset?: (settings: Settings, meta: { title: string; subtitle?: string }) => void;
}

const QuickPresetsModal: React.FC<QuickPresetsModalProps> = ({ isOpen, onClose, onApply, onStartPreset }) => {
  const [selected, setSelected] = useState<null | { settings: Settings; meta: { title: string; subtitle?: string } }>(null);

  const totalTime = useMemo(() => {
    if (!selected) return '';
    const s = selected.settings;
    let totalSeconds = 0;
    if (s.mode === TimerMode.Simple) {
      totalSeconds = (s.simple.workTime + s.simple.breakTime) * s.simple.sets;
    } else {
      const sum = s.advanced.intervals.reduce((acc, i) => acc + i.duration, 0);
      totalSeconds = sum * s.advanced.rounds;
    }
    const m = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, [selected]);

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
                <SparklesIcon className="w-5 h-5" /> {selected ? 'Preset Details' : 'Presets'}
              </div>
              <button onClick={() => (selected ? setSelected(null) : onClose())} className="p-2 rounded-lg hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {!selected ? (
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <QuickPresets onApply={(s, meta) => setSelected({ settings: s, meta })} />
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xl font-bold text-light-text dark:text-dark-text">{selected.meta.title}</div>
                  {selected.meta.subtitle && <div className="text-sm text-light-text/70 dark:text-dark-text/70">{selected.meta.subtitle}</div>}
                </div>
                <div className="text-sm text-light-text/70 dark:text-dark-text/70">
                  Total Time: <span className="font-mono text-light-text dark:text-dark-text">{totalTime}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onApply(selected.settings, selected.meta);
                      onClose();
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg"
                  >
                    Edit First
                  </button>
                  <button
                    onClick={() => {
                      const startSettings: Settings = { ...selected.settings, countdown: 10 };
                      onStartPreset?.(startSettings, selected.meta);
                      onClose();
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:bg-light-accent-hover dark:hover:bg-dark-accent-hover"
                  >
                    Let’s GO (10s)
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickPresetsModal;


