import React from 'react';
import { usePresets } from '../hooks/usePresets';
import { Settings } from '../types';

interface PresetSelectorProps {
  currentSettings: Settings;
  onApply: (settings: Settings) => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ currentSettings, onApply }) => {
  const { presets, savePreset } = usePresets();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = presets.find(p => p.id === e.target.value);
    if (selected) onApply(selected.settings);
  };

  const handleSave = () => {
    const name = window.prompt('Enter a name for this preset:');
    if (name) savePreset(name, currentSettings);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue=""
        onChange={handleSelect}
        className="flex-1 px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none"
      >
        <option value="" disabled>Select</option>
        {presets.map(preset => (
          <option key={preset.id} value={preset.id}>{preset.name}</option>
        ))}
      </select>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white text-sm font-medium rounded-lg hover:bg-light-accent-hover dark:hover:bg-dark-accent-hover transition-colors"
      >
        Save
      </button>
    </div>
  );
};

export default PresetSelector;