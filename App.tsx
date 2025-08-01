import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTimer } from './hooks/useTimer';
import { useSound } from './hooks/useSound';
import { Settings, HistoryEntry, Theme, TimerMode } from './types';
import { DEFAULT_SETTINGS, SOUNDS } from './constants';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import ConfigurationScreen from './components/ConfigurationScreen';
import CountdownScreen from './components/CountdownScreen';
import ThemeToggle from './components/ThemeToggle';
import SessionCounter from './components/SessionCounter';
import { SettingsIcon } from './components/icons';

const formatWorkTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

const formatRealTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(String(hours).padStart(2, '0'));
    parts.push(String(minutes).padStart(2, '0'));
    parts.push(String(seconds).padStart(2, '0'));
    
    return parts.join(':');
};

const App: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<Settings>('flow-timer-settings', DEFAULT_SETTINGS);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('flow-timer-history', []);
  const [theme, setTheme] = useLocalStorage<Theme>('flow-timer-theme', 'dark');
  const [showConfig, setShowConfig] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<Settings | null>(null);
  
  const playStartSound = useSound(SOUNDS.start);
  const playEndSound = useSound(SOUNDS.end);
  const playCompleteSound = useSound(SOUNDS.complete);

  const handleSessionEnd = useCallback((entry: HistoryEntry) => {
    setHistory(prev => [entry, ...prev]);
  }, [setHistory]);

  const handleSound = useCallback((sound: 'start' | 'end' | 'complete') => {
    if (sound === 'start') playStartSound();
    if (sound === 'end') playEndSound();
    if (sound === 'complete') playCompleteSound();
  }, [playStartSound, playEndSound, playCompleteSound]);

  const [timerState, timerActions] = useTimer(settings, handleSessionEnd, handleSound);
  // Determine session mode for display
  const mode: 'work' | 'break' = (settings.mode === TimerMode.Simple && timerState.currentLabel === settings.simple.workLabel)
    ? 'work' : 'break';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const clearHistory = () => {
      setHistory([]);
  }

  if (showCountdown && pendingSettings) {
    return (
      <CountdownScreen
        countdownSeconds={pendingSettings.countdown}
        onComplete={() => {
          setSettings(pendingSettings!);
          setShowCountdown(false);
          setPendingSettings(null);
          // Use multiple approaches for mobile compatibility
          requestAnimationFrame(() => {
            timerActions.resetSequence();
            requestAnimationFrame(() => {
              // Force timer to start with explicit state check
              timerActions.play();
              console.log('Timer play() called after countdown');
              
              // Double-check after a short delay for mobile
              setTimeout(() => {
                console.log('Double-checking timer state on mobile...');
                if (!timerState.isActive && timerState.timeRemaining > 0) {
                  console.log('Timer not active, forcing play again');
                  timerActions.play();
                }
              }, 100);
            });
          });
        }}
        onCancel={() => {
          setShowCountdown(false);
          setPendingSettings(null);
          setShowConfig(true);
        }}
      />
    );
  }

  if (showConfig) {
    return (
      <ConfigurationScreen
        onStart={(newSettings) => {
          setShowConfig(false);
          setPendingSettings(newSettings);
          setShowCountdown(true);
        }}
        history={history}
        onClearHistory={clearHistory}
      />
    );
  }
  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen p-4 font-sans text-light-text dark:text-dark-text transition-colors duration-500`}>  
      <div className="absolute top-10 left-4 right-4 flex justify-between items-center">
        <motion.button
            onClick={() => setShowConfig(true)}
            className="p-2 rounded-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open Settings"
        >
            <SettingsIcon className="w-6 h-6" />
        </motion.button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      
      <main className="flex flex-col items-center justify-center w-full max-w-md mx-auto text-center gap-8">
        <TimerDisplay 
            timeRemaining={timerState.timeRemaining}
            totalDuration={timerState.totalDuration}
            label={timerState.isFinished ? 'DONE!' : timerState.currentLabel}
            mode={mode}
            theme={theme}
        />
        
        <Controls 
            isActive={timerState.isActive}
            isFinished={timerState.isFinished}
            play={timerActions.play}
            pause={timerActions.pause}
            reset={timerActions.reset}
            skip={timerActions.skip}
        />

        <SessionCounter 
          current={timerState.currentSet}
          total={timerState.totalSets}
          isFinished={timerState.isFinished}
        />
      </main>

      <div className="absolute bottom-10 left-4 right-4 flex justify-between items-center font-mono text-base sm:text-lg text-light-text dark:text-dark-text">
        <span>Work: {formatWorkTime(timerState.totalWorkTime)}</span>
        <span>Total: {formatRealTime(timerState.realTimeElapsed)}</span>
      </div>

      {/* Configuration screen replaces SettingsModal */}
    </div>
  );
};

export default App;
