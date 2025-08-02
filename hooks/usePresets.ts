import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Settings } from '../types';

// Preset represents a named saved configuration
export interface Preset {
  id: string;
  name: string;
  settings: Settings;
}

/**
 * usePresets hook provides CRUD operations for timer presets via localStorage.
 */
export const usePresets = () => {
  const [presets, setPresets] = useLocalStorage<Preset[]>('flow-timer-presets', []);

  const savePreset = useCallback((name: string, settings: Settings) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setPresets(prev => [...prev, { id, name, settings }]);
  }, [setPresets]);

  const deletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  }, [setPresets]);

  const renamePreset = useCallback((id: string, newName: string) => {
    setPresets(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  }, [setPresets]);

  const updatePreset = useCallback((id: string, settings: Settings) => {
    setPresets(prev => prev.map(p => p.id === id ? { ...p, settings } : p));
  }, [setPresets]);

  return { presets, savePreset, deletePreset, renamePreset, updatePreset };
};