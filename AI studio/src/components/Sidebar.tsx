import React from 'react';

export type NavigationTab = 
  | 'dispatch-console'
  | 'dock-doors'
  | 'fleet-telemetry'
  | 'load-manifests'
  | 'exceptions'
  | 'throughput-kpis'
  | 'system-config';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  exceptionCount: number;
  bayOccupancyPct?: number;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  exceptionCount,
  bayOccupancyPct = 82,
  onSignOut,
}) => {
  const navItems = [
    {
      id: 'dispatch-console' as NavigationTab,
      label: 'Dispatch Console',
      icon: 'grid_view',
    },
    {
      id: 'dock-doors' as NavigationTab,
      label: 'Dock Doors',
      icon: 'meeting_room',
    },
    {
      id: 'fleet-telemetry' as NavigationTab,
      label: 'Fleet Telemetry',
      icon: 'local_shipping',
    },
    {
      id: 'load-manifests' as NavigationTab,
      label: 'Load Manifests',
      icon: 'fact_check',
    },
    {
      id: 'exceptions' as NavigationTab,
      label: 'Exceptions',
      icon: 'warning',
      badge: exceptionCount,
      badgeColor: 'bg-[#ffdad6] text-[#93000a]',
    },
    {
      id: 'throughput-kpis' as NavigationTab,
      label: 'Throughput & KPIs',
      icon: 'insights',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between pt-20 pb-6 border-r border-[#eff4ff]">
      <div className="px-4 flex flex-col gap-4">
        {/* Header Tagline */}
        <div className="px-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#565e74] font-bold">
            Logistics Control
          </span>
          <span className="text-[11px] text-[#006243] bg-[#eff4ff] px-2 py-0.5 rounded-full font-bold">
            v4.2 PROD
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-[#2563eb] text-[#eeefff] font-semibold shadow-sm'
                    : 'text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span className="font-medium text-[13px]">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-white text-[#ba1a1a]' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Bay Occupancy + System Config + Logout */}
      <div className="px-4 flex flex-col gap-2">
        <div className="p-3 rounded-xl bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dce9ff]/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#565e74] font-medium">Bay Occupancy</span>
            <span className="font-bold text-[#0b1c30]">{bayOccupancyPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
              style={{ width: `${bayOccupancyPct}%` }}
            />
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onSelectTab('system-config')}
            className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'system-config'
                ? 'bg-[#dce9ff] text-[#0b1c30] font-semibold'
                : 'text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">tune</span>
            <span>System Config</span>
          </button>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-medium text-[#737686] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
          >
            <span className="material-symbols-outlined text-[19px]">logout</span>
            <span>Switch Terminal / Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};
