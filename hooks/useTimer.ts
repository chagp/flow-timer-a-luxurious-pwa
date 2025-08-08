
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Settings, TimerMode, HistoryEntry } from '../types';

interface TimerState {
  timeRemaining: number;
  totalDuration: number;
  isActive: boolean;
  isFinished: boolean;
  currentSet: number;
  currentLabel: string;
  totalSets: number;
  totalWorkTime: number;
  realTimeElapsed: number;
  isWorkPhase: boolean;
}

interface TimerActions {
  play: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  resetSequence: () => void;
}

export const useTimer = (
  settings: Settings,
  onSessionEnd: (entry: HistoryEntry) => void,
  playSound: (sound: 'start' | 'end' | 'complete') => void
): [TimerState, TimerActions] => {
  const getSequence = useCallback(() => {
    if (settings.mode === TimerMode.Simple) {
      return [
        { label: settings.simple.workLabel, duration: settings.simple.workTime },
        { label: settings.simple.breakLabel, duration: settings.simple.breakTime },
      ];
    }
    return settings.advanced.intervals.map(i => ({ label: i.label, duration: i.duration }));
  }, [settings]);

  const getTotalSets = useCallback(() => {
    return settings.mode === TimerMode.Simple ? settings.simple.sets : settings.advanced.rounds;
  }, [settings]);

  const [sequence, setSequence] = useState(getSequence());
  const [totalSets, setTotalSets] = useState(getTotalSets());
  
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const initialTime = (sequence.length > 0 ? sequence[0].duration : 0) * 1000;
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  const [realTimeElapsed, setRealTimeElapsed] = useState(0);
  const realTimeIntervalRef = useRef<number | null>(null);

  const intervalRef = useRef<number | null>(null);
  
  const totalWorkTime = useMemo(() => {
    if (settings.mode === TimerMode.Simple) {
      const { workTime, breakTime, sets } = settings.simple;
      return (workTime + breakTime) * sets;
    }
    const totalIntervalDuration = settings.advanced.intervals.reduce((sum, i) => sum + i.duration, 0);
    return totalIntervalDuration * settings.advanced.rounds;
  }, [settings]);

  const resetSequence = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (realTimeIntervalRef.current) clearInterval(realTimeIntervalRef.current);
    realTimeIntervalRef.current = null;
    setRealTimeElapsed(0);

    const newSequence = getSequence();
    const newTotalSets = getTotalSets();
    setSequence(newSequence);
    setTotalSets(newTotalSets);
    
    setIsActive(false);
    setIsFinished(false);
    setCurrentIntervalIndex(0);
    setCurrentSet(1);
    if (newSequence.length > 0 && newSequence[0].duration > 0) {
      setTimeRemaining(newSequence[0].duration * 1000);
    } else {
      setTimeRemaining(0);
    }
  }, [getSequence, getTotalSets]);

  useEffect(() => {
      resetSequence();
  }, [settings, resetSequence]);
  
  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (realTimeIntervalRef.current) clearInterval(realTimeIntervalRef.current);
    }
  }, []);

  const advanceToNext = useCallback(() => {
    const lastSession = sequence[currentIntervalIndex];
    if (lastSession) {
      const totalMs = (lastSession.duration || 0) * 1000;
      const elapsedMs = Math.max(0, Math.min(totalMs, totalMs - timeRemaining));
      const elapsedSeconds = Math.round(elapsedMs / 1000);
      onSessionEnd({
        id: new Date().toISOString(),
        date: new Date().toLocaleString(),
        label: lastSession.label,
        duration: elapsedSeconds,
      });
    }

    let nextIntervalIndex = currentIntervalIndex + 1;
    let nextSet = currentSet;

    if (nextIntervalIndex >= sequence.length) {
      nextIntervalIndex = 0;
      nextSet += 1;
    }
    
    if (nextSet > totalSets) {
      setIsActive(false);
      setIsFinished(true);
      if (realTimeIntervalRef.current) clearInterval(realTimeIntervalRef.current);
      realTimeIntervalRef.current = null;
      playSound('complete');
    } else {
      setCurrentIntervalIndex(nextIntervalIndex);
      setCurrentSet(nextSet);
      setTimeRemaining(sequence[nextIntervalIndex].duration * 1000);
      playSound('end');
    }
  }, [currentIntervalIndex, currentSet, onSessionEnd, playSound, sequence, totalSets, timeRemaining]);

  useEffect(() => {
    if (isActive && !isFinished) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            advanceToNext();
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isFinished, advanceToNext]);

  const play = () => {
    console.log('play() called - isFinished:', isFinished, 'timeRemaining:', timeRemaining);
    
    if (isFinished) {
      console.log('Timer was finished, resetting sequence');
      resetSequence();
      // fall-through to start immediately
    }

    if (realTimeIntervalRef.current === null) {
      const sessionStartTime = Date.now();
      realTimeIntervalRef.current = window.setInterval(() => {
        setRealTimeElapsed(Date.now() - sessionStartTime);
      }, 1000);
    }

    if (timeRemaining > 0 || isFinished) {
      console.log('Starting timer - setting isActive to true');
      setIsActive(true);
      // Try to play sound but don't let it block timer start
      try {
        playSound('start');
      } catch (err) {
        console.log('Sound play failed, but timer will continue:', err);
      }
    } else {
      console.log('Cannot start timer - timeRemaining is 0');
    }
  };

  const pause = () => setIsActive(false);

  const reset = () => {
    if (sequence.length > 0) {
        setTimeRemaining(sequence[currentIntervalIndex].duration * 1000);
    }
    setIsActive(false);
    if (realTimeIntervalRef.current) clearInterval(realTimeIntervalRef.current);
    realTimeIntervalRef.current = null;
    setRealTimeElapsed(0);
  };

  const skip = () => {
    if(intervalRef.current) clearInterval(intervalRef.current);
    advanceToNext();
  };

  const currentInterval = sequence[currentIntervalIndex];
  const totalDuration = currentInterval?.duration * 1000 || 0;
  const currentLabel = isFinished ? 'DONE' : currentInterval?.label || 'READY';
  const isWorkPhase = (() => {
    if (isFinished) return false;
    if (!currentInterval) return false;
    if (settings.mode === TimerMode.Simple) {
      return currentInterval.label === settings.simple.workLabel;
    }
    // Heuristic for advanced mode: even-indexed intervals are work
    return currentIntervalIndex % 2 === 0;
  })();
  
  return [
    { timeRemaining, totalDuration, isActive, isFinished, currentSet, currentLabel, totalSets, totalWorkTime, realTimeElapsed, isWorkPhase },
    { play, pause, reset, skip, resetSequence },
  ];
};
