import React from 'react';

export const ErrorFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 pb-28">
    <div className="max-w-md w-full p-6 rounded-card bg-[#F7F4EE] border border-slate-200 shadow-[0_16px_40px_-12px_rgba(27,36,64,0.25)] text-center space-y-3">
      <h1 className="text-[18px] font-bold text-[#1B2440]">Something went wrong</h1>
      <p className="text-[14px] leading-relaxed text-slate-600">
        The page hit an unexpected error. Your data is still saved in this browser. Reload to continue.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="h-10 px-5 rounded-btn bg-[#1B2440] hover:bg-[#28345a] text-[#F7F4EE] text-[14px] font-semibold transition-colors cursor-pointer"
      >
        Reload page
      </button>
    </div>
  </div>
);
