import React, { useState } from 'react';
import { ExceptionItem, DispatchRole } from '../types/dispatch';

interface ExceptionsViewProps {
  exceptions: ExceptionItem[];
  role: DispatchRole;
  onResolveException: (id: string, note: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExceptionsView: React.FC<ExceptionsViewProps> = ({
  exceptions,
  role,
  onResolveException,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');

  const openList = exceptions.filter((e) => e.status !== 'resolved');
  const resolvedList = exceptions.filter((e) => e.status === 'resolved');

  const filtered = filter === 'open' ? openList : filter === 'resolved' ? resolvedList : exceptions;

  const handleResolve = (item: ExceptionItem) => {
    onResolveException(
      item.id,
      `Authorized and cleared by ${role === 'admin' ? 'Supervisor Kallstrom' : 'Operator Sterling'}`
    );
    onShowToast(`Exception ${item.id} successfully resolved and cleared from gate alerts.`, 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#eff4ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Dispatch Exceptions Center</h1>
            <p className="text-xs text-[#565e74]">
              Active terminal holds, cold chain temperature deviations, RFID mismatch alerts, and bay dwells
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="inline-flex bg-[#eff4ff] p-1 rounded-lg border border-[#dce9ff]">
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'open' ? 'bg-white text-[#ba1a1a] shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            Active Holds ({openList.length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'resolved' ? 'bg-white text-[#006243] shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            Cleared ({resolvedList.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-white text-[#0b1c30] shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            All Logs ({exceptions.length})
          </button>
        </div>
      </div>

      {/* Exception Cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-[#eff4ff] text-[#565e74]">
            <span className="material-symbols-outlined text-[36px] text-[#006243] mb-2">
              check_circle
            </span>
            <div className="text-sm font-bold text-[#0b1c30]">No active exceptions matching filter</div>
            <p className="text-xs mt-1">All yard gates and cold-chain conduits are operating normally.</p>
          </div>
        ) : (
          filtered.map((exc) => {
            const isResolved = exc.status === 'resolved';
            const isCritical = exc.severity === 'critical';
            const isHigh = exc.severity === 'high';

            return (
              <div
                key={exc.id}
                className={`p-4 rounded-xl bg-white shadow-xs border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isResolved
                    ? 'border-[#bdffdc] opacity-75'
                    : isCritical
                    ? 'border-l-4 border-l-[#ba1a1a] border-[#e5eeff]'
                    : isHigh
                    ? 'border-l-4 border-l-[#d97706] border-[#e5eeff]'
                    : 'border-l-4 border-l-[#2563eb] border-[#e5eeff]'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      isResolved
                        ? 'bg-[#eff4ff] text-[#006243]'
                        : isCritical
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : isHigh
                        ? 'bg-[#fef3c7] text-[#d97706]'
                        : 'bg-[#eff4ff] text-[#004ac6]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isResolved
                        ? 'verified'
                        : isCritical
                        ? 'emergency'
                        : isHigh
                        ? 'report_problem'
                        : 'info'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#0b1c30]">{exc.id}</span>
                      <span className="text-xs font-bold text-[#0b1c30]">• {exc.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isResolved
                            ? 'bg-[#eff4ff] text-[#006243]'
                            : isCritical
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#fef3c7] text-[#d97706]'
                        }`}
                      >
                        {exc.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[#565e74] mt-1">{exc.description}</p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[#737686]">
                      <span>Target: <strong className="text-[#0b1c30]">{exc.dspId}</strong></span>
                      <span>•</span>
                      <span>Zone: <strong className="text-[#0b1c30]">{exc.zone}</strong></span>
                      <span>•</span>
                      <span>Detected: {exc.timestamp}</span>
                      {exc.resolutionNote && (
                        <>
                          <span>•</span>
                          <span className="text-[#006243] font-semibold">{exc.resolutionNote}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {!isResolved && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolve(exc)}
                      className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Override &amp; Resolve</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
