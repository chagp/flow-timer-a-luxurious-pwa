import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollableWheelPicker from './ScrollableWheelPicker';

interface CountdownSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: number;
  onConfirm: (value: number) => void;
}

const CountdownModal: React.FC<CountdownModalProps> = ({
  isOpen,
  onClose,
  value,
  onConfirm
}) => {
  const [selectedValue, setSelectedValue] = useState(value);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedValue);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-light-card dark:bg-dark-card rounded-t-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-light-accent dark:text-dark-accent font-semibold"
            >
              Cancel
            </button>
            <h3 className="font-semibold text-light-text dark:text-dark-text">
              Countdown Timer
            </h3>
            <button
              onClick={handleConfirm}
              className="text-light-accent dark:text-dark-accent font-semibold"
            >
              Done
            </button>
          </div>
        </div>

        {/* Countdown Picker */}
        <div className="p-6">
          <div className="text-center">
            <div className="text-sm text-light-text/60 dark:text-dark-text/60 mb-2">
              Seconds
            </div>
            <ScrollableWheelPicker
              value={selectedValue}
              min={0}
              max={60}
              onChange={setSelectedValue}
              itemHeight={50}
              visibleItems={5}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CountdownSelector: React.FC<CountdownSelectorProps> = ({ value, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Preset countdown options
  const presets = [0, 3, 5, 10];
  const isCustomValue = !presets.includes(value);

  const handlePresetSelect = (preset: number) => {
    onChange(preset);
  };

  const handleCustomize = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-3">
        <label className="font-semibold text-light-text dark:text-dark-text">
          Start Delay
        </label>
        
        {/* Preset buttons */}
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                value === preset
                  ? 'bg-light-accent dark:bg-dark-accent text-white'
                  : 'bg-light-subtle-bg dark:bg-dark-subtle-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
              }`}
            >
              {preset}s
            </button>
          ))}
        </div>

        {/* Custom button */}
        <button
          onClick={handleCustomize}
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isCustomValue
              ? 'bg-light-accent dark:bg-dark-accent text-white'
              : 'bg-light-subtle-bg dark:bg-dark-subtle-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          {isCustomValue && value > 0 ? `Custom (${value}s)` : 'Custom'}
        </button>
      </div>

      <CountdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={value}
        onConfirm={onChange}
      />
    </>
  );
};

export default CountdownSelector;