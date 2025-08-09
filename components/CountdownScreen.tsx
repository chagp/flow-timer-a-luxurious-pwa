import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playCue, playCountdownTick } from '../utils/soundManager';

interface CountdownScreenProps {
  countdownSeconds: number;
  onComplete: () => void;
  onCancel: () => void;
}

const CountdownScreen: React.FC<CountdownScreenProps> = ({ 
  countdownSeconds, 
  onComplete, 
  onCancel 
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (countdownSeconds === 0) {
      onComplete();
      return;
    }

    setTimeLeft(countdownSeconds);
    const start = Date.now();
    let lastAnnounced = -1;
    let completed = false;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, countdownSeconds - elapsed);
      setTimeLeft(prev => (prev !== remaining ? remaining : prev));
      // Play exactly once per remaining second
      if (remaining > 0 && remaining <= 3 && remaining !== lastAnnounced) {
        lastAnnounced = remaining;
        playCountdownTick(remaining);
      }
      if (!completed && remaining <= 0) {
        completed = true;
        // distinct start tone
        playCue('workStart');
        onComplete();
      }
    };
    // Use rAF to drive updates smoothly, stop after completion
    let rafId = 0;
    const loop = () => { tick(); if (!completed) rafId = window.requestAnimationFrame(loop); };
    rafId = window.requestAnimationFrame(loop);
    // Initial tick to avoid waiting for first interval
    tick();
    return () => { completed = true; window.cancelAnimationFrame(rafId); };
  }, [countdownSeconds, onComplete]);

  // Render even when 0 to keep hook order stable; but immediately signal complete
  if (countdownSeconds === 0) {
    useEffect(() => { onComplete(); }, [onComplete]);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background:
          'radial-gradient(120% 120% at 50% 20%, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.08) 30%, rgba(0,0,0,0) 70%)',
      }}
    >
      <button
        onClick={onCancel}
        className="absolute top-8 right-8 text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text text-lg"
      >
        Cancel
      </button>

      <div className="text-center">
        <div className="text-lg text-light-text/60 dark:text-dark-text/60 mb-4">
          Get Ready!
        </div>
        
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-9xl font-bold mb-8"
          style={{
            color: 'white',
            textShadow: '0 2px 12px rgba(0,0,0,0.4)'
          }}
        >
          {timeLeft}
        </motion.div>

        <div className="text-lg text-light-text/80 dark:text-dark-text/80">
          Starting in {timeLeft} second{timeLeft !== 1 ? 's' : ''}...
        </div>
      </div>
      {/* Animated overlay from red to green as countdown approaches 0 */}
      <motion.div
        key={`bg-${timeLeft}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            timeLeft > 2
              ? 'radial-gradient(120% 120% at 50% 20%, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.10) 40%, rgba(0,0,0,0) 70%)'
              : 'radial-gradient(120% 120% at 50% 20%, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.10) 40%, rgba(0,0,0,0) 70%)',
        }}
      />
    </motion.div>
  );
};

export default CountdownScreen;