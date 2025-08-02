import React from 'react';

interface SetsStepperProps {
  sets: number;
  onChange: (newSets: number) => void;
}

const SetsStepper: React.FC<SetsStepperProps> = ({ sets, onChange }) => (
  <div className="flex items-center justify-center space-x-4">
    <button
      onClick={() => onChange(Math.max(1, sets - 1))}
      className="w-12 h-12 flex items-center justify-center bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full shadow-lg text-2xl text-light-text dark:text-dark-text"
      aria-label="Decrease sets"
    >
      –
    </button>
    <span className="text-3xl font-bold text-light-text dark:text-dark-text">{sets}</span>
    <button
      onClick={() => onChange(sets + 1)}
      className="w-12 h-12 flex items-center justify-center bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full shadow-lg text-2xl text-light-text dark:text-dark-text"
      aria-label="Increase sets"
    >
      +
    </button>
  </div>
);

export default SetsStepper;