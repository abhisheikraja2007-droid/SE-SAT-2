import React, { useState, useEffect } from 'react';
import { DispatchRole, UserSession } from '../types/dispatch';

interface AuthScreenProps {
  onAuthenticate: (session: UserSession) => void;
  initialRole?: DispatchRole;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate, initialRole = 'operator' }) => {
  const [role, setRole] = useState<DispatchRole>(initialRole);
  const [consoleId, setConsoleId] = useState(
    initialRole === 'operator' ? 'sterling.v@logistics.corp' : 'adm.kallstrom@logistics.corp'
  );
  const [passcode, setPasscode] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [hub, setHub] = useState('dc-04');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleRoleSwitch = (newRole: DispatchRole) => {
    setRole(newRole);
    if (newRole === 'operator') {
      setConsoleId('sterling.v@logistics.corp');
      showToast('Switched to Dispatch Operator Terminal Profile');
    } else {
      setConsoleId('adm.kallstrom@logistics.corp');
      showToast('Supervisor / Dispatch Admin Profile selected (PRO Elevated)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      showToast('Handshake complete. Launching active Bay Manifest...');

      setTimeout(() => {
        onAuthenticate({
          email: consoleId,
          consoleId: role === 'operator' ? 'DC-04' : 'DC-01',
          name: role === 'operator' ? 'Capt. V. Sterling' : 'Adm. J. Kallstrom',
          role: role,
          rolePill: role === 'operator' ? 'OP-TIER 2' : 'SUPV-ELEVATED',
          hub: hub === 'dc-04' ? 'Terminal DC-04 • North Bay Logistics Park' : 'Central Yard • Cross-Dock Depot',
          authenticated: true,
          workstationRemembered: rememberMe,
        });
      }, 700);
    }, 900);
  };

  const triggerSSO = (provider: string) => {
    showToast(`Routing to Enterprise ${provider} IDP...`);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onAuthenticate({
          email: `${role === 'operator' ? 'sterling.v' : 'adm.kallstrom'}@enterprise.idp`,
          consoleId: role === 'operator' ? 'DC-04' : 'DC-01',
          name: role === 'operator' ? 'Capt. V. Sterling' : 'Adm. J. Kallstrom',
          role: role,
          rolePill: role === 'operator' ? 'OP-SSO' : 'SUPV-SSO',
          hub: 'Terminal DC-04 • North Bay Logistics Park',
          authenticated: true,
          workstationRemembered: true,
        });
      }, 600);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-12 relative overflow-hidden font-sans">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#2563eb]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#85f8c4]/15 blur-3xl pointer-events-none" />

      {/* Top System Telemetry Marquee & Classification Pill */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-6 px-2 z-10">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#e5eeff] text-[#0b1c30] text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#006243] mr-1.5 animate-pulse" />
            Logistics Control v4.2 PROD
          </span>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-[#dce9ff] text-[#565e74] text-[11px] font-medium">
            <span className="material-symbols-outlined text-[14px] mr-1">lock</span>
            Restricted Terminal Access • 256-Bit TLS
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-[#565e74]">
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006243] mr-1" />
            Latency: 28ms
          </span>
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] mr-1" />
            Zone: US-EAST-BAY-04
          </span>
          <span className="font-semibold text-[#0b1c30] tabular-nums">{utcTime || '00:24:12 UTC'}</span>
        </div>
      </div>

      {/* Main Split Authentication Console */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative border border-[#e5eeff] z-10">
        {/* Left Column: Operations Visual Context & Live Manifest Glance */}
        <div className="lg:col-span-5 bg-[#213145] text-[#eaf1ff] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#213145] via-[#213145]/95 to-[#213145] pointer-events-none z-10" />
          <div
            className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtJSIcYw5yotSnxkUKUQcASmZfUvyHEYQsfYFhfNR7XX8Q_NGKSPF7E4OeABqym-TVmLjytUPzDRkf3Bd-Xm4CMd8Uk207EAAXI61gXUt9bOny0qLM0RQpmcQ-yDQ_Zk_MjC650Lo-cHaTObNQnjZGr_AW24oRTowfkdturWmCom5fqsqBdL47mR-6_WkQCOg07bBEjD95y6TbH_8km0mVOjeeGWQWm1Sa5Uiuoz8A6T2glF5xRIDj6w')`,
            }}
          />

          <div className="relative z-20 flex flex-col space-y-6">
            {/* Brand Identity */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-[24px]">hub</span>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#eaf1ff] tracking-tight leading-tight">DISPATCH MATRIX</h2>
                <p className="text-[11px] font-semibold text-[#bec6e0] uppercase tracking-wider">Enterprise Terminal Portal</p>
              </div>
            </div>

            {/* Terminal Status Card */}
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm space-y-3 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#eaf1ff]/90">BAY CLUSTER TELEMETRY</span>
                <span className="px-2 py-0.5 rounded-full bg-[#007d57] text-[#bdffdc] text-[11px] font-bold flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#85f8c4] mr-1 animate-pulse" /> ONLINE
                </span>
              </div>

              {/* Micro Visualizer */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded bg-white/10 text-center">
                  <div className="text-[10px] text-[#eaf1ff]/70 font-medium">BAY 11</div>
                  <div className="text-[15px] font-bold text-[#85f8c4]">ACT</div>
                </div>
                <div className="p-2 rounded bg-white/10 text-center">
                  <div className="text-[10px] text-[#eaf1ff]/70 font-medium">BAY 12</div>
                  <div className="text-[15px] font-bold text-[#bec6e0]">IDL</div>
                </div>
                <div className="p-2 rounded bg-white/10 text-center">
                  <div className="text-[10px] text-[#eaf1ff]/70 font-medium">BAY 13</div>
                  <div className="text-[15px] font-bold text-[#b4c5ff]">DIS</div>
                </div>
                <div className="p-2 rounded bg-white/10 text-center">
                  <div className="text-[10px] text-[#eaf1ff]/70 font-medium">BAY 14</div>
                  <div className="text-[15px] font-bold text-[#85f8c4]">ACT</div>
                </div>
              </div>

              {/* Throughput gauge */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-[#eaf1ff]/80 mb-1">
                  <span>Yard Capacity Saturation</span>
                  <span className="font-semibold text-[#eaf1ff] tabular-nums">74.2%</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2563eb] h-full rounded-full transition-all duration-500" style={{ width: '74.2%' }} />
                </div>
              </div>
            </div>

            {/* System Notice */}
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/10 border border-white/5">
              <span className="material-symbols-outlined text-[#bec6e0] text-[20px] mt-0.5 shrink-0">verified_user</span>
              <p className="text-xs text-[#eaf1ff]/80 leading-relaxed">
                Role validation applies dynamic dispatch clearance. Multi-factor handshake required for cross-hub override authorizations.
              </p>
            </div>
          </div>

          <div className="relative z-20 pt-6 mt-6 border-t border-white/10">
            <div className="flex items-center space-x-2 text-[#eaf1ff]/60 text-xs">
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>
                Node ID: <code className="text-[#eaf1ff] font-mono font-semibold">NODE-ORL-BAY-09</code>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login Authentication Workbench */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Header & Subtitle */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">Executive Dispatch Console</h1>
                <p className="text-sm text-[#565e74] mt-0.5">Authorized terminal authentication &amp; fleet operations sign-in</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-[20px]">security</span>
              </div>
            </div>

            {/* Dual Role Simulation Switcher */}
            <div className="p-1 bg-[#eff4ff] rounded-lg flex items-center mb-6">
              <button
                type="button"
                onClick={() => handleRoleSwitch('operator')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                  role === 'operator'
                    ? 'bg-white text-[#004ac6] shadow-sm'
                    : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">pallet</span>
                <span>Operator Terminal</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                  role === 'admin'
                    ? 'bg-white text-[#004ac6] shadow-sm'
                    : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">shield_person</span>
                <span>Supervisor / Dispatch Admin</span>
              </button>
            </div>

            {/* Authentication Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Corporate Email / ID Input */}
              <div>
                <label className="block text-[11px] font-bold text-[#565e74] uppercase tracking-wider mb-1" htmlFor="console-id">
                  Corporate Email or Console ID
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#737686] flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </span>
                  <input
                    id="console-id"
                    type="text"
                    required
                    value={consoleId}
                    onChange={(e) => setConsoleId(e.target.value)}
                    className="w-full pl-10 pr-24 py-2.5 bg-[#f8f9ff] border border-[#e5eeff] rounded-lg text-sm text-[#0b1c30] placeholder:text-[#737686] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb] transition-all font-medium"
                    placeholder="e.g. sterling.v@logistics.corp"
                  />
                  <span className="absolute right-3 px-2 py-0.5 rounded text-[11px] font-bold bg-[#dce9ff] text-[#004ac6]">
                    {role === 'operator' ? 'OP-TIER 2' : 'SUPV-ELEVATED'}
                  </span>
                </div>
              </div>

              {/* Passcode / Token Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#565e74] uppercase tracking-wider" htmlFor="passcode">
                    Security Passcode or Hardware Token
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Credential recovery link transmitted to enterprise key vault')}
                    className="text-xs text-[#004ac6] hover:underline font-medium"
                  >
                    Forgot Credentials?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#737686] flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[18px]">password</span>
                  </span>
                  <input
                    id="passcode"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#f8f9ff] border border-[#e5eeff] rounded-lg text-sm text-[#0b1c30] placeholder:text-[#737686] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb] transition-all font-mono"
                    placeholder="Enter operational token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#737686] hover:text-[#0b1c30] p-1 rounded"
                    title={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Hub / Sector Select */}
              <div>
                <label className="block text-[11px] font-bold text-[#565e74] uppercase tracking-wider mb-1" htmlFor="hub-selection">
                  Designated Hub &amp; Gate Sector
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#737686] flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[18px]">warehouse</span>
                  </span>
                  <select
                    id="hub-selection"
                    value={hub}
                    onChange={(e) => setHub(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#f8f9ff] border border-[#e5eeff] rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2563eb] appearance-none transition-all cursor-pointer font-medium"
                  >
                    <option value="dc-04">Terminal DC-04 • North Bay Logistics Park (Active Workstation)</option>
                    <option value="hub-a04">Inbound Hub A-04 • Intermodal Yard</option>
                    <option value="central-yard">Central Yard • Bulk Cross-Dock Depot</option>
                    <option value="air-cargo">Air Freight Cargo Sector • Gate 9</option>
                  </select>
                  <span className="absolute right-3 pointer-events-none text-[#737686] flex items-center">
                    <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
                  </span>
                </div>
              </div>

              {/* Checkbox & Hardware Token */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-sm">
                <label className="flex items-center space-x-2 text-[#0b1c30] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563eb] focus:ring-[#2563eb] border-[#c3c6d7]"
                  />
                  <span className="text-xs text-[#565e74]">Remember workstation identity</span>
                </label>
                <button
                  type="button"
                  onClick={() => showToast('FIDO2 hardware challenge prompt sent to USB token key...')}
                  className="inline-flex items-center space-x-1 text-[#004ac6] hover:underline text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-[14px]">key</span>
                  <span>Hardware Key (FIDO2)</span>
                </button>
              </div>

              {/* Primary Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full py-3 px-4 rounded-lg bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-80"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                      <span>Verifying Credentials & TLS Session...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">verified</span>
                      <span>Access Granted • Entering Console...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      <span>
                        {role === 'operator'
                          ? 'Authenticate & Enter Dispatch Console'
                          : 'Authorize Supervisor Override & Enter'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full h-px bg-[#e5eeff]" />
              <span className="absolute px-3 bg-white text-[11px] font-bold text-[#565e74] uppercase tracking-widest">
                Or Enterprise Federated Sign-In
              </span>
            </div>

            {/* Secondary SSO Action Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => triggerSSO('Okta / Entra')}
                className="py-2.5 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold flex items-center justify-center space-x-2 transition-all border border-[#dce9ff]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#565e74]">corporate_fare</span>
                <span>Okta / Entra SSO</span>
              </button>
              <button
                type="button"
                onClick={() => triggerSSO('SmartCard / CAC')}
                className="py-2.5 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold flex items-center justify-center space-x-2 transition-all border border-[#dce9ff]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#565e74]">contactless</span>
                <span>SmartCard / CAC Reader</span>
              </button>
            </div>
          </div>

          {/* Bottom Security Protocol notice */}
          <div className="pt-6 mt-6 border-t border-[#e5eeff]">
            <p className="text-[11px] text-[#737686] leading-tight text-center">
              Authorized personnel only. All access attempts, manifest overrides, and dock assignments are logged under Sec-Ops Protocol 402.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Operational Telemetry Bottom Bar */}
      <div className="w-full max-w-4xl mt-6 px-4 py-3 rounded-lg bg-[#e5eeff] flex flex-wrap items-center justify-between gap-3 text-[#565e74] text-xs z-10 border border-[#dce9ff]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#006243]" />
          <span className="font-semibold text-[#0b1c30]">Dispatch Engine: Operational</span>
          <span className="text-[#737686]">/</span>
          <span>Live Sync: Active</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>
            Active Dock Doors: <strong className="text-[#0b1c30]">24/24 Online</strong>
          </span>
          <span>
            Trailer Queue: <strong className="text-[#0b1c30]">18 Inbound</strong>
          </span>
          <span className="hidden sm:inline">Version: 4.2.0-rc9</span>
        </div>
      </div>

      {/* Interactive Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#213145] text-white py-2.5 px-4 rounded-lg shadow-xl text-xs font-medium flex items-center space-x-2 border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
