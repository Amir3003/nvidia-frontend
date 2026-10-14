import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { TerminalIcon, ShieldIcon, AlertTriangleIcon, CheckIcon } from '../components/Icons';

export const LogsPage: React.FC = () => {
  const { logs, addLog, triggerBlockedSandboxAction, runTavilySearch } = useApp();
  const [activeFilter, setActiveFilter] = useState<'All' | 'System' | 'Sandbox' | 'Model'>('All');
  const [commandInput, setCommandInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of terminal when logs are added
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'System') return log.tag === 'SYSTEM';
    if (activeFilter === 'Sandbox') {
      return log.tag === 'SANDBOX' || log.tag === 'SANDBOX WARNING';
    }
    if (activeFilter === 'Model') return log.tag === 'MODEL';
    return true;
  });

  const blockedCount = logs.filter((l) => l.tag === 'SANDBOX WARNING').length;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    addLog('SYSTEM', `$ ${cmd}`);

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      addLog('SYSTEM', 'Available commands: openshell status, cat MEMORY.md, tavily search, access /root/system, clear');
    } else if (lower.includes('access /root') || lower.includes('/root/system')) {
      triggerBlockedSandboxAction();
    } else if (lower.includes('status')) {
      addLog('SANDBOX', 'OpenShell Status: ACTIVE · Directory Jail: /workspace/qadam · Confinement: 100%');
    } else if (lower.includes('tavily')) {
      runTavilySearch();
    } else if (lower.includes('memory') || lower.includes('cat')) {
      addLog('SYSTEM', 'Reading local MEMORY.md: 6 profile directives loaded');
    } else {
      addLog('SYSTEM', `Execution acknowledged: "${cmd}" within sandbox environment.`);
    }

    setCommandInput('');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        title="Logs & Terminal"
        subtitle="OpenShell sandboxed event stream & AST security verification"
        actions={
          <button
            type="button"
            onClick={triggerBlockedSandboxAction}
            className="h-11 px-3.5 rounded-btn border border-warning/40 text-warning hover:bg-warning/10 text-mini font-mono flex items-center gap-2 transition-colors"
          >
            <AlertTriangleIcon size={14} />
            <span>Test Security Jail Violation</span>
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Row of 3 mini-cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-card bg-surface border border-border flex items-center justify-between">
            <div>
              <div className="text-mini font-mono text-muted uppercase">Sandbox State</div>
              <div className="text-[14px] font-mono font-semibold text-text mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>Sandbox: ACTIVE</span>
              </div>
            </div>
            <span className="text-mini font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent-border">
              JAIL ON
            </span>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-card bg-surface border border-border flex items-center justify-between">
            <div>
              <div className="text-mini font-mono text-muted uppercase">Allowed Directory</div>
              <div className="text-[13px] font-mono text-text-2 mt-1 truncate max-w-[200px]">
                /workspace/qadam
              </div>
            </div>
            <span className="text-mini font-mono text-muted-2">r/w</span>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-card bg-surface border border-border flex items-center justify-between">
            <div>
              <div className="text-mini font-mono text-muted uppercase">Security Interceptions</div>
              <div className="text-[14px] font-mono font-semibold text-warning mt-1">
                Blocked this session: {blockedCount} {blockedCount === 1 ? 'action' : 'actions'}
              </div>
            </div>
            <span className="text-mini font-mono px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/30">
              BLOCKED
            </span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          {(['All', 'System', 'Sandbox', 'Model'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`
                  h-11 px-3.5 rounded-btn text-mini font-mono transition-colors border
                  ${
                    isActive
                      ? 'bg-surface-hover text-text border-border-strong font-semibold'
                      : 'bg-surface text-muted border-border hover:bg-surface-hover hover:text-text'
                  }
                `}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Terminal panel */}
        <div className="rounded-card bg-surface border border-border overflow-hidden shadow-2xl flex flex-col h-[520px]">
          {/* Terminal Header */}
          <div className="px-4 py-3 border-b border-border bg-[#121215] flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-mini font-mono text-text font-semibold">Live stream</span>
            </div>
            <div className="flex items-center gap-3 text-mini font-mono text-muted-2">
              <span>buffer: 2048KB</span>
              <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                session 0x4f2a
              </span>
            </div>
          </div>

          {/* Terminal Log Output (Horizontal scroll without wrap) */}
          <div className="p-4 flex-1 overflow-y-auto overflow-x-auto font-mono text-[12px] leading-relaxed space-y-1 bg-[#09090b]">
            {filteredLogs.map((log) => {
              const isWarning = log.tag === 'SANDBOX WARNING' || log.isWarning;
              const isSandbox = log.tag === 'SANDBOX';

              let tagColor = 'text-muted';
              if (isSandbox) tagColor = 'text-accent font-semibold';
              if (isWarning) tagColor = 'text-warning font-semibold';

              return (
                <div
                  key={log.id}
                  className={`
                    whitespace-nowrap flex items-center px-2 py-0.5 rounded
                    ${isWarning ? 'bg-warning/10 text-warning-text' : 'text-text-2 hover:bg-surface/40'}
                  `}
                >
                  {/* Timestamp */}
                  <span className="text-muted-2 mr-3 select-none flex-shrink-0">{log.time}</span>

                  {/* Bracketed Tag (fixed width 132px) */}
                  <span
                    className={`inline-block w-[132px] flex-shrink-0 ${tagColor}`}
                  >
                    [{log.tag}]
                  </span>

                  {/* Message */}
                  <span className={isWarning ? 'text-warning font-medium' : 'text-text'}>
                    {log.message}
                  </span>
                </div>
              );
            })}

            {/* Prompt with blinking cursor */}
            <div className="flex items-center px-2 pt-2 text-text font-mono">
              <span className="text-accent mr-2">$</span>
              <span className="text-muted mr-1">/workspace/qadam</span>
              <span className="w-2 h-4 bg-text inline-block animate-cursor-blink ml-1" />
            </div>

            <div ref={terminalBottomRef} />
          </div>

          {/* Terminal Input Bar */}
          <form
            onSubmit={handleCommandSubmit}
            className="p-3 border-t border-border bg-[#121215] flex items-center gap-3"
          >
            <span className="text-accent font-mono text-[13px]">$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Run sandbox CLI directive: 'help', 'inspect sandbox', 'audit pii'..."
              className="flex-1 bg-transparent border-none text-[12px] font-mono text-text placeholder:text-muted-2 focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 px-4 bg-surface hover:bg-surface-hover text-text border border-border-strong rounded-btn text-mini font-mono font-medium transition-colors"
            >
              Execute
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

