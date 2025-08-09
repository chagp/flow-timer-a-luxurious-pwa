import React, { useState, useEffect, useRef } from 'react';
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
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (countdownSeconds === 0) {
      onCompleteRef.current();
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
        onCompleteRef.current();
      }
    };
    // Use rAF to drive updates smoothly, stop after completion.
    // Guard visibility: if the page is hidden, fall back to setInterval to avoid rAF throttling.
    let rafId = 0;
    let intervalId: number | null = null;
    const useInterval = () => {
      if (intervalId) window.clearInterval(intervalId);
      intervalId = window.setInterval(() => { tick(); if (completed && intervalId) { window.clearInterval(intervalId); intervalId = null; } }, 250);
    };
    const loop = () => { tick(); if (!completed) rafId = window.requestAnimationFrame(loop); };
    const handleVis = () => {
      if (document.hidden) {
        if (rafId) { window.cancelAnimationFrame(rafId); rafId = 0; }
        useInterval();
      } else {
        if (intervalId) { window.clearInterval(intervalId); intervalId = null; }
        rafId = window.requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    handleVis();
    // Initial tick to avoid waiting for first interval
    tick();
    return () => {
      completed = true;
      document.removeEventListener('visibilitychange', handleVis);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [countdownSeconds]);

  // App only renders this when countdownSeconds > 0, so keep hooks stable here

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