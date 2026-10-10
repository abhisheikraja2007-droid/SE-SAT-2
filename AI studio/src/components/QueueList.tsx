import React, { useState } from 'react';
import { DispatchRequest, DispatchRole, DispatchStatus } from '../types/dispatch';

interface QueueListProps {
  requests: DispatchRequest[];
  role: DispatchRole;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCancelRequest: (id: string) => void;
  onAssignBay: (id: string) => void;
  onViewTelemetry: (request: DispatchRequest) => void;
  onAdminAction: (actionName: string, id: string) => void;
  onSimulateSync: () => void;
  isSyncing: boolean;
  onNavigateToDocks: () => void;
}

export const QueueList: React.FC<QueueListProps> = ({
  requests,
  role,
  searchQuery,
  onSearchChange,
  onCancelRequest,
  onAssignBay,
  onViewTelemetry,
  onAdminAction,
  onSimulateSync,
  isSyncing,
  onNavigateToDocks,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | DispatchStatus>('all');

  const filteredRequests = requests.filter((item) => {
    const matchesFilter = statusFilter === 'all' || item.status === statusFilter;
    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesFilter;

    const matchesSearch =
      item.id.toLowerCase().includes(term) ||
      item.cargo.toLowerCase().includes(term) ||
      item.source.toLowerCase().includes(term) ||
      item.destination.toLowerCase().includes(term) ||
      item.carrier.toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const transitCount = requests.filter((r) => r.status === 'transit').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;
  const activeCount = requests.filter((r) => r.status !== 'cancelled').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-4 border border-[#eff4ff]">
        {/* Queue Top Bar & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 border-b border-[#eff4ff]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0b1c30]">
                Requests List &amp; Real-time Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] text-[11px] font-bold">
                {activeCount} Active
              </span>
            </div>
            <p className="text-xs text-[#565e74]">
              Live terminal staging telemetry, dispatch states, and gate assignments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateSync}
              disabled={isSyncing}
              className="p-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#434655] hover:text-[#0b1c30] transition-colors flex items-center gap-1.5 text-xs font-semibold border border-[#dce9ff]"
              title="Simulate dynamic fetch reload"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isSyncing ? 'animate-spin text-[#2563eb]' : ''
                }`}
              >
                sync
              </span>
              <span className="hidden sm:inline">Simulate Sync</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#eff4ff] border border-[#bdffdc]/60">
              <span className="w-2 h-2 rounded-full bg-[#006243] animate-pulse" />
              <span className="text-[11px] text-[#006243] font-bold">Stream Live</span>
            </div>
          </div>
        </div>

        {/* Search Bar and Status Tabs Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-[#565e74] text-[18px] absolute left-3 top-2.5">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by DSP ID, bay, cargo, or driver..."
              className="w-full bg-[#eff4ff] border border-[#dce9ff] pl-9 pr-4 py-2 rounded-lg text-xs text-[#0b1c30] placeholder:text-[#737686] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-[#737686] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="inline-flex bg-[#eff4ff] p-1 rounded-lg overflow-x-auto text-nowrap border border-[#dce9ff]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('transit')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'transit'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              In Transit ({transitCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white text-[#0b1c30] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Skeleton Loader Screen (during simulate sync) */}
        {isSyncing ? (
          <div className="flex flex-col gap-3 py-4 animate-pulse">
            <div className="h-28 bg-[#eff4ff] rounded-xl w-full border border-[#dce9ff]" />
            <div className="h-28 bg-[#eff4ff] rounded-xl w-full border border-[#dce9ff]" />
            <div className="h-28 bg-[#eff4ff] rounded-xl w-full border border-[#dce9ff]" />
            <div className="text-center py-2 text-[#565e74] text-xs font-medium">
              Fetching real-time dock array telemetry from Terminal ERP v4.2...
            </div>
          </div>
        ) : (
          /* Queue Cards Container */
          <div className="flex flex-col gap-3">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-[#eff4ff] rounded-xl border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[40px] text-[#565e74] mb-2">
                  find_in_page
                </span>
                <div className="text-sm font-bold text-[#0b1c30]">
                  No matching dispatch requests
                </div>
                <p className="text-xs text-[#565e74] max-w-sm mt-1">
                  Try adjusting the search query or toggle status filters to view active loads.
                </p>
                <button
                  onClick={() => {
                    onSearchChange('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded-lg hover:bg-[#004ac6] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredRequests.map((card) => {
                const isPending = card.status === 'pending';
                const isTransit = card.status === 'transit';
                const isCompleted = card.status === 'completed';
                const isCritical = card.priority === 'critical';
                const isExpedited = card.priority === 'expedited';

                return (
                  <div
                    key={card.id}
                    className={`p-4 rounded-xl bg-white hover:bg-[#eff4ff]/40 transition-all flex flex-col gap-3 shadow-xs border ${
                      card.isCustom
                        ? 'border-l-4 border-l-[#2563eb] border-[#dce9ff]'
                        : isCritical
                        ? 'border-l-4 border-l-[#ba1a1a] border-[#e5eeff]'
                        : isTransit
                        ? 'border-l-4 border-l-[#2563eb] border-[#e5eeff]'
                        : 'border-[#e5eeff]'
                    }`}
                  >
                    {/* Top Row: Token ID, Pallets, Priority, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isCompleted
                              ? 'bg-[#006243]'
                              : isCritical
                              ? 'bg-[#ba1a1a]'
                              : isTransit
                              ? 'bg-[#2563eb]'
                              : 'bg-[#737686]'
                          }`}
                        />
                        <span className="text-sm font-bold text-[#0b1c30] tracking-tight">
                          {card.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#5c647a] text-[11px] font-bold">
                          {card.pallets} Pallets
                        </span>

                        {isCritical && (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">emergency</span>
                            CRITICAL
                          </span>
                        )}

                        {isExpedited && !isCritical && (
                          <span className="px-2 py-0.5 rounded-full bg-[#2563eb]/10 text-[#2563eb] text-[11px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                            Expedited
                          </span>
                        )}

                        {!isExpedited && !isCritical && !card.specialHandling.hazmat && (
                          <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#565e74] text-[11px] font-semibold">
                            Standard
                          </span>
                        )}

                        {card.specialHandling.hazmat && (
                          <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006243] text-[11px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Hazmat Cl.9
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isTransit && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#004ac6] text-[11px] font-bold border border-[#dce9ff]">
                            <span className="material-symbols-outlined text-[14px] animate-spin">
                              sync
                            </span>
                            In Transit
                          </span>
                        )}

                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#565e74] text-[11px] font-bold border border-[#dce9ff]">
                            <span className="w-2 h-2 rounded-full bg-[#737686] animate-pulse" />
                            {isCritical ? 'Pending Dock Door' : 'Staged Buffer'}
                          </span>
                        )}

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#006243] text-[11px] font-bold border border-[#bdffdc]">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Dispatched / Delivered
                          </span>
                        )}

                        <span className="text-[11px] text-[#565e74] font-medium">
                          {isCompleted
                            ? `Turnaround: ${card.turnaroundMinutes}m`
                            : isTransit
                            ? `ETA: ${card.eta}`
                            : isCritical
                            ? `Wait: ${card.eta}`
                            : `Slot ${card.eta}`}
                        </span>
                      </div>
                    </div>

                    {/* Route Nodes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-[#eff4ff] text-xs border border-[#dce9ff]/60">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#565e74] uppercase font-bold tracking-wider">
                          Origin Zone
                        </span>
                        <span className="text-xs text-[#0b1c30] font-semibold flex items-center gap-1 mt-0.5 truncate">
                          <span className="material-symbols-outlined text-[16px] text-[#006243] shrink-0">
                            login
                          </span>
                          {card.source}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#565e74] uppercase font-bold tracking-wider">
                          Destination Hub
                        </span>
                        <span className="text-xs text-[#0b1c30] font-semibold flex items-center gap-1 mt-0.5 truncate">
                          <span className="material-symbols-outlined text-[16px] text-[#004ac6] shrink-0">
                            logout
                          </span>
                          {card.destination}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#565e74] uppercase font-bold tracking-wider">
                          {isCompleted
                            ? 'Signed Carrier Receipt'
                            : isPending && isCritical
                            ? 'Assignment'
                            : 'Carrier / Unit'}
                        </span>
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 mt-0.5 truncate ${
                            isPending && isCritical
                              ? 'text-[#ba1a1a]'
                              : isCompleted
                              ? 'text-[#006243]'
                              : 'text-[#0b1c30]'
                          }`}
                        >
                          {isPending && isCritical ? (
                            <span className="material-symbols-outlined text-[16px] shrink-0">
                              priority_high
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px] text-[#565e74] shrink-0">
                              pin_drop
                            </span>
                          )}
                          {card.carrier}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Telemetry & Role Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2 text-[#565e74] text-[11px] flex-wrap">
                        {card.specialHandling.coldChain ? (
                          <>
                            <span className="material-symbols-outlined text-[16px] text-[#2563eb]">
                              sensors
                            </span>
                            <span className="font-semibold text-[#004ac6]">
                              Cold Chain: {card.telemetry.temp || '4.2°C (OK)'}
                            </span>
                            <span>•</span>
                            <span>Locked {card.createdAt}</span>
                          </>
                        ) : isCritical ? (
                          <>
                            <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
                              ac_unit
                            </span>
                            <span className="text-[#ba1a1a] font-bold">
                              Strict Cold Chain Active
                            </span>
                            <span>•</span>
                            <span>Queue Pos: #{card.telemetry.queuePos || 1}</span>
                          </>
                        ) : isCompleted ? (
                          <>
                            <span className="material-symbols-outlined text-[16px] text-[#006243]">
                              verified
                            </span>
                            <span className="text-[#006243] font-semibold">
                              Manifest Cleared &amp; Archived
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">
                              inventory_2
                            </span>
                            <span>{card.cargo}</span>
                            <span>•</span>
                            <span>Non-perishable</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Admin Elevated Controls (visible only when Supervisor / Admin is active) */}
                        {role === 'admin' && (
                          <>
                            {isTransit && (
                              <button
                                onClick={() => onAdminAction('Force Priority Override', card.id)}
                                className="px-2 py-1 rounded bg-[#eff4ff] text-[#004ac6] hover:bg-[#dce9ff] text-[11px] font-bold transition-colors border border-[#dce9ff]"
                              >
                                Force Priority
                              </button>
                            )}

                            {isPending && isCritical && (
                              <button
                                onClick={() => onAdminAction('Force Assign Dock Bay', card.id)}
                                className="px-2 py-1 rounded bg-[#2563eb] text-white hover:bg-[#004ac6] text-[11px] font-bold transition-all shadow-xs"
                              >
                                Force Assign Bay
                              </button>
                            )}

                            {isPending && !isCritical && (
                              <button
                                onClick={() => onAdminAction('Promote Slot Preemption', card.id)}
                                className="px-2 py-1 rounded bg-[#eff4ff] text-[#004ac6] hover:bg-[#dce9ff] text-[11px] font-bold transition-colors border border-[#dce9ff]"
                              >
                                Promote Slot
                              </button>
                            )}
                          </>
                        )}

                        {/* Standard Action Buttons */}
                        {isPending && (
                          <button
                            onClick={() => onAssignBay(card.id)}
                            className="px-2.5 py-1 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors flex items-center gap-1 border border-[#dce9ff]"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              meeting_room
                            </span>
                            <span>Assign Bay</span>
                          </button>
                        )}

                        <button
                          onClick={() => onViewTelemetry(card)}
                          className="px-2.5 py-1 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors flex items-center gap-1 border border-[#dce9ff]"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isCompleted ? 'description' : isTransit ? 'analytics' : 'visibility'}
                          </span>
                          <span>
                            {isCompleted ? 'Audit Manifest' : isTransit ? 'Telemetry' : 'Inspect'}
                          </span>
                        </button>

                        {!isCompleted && (
                          <button
                            onClick={() => onCancelRequest(card.id)}
                            title="Cancel Request"
                            className="p-1 rounded-md text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Dock Door Matrix Status Footer Card */}
      <div
        onClick={onNavigateToDocks}
        className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#eff4ff] hover:border-[#2563eb]/40 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006243] group-hover:bg-[#2563eb]/10 group-hover:text-[#2563eb] transition-colors">
            <span className="material-symbols-outlined text-[20px]">door_front</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#0b1c30] group-hover:text-[#2563eb] transition-colors flex items-center gap-1">
              <span>Dock Door Matrix Status</span>
              <span className="material-symbols-outlined text-[16px] text-[#737686]">
                arrow_forward
              </span>
            </div>
            <div className="text-[11px] text-[#565e74]">
              Bay Doors 1-12 Operational • Bay 07 Scheduled Cleaning (14:30)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-[#eff4ff] text-[#006243]">
            <span className="w-2 h-2 rounded-full bg-[#006243]" /> 9 Occupied
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-[#eff4ff] text-[#004ac6]">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]" /> 2 Staging
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-[#eff4ff] text-[#565e74]">
            <span className="w-2 h-2 rounded-full bg-[#737686]" /> 1 Available
          </span>
        </div>
      </div>
    </div>
  );
};
