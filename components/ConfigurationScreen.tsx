import React, { useState, useEffect } from 'react';
import PresetSelector from './PresetSelector';
import QuickPresets from './QuickPresets';
import QuickPresetsModal from './QuickPresetsModal';
import { SparklesIcon } from './icons';
import SetsStepper from './SetsStepper';
import TimePicker from './TimePicker';
import CountdownSelector from './CountdownSelector';
import HistoryModal from './HistoryModal';
import { Settings, TimerMode, Interval, HistoryEntry } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS } from '../constants';
import { PlusIcon, TrashIcon, HistoryIcon } from './icons';

interface ConfigurationScreenProps {
  onStart: (settings: Settings) => void;
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const formatTotalTime = (settings: Settings): string => {
  let totalSeconds = 0;
  
  if (settings.mode === TimerMode.Simple) {
    const action = settings.simple.workTime;
    const brk = settings.simple.breakTime;
    const sets = settings.simple.sets;
    totalSeconds = (action + brk) * sets;
  } else {
    const totalIntervalDuration = settings.advanced.intervals.reduce((sum, i) => sum + i.duration, 0);
    totalSeconds = totalIntervalDuration * settings.advanced.rounds;
  }
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({ onStart, history, onClearHistory }) => {
  const [savedSettings, setSavedSettings] = useLocalStorage<Settings>('flow-timer-settings', DEFAULT_SETTINGS);
  const [localSettings, setLocalSettings] = useState<Settings>(savedSettings);
  const [activeView, setActiveView] = useState<'simple' | 'advanced' | 'presets'>(
    savedSettings.mode === TimerMode.Simple ? 'simple' : 'advanced'
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [presetMeta, setPresetMeta] = useState<{ title: string; subtitle?: string } | null>(null);

  const handleAddInterval = () => {
    const newInterval: Interval = { 
      id: Date.now().toString(), 
      label: "New Interval", 
      duration: 10 * 60 
    };
    setLocalSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        intervals: [...prev.advanced.intervals, newInterval]
      }
    }));
  };

  const handleRemoveInterval = (id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        intervals: prev.advanced.intervals.filter(i => i.id !== id)
      }
    }));
  };

  const handleIntervalChange = <K extends keyof Interval>(id: string, field: K, value: Interval[K]) => {
    setLocalSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        intervals: prev.advanced.intervals.map(i => 
          i.id === id ? { ...i, [field]: value } : i
        )
      }
    }));
  };

  useEffect(() => {
    setLocalSettings(savedSettings);
  }, [savedSettings]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lastPresetMeta');
      if (raw) setPresetMeta(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-2 flex items-center justify-center">
      <div className="bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text p-4 max-w-md w-full space-y-4 rounded-2xl shadow-xl">
        {/* Top preset selector removed to save space */}

        {/* Timer Mode Toggle with History Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xl font-semibold">Timer Mode</label>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-lg hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg transition-colors"
              title="Session History"
            >
              <HistoryIcon className="w-6 h-6 text-light-text dark:text-dark-text" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 p-1 bg-light-subtle-bg dark:bg-dark-subtle-bg rounded-lg">
            <button
              onClick={() => {
                setLocalSettings({ ...localSettings, mode: TimerMode.Simple });
                setActiveView('simple');
              }}
              className={`p-2 rounded-md font-semibold capitalize transition-colors ${
                activeView === 'simple'
                  ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-bg'
                  : 'hover:bg-white/50 dark:hover:bg-black/20'
              }`}
            >
              {TimerMode.Simple}
            </button>
            <button
              onClick={() => {
                setLocalSettings({ ...localSettings, mode: TimerMode.Advanced });
                setActiveView('advanced');
              }}
              className={`p-2 rounded-md font-semibold capitalize transition-colors ${
                activeView === 'advanced'
                  ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-bg'
                  : 'hover:bg-white/50 dark:hover:bg-black/20'
              }`}
            >
              {TimerMode.Advanced}
            </button>
            <button
              onClick={() => setIsPresetsOpen(true)}
              className={`p-2 rounded-md font-semibold capitalize transition-colors hover:bg-white/50 dark:hover:bg-black/20 flex items-center justify-center gap-2`}
              title="Browse presets"
            >
              <SparklesIcon className="w-4 h-4" /> Presets
            </button>
          </div>
        </div>

        {activeView === 'simple' ? (
          <>
            <div className="space-y-4 text-center">
              <label className="text-2xl font-bold">Sets</label>
              <SetsStepper
                sets={localSettings.simple.sets}
                onChange={v =>
                  setLocalSettings({
                    ...localSettings,
                    simple: { ...localSettings.simple, sets: v },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold">Action Time</label>
              <TimePicker
                minutes={Math.floor(localSettings.simple.workTime / 60)}
                seconds={localSettings.simple.workTime % 60}
                label="Action Time"
                onChange={(m, s) =>
                  setLocalSettings({
                    ...localSettings,
                    simple: { ...localSettings.simple, workTime: m * 60 + s },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold">Break Time</label>
              <TimePicker
                minutes={Math.floor(localSettings.simple.breakTime / 60)}
                seconds={localSettings.simple.breakTime % 60}
                label="Break Time"
                onChange={(m, s) =>
                  setLocalSettings({
                    ...localSettings,
                    simple: { ...localSettings.simple, breakTime: m * 60 + s },
                  })
                }
              />
            </div>
          </>
        ) : activeView === 'advanced' ? (
          <>
            {/* Selected preset description (if any) */}
            {presetMeta && (
              <div className="mb-2 p-2 rounded-lg bg-light-subtle-bg dark:bg-dark-subtle-bg text-left">
                <div className="font-semibold text-light-text dark:text-dark-text">{presetMeta.title}</div>
                {presetMeta.subtitle && (
                  <div className="text-xs text-light-text/70 dark:text-dark-text/70">{presetMeta.subtitle}</div>
                )}
              </div>
            )}

            <div className="space-y-4 text-center">
              <label className="text-2xl font-bold">Rounds</label>
              <SetsStepper
                sets={localSettings.advanced.rounds}
                onChange={v =>
                  setLocalSettings({
                    ...localSettings,
                    advanced: { ...localSettings.advanced, rounds: v },
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <label className="font-semibold">Intervals</label>
              <div className="space-y-2">
                {localSettings.advanced.intervals.map((interval, index) => (
                  <div key={interval.id} className="grid grid-cols-12 items-center gap-1 bg-light-subtle-bg dark:bg-dark-subtle-bg rounded-xl p-2">
                    <div className="col-span-1 text-xs text-light-text/70 dark:text-dark-text/70">#{index + 1}</div>
                    <input
                      type="text"
                      value={interval.label}
                      onChange={e => handleIntervalChange(interval.id, 'label', e.target.value)}
                      className="col-span-6 px-2 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none text-sm"
                    />
                    <div className="col-span-4 pr-1">
                      <TimePicker
                        minutes={Math.floor(interval.duration / 60)}
                        seconds={interval.duration % 60}
                        label="Duration"
                        onChange={(m, s) => handleIntervalChange(interval.id, 'duration', m * 60 + s)}
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveInterval(interval.id)}
                      className="col-span-1 text-red-500 hover:text-red-700 flex items-center justify-center"
                      title="Remove"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddInterval} 
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-dashed border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
              >
                <PlusIcon/> Add Interval
              </button>
            </div>
          </>
        ) : null}

        {/* Countdown Timer Section */}
        <CountdownSelector
          value={localSettings.countdown}
          onChange={(value) => setLocalSettings({ ...localSettings, countdown: value })}
        />

        {/* Quick Presets (removed from inline; use modal instead) */}

        <div className="text-center py-4 border-t border-light-border dark:border-dark-border text-light-text dark:text-dark-text">
          <span className="text-sm text-light-text/60 dark:text-dark-text/60">Total Time:</span>
          <span className="text-2xl font-bold ml-2">{formatTotalTime(localSettings)}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <PresetSelector currentSettings={localSettings} onApply={setLocalSettings} />
          </div>
          <button
            onClick={() => {
              setSavedSettings(localSettings);
              onStart(localSettings);
            }}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Let's GO!
          </button>
        </div>
      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={onClearHistory}
      />

      {/* Presets Modal */}
          <QuickPresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
            onApply={(s, meta) => {
              setLocalSettings({ ...s, simple: { ...s.simple }, advanced: { ...s.advanced } });
              setSavedSettings(s);
              setActiveView(s.mode === TimerMode.Simple ? 'simple' : 'advanced');
              // Store meta in session to show description; read below.
              sessionStorage.setItem('lastPresetMeta', JSON.stringify(meta));
            }}
      />
    </div>
  );
};

export default ConfigurationScreen;