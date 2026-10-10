import React from 'react';
import { FleetUnit, DispatchRole } from '../types/dispatch';

interface FleetTelemetryViewProps {
  fleet: FleetUnit[];
  role: DispatchRole;
  onOpenSensorChart: (unit: FleetUnit) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FleetTelemetryView: React.FC<FleetTelemetryViewProps> = ({
  fleet,
  role,
  onOpenSensorChart,
  onShowToast,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#eff4ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-[24px]">local_shipping</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Fleet Telemetry &amp; Yard AGVs</h1>
            <p className="text-xs text-[#565e74]">
              Real-time tractor positioning, high-precision GPS telematics, and cold-chain sensor streams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('All 4 active fleet beacons pinged. Signal latency 28ms.', 'success')}
            className="px-3 py-2 rounded-lg bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>Ping All Transponders</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fleet.map((unit) => {
          const isTransit = unit.status === 'in-transit';
          const isStaged = unit.status === 'staged';
          const isDocked = unit.status === 'docked';
          const isIdle = unit.status === 'idle';

          return (
            <div
              key={unit.id}
              className="p-5 rounded-xl bg-white shadow-xs border border-[#eff4ff] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[22px] text-[#2563eb]">
                      rv_hookup
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#0b1c30]">{unit.unitNumber}</h3>
                      <div className="text-xs text-[#565e74]">Driver: {unit.driver}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      isTransit
                        ? 'bg-[#eff4ff] text-[#004ac6] border border-[#dce9ff]'
                        : isStaged
                        ? 'bg-[#dae2fd] text-[#004ac6]'
                        : isDocked
                        ? 'bg-[#eff4ff] text-[#006243]'
                        : 'bg-[#eff4ff] text-[#737686]'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                {/* Telemetry Stats Strip */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#eff4ff]">
                  <div className="bg-[#eff4ff] p-2.5 rounded-lg flex flex-col">
                    <span className="text-[10px] text-[#565e74] font-semibold uppercase">Speed</span>
                    <span className="text-sm font-bold text-[#0b1c30] tabular-nums mt-0.5">
                      {unit.speed} km/h
                    </span>
                  </div>

                  <div className="bg-[#eff4ff] p-2.5 rounded-lg flex flex-col">
                    <span className="text-[10px] text-[#565e74] font-semibold uppercase">Battery</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-sm font-bold text-[#0b1c30] tabular-nums">
                        {unit.battery}%
                      </span>
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          unit.battery > 50 ? 'text-[#006243]' : 'text-[#ba1a1a]'
                        }`}
                      >
                        {unit.battery > 80 ? 'battery_full' : 'battery_5_bar'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#eff4ff] p-2.5 rounded-lg flex flex-col">
                    <span className="text-[10px] text-[#565e74] font-semibold uppercase">Reefer Temp</span>
                    <span
                      className={`text-sm font-bold mt-0.5 tabular-nums ${
                        unit.temp !== undefined ? 'text-[#004ac6]' : 'text-[#737686]'
                      }`}
                    >
                      {unit.temp !== undefined ? `${unit.temp}°C` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Route Info */}
                <div className="mt-3 p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#565e74]">Assigned Route:</span>
                    <span className="font-bold text-[#0b1c30] truncate max-w-[200px]">{unit.route}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#565e74]">Current Location:</span>
                    <span className="font-semibold text-[#004ac6] truncate max-w-[200px]">{unit.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#565e74]">Active Payload:</span>
                    <span className="text-[#565e74] truncate max-w-[200px]">{unit.cargo}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#eff4ff]">
                <button
                  onClick={() => onOpenSensorChart(unit)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#dce9ff]"
                >
                  <span className="material-symbols-outlined text-[16px]">monitoring</span>
                  <span>Sensor Log</span>
                </button>

                <button
                  onClick={() => onShowToast(`Radio channel opened to ${unit.driver} (${unit.unitNumber})`, 'info')}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#dce9ff]"
                >
                  <span className="material-symbols-outlined text-[16px]">headset_mic</span>
                  <span>Comms Link</span>
                </button>

                {role === 'admin' && (
                  <button
                    onClick={() => onShowToast(`Supervisor override: Sent route diversion to ${unit.unitNumber}`, 'success')}
                    className="py-2 px-3 rounded-lg bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold transition-colors"
                    title="Admin Route Reroute"
                  >
                    Reroute
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
