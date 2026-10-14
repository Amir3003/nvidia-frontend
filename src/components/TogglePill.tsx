import React from 'react';

interface TogglePillProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const TogglePill: React.FC<TogglePillProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none
        ${
          checked
            ? 'bg-emerald-600 border-emerald-600'
            : 'bg-slate-200 border-slate-300 hover:border-slate-400'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full transition duration-200 ease-in-out shadow-xs bg-white
          ${
            checked
              ? 'translate-x-6'
              : 'translate-x-1'
          }
        `}
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
};

