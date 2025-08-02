
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, TimerMode, Interval, HistoryEntry } from '../types';
import { CloseIcon, PlusIcon, TrashIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

const InputField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="font-semibold text-sm">{label}</label>
    {children}
  </div>
);

const NumberInput: React.FC<{ value: number; onChange: (value: number) => void; min?: number }> = ({ value, onChange, min = 1 }) => (
    <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => onChange(Math.max(min, parseInt(e.target.value, 10) || min))}
        className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none"
    />
);

const DurationInput: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    const handleMinutesChange = (newMinutes: number) => {
        onChange(newMinutes * 60 + seconds);
    };
    const handleSecondsChange = (newSeconds: number) => {
        onChange(minutes * 60 + newSeconds);
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <InputField label="Minutes">
                <NumberInput value={minutes} onChange={handleMinutesChange} min={0} />
            </InputField>
            <InputField label="Seconds">
                <NumberInput value={seconds} onChange={handleSecondsChange} min={0} />
            </InputField>
        </div>
    );
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, history, onClearHistory }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [activeView, setActiveView] = useState<'settings' | 'history'>('settings');

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };
  
  const handleAddInterval = () => {
      const newInterval: Interval = { id: Date.now().toString(), label: "New Interval", duration: 10 * 60 };
      setLocalSettings(prev => ({ ...prev, advanced: { ...prev.advanced, intervals: [...prev.advanced.intervals, newInterval] } }));
  }

  const handleRemoveInterval = (id: string) => {
      setLocalSettings(prev => ({...prev, advanced: {...prev.advanced, intervals: prev.advanced.intervals.filter(i => i.id !== id)}}));
  }

  const handleIntervalChange = <K extends keyof Interval,>(id: string, field: K, value: Interval[K]) => {
      setLocalSettings(prev => ({
          ...prev,
          advanced: {
              ...prev.advanced,
              intervals: prev.advanced.intervals.map(i => i.id === id ? {...i, [field]: value} : i)
          }
      }))
  }

  const handleClearHistory = () => {
    onClearHistory();
    // No need to close modal, user might want to switch back to settings
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex items-center justify-between border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveView('settings')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeView === 'settings' ? 'text-light-accent dark:text-dark-accent' : 'text-light-text/60 dark:text-dark-text/60 hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg'}`}>
                Settings
            </button>
            <button onClick={() => setActiveView('history')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeView === 'history' ? 'text-light-accent dark:text-dark-accent' : 'text-light-text/60 dark:text-dark-text/60 hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg'}`}>
                History
            </button>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg">
            <CloseIcon />
          </button>
        </header>

        <div className="p-6 overflow-y-auto flex-grow">
        {activeView === 'settings' ? (
          <div className="space-y-6">
            <InputField label="Timer Mode">
              <div className="grid grid-cols-2 gap-2 p-1 bg-light-subtle-bg dark:bg-dark-subtle-bg rounded-lg">
                  {[TimerMode.Simple, TimerMode.Advanced].map(mode => (
                      <button key={mode} onClick={() => setLocalSettings({...localSettings, mode})} className={`p-2 rounded-md font-semibold capitalize transition-colors ${localSettings.mode === mode ? 'bg-light-accent dark:bg-dark-accent text-white dark:text-dark-bg' : 'hover:bg-white/50 dark:hover:bg-black/20'}`}>
                          {mode}
                      </button>
                  ))}
              </div>
            </InputField>

            {localSettings.mode === TimerMode.Simple && (
              <div className="space-y-4">
                <InputField label="Work Label">
                  <input type="text" value={localSettings.simple.workLabel} onChange={e => setLocalSettings({...localSettings, simple: {...localSettings.simple, workLabel: e.target.value}})} className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none" />
                </InputField>
                <InputField label="Work Duration">
                  <DurationInput value={localSettings.simple.workTime} onChange={val => setLocalSettings({...localSettings, simple: {...localSettings.simple, workTime: val}})} />
                </InputField>
                
                {/* Divider */}
                <hr className="border-light-border dark:border-dark-border" />
                
                <InputField label="Break Label">
                  <input type="text" value={localSettings.simple.breakLabel} onChange={e => setLocalSettings({...localSettings, simple: {...localSettings.simple, breakLabel: e.target.value}})} className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none" />
                </InputField>
                <InputField label="Break Duration">
                  <DurationInput value={localSettings.simple.breakTime} onChange={val => setLocalSettings({...localSettings, simple: {...localSettings.simple, breakTime: val}})} />
                </InputField>
                <InputField label="Sets">
                  <NumberInput value={localSettings.simple.sets} onChange={val => setLocalSettings({...localSettings, simple: {...localSettings.simple, sets: val}})} />
                </InputField>
              </div>
            )}

            {localSettings.mode === TimerMode.Advanced && (
              <div className="space-y-4">
                <InputField label="Rounds">
                  <NumberInput value={localSettings.advanced.rounds} onChange={val => setLocalSettings({...localSettings, advanced: {...localSettings.advanced, rounds: val}})} />
                </InputField>
                <div className="space-y-3">
                  {localSettings.advanced.intervals.map((interval, index) => (
                      <div key={interval.id} className="p-3 bg-light-subtle-bg dark:bg-dark-subtle-bg rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                              <span className="font-bold">Interval {index+1}</span>
                              <button onClick={() => handleRemoveInterval(interval.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                          </div>
                          <InputField label="Label">
                              <input type="text" value={interval.label} onChange={e => handleIntervalChange(interval.id, 'label', e.target.value)} className="w-full p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none" />
                          </InputField>
                          <InputField label="Duration">
                            <DurationInput value={interval.duration} onChange={val => handleIntervalChange(interval.id, 'duration', val)} />
                          </InputField>
                      </div>
                  ))}
                </div>
                <button onClick={handleAddInterval} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-dashed border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors">
                  <PlusIcon/> Add Interval
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {history.length > 0 ? (
              <ul className="space-y-3">
                {history.map((entry) => (
                  <li key={entry.id} className="p-3 bg-light-subtle-bg dark:bg-dark-subtle-bg rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{entry.label}</p>
                      <p className="text-sm text-light-text/70 dark:text-dark-text/70">{entry.date}</p>
                    </div>
                    <span className="font-mono text-lg">{formatDuration(entry.duration)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-light-text/70 dark:text-dark-text/70 py-8">No sessions completed yet.</p>
            )}
          </div>
        )}
        </div>

        <footer className="p-4 border-t border-light-border dark:border-dark-border">
            {activeView === 'settings' ? (
                <button onClick={handleSave} className="w-full py-3 px-4 rounded-lg bg-light-accent dark:bg-dark-accent text-white dark:text-dark-bg font-bold text-lg hover:bg-light-accent-hover dark:hover:bg-dark-accent-hover transition-colors">
                    Save Settings
                </button>
            ) : (
                history.length > 0 && (
                     <button
                        onClick={handleClearHistory}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                        <TrashIcon /> Clear History
                    </button>
                )
            )}
        </footer>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;
