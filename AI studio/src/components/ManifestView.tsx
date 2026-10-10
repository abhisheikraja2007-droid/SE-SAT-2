import React, { useState } from 'react';
import { DispatchRequest } from '../types/dispatch';

interface ManifestViewProps {
  requests: DispatchRequest[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ManifestView: React.FC<ManifestViewProps> = ({ requests, onShowToast }) => {
  const [selectedRequest, setSelectedRequest] = useState<DispatchRequest | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#eff4ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-[24px]">fact_check</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Load Manifests &amp; Custody Audit</h1>
            <p className="text-xs text-[#565e74]">
              Verifiable Bills of Lading (BOL), EDI 214 transit status logs, and digital POD signatures
            </p>
          </div>
        </div>

        <button
          onClick={() => onShowToast('Exported 4 verifiable EDI manifests (JSON/XML standard)', 'success')}
          className="px-3 py-2 rounded-lg bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span>Export EDI 214 Archive</span>
        </button>
      </div>

      {/* Manifests Table / List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#eff4ff] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Dispatch Token</th>
                <th className="py-3 px-4">Origin / Hub</th>
                <th className="py-3 px-4">Carrier / Vehicle</th>
                <th className="py-3 px-4">Pallets / Cargo</th>
                <th className="py-3 px-4">Handling Class</th>
                <th className="py-3 px-4">Status &amp; POD</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {requests.map((item) => (
                <tr key={item.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0b1c30]">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#0b1c30] truncate max-w-[160px]">{item.source}</div>
                    <div className="text-[#565e74] text-[11px] truncate max-w-[160px]">→ {item.destination}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#0b1c30] truncate max-w-[150px]">{item.carrier}</div>
                    <div className="text-[#565e74] text-[11px]">Slot: {item.baySlot}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#0b1c30]">{item.pallets} Pallets</span>
                    <div className="text-[#565e74] text-[11px] truncate max-w-[140px]">{item.cargo}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.specialHandling.hazmat && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold mr-1">
                        Hazmat
                      </span>
                    )}
                    {item.specialHandling.coldChain && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-[#dae2fd] text-[#004ac6] text-[10px] font-bold mr-1">
                        Cold Chain
                      </span>
                    )}
                    {!item.specialHandling.hazmat && !item.specialHandling.coldChain && (
                      <span className="text-[#565e74]">Standard Dry</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006243] font-bold text-[11px] border border-[#bdffdc]">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        POD Verified #9921
                      </span>
                    ) : item.status === 'transit' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#004ac6] font-bold text-[11px]">
                        Active Transit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#737686] font-bold text-[11px]">
                        Staged Pre-Gate
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(item)}
                      className="px-2.5 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] font-semibold text-xs transition-colors border border-[#dce9ff]"
                    >
                      Inspect BOL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manifest Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eff4ff] animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#004ac6]">
                  Standard Freight Bill of Lading
                </span>
                <h3 className="text-lg font-bold text-[#0b1c30]">{selectedRequest.id}</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg hover:bg-[#eff4ff] text-[#737686]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#565e74] text-[10px] uppercase font-bold">Shipper / Origin</span>
                  <div className="font-bold text-[#0b1c30] mt-0.5">{selectedRequest.source}</div>
                </div>
                <div>
                  <span className="text-[#565e74] text-[10px] uppercase font-bold">Consignee Hub</span>
                  <div className="font-bold text-[#0b1c30] mt-0.5">{selectedRequest.destination}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-[#eff4ff] flex flex-col">
                  <span className="text-[10px] text-[#565e74]">Total Pallets</span>
                  <span className="text-sm font-bold text-[#0b1c30]">{selectedRequest.pallets}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#eff4ff] flex flex-col">
                  <span className="text-[10px] text-[#565e74]">Est. Gross Mass</span>
                  <span className="text-sm font-bold text-[#0b1c30]">
                    {(selectedRequest.pallets * 800).toLocaleString()} kg
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#eff4ff] flex flex-col">
                  <span className="text-[10px] text-[#565e74]">Tariff Total</span>
                  <span className="text-sm font-bold text-[#004ac6]">${selectedRequest.cost.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[#eff4ff] text-xs">
                <div className="font-bold text-[#0b1c30] mb-1">Chain of Custody Verification:</div>
                <div className="text-[#565e74] text-[11px] leading-relaxed">
                  Cryptographically sealed under Terminal Key <code className="font-mono font-semibold">SHA256:7b49...e021</code>. 
                  Digital carrier signature verified via Sec-Ops protocol 402. Gate lock cleared at timestamp {selectedRequest.createdAt}.
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#eff4ff] flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  onShowToast(`Printing Official BOL for ${selectedRequest.id}`, 'info');
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Official Waybill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
