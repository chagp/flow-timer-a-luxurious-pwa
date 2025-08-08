export type HapticsMode = 'auto' | 'vibration' | 'capacitor' | 'none';

declare global {
  interface Window {
    Capacitor?: any;
  }
}

function tryCapacitorSelection(): boolean {
  try {
    const cap = typeof window !== 'undefined' ? window.Capacitor : null;
    const isNative = !!cap?.isNativePlatform?.();
    const plugin = cap?.Plugins?.Haptics;
    if (isNative && plugin && typeof plugin.selection === 'function') {
      plugin.selection();
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function triggerHaptic(mode: HapticsMode = 'auto') {
  if (mode === 'none') return;
  if (mode === 'capacitor' || mode === 'auto') {
    if (tryCapacitorSelection()) return;
  }
  if (mode === 'vibration' || mode === 'auto') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // @ts-expect-error vibrate exists in browsers supporting it
      navigator.vibrate?.(8);
    }
  }
}


