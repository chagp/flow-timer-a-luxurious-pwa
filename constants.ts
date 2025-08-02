import { Settings, TimerMode } from './types';

export const DEFAULT_SETTINGS: Settings = {
  mode: TimerMode.Simple,
  simple: {
    workTime: 25 * 60, // 25 minutes
    breakTime: 5 * 60, // 5 minutes
    sets: 4,
    workLabel: 'FLOW',
    breakLabel: 'BREAK',
  },
  advanced: {
    rounds: 2,
    intervals: [
      { id: '1', label: 'DEEP WORK', duration: 45 * 60 },
      { id: '2', label: 'SHORT BREAK', duration: 10 * 60 },
      { id: '3', label: 'REVIEW', duration: 5 * 60 },
    ],
  },
  countdown: 3, // 3 second countdown by default
};

// Using reliable, CORS-friendly audio sources from pixabay.com to prevent playback errors.
export const SOUNDS = {
  start: 'https://cdn.pixabay.com/audio/2022/03/15/audio_2c28b6b907.mp3', // UI Click
  end: 'https://cdn.pixabay.com/audio/2022/10/28/audio_823c316712.mp3', // Notification
  complete: 'https://cdn.pixabay.com/audio/2022/01/21/audio_a125c94294.mp3', // Level Win
};
