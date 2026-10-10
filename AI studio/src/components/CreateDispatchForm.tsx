import React, { useState, useEffect } from 'react';
import { DispatchRequest, PriorityTier, SpecialHandling, RateEstimate } from '../types/dispatch';

interface CreateDispatchFormProps {
  onSubmit: (request: Omit<DispatchRequest, 'id' | 'createdAt' | 'telemetry'>) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreateDispatchForm: React.FC<CreateDispatchFormProps> = ({ onSubmit, onShowToast }) => {
  const [refId, setRefId] = useState('DSP-2025-8841-B');
  const [sourceBay, setSourceBay] = useState('Dock Door A-04 (Inbound)');
  const [destinationHub, setDestinationHub] = useState('Outbound Bay 19 (Long Haul)');
  const [priority, setPriority] = useState<PriorityTier>('expedited');
  const [cargoType, setCargoType] = useState('Electronics & Components');
  const [palletCount, setPalletCount] = useState<number>(8);
  const [specialHandling, setSpecialHandling] = useState<SpecialHandling>({
    hazmat: false,
    coldChain: true,
    highSecurity: false,
  });

  const [rateEstimate, setRateEstimate] = useState<RateEstimate>({
    baseSurcharge: 405.95,
    fuelBase: 42.0,
    turnaroundMinutes: 30,
    baySlot: 'Dock Door A-04',
    weightKg: 6400,
  });

  const generateToken = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const letters = ['A', 'B', 'C', 'X', 'Z'];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const newId = `DSP-2025-${randomSuffix}-${letter}`;
    setRefId(newId);
    onShowToast(`Assigned new system token: ${newId}`, 'info');
  };

  // Re-calculate rates whenever inputs change
  useEffect(() => {
    const weight = palletCount * 800;
    let base = 140 + palletCount * 18.5;
    if (specialHandling.hazmat) base += 95;
    if (specialHandling.coldChain) base += 65;
    if (specialHandling.highSecurity) base += 50;

    let minutes = 20 + Math.round(palletCount * 1.5);
    if (priority === 'critical') {
      base *= 1.45;
      minutes = 15;
    } else if (priority === 'expedited') {
      base *= 1.15;
      minutes = 30;
    } else {
      minutes = 65;
    }

    const slot = sourceBay.split('(')[0].trim() || 'Bay A-04';

    setRateEstimate({
      baseSurcharge: parseFloat(base.toFixed(2)),
      fuelBase: 42.0,
      turnaroundMinutes: minutes,
      baySlot: slot,
      weightKg: weight,
    });
  }, [palletCount, priority, specialHandling, sourceBay]);

  const handleIncrement = () => {
    if (palletCount < 44) setPalletCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (palletCount > 1) setPalletCount((prev) => prev - 1);
  };

  const handleReset = () => {
    setSourceBay('Dock Door A-04 (Inbound)');
    setDestinationHub('Outbound Bay 19 (Long Haul)');
    setPriority('expedited');
    setCargoType('Electronics & Components');
    setPalletCount(8);
    setSpecialHandling({
      hazmat: false,
      coldChain: true,
      highSecurity: false,
    });
    generateToken();
    onShowToast('Dispatch form reset to defaults', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceBay || !destinationHub) {
      onShowToast('Please choose both Origin and Destination Hubs', 'error');
      return;
    }

    let etaText = 'T+35m';
    if (priority === 'critical') etaText = 'Immediate (5m)';
    else if (priority === 'standard') etaText = 'T+90m';

    onSubmit({
      source: sourceBay,
      destination: destinationHub,
      carrier: 'Auto-Assigned Unit',
      priority,
      status: 'pending',
      cargo: cargoType,
      pallets: palletCount,
      specialHandling,
      eta: etaText,
      cost: rateEstimate.baseSurcharge,
      turnaroundMinutes: rateEstimate.turnaroundMinutes,
      baySlot: rateEstimate.baySlot,
      isCustom: true,
    });

    onShowToast(`Dispatch Request ${refId} verified and added to terminal queue!`, 'success');
    generateToken();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-4 border border-[#eff4ff]">
        {/* Section Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#eff4ff] text-[#004ac6]">
              <span className="material-symbols-outlined text-[22px]">departure_board</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b1c30]">Create Dispatch Request</h2>
              <p className="text-xs text-[#565e74]">
                Submit warehouse movement or bay transfers with dynamic rate validation
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#565e74] text-[11px] font-bold">
            FORM-04
          </span>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          {/* Dispatch ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider flex items-center justify-between">
              <span>Dispatch Reference ID</span>
              <span className="text-[#006243] font-semibold">System-Signed</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#565e74] material-symbols-outlined text-[18px]">
                tag
              </span>
              <input
                type="text"
                value={refId}
                readOnly
                className="w-full bg-[#eff4ff] border border-[#dce9ff] pl-9 pr-14 py-2 rounded-lg text-xs font-mono font-bold text-[#0b1c30] select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={generateToken}
                className="absolute right-2 px-2 py-1 text-[#565e74] hover:text-[#004ac6] hover:bg-white rounded text-xs flex items-center gap-1 transition-colors"
                title="Regenerate token"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span className="hidden sm:inline text-[11px] font-semibold">Gen</span>
              </button>
            </div>
          </div>

          {/* Origin & Destination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Origin */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
                Source Bay / Origin
              </label>
              <div className="relative">
                <select
                  value={sourceBay}
                  onChange={(e) => setSourceBay(e.target.value)}
                  required
                  className="w-full bg-white border border-[#dce9ff] text-[#0b1c30] py-2.5 px-3 rounded-lg text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] appearance-none pr-8 cursor-pointer font-medium"
                >
                  <option value="Dock Door A-04 (Inbound)">Dock Door A-04 (Inbound)</option>
                  <option value="Bay B-12 (Pallet Staging)">Bay B-12 (Pallet Staging)</option>
                  <option value="Cross-dock Staging 3">Cross-dock Staging 3</option>
                  <option value="Mezzanine Buffer Zone">Mezzanine Buffer Zone</option>
                  <option value="Gate 07 Fast Transfer">Gate 07 Fast Transfer</option>
                </select>
                <span className="material-symbols-outlined text-[#565e74] absolute right-2.5 top-2.5 pointer-events-none text-[18px]">
                  unfold_more
                </span>
              </div>
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
                Destination Hub
              </label>
              <div className="relative">
                <select
                  value={destinationHub}
                  onChange={(e) => setDestinationHub(e.target.value)}
                  required
                  className="w-full bg-white border border-[#dce9ff] text-[#0b1c30] py-2.5 px-3 rounded-lg text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] appearance-none pr-8 cursor-pointer font-medium"
                >
                  <option value="Outbound Bay 19 (Long Haul)">Outbound Bay 19 (Long Haul)</option>
                  <option value="Regional Yard West (Intermodal)">Regional Yard West (Intermodal)</option>
                  <option value="Zone C Cold Vault">Zone C Cold Vault</option>
                  <option value="Contract Carrier Lane 02">Contract Carrier Lane 02</option>
                  <option value="Air Freight Express Cargo">Air Freight Express Cargo</option>
                </select>
                <span className="material-symbols-outlined text-[#565e74] absolute right-2.5 top-2.5 pointer-events-none text-[18px]">
                  unfold_more
                </span>
              </div>
            </div>
          </div>

          {/* Priority Tier Allocation Segmented Control */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
              Priority Tier Allocation
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff]/60">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="standard"
                  checked={priority === 'standard'}
                  onChange={() => setPriority('standard')}
                  className="peer sr-only"
                />
                <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[#565e74] peer-checked:bg-white peer-checked:text-[#0b1c30] peer-checked:shadow-sm transition-all text-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#737686]" />
                    <span className="text-xs font-semibold">Standard</span>
                  </div>
                  <span className="text-[11px] text-[#565e74]">T+90m slot</span>
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="expedited"
                  checked={priority === 'expedited'}
                  onChange={() => setPriority('expedited')}
                  className="peer sr-only"
                />
                <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[#565e74] peer-checked:bg-white peer-checked:text-[#0b1c30] peer-checked:shadow-sm transition-all text-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    <span className="text-xs font-semibold">Expedited</span>
                  </div>
                  <span className="text-[11px] text-[#565e74]">T+35m slot</span>
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="critical"
                  checked={priority === 'critical'}
                  onChange={() => setPriority('critical')}
                  className="peer sr-only"
                />
                <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[#565e74] peer-checked:bg-white peer-checked:text-[#ba1a1a] peer-checked:shadow-sm transition-all text-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                    <span className="text-xs font-semibold">Critical</span>
                  </div>
                  <span className="text-[11px] text-[#ba1a1a]/80 font-medium">Immediate gate</span>
                </div>
              </label>
            </div>
          </div>

          {/* Cargo Classification & Pallet Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
                Cargo Classification
              </label>
              <div className="relative">
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full bg-white border border-[#dce9ff] text-[#0b1c30] py-2.5 px-3 rounded-lg text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] appearance-none pr-8 font-medium cursor-pointer"
                >
                  <option value="Electronics & Components">Electronics & High-Tech</option>
                  <option value="Perishable Pharmaceuticals">Perishable Medical Goods</option>
                  <option value="Automotive Subassemblies">Automotive Assemblies</option>
                  <option value="FMCG Dry Bulk">Dry Bulk & Packaging</option>
                </select>
                <span className="material-symbols-outlined text-[#565e74] absolute right-2.5 top-2.5 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Pallet Stepper */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider flex justify-between">
                <span>Pallet Count</span>
                <span className="text-[#565e74] font-medium tabular-nums">
                  ~{rateEstimate.weightKg.toLocaleString()} kg
                </span>
              </label>
              <div className="flex items-center rounded-lg bg-white border border-[#dce9ff] shadow-sm p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center justify-center text-[#0b1c30] font-bold text-lg active:scale-95 transition-transform"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="44"
                  value={palletCount}
                  onChange={(e) => setPalletCount(Math.max(1, Math.min(44, parseInt(e.target.value) || 1)))}
                  className="w-full text-center bg-transparent border-none text-base font-bold text-[#0b1c30] focus:outline-none tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center justify-center text-[#0b1c30] font-bold text-lg active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Special Handling Protocols */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
              Special Handling Protocols
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60 cursor-pointer hover:bg-[#dce9ff]/50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={specialHandling.hazmat}
                  onChange={(e) =>
                    setSpecialHandling((prev) => ({ ...prev, hazmat: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-[#2563eb] focus:ring-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0b1c30] leading-tight">
                    Hazmat / Class 3
                  </span>
                  <span className="text-[11px] text-[#565e74] leading-tight">Flammable liquid</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60 cursor-pointer hover:bg-[#dce9ff]/50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={specialHandling.coldChain}
                  onChange={(e) =>
                    setSpecialHandling((prev) => ({ ...prev, coldChain: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-[#2563eb] focus:ring-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0b1c30] leading-tight">
                    Cold Chain
                  </span>
                  <span className="text-[11px] text-[#565e74] leading-tight">2°C – 8°C Monitored</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60 cursor-pointer hover:bg-[#dce9ff]/50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={specialHandling.highSecurity}
                  onChange={(e) =>
                    setSpecialHandling((prev) => ({ ...prev, highSecurity: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-[#2563eb] focus:ring-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#0b1c30] leading-tight">
                    High Security
                  </span>
                  <span className="text-[11px] text-[#565e74] leading-tight">Dual-seal escort</span>
                </div>
              </label>
            </div>
          </div>

          {/* Live Tariff, Fuel Surcharge & Turnaround Banner */}
          <div className="p-3.5 rounded-xl bg-[#dce9ff]/60 border border-[#c3c6d7]/50 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#004ac6]">
                  receipt_long
                </span>
                <span className="text-xs font-bold">Dynamic Rate & Window Matrix</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#006243] font-bold shadow-xs">
                RATE LOCKED (15m)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="flex flex-col bg-white p-2.5 rounded-lg shadow-xs border border-[#eff4ff]">
                <span className="text-[11px] text-[#565e74] font-medium">Estimated Surcharge</span>
                <span className="text-base font-bold text-[#0b1c30] mt-0.5 tabular-nums">
                  ${rateEstimate.baseSurcharge.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#565e74]">Fuel base ${rateEstimate.fuelBase.toFixed(2)}</span>
              </div>

              <div className="flex flex-col bg-white p-2.5 rounded-lg shadow-xs border border-[#eff4ff]">
                <span className="text-[11px] text-[#565e74] font-medium">Turnaround Window</span>
                <span className="text-base font-bold text-[#004ac6] mt-0.5 tabular-nums">
                  {rateEstimate.turnaroundMinutes} min
                </span>
                <span className="text-[10px] text-[#565e74]">Door clear buffer</span>
              </div>

              <div className="flex flex-col bg-white p-2.5 rounded-lg shadow-xs border border-[#eff4ff]">
                <span className="text-[11px] text-[#565e74] font-medium">Bay Lock Slot</span>
                <span className="text-base font-bold text-[#0b1c30] mt-0.5 truncate">
                  {rateEstimate.baySlot}
                </span>
                <span className="text-[10px] text-[#006243] font-semibold">Guaranteed lock</span>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-lg bg-[#2563eb] text-white hover:bg-[#004ac6] font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[19px]">send</span>
              <span>Submit Dispatch Request</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-3 px-4 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-sm font-semibold transition-colors flex items-center gap-1.5 border border-[#dce9ff]"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* Autonomous Load Allocator Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between border border-[#eff4ff]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-[22px]">speed</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#0b1c30]">Autonomous Load Allocator</div>
            <div className="text-[11px] text-[#565e74]">
              Auto-pairing pallets with available tractor-units within 150m radius
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#dae2fd] text-[#5c647a] font-bold">
            Active Engine
          </span>
        </div>
      </div>
    </div>
  );
};
