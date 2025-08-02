
export enum TimerMode {
  Simple = 'simple',
  Advanced = 'advanced',
}

export interface SimpleSettings {
  workTime: number; // in seconds
  breakTime: number; // in seconds
  sets: number;
  workLabel: string;
  breakLabel: string;
}

export interface Interval {
  id: string;
  label: string;
  duration: number; // in seconds
}

export interface AdvancedSettings {
  rounds: number;
  intervals: Interval[];
}

export interface Settings {
  mode: TimerMode;
  simple: SimpleSettings;
  advanced: AdvancedSettings;
  countdown: number; // countdown before timer starts (in seconds)
}

export interface HistoryEntry {
  id: string;
  date: string;
  label: string;
  duration: number; // in seconds
}

export type Theme = 'light' | 'dark';
// Preset type for saved timer configurations
export interface Preset {
  id: string;
  name: string;
  settings: Settings;
}
