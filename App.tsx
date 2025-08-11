import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
// import { motion, AnimatePresence } from 'framer-motion';
import { useUserSettings } from '@/src/hooks/useUserSettings';
import { useTimer } from './hooks/useTimer';
import { useSound } from './hooks/useSound';
import { ensureAudioReady, playCue } from './utils/soundManager';
import { Settings, HistoryEntry, Theme, TimerMode } from './types';
import { DEFAULT_SETTINGS, SOUNDS } from './constants';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
// import ConfigurationScreen from './components/ConfigurationScreen';
// import AuthGate from './components/AuthGate';
// import CountdownScreen from './components/CountdownScreen';
import ThemeToggle from './components/ThemeToggle';
import SessionCounter from './components/SessionCounter';
import { SettingsIcon } from './components/icons';
import A2HSHint from './components/A2HSHint';
import { useTimerHistory } from '@/src/hooks/useTimerHistory';
import MigrationBanner from '@/src/components/MigrationBanner';

const ConfigurationScreen = React.lazy(() => import('./components/ConfigurationScreen'));
const CountdownScreen = React.lazy(() => import('./components/CountdownScreen'));

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
  const { settings, setSettings, theme, setTheme, isLoading } = useUserSettings() as unknown as {
    settings: Settings; setSettings: (s: Settings) => void; theme: Theme; setTheme: (t: Theme) => void; isLoading: boolean
  };
  const { history, addSession, clearHistory: clearServerHistory } = useTimerHistory();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showConfig, setShowConfig] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<Settings | null>(null);
  const [startAfterSettings, setStartAfterSettings] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);

  const [framerModule, setFramerModule] = useState<{ motion: any; AnimatePresence: any } | null>(null);
  useEffect(() => {
    let mounted = true;
    const load = () => {
      import('framer-motion')
        .then(mod => { if (mounted) setFramerModule({ motion: mod.motion, AnimatePresence: mod.AnimatePresence }); })
        .catch(() => {});
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(load, { timeout: 1500 });
    } else {
      // Fallback: defer until first pointer interaction
      const onFirst = () => { load(); (window as any).removeEventListener('pointerdown', onFirst); };
      (window as any).addEventListener('pointerdown', onFirst, { once: true, passive: true });
    }
    return () => { mounted = false; };
  }, []);

  const MotionDiv: any = framerModule?.motion?.div ?? 'div';
  const MotionButton: any = framerModule?.motion?.button ?? 'button';

  const playStartSound = useSound('start');
  const playEndSound = useSound('end');
  const playCompleteSound = useSound('complete');

  const handleSessionEnd = useCallback((entry: HistoryEntry) => {
    addSession({
      started_at: new Date().toISOString(),
      duration_seconds: entry.duration,
      status: 'completed',
      preset: null,
    });
  }, [addSession]);

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
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Warm up AudioContext after first interaction for PWA/iOS
    const onInteract = () => { ensureAudioReady(); window.removeEventListener('pointerdown', onInteract); };
    window.addEventListener('pointerdown', onInteract, { passive: true });
    return () => window.removeEventListener('pointerdown', onInteract);
  }, []);

  const clearHistory = () => { clearServerHistory(); };

  // Authentication is now handled globally via AuthProvider + ProtectedRoute

  // Auto-start once settings are applied and timer has initialized
  useEffect(() => {
    if (
      startAfterSettings &&
      timerState.totalDuration > 0 &&
      timerState.timeRemaining > 0 &&
      !timerState.isActive
    ) {
      timerActions.play();
      setStartAfterSettings(false);
    }
  }, [startAfterSettings, timerState.totalDuration, timerState.timeRemaining, timerState.isActive, timerActions]);

  if (isLoading) return <div className="min-h-screen" />;

  if (showCountdown && pendingSettings && pendingSettings.countdown > 0) {
    return (
      <Suspense fallback={<div className="min-h-screen" /> }>
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
      </Suspense>
    );
  }

  if (showConfig) {
    return (
      <Suspense fallback={<div className="min-h-screen" /> }>
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
      </Suspense>
    );
  }
  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen p-4 font-sans text-light-text dark:text-dark-text transition-colors duration-500`}>  
      <MigrationBanner />
      {/* Background overlays behind content; do not block interactions */}
      <MotionDiv
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: workGradient }}
        {...(framerModule ? { initial: false, animate: { opacity: isWorkActive ? 1 : 0 }, transition: { duration: 0.4 } } : {})}
      />
      <MotionDiv
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: breakGradient }}
        {...(framerModule ? { initial: false, animate: { opacity: isBreakActive ? 1 : 0 }, transition: { duration: 0.4 } } : {})}
      />
      <div className="absolute top-10 left-4 right-4 flex justify-between items-center">
        <MotionButton
            onClick={() => setShowConfig(true)}
            className="p-2 rounded-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border"
            {...(framerModule ? { whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } } : {})}
            aria-label="Open Settings"
        >
            <SettingsIcon className="w-6 h-6" />
        </MotionButton>
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

      <div className="fixed left-4 right-4 flex justify-between items-center font-mono text-base sm:text-lg text-light-text dark:text-dark-text bottom-safe z-10">
        <span>Work: {formatWorkTime(timerState.totalWorkTime)}</span>
        <span>Total: {formatRealTime(timerState.realTimeElapsed)}</span>
      </div>

      {/* Configuration screen replaces SettingsModal */}
      <A2HSHint />
    </div>
  );
};

export default App;
