import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollableWheelPicker from './ScrollableWheelPicker';
import SecondsWheelPicker from './SecondsWheelPicker';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  minutes: number;
  seconds: number;
  onConfirm: (minutes: number, seconds: number) => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  title,
  minutes,
  seconds,
  onConfirm
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(minutes);
  // Round seconds to nearest 5-second interval
  const [selectedSeconds, setSelectedSeconds] = useState(Math.round(seconds / 5) * 5);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedMinutes, selectedSeconds);
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
              Start Delay
            </h3>
            <button
              onClick={handleConfirm}
              className="text-light-accent dark:text-dark-accent font-semibold"
            >
              Done
            </button>
          </div>
        </div>

        {/* Time Picker */}
        <div className="p-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Minutes Picker */}
            <div className="flex-1 text-center">
              <div className="text-sm text-light-text/60 dark:text-dark-text/60 mb-2">
                Minutes
              </div>
              <ScrollableWheelPicker
                value={selectedMinutes}
                min={0}
                max={60}
                onChange={setSelectedMinutes}
                itemHeight={50}
                visibleItems={5}
              />
            </div>

            {/* Separator */}
            <div className="text-2xl font-bold text-light-text dark:text-dark-text">
              :
            </div>

            {/* Seconds Picker */}
            <div className="flex-1 text-center">
              <div className="text-sm text-light-text/60 dark:text-dark-text/60 mb-2">
                Seconds
              </div>
              <SecondsWheelPicker
                value={selectedSeconds}
                onChange={setSelectedSeconds}
                itemHeight={50}
                visibleItems={5}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimePickerModal;