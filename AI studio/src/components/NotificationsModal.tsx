import React from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'info' | 'success';
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClear: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#eff4ff] animate-fade-in flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">
              notifications
            </span>
            <h3 className="text-sm font-bold text-[#0b1c30]">Operational Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#eff4ff] text-[#737686]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto py-1">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-[#565e74] text-xs">
              No unread operational notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-start gap-2.5 text-xs"
              >
                <span
                  className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                    n.type === 'alert'
                      ? 'text-[#ba1a1a]'
                      : n.type === 'success'
                      ? 'text-[#006243]'
                      : 'text-[#004ac6]'
                  }`}
                >
                  {n.type === 'alert'
                    ? 'emergency'
                    : n.type === 'success'
                    ? 'check_circle'
                    : 'info'}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-[#0b1c30]">{n.title}</div>
                  <p className="text-[#565e74] text-[11px] mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-[#737686] mt-1 block">{n.time}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-[#eff4ff] flex justify-between items-center">
          <button
            onClick={onClear}
            className="text-xs text-[#565e74] hover:text-[#ba1a1a] font-semibold"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#2563eb] text-white text-xs font-semibold rounded-lg hover:bg-[#004ac6]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
