import { useMemo, useCallback } from 'react';

export const useSound = (url: string, volume = 0.5) => {
  const audio = useMemo(() => {
    if (typeof Audio === 'undefined') {
        return null;
    }
    try {
        const a = new Audio(url);
        a.volume = volume;
        a.preload = 'auto'; // Hint to browser to start loading audio
        return a;
    } catch (e) {
        console.error(`Could not create audio for url: ${url}`, e);
        return null;
    }
  }, [url, volume]);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => {
          // More descriptive error in case playback fails.
          console.error(`Audio play failed for ${url}:`, err)
      });
    }
  }, [audio, url]);

  return play;
};
