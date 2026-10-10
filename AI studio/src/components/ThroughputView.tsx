import React from 'react';

export const ThroughputView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#eff4ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-[24px]">insights</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Terminal Throughput &amp; KPIs</h1>
            <p className="text-xs text-[#565e74]">
              Turnaround dwell velocity, gate utilization efficiency, and daily dispatch throughput analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#565e74]">Benchmark Period:</span>
          <span className="px-3 py-1 rounded-md bg-[#eff4ff] text-[#004ac6] font-bold text-xs border border-[#dce9ff]">
            Last 24 Hours
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#eff4ff] shadow-xs flex flex-col">
          <span className="text-[11px] font-bold text-[#565e74] uppercase">Average Bay Turnaround</span>
          <span className="text-2xl font-bold text-[#006243] mt-1 tabular-nums">24 min</span>
          <span className="text-[10px] text-[#006243] mt-1 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
            -6m vs. shift benchmark
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#eff4ff] shadow-xs flex flex-col">
          <span className="text-[11px] font-bold text-[#565e74] uppercase">Fleet Capacity Utilization</span>
          <span className="text-2xl font-bold text-[#004ac6] mt-1 tabular-nums">88%</span>
          <span className="text-[10px] text-[#2563eb] mt-1 font-semibold">Optimal Operating Envelope</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#eff4ff] shadow-xs flex flex-col">
          <span className="text-[11px] font-bold text-[#565e74] uppercase">Dispatched Loads Today</span>
          <span className="text-2xl font-bold text-[#0b1c30] mt-1 tabular-nums">142</span>
          <span className="text-[10px] text-[#006243] mt-1 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +18% above median
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#eff4ff] shadow-xs flex flex-col">
          <span className="text-[11px] font-bold text-[#565e74] uppercase">Cold-Chain Compliance</span>
          <span className="text-2xl font-bold text-[#006243] mt-1 tabular-nums">99.8%</span>
          <span className="text-[10px] text-[#006243] mt-1 font-semibold">Zero Critical Excursions</span>
        </div>
      </div>

      {/* Hourly Flow Chart & Door Dwell Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-xs border border-[#eff4ff] p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0b1c30]">Hourly Pallet Movement Velocity</h3>
            <p className="text-xs text-[#565e74]">Pallets staged &amp; cleared per hour</p>
          </div>

          <div className="h-44 w-full flex items-end gap-2 pt-6 px-2">
            {[24, 38, 45, 62, 54, 78, 92, 85, 96, 74, 82, 68].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div
                  className="w-full bg-[#2563eb] rounded-t-md transition-all group-hover:bg-[#004ac6]"
                  style={{ height: `${(val / 100) * 100}%` }}
                />
                <span className="text-[9px] text-[#737686]">{idx * 2}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-[#eff4ff] p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0b1c30]">Bay Door Clearance Breakdown</h3>
            <p className="text-xs text-[#565e74]">Turnaround time distribution across bay types</p>
          </div>

          <div className="space-y-3 pt-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#0b1c30]">Inbound Doors (Bays 1-4)</span>
                <span className="text-[#565e74] tabular-nums font-bold">22 min avg</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
                <div className="h-full bg-[#006243] rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#0b1c30]">Cross-Dock Bays (Bays 5-6)</span>
                <span className="text-[#565e74] tabular-nums font-bold">18 min avg</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
                <div className="h-full bg-[#2563eb] rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#0b1c30]">Outbound Staging (Bays 8-12)</span>
                <span className="text-[#565e74] tabular-nums font-bold">29 min avg</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
                <div className="h-full bg-[#d97706] rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#eff4ff] text-[11px] text-[#737686] flex justify-between">
            <span>Terminal Operating Mode: Dynamic AI Allocator</span>
            <span className="font-bold text-[#006243]">Target SLA: 98.4% Met</span>
          </div>
        </div>
      </div>
    </div>
  );
};
