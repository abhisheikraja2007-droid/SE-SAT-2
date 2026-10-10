import React from 'react';
import { DispatchRequest } from '../types/dispatch';

interface TelemetryModalProps {
  request: DispatchRequest | null;
  onClose: () => void;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eff4ff] animate-fade-in flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">sensors</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
                Live Sensor Telematics
              </div>
              <h3 className="text-base font-bold text-[#0b1c30]">{request.id}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#eff4ff] text-[#737686] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sensor details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
            <span className="text-[10px] text-[#565e74] uppercase font-bold">Cold Chain Telemetry</span>
            <span className="text-xl font-bold text-[#004ac6] mt-1 tabular-nums">
              {request.telemetry.temp || '4.2°C (OK)'}
            </span>
            <span className="text-[10px] text-[#006243] font-semibold mt-0.5">
              Target Range: 2.0°C – 8.0°C
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
            <span className="text-[10px] text-[#565e74] uppercase font-bold">Transponder Health</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl font-bold text-[#0b1c30] tabular-nums">
                {request.telemetry.sensorHealth || 99}%
              </span>
              <span className="w-2 h-2 rounded-full bg-[#006243] animate-pulse ml-1" />
            </div>
            <span className="text-[10px] text-[#565e74] mt-0.5">TLS 256-Bit Encrypted</span>
          </div>
        </div>

        {/* Visualized Temperature / Vibration Stream Simulation */}
        <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#dce9ff] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#0b1c30]">Recent Temperature Log Stream</span>
            <span className="text-[10px] text-[#565e74]">12 Samples (Every 60s)</span>
          </div>

          <div className="h-20 w-full flex items-end gap-1.5 pt-2 px-1">
            {[4.1, 4.2, 4.3, 4.2, 4.1, 4.2, 4.4, 4.3, 4.2, 4.2, 4.1, 4.2].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-[#2563eb] rounded-t-sm transition-all group-hover:bg-[#004ac6]"
                  style={{ height: `${(val / 6) * 100}%` }}
                />
                <span className="text-[9px] text-[#737686] hidden sm:block">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route Details */}
        <div className="p-3 rounded-xl bg-[#eff4ff] text-xs flex flex-col gap-1 border border-[#dce9ff]/60">
          <div className="flex justify-between">
            <span className="text-[#565e74]">Origin Bay:</span>
            <span className="font-bold text-[#0b1c30]">{request.source}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#565e74]">Destination Hub:</span>
            <span className="font-bold text-[#0b1c30]">{request.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#565e74]">Assigned Carrier:</span>
            <span className="font-semibold text-[#004ac6]">{request.carrier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#565e74]">GPS Position:</span>
            <span className="font-mono text-[#0b1c30]">
              {request.telemetry.gpsCoords || '37.7749° N, 122.4194° W'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#2563eb] text-white font-semibold text-xs rounded-lg hover:bg-[#004ac6] transition-colors"
        >
          Close Telemetry Monitor
        </button>
      </div>
    </div>
  );
};
