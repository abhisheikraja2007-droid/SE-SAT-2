import React, { useState } from 'react';
import { DispatchRole, UserSession } from '../types/dispatch';

interface HeaderProps {
  session: UserSession;
  onRoleChange: (newRole: DispatchRole) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onRoleChange,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  unreadCount,
  onSignOut,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6 border-b border-[#eff4ff]">
      {/* Left: Logo & System Identity */}
      <div className="flex items-center gap-4">
        <img
          src="https://lh3.googleusercontent.com/aida/AEtjO1Xp98klJjcEHIe7-OtxRRW58wx4748qN2HRRHaOZVW23loiUzBBut9v0ZYGzozdI1QY_QUevntMAzx9e6B1J-AYf-2BGFDjhjOcNEqYDA-NHiDim-Jvn_1eau0cmAQLiJUU4u2bndl-BojN-jixVna_WXwM_qbKzTu2M-bhjZ9v1tB8ldYJZiI48u0ogXjE352lgFXMl7YfvrUU8hhIdiU4wvw0sdYsdwYr5VlgsAN9OwsKmCFFSqzeC7CB"
          alt="Warehouse Dispatch Logo"
          className="h-8 w-auto object-contain"
        />
        <div className="flex items-center gap-2.5">
          <span className="text-base font-bold text-[#0b1c30] tracking-tight">
            Warehouse Dispatch System
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#006243] text-[11px] font-bold border border-[#bdffdc]/60">
            <span className="w-2 h-2 rounded-full bg-[#006243] animate-pulse" />
            Live Sync / Operational
          </span>
        </div>
      </div>

      {/* Right: Role Simulation, Search, Actions, Profile */}
      <div className="flex items-center gap-4">
        {/* Role Simulator Pill */}
        <div className="relative hidden xl:flex items-center bg-[#eff4ff] rounded-full p-0.5 border border-[#dce9ff]">
          <button
            onClick={() => onRoleChange('operator')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              session.role === 'operator'
                ? 'bg-white text-[#0b1c30] shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                session.role === 'operator' ? 'bg-[#2563eb]' : 'bg-[#c3c6d7]'
              }`}
            />
            Simulating Role: Dispatch Operator
          </button>

          <button
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              session.role === 'admin'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                session.role === 'admin' ? 'bg-white' : 'bg-[#c3c6d7]'
              }`}
            />
            <span>Fleet Supervisor / Admin</span>
            <span
              className={`text-[10px] px-1 rounded font-bold ${
                session.role === 'admin'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#dae2fd] text-[#004ac6]'
              }`}
            >
              PRO
            </span>
          </button>
        </div>

        {/* Global Quick Search */}
        <div className="hidden md:flex items-center bg-[#eff4ff] rounded-lg px-3 py-1.5 gap-2 border border-[#dce9ff]/70 focus-within:ring-2 focus-within:ring-[#2563eb] focus-within:bg-white transition-all">
          <span className="material-symbols-outlined text-[#737686] text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search loads, bays, drivers..."
            className="bg-transparent border-none outline-none text-xs text-[#0b1c30] placeholder:text-[#737686] w-48 lg:w-56 font-medium"
          />
          <kbd className="text-[10px] font-bold bg-white text-[#565e74] px-1.5 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#dce9ff]">
            ⌘K
          </kbd>
        </div>

        {/* Utility Icon Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
            title="Operational Alerts"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
            )}
          </button>

          <button
            onClick={() => alert("Warehouse Dispatch Terminal v4.2 PROD\nHotlines:\n- Yard Control: Ext 401\n- Refrigeration Ops: Ext 208\n- Gate Security: Ext 100")}
            className="p-2 rounded-lg text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
            title="Operations Help"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative pl-1">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#eff4ff] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#004ac6] flex items-center justify-center text-white shadow-sm font-bold text-xs">
              {session.role === 'admin' ? 'JK' : 'VS'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0b1c30] leading-tight">
                {session.name}
              </span>
              <span className="text-[11px] text-[#565e74] leading-tight font-medium">
                Console ID: {session.consoleId}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#737686]">
              expand_more
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-[#eff4ff] p-2 z-50 animate-fade-in">
              <div className="p-2.5 border-b border-[#eff4ff]">
                <div className="text-xs font-bold text-[#0b1c30]">{session.name}</div>
                <div className="text-[11px] text-[#565e74] truncate">{session.email}</div>
                <div className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#004ac6]">
                  {session.rolePill} • {session.hub}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onRoleChange(session.role === 'operator' ? 'admin' : 'operator');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#2563eb]">
                    swap_horiz
                  </span>
                  <span>
                    Switch to {session.role === 'operator' ? 'Admin / Supervisor' : 'Operator'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Exit to Gate Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
