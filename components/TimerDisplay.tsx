
import React from 'react';
import { motion } from 'framer-motion';

interface TimerDisplayProps {
  timeRemaining: number;
  totalDuration: number;
  label: string;
  mode: 'work' | 'break';
  theme: 'light' | 'dark';
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
};

const STROKE_WIDTH = 18;
const RADIUS = 150 - STROKE_WIDTH / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeRemaining, totalDuration, label, mode, theme }) => {
  // Calculate progress and angle directly on each render.
  const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0;
  const angle = progress * 360;
  const circumference = CIRCUMFERENCE;
  const dashOffset = circumference * (1 - progress);
  // Theme-based colors
  const trackColor = theme === 'dark' ? '#1F2937' : '#F3F4F6';
  const strokeColor = theme === 'dark'
    ? (mode === 'work' ? '#63e6be' : '#546E7A')
    : (mode === 'work' ? '#0b5ed7' : '#CBD5E1');
  // Breathing effect during break
  const breathingProps = mode === 'break'
    ? { animate: { scale: [1, 1.02, 1] }, transition: { duration: 2, ease: 'easeInOut', repeat: Infinity } }
    : {};
  
  return (
    <motion.div {...breathingProps} className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 300 300">
        {/* Background track */}
        <circle
          cx="150"
          cy="150"
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          stroke={trackColor}
          opacity={0.4}
          fill="transparent"
        />
        {/* Animated progress fill */}
        <motion.circle
          cx="150"
          cy="150"
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          stroke={strokeColor}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 150 150)"
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
        />
        {/* Rotating dot indicator group */}
        <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: angle - 90 }}
            // Ensure the animation is linear and matches our timer's update interval.
            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
            style={{
              transformOrigin: '150px 150px',
              transformBox: 'view-box',
            }}
        >
            <circle
                // Place the dot at 3 o'clock (0 degrees on a standard plane).
                // The parent SVG's -90deg rotation places this at the top (12 o'clock).
                cx={150 + RADIUS}
                cy="150"
                r={STROKE_WIDTH / 2}
                className="fill-light-text dark:fill-dark-text"
            />
        </motion.g>
      </svg>
      <div className="z-10 flex flex-col items-center">
        <span className="font-mono text-5xl sm:text-7xl font-bold tracking-tighter text-light-text dark:text-dark-text">
          {formatTime(timeRemaining)}
        </span>
        <span className="text-[1.7rem] sm:text-[2.1rem] font-bold tracking-wider uppercase mt-4 text-light-text/90 dark:text-dark-text/90">
          {label}
        </span>
      </div>
    </motion.div>
  );
};

export default TimerDisplay;
