import React, { useState } from 'react';
import TimePickerModal from './TimePickerModal';

interface TimePickerProps {
  minutes: number;
  seconds: number;
  onChange: (minutes: number, seconds: number) => void;
  label?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ minutes, seconds, onChange, label = "Select Time" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full p-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-left flex items-center justify-between hover:bg-light-subtle-bg dark:hover:bg-dark-subtle-bg transition-colors"
      >
        <span className="font-mono text-lg text-light-text dark:text-dark-text">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-light-text/50 dark:text-dark-text/50">
          ▼
        </span>
      </button>

      <TimePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={label}
        minutes={minutes}
        seconds={seconds}
        onConfirm={onChange}
      />
    </>
  );
};

export default TimePicker;