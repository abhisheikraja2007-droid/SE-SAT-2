import React, { useState } from 'react';
import { DockBay, DispatchRole } from '../types/dispatch';

interface DockDoorsViewProps {
  docks: DockBay[];
  role: DispatchRole;
  onUpdateDock: (updated: DockBay) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DockDoorsView: React.FC<DockDoorsViewProps> = ({
  docks,
  role,
  onUpdateDock,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'occupied' | 'staging' | 'available' | 'cleaning'>('all');
  const [selectedDock, setSelectedDock] = useState<DockBay | null>(null);

  const filteredDocks = docks.filter((d) => (filter === 'all' ? true : d.status === filter));

  const occupiedCount = docks.filter((d) => d.status === 'occupied').length;
  const stagingCount = docks.filter((d) => d.status === 'staging').length;
  const availableCount = docks.filter((d) => d.status === 'available').length;
  const cleaningCount = docks.filter((d) => d.status === 'cleaning').length;

  const handleToggleCleaning = (dock: DockBay) => {
    const newStatus = dock.status === 'cleaning' ? 'available' : 'cleaning';
    const updated: DockBay = {
      ...dock,
      status: newStatus,
      cleaningScheduled: newStatus === 'cleaning' ? 'In Progress' : undefined,
      timeRemaining: newStatus === 'cleaning' ? 'Sanitization Mode' : 'Ready for Gate Lock',
    };
    onUpdateDock(updated);
    onShowToast(`${dock.name} status updated to ${newStatus.toUpperCase()}`, 'info');
  };

  const handleReleaseTrailer = (dock: DockBay) => {
    const updated: DockBay = {
      ...dock,
      status: 'available',
      trailerId: undefined,
      carrier: undefined,
      cargo: undefined,
      timeRemaining: 'Ready for Gate Lock',
    };
    onUpdateDock(updated);
    onShowToast(`${dock.name} cleared. Bay gate unlocked.`, 'success');
  };

  const handleAssignTrailer = (dock: DockBay) => {
    const newTrailer = `TR-${Math.floor(100 + Math.random() * 900)}`;
    const updated: DockBay = {
      ...dock,
      status: 'occupied',
      trailerId: newTrailer,
      carrier: 'Priority Carrier Logistics',
      cargo: 'Cross-dock Pallets',
      timeRemaining: '25 min',
    };
    onUpdateDock(updated);
    onShowToast(`Assigned ${newTrailer} to ${dock.name}`, 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#eff4ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-[24px]">meeting_room</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0b1c30]">Dock Door Matrix</h1>
              <p className="text-xs text-[#565e74]">
                12-Bay terminal gate scheduling, occupancy sensors, and turnaround dwell timers
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#eff4ff] p-1 rounded-lg border border-[#dce9ff] flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-white text-[#0b1c30] shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            All Bays ({docks.length})
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'occupied' ? 'bg-white text-[#006243] shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            Occupied ({occupiedCount})
          </button>
          <button
            onClick={() => setFilter('staging')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'staging' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            Staging ({stagingCount})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'available' ? 'bg-white text-[#565e74] shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setFilter('cleaning')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'cleaning' ? 'bg-white text-[#ba1a1a] shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            Maintenance ({cleaningCount})
          </button>
        </div>
      </div>

      {/* Grid of 12 Dock Bays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocks.map((dock) => {
          const isOccupied = dock.status === 'occupied';
          const isStaging = dock.status === 'staging';
          const isAvailable = dock.status === 'available';
          const isCleaning = dock.status === 'cleaning';

          return (
            <div
              key={dock.id}
              className={`p-4 rounded-xl bg-white shadow-xs border transition-all flex flex-col justify-between ${
                isOccupied
                  ? 'border-t-4 border-t-[#006243] border-[#e5eeff]'
                  : isStaging
                  ? 'border-t-4 border-t-[#2563eb] border-[#e5eeff]'
                  : isCleaning
                  ? 'border-t-4 border-t-[#ba1a1a] border-[#e5eeff]'
                  : 'border-t-4 border-t-[#c3c6d7] border-[#e5eeff]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#0b1c30]">{dock.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#565e74]">
                      {dock.doorType}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isOccupied
                        ? 'bg-[#eff4ff] text-[#006243] border border-[#bdffdc]'
                        : isStaging
                        ? 'bg-[#dae2fd] text-[#004ac6]'
                        : isCleaning
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : 'bg-[#eff4ff] text-[#737686]'
                    }`}
                  >
                    {dock.status}
                  </span>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-[#eff4ff] flex flex-col gap-1 text-xs">
                  {isAvailable ? (
                    <div className="py-2 text-center text-[#565e74]">
                      <span className="material-symbols-outlined text-[28px] text-[#006243]">
                        check_circle
                      </span>
                      <div className="font-semibold text-xs mt-1 text-[#0b1c30]">Door Ready for Staging</div>
                      <div className="text-[11px] text-[#737686]">No trailer currently docked</div>
                    </div>
                  ) : isCleaning ? (
                    <div className="py-2 text-center text-[#ba1a1a]">
                      <span className="material-symbols-outlined text-[28px]">cleaning_services</span>
                      <div className="font-semibold text-xs mt-1">Scheduled Bay Sanitization</div>
                      <div className="text-[11px] text-[#565e74]">Resumes after inspection</div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-[#565e74] text-[11px]">Trailer / Bolt:</span>
                        <span className="font-bold text-[#0b1c30] font-mono">{dock.trailerId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#565e74] text-[11px]">Carrier:</span>
                        <span className="font-semibold text-[#0b1c30] truncate max-w-[120px]">{dock.carrier}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#565e74] text-[11px]">Payload:</span>
                        <span className="text-[#565e74] truncate max-w-[120px]">{dock.cargo}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-[#dce9ff]">
                        <span className="text-[#565e74] text-[11px]">Clearance Dwell:</span>
                        <span className="font-bold text-[#004ac6]">{dock.timeRemaining}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-2 border-t border-[#eff4ff] flex items-center justify-between gap-2">
                {isAvailable ? (
                  <button
                    onClick={() => handleAssignTrailer(dock)}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_box</span>
                    <span>Lock Inbound Trailer</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggleCleaning(dock)}
                      className="flex-1 py-1 px-2 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#565e74] text-[11px] font-semibold transition-colors truncate"
                    >
                      {isCleaning ? 'End Clean' : 'Clean Bay'}
                    </button>
                    <button
                      onClick={() => handleReleaseTrailer(dock)}
                      className="flex-1 py-1 px-2 rounded bg-[#ffdad6] hover:bg-[#ffdad6]/80 text-[#ba1a1a] text-[11px] font-bold transition-colors truncate"
                    >
                      Clear Gate
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
