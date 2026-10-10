import React from 'react';
import { CreateDispatchForm } from './CreateDispatchForm';
import { QueueList } from './QueueList';
import { DispatchRequest, DispatchRole } from '../types/dispatch';

interface DispatchConsoleProps {
  role: DispatchRole;
  onRoleChange: (newRole: DispatchRole) => void;
  requests: DispatchRequest[];
  onSubmitRequest: (req: Omit<DispatchRequest, 'id' | 'createdAt' | 'telemetry'>) => void;
  onCancelRequest: (id: string) => void;
  onAssignBay: (id: string) => void;
  onViewTelemetry: (req: DispatchRequest) => void;
  onAdminAction: (actionName: string, id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSimulateSync: () => void;
  isSyncing: boolean;
  onNavigateToDocks: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeCount: number;
}

export const DispatchConsole: React.FC<DispatchConsoleProps> = ({
  role,
  onRoleChange,
  requests,
  onSubmitRequest,
  onCancelRequest,
  onAssignBay,
  onViewTelemetry,
  onAdminAction,
  searchQuery,
  onSearchChange,
  onSimulateSync,
  isSyncing,
  onNavigateToDocks,
  onShowToast,
  activeCount,
}) => {
  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Operational Banner & Telemetry Bar */}
      <section className="w-full mb-6">
        <div className="bg-white rounded-xl shadow-xs p-4 sm:p-6 flex flex-col gap-4 border border-[#eff4ff]">
          {/* Title + Role Simulation Controller */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb]">
                <span className="material-symbols-outlined text-[28px]">local_shipping</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">
                    Warehouse Dispatch System
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#006243] text-[11px] font-bold border border-[#bdffdc]">
                    <span className="w-2 h-2 rounded-full bg-[#006243] animate-pulse" />
                    ACTIVE REQ ENGINE
                  </span>
                </div>
                <p className="text-xs text-[#565e74]">
                  Dynamic rate validation, real-time yard routing, and slot-locked gate clearance
                </p>
              </div>
            </div>

            {/* Role Simulator Toggle */}
            <div className="flex items-center self-start md:self-auto bg-[#eff4ff] p-1.5 rounded-xl border border-[#dce9ff]">
              <div className="flex items-center gap-2 px-2 py-1 mr-1">
                <span className="material-symbols-outlined text-[18px] text-[#565e74]">badge</span>
                <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider hidden sm:inline">
                  Active Persona:
                </span>
              </div>
              <div className="inline-flex rounded-lg bg-white p-1 shadow-xs border border-[#eff4ff]">
                <button
                  type="button"
                  onClick={() => onRoleChange('operator')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    role === 'operator'
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'text-[#434655] hover:text-[#0b1c30]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      role === 'operator' ? 'bg-white' : 'bg-[#c3c6d7]'
                    }`}
                  />
                  <span>Operator User</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRoleChange('admin')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    role === 'admin'
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'text-[#434655] hover:text-[#0b1c30]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      role === 'admin' ? 'bg-white' : 'bg-[#c3c6d7]'
                    }`}
                  />
                  <span>Admin / Supervisor</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      role === 'admin' ? 'bg-white/20 text-white' : 'bg-[#eff4ff] text-[#004ac6]'
                    }`}
                  >
                    PRO
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry Quick Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#004ac6] shadow-xs">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#565e74] truncate font-medium">Active Queue</span>
                <span className="text-sm sm:text-base text-[#0b1c30] font-bold tabular-nums">
                  {activeCount} Tasks
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#006243] shadow-xs">
                <span className="material-symbols-outlined text-[20px]">timelapse</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#565e74] truncate font-medium">Avg Dock Turnaround</span>
                <span className="text-sm sm:text-base text-[#0b1c30] font-bold tabular-nums">
                  24 min
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#2563eb] shadow-xs">
                <span className="material-symbols-outlined text-[20px]">warehouse</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#565e74] truncate font-medium">Fleet Capacity</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base text-[#0b1c30] font-bold tabular-nums">
                    88%
                  </span>
                  <span className="text-[11px] text-[#565e74] hidden sm:inline">(Optimal)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#007d57] shadow-xs">
                <span className="material-symbols-outlined text-[20px]">network_ping</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#565e74] truncate font-medium">API Stream Latency</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006243]" />
                  <span className="text-sm sm:text-base text-[#0b1c30] font-bold tabular-nums">
                    32 ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: 2-Column Responsive Control Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Create Dispatch Request (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <CreateDispatchForm onSubmit={onSubmitRequest} onShowToast={onShowToast} />
        </div>

        {/* Right Column: Requests List & Real-time Queue (7 cols) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <QueueList
            requests={requests}
            role={role}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onCancelRequest={onCancelRequest}
            onAssignBay={onAssignBay}
            onViewTelemetry={onViewTelemetry}
            onAdminAction={onAdminAction}
            onSimulateSync={onSimulateSync}
            isSyncing={isSyncing}
            onNavigateToDocks={onNavigateToDocks}
          />
        </div>
      </div>
    </div>
  );
};
