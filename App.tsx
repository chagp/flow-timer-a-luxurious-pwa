import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTimer } from './hooks/useTimer';
import { useSound } from './hooks/useSound';
import { ensureAudioReady, playCue } from './utils/soundManager';
import { Settings, HistoryEntry, Theme, TimerMode } from './types';
import { DEFAULT_SETTINGS, SOUNDS } from './constants';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import ConfigurationScreen from './components/ConfigurationScreen';
import AuthGate from './components/AuthGate';
import CountdownScreen from './components/CountdownScreen';
import ThemeToggle from './components/ThemeToggle';
import SessionCounter from './components/SessionCounter';
import { SettingsIcon } from './components/icons';
import A2HSHint from './components/A2HSHint';

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
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<Settings | null>(null);
  const [startAfterSettings, setStartAfterSettings] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  
  const playStartSound = useSound('start');
  const playEndSound = useSound('end');
  const playCompleteSound = useSound('complete');

  const handleSessionEnd = useCallback((entry: HistoryEntry) => {
    setHistory(prev => [entry, ...prev]);
  }, [setHistory]);

  const handleSound = useCallback((sound: 'start' | 'end' | 'complete') => {
    if (sound === 'start') playStartSound();
    if (sound === 'end') playEndSound();
    if (sound === 'complete') playCompleteSound();
  }, [playStartSound, playEndSound, playCompleteSound]);

  const [timerState, timerActions] = useTimer(settings, handleSessionEnd, handleSound);
  // Determine session mode using timer's phase
  const mode: 'work' | 'break' = timerState.isWorkPhase ? 'work' : 'break';
  // Subtle background state overlays (slightly brighter)
  const isWorkActive = timerState.isActive && mode === 'work';
  const isBreakActive = timerState.isActive && mode === 'break';
  const workGradient = theme === 'dark'
    ? 'radial-gradient(120% 120% at 50% 20%, rgba(99,230,190,0.20) 0%, rgba(99,230,190,0.10) 40%, rgba(0,0,0,0) 70%)'
    : 'radial-gradient(120% 120% at 50% 20%, rgba(34,197,94,0.20) 0%, rgba(34,197,94,0.10) 40%, rgba(255,255,255,0) 70%)';
  const breakGradient = theme === 'dark'
    ? 'radial-gradient(120% 120% at 50% 20%, rgba(239,68,68,0.20) 0%, rgba(239,68,68,0.10) 40%, rgba(0,0,0,0) 70%)'
    : 'radial-gradient(120% 120% at 50% 20%, rgba(239,68,68,0.20) 0%, rgba(239,68,68,0.10) 40%, rgba(255,255,255,0) 70%)';

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

  useEffect(() => {
    // Warm up AudioContext after first interaction for PWA/iOS
    const onInteract = () => { ensureAudioReady(); window.removeEventListener('pointerdown', onInteract); };
    window.addEventListener('pointerdown', onInteract, { passive: true });
    return () => window.removeEventListener('pointerdown', onInteract);
  }, []);

  const clearHistory = () => {
      setHistory([]);
  }

  // Auth gate: only show if Supabase env is configured; otherwise bypass in dev
  const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || (window as any).SUPABASE_URL;
  const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (window as any).SUPABASE_ANON_KEY;
  const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  if (!isAuthed && hasSupabase) {
    return (
      <AuthGate
        supabaseUrl={SUPABASE_URL}
        supabaseAnonKey={SUPABASE_ANON_KEY}
        onAuthenticated={() => setIsAuthed(true)}
      />
    );
  }

  // Auto-start once settings are applied and timer has initialized
  useEffect(() => {
    if (startAfterSettings && timerState.totalDuration > 0 && !timerState.isActive && !timerState.isFinished) {
      timerActions.resetSequence();
      timerActions.play();
      setStartAfterSettings(false);
    }
  }, [startAfterSettings, timerState.totalDuration, timerState.isActive, timerState.isFinished, timerActions]);

  if (showCountdown && pendingSettings && pendingSettings.countdown > 0) {
    return (
      <CountdownScreen
        key={countdownKey}
        countdownSeconds={pendingSettings.countdown}
        onComplete={() => {
          // Apply settings and defer start until timer initializes
          setSettings(pendingSettings!);
          setShowCountdown(false);
          setPendingSettings(null);
          setStartAfterSettings(true);
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
          if (newSettings.countdown > 0) {
            setPendingSettings(newSettings);
            setCountdownKey(k => k + 1); // force fresh countdown instance
            setShowCountdown(true);
          } else {
            // No countdown: apply settings and start once timer is ready
            setSettings(newSettings);
            setStartAfterSettings(true);
          }
        }}
        history={history}
        onClearHistory={clearHistory}
      />
    );
  }
  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen p-4 font-sans text-light-text dark:text-dark-text transition-colors duration-500`}>  
      {/* Background overlays behind content; do not block interactions */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: workGradient }}
        initial={false}
        animate={{ opacity: isWorkActive ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: breakGradient }}
        initial={false}
        animate={{ opacity: isBreakActive ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
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
      <A2HSHint />
    </div>
  );
};

export default App;
