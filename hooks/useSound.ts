import { useCallback } from 'react';
import { playCue, CueType } from '../utils/soundManager';

// Backwards-compatible hook. If passed a known string key, map to cue.
export const useSound = (urlOrKey: string, _volume = 0.5) => {
  const play = useCallback(() => {
    const key = urlOrKey as CueType;
    if (['start','end','complete'].includes(key)) {
      playCue(key as CueType);
      return;
    }
    // Fallback: try HTMLAudio for arbitrary URLs
    try {
      const a = new Audio(urlOrKey);
      a.volume = _volume;
      void a.play();
    } catch {
      // ignore
    }
  }, [urlOrKey, _volume]);
  return play;
};
