import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <header className="px-6 py-4 border-b border-teal-500/20 bg-slate-950/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <h2 className="text-pageTitle text-teal-50 tracking-tight font-semibold">{title}</h2>
        <div className="text-[13px] font-mono text-teal-200/80 mt-0.5 tracking-tight font-medium">{subtitle}</div>
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </header>
  );
};

export default PageHeader;
