import React, { useState } from 'react';

interface SystemConfigViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SystemConfigView: React.FC<SystemConfigViewProps> = ({ onShowToast }) => {
  const [fuelBase, setFuelBase] = useState(42.0);
  const [radiusMeters, setRadiusMeters] = useState(150);
  const [autoAllocation, setAutoAllocation] = useState(true);
  const [tlsStrict, setTlsStrict] = useState(true);
  const [tempMin, setTempMin] = useState(2.0);
  const [tempMax, setTempMax] = useState(8.0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('System Configuration parameters saved to Terminal Node ORL-BAY-09.', 'success');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#eff4ff] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-[24px]">tune</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0b1c30]">System &amp; Engine Configuration</h1>
            <p className="text-xs text-[#565e74]">
              Terminal rules, Autonomous AGV parameters, rate matrices, and telemetry security protocols
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 border border-[#eff4ff] space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#0b1c30] mb-1">Autonomous Load Allocator Parameters</h3>
          <p className="text-xs text-[#565e74] mb-3">Adjust auto-pairing logic for yard tractor units and AGVs.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c30] flex justify-between">
                <span>Pairing Radius</span>
                <span className="text-[#004ac6]">{radiusMeters} meters</span>
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                className="w-full accent-[#2563eb]"
              />
              <span className="text-[10px] text-[#565e74]">Standard terminal radius is 150m</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#0b1c30]">Auto-Pairing Engine</div>
                <div className="text-[11px] text-[#565e74]">Pair pallets upon gate check-in</div>
              </div>
              <input
                type="checkbox"
                checked={autoAllocation}
                onChange={(e) => setAutoAllocation(e.target.checked)}
                className="w-5 h-5 rounded text-[#2563eb] accent-[#2563eb]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#eff4ff]">
          <h3 className="text-sm font-bold text-[#0b1c30] mb-1">Cold Chain Monitoring Bounds</h3>
          <p className="text-xs text-[#565e74] mb-3">Temperature boundaries that trigger critical dispatch alarms.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#565e74] block mb-1">Min Threshold (°C)</label>
              <input
                type="number"
                step="0.5"
                value={tempMin}
                onChange={(e) => setTempMin(parseFloat(e.target.value))}
                className="w-full p-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-xs font-bold text-[#0b1c30]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#565e74] block mb-1">Max Threshold (°C)</label>
              <input
                type="number"
                step="0.5"
                value={tempMax}
                onChange={(e) => setTempMax(parseFloat(e.target.value))}
                className="w-full p-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-xs font-bold text-[#0b1c30]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#eff4ff]">
          <h3 className="text-sm font-bold text-[#0b1c30] mb-1">Tariff &amp; Fuel Baseline</h3>
          <p className="text-xs text-[#565e74] mb-3">Baseline surcharge fuel charge applied to standard dispatches.</p>

          <div className="max-w-xs">
            <label className="text-xs font-bold text-[#565e74] block mb-1">Base Fuel Surcharge ($)</label>
            <input
              type="number"
              step="1"
              value={fuelBase}
              onChange={(e) => setFuelBase(parseFloat(e.target.value))}
              className="w-full p-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-xs font-bold text-[#0b1c30]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#eff4ff] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setRadiusMeters(150);
              setFuelBase(42.0);
              setTempMin(2.0);
              setTempMax(8.0);
              onShowToast('Reset to facility default settings', 'info');
            }}
            className="px-4 py-2 bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold rounded-lg hover:bg-[#dce9ff]"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded-lg hover:bg-[#004ac6] shadow-xs"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
