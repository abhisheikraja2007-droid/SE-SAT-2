import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DispatchConsole } from './components/DispatchConsole';
import { DockDoorsView } from './components/DockDoorsView';
import { FleetTelemetryView } from './components/FleetTelemetryView';
import { ManifestView } from './components/ManifestView';
import { ExceptionsView } from './components/ExceptionsView';
import { ThroughputView } from './components/ThroughputView';
import { SystemConfigView } from './components/SystemConfigView';
import { TelemetryModal } from './components/TelemetryModal';
import { NotificationsModal } from './components/NotificationsModal';
import {
  DispatchRequest,
  DockBay,
  FleetUnit,
  ExceptionItem,
  UserSession,
  DispatchRole,
} from './types/dispatch';
import {
  initialRequests,
  initialDockBays,
  initialFleet,
  initialExceptions,
  initialUserSession,
} from './data/initialData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // Session & Authentication Gateway
  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('dsp_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialUserSession;
      }
    }
    return initialUserSession;
  });

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dispatch-console');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Operational Datasets
  const [requests, setRequests] = useState<DispatchRequest[]>(() => {
    const saved = localStorage.getItem('dsp_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialRequests;
      }
    }
    return initialRequests;
  });

  const [dockBays, setDockBays] = useState<DockBay[]>(() => {
    const saved = localStorage.getItem('dsp_docks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialDockBays;
      }
    }
    return initialDockBays;
  });

  const [fleet, setFleet] = useState<FleetUnit[]>(initialFleet);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(initialExceptions);

  // Modals & Overlays
  const [telemetryModalItem, setTelemetryModalItem] = useState<DispatchRequest | null>(null);
  const [assignBayModalId, setAssignBayModalId] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Bay Door A-04 Staging Ready',
      message: 'Inbound tractor trailer completed clearance checklist.',
      time: '2m ago',
      type: 'info' as const,
    },
    {
      id: 'notif-2',
      title: 'Cold-Chain Telemetry Nominal',
      message: 'Refrigerated transit loads maintaining 3.8°C - 4.2°C.',
      time: '12m ago',
      type: 'success' as const,
    },
    {
      id: 'notif-3',
      title: 'Gate Exception Detected',
      message: 'RFID tag mismatch on Inbound Gate Sector 3.',
      time: '18m ago',
      type: 'alert' as const,
    },
  ]);

  // Persist key datasets
  useEffect(() => {
    localStorage.setItem('dsp_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('dsp_docks', JSON.stringify(dockBays));
  }, [dockBays]);

  useEffect(() => {
    localStorage.setItem('dsp_user_session', JSON.stringify(session));
  }, [session]);

  // Background Simulated Events (every 35 seconds per user request)
  useEffect(() => {
    if (!session.authenticated) return;

    const interval = setInterval(() => {
      // Small simulated event: update fleet unit position or temperature
      setFleet((prevFleet) =>
        prevFleet.map((unit) => {
          if (unit.status === 'in-transit') {
            const jitter = (Math.random() * 0.4 - 0.2).toFixed(1);
            const newTemp = parseFloat(Math.max(2.5, Math.min(6.5, (unit.temp || 4.2) + parseFloat(jitter))).toFixed(1));
            return {
              ...unit,
              temp: newTemp,
              speed: Math.floor(50 + Math.random() * 15),
            };
          }
          return unit;
        })
      );
    }, 35000);

    return () => clearInterval(interval);
  }, [session.authenticated]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAuthenticate = (newSession: UserSession) => {
    setSession(newSession);
    showToast(`Access Granted: Welcome, ${newSession.name} (${newSession.rolePill})`, 'success');
  };

  const handleSignOut = () => {
    setSession((prev) => ({ ...prev, authenticated: false }));
    showToast('Signed out of terminal workstation', 'info');
  };

  const handleRoleChange = (newRole: DispatchRole) => {
    setSession((prev) => ({
      ...prev,
      role: newRole,
      name: newRole === 'admin' ? 'Adm. J. Kallstrom' : 'Capt. V. Sterling',
      consoleId: newRole === 'admin' ? 'DC-01' : 'DC-04',
      rolePill: newRole === 'admin' ? 'SUPV-ELEVATED' : 'OP-TIER 2',
    }));

    if (newRole === 'admin') {
      showToast('Role elevated: Fleet Supervisor / Admin Mode active', 'info');
    } else {
      showToast('Switched to Dispatch Operator User Mode', 'info');
    }
  };

  const handleSubmitRequest = (data: Omit<DispatchRequest, 'id' | 'createdAt' | 'telemetry'>) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `DSP-2025-${randomSuffix}-X`;

    const newRequest: DispatchRequest = {
      ...data,
      id,
      createdAt: 'Just now',
      telemetry: {
        temp: data.specialHandling.coldChain ? '3.8°C (OK)' : undefined,
        tempStatus: 'ok',
        queuePos: 1,
        sensorHealth: 100,
        batteryPct: 95,
        gpsCoords: '37.7749° N, 122.4194° W',
      },
      isCustom: true,
    };

    setRequests((prev) => [newRequest, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Dispatch Created: ${id}`,
        message: `${data.pallets} Pallets • ${data.source} → ${data.destination}`,
        time: 'Just now',
        type: 'success',
      },
      ...prev,
    ]);
  };

  const handleCancelRequest = (id: string) => {
    if (window.confirm(`Confirm cancellation of dispatch token ${id}? Yard slots will be unlocked.`)) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast(`Task ${id} has been aborted and slot removed from yard queue`, 'error');
    }
  };

  const handleAssignBay = (id: string) => {
    setAssignBayModalId(id);
  };

  const handleConfirmBayAssign = (bayName: string) => {
    if (!assignBayModalId) return;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === assignBayModalId) {
          return {
            ...r,
            carrier: `Allocated to ${bayName}`,
            baySlot: bayName,
            status: 'transit',
            eta: '10m',
          };
        }
        return r;
      })
    );

    showToast(`Assigned ${bayName} to task ${assignBayModalId}`, 'success');
    setAssignBayModalId(null);
  };

  const handleAdminAction = (actionName: string, id: string) => {
    showToast(`Supervisor Directive: Executed "${actionName}" on ${id}`, 'success');

    if (actionName.includes('Priority')) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, priority: 'critical', eta: '5m' } : r))
      );
    } else if (actionName.includes('Assign Dock Bay')) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'transit',
                carrier: 'Direct Bay Assignment #04',
                eta: '8m',
              }
            : r
        )
      );
    } else if (actionName.includes('Promote')) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, priority: 'expedited', eta: '15m' } : r))
      );
    }
  };

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Live dispatch stream synced with Terminal ERP v4.2', 'info');
    }, 850);
  };

  const handleUpdateDock = (updated: DockBay) => {
    setDockBays((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleResolveException = (id: string, note: string) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'resolved', resolutionNote: note } : e))
    );
  };

  const openExceptionCount = exceptions.filter((e) => e.status !== 'resolved').length;

  // If user is not authenticated, render the Executive Dispatch Console authentication portal
  if (!session.authenticated) {
    return (
      <AuthScreen
        onAuthenticate={handleAuthenticate}
        initialRole={session.role}
      />
    );
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen font-sans flex">
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 border border-black/5 ${
                isError
                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                  : isInfo
                  ? 'bg-[#213145] text-white'
                  : 'bg-[#2563eb] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">
                {isError ? 'error' : isInfo ? 'info' : 'check_circle'}
              </span>
              <div className="text-xs font-semibold flex-1">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-70 hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        exceptionCount={openExceptionCount}
        bayOccupancyPct={82}
        onSignOut={handleSignOut}
      />

      {/* Main App Content Viewport (offset left 64 for sidebar) */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <Header
          session={session}
          onRoleChange={handleRoleChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNotifications={() => setNotificationsOpen(true)}
          unreadCount={notifications.length}
          onSignOut={handleSignOut}
        />

        <main className="w-full pt-20 px-6 sm:px-8 pb-12 flex-1 max-w-[1600px]">
          {currentTab === 'dispatch-console' && (
            <DispatchConsole
              role={session.role}
              onRoleChange={handleRoleChange}
              requests={requests}
              onSubmitRequest={handleSubmitRequest}
              onCancelRequest={handleCancelRequest}
              onAssignBay={handleAssignBay}
              onViewTelemetry={(req) => setTelemetryModalItem(req)}
              onAdminAction={handleAdminAction}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSimulateSync={handleSimulateSync}
              isSyncing={isSyncing}
              onNavigateToDocks={() => setCurrentTab('dock-doors')}
              onShowToast={showToast}
              activeCount={requests.filter((r) => r.status !== 'cancelled').length}
            />
          )}

          {currentTab === 'dock-doors' && (
            <DockDoorsView
              docks={dockBays}
              role={session.role}
              onUpdateDock={handleUpdateDock}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'fleet-telemetry' && (
            <FleetTelemetryView
              fleet={fleet}
              role={session.role}
              onOpenSensorChart={(unit) => {
                // Find matching request or create transient telemetry view
                const matched = requests.find((r) => r.id === unit.dspId);
                setTelemetryModalItem(
                  matched || {
                    id: unit.unitNumber,
                    source: unit.route.split('→')[0]?.trim() || 'Terminal Staging',
                    destination: unit.route.split('→')[1]?.trim() || 'Yard Outbound',
                    carrier: unit.driver,
                    priority: 'expedited',
                    status: 'transit',
                    cargo: unit.cargo,
                    pallets: 12,
                    specialHandling: { hazmat: false, coldChain: true, highSecurity: false },
                    eta: 'Live GPS',
                    createdAt: 'Now',
                    cost: 380,
                    turnaroundMinutes: 24,
                    baySlot: 'Bay In-Transit',
                    telemetry: {
                      temp: `${unit.temp || 4.2}°C (OK)`,
                      sensorHealth: 100,
                      batteryPct: unit.battery,
                      gpsCoords: '37.7749° N, 122.4194° W',
                    },
                  }
                );
              }}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'load-manifests' && (
            <ManifestView requests={requests} onShowToast={showToast} />
          )}

          {currentTab === 'exceptions' && (
            <ExceptionsView
              exceptions={exceptions}
              role={session.role}
              onResolveException={handleResolveException}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'throughput-kpis' && <ThroughputView />}

          {currentTab === 'system-config' && <SystemConfigView onShowToast={showToast} />}
        </main>
      </div>

      {/* Telemetry Detail Modal */}
      <TelemetryModal
        request={telemetryModalItem}
        onClose={() => setTelemetryModalItem(null)}
      />

      {/* Quick Assign Bay Modal */}
      {assignBayModalId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#eff4ff] animate-fade-in flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#eff4ff]">
              <div>
                <span className="text-[10px] font-bold text-[#565e74] uppercase">Terminal Allocation</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">Assign Dock Bay Slot</h3>
              </div>
              <button
                onClick={() => setAssignBayModalId(null)}
                className="p-1 rounded-lg hover:bg-[#eff4ff] text-[#737686]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#565e74]">
              Select an available terminal door to clear dispatch token{' '}
              <strong className="text-[#0b1c30]">{assignBayModalId}</strong>:
            </p>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto py-1">
              {dockBays
                .filter((d) => d.status === 'available' || d.status === 'staging')
                .map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleConfirmBayAssign(b.name)}
                    className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-left flex justify-between items-center transition-colors border border-[#dce9ff]"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0b1c30]">{b.name}</div>
                      <div className="text-[11px] text-[#565e74]">{b.doorType} Gate</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#006243]">
                      Available
                    </span>
                  </button>
                ))}
            </div>

            <div className="pt-2 border-t border-[#eff4ff] flex justify-end gap-2">
              <button
                onClick={() => setAssignBayModalId(null)}
                className="px-3 py-1.5 text-xs text-[#565e74] hover:text-[#0b1c30] font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer/Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onClear={() => setNotifications([])}
      />
    </div>
  );
}
