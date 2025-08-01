
import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, ResetIcon, SkipIcon } from './icons';

interface ControlsProps {
  isActive: boolean;
  isFinished: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; ariaLabel: string; className?: string }> = ({ onClick, children, ariaLabel, className = '' }) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        aria-label={ariaLabel}
        className={`flex items-center justify-center rounded-full shadow-lg transition-all ${className}`}
    >
        {children}
    </motion.button>
);


const Controls: React.FC<ControlsProps> = ({ isActive, isFinished, play, pause, reset, skip }) => {
  return (
    <div className="flex justify-center items-center gap-8 w-full">
      {/* Secondary control: Reset */}
      <ControlButton
        onClick={reset}
        ariaLabel="Reset current session"
        className="w-16 h-16 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg text-light-text dark:text-dark-text"
      >
        <ResetIcon className="w-8 h-8" />
      </ControlButton>

      {/* Primary control: Play/Pause/Restart */}
      <ControlButton
        onClick={isActive ? pause : play}
        ariaLabel={isActive ? "Pause timer" : isFinished ? "Restart sequence" : "Play timer"}
        className="w-20 h-20 bg-light-accent text-white hover:bg-light-accent-hover dark:bg-dark-accent dark:text-dark-bg dark:hover:bg-dark-accent-hover"
      >
        {isFinished ? <ResetIcon className="w-10 h-10" /> : (isActive ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>)}
      </ControlButton>

      {/* Secondary control: Skip */}
      <ControlButton
        onClick={skip}
        ariaLabel="Skip to next session"
        className="w-16 h-16 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg text-light-text dark:text-dark-text"
      >
        <SkipIcon className="w-8 h-8" />
      </ControlButton>
    </div>
  );
};

export default Controls;