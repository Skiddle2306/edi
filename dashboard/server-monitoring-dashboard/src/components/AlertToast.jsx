import React, { useEffect } from 'react';

const AlertToast = ({ alerts, onDismiss }) => {
  if (!alerts.length) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-red-600 text-white px-5 py-4 rounded-lg shadow-xl
                     flex items-start gap-3 animate-fade-in"
        >
          <span className="text-xl">🚨</span>
          <div className="flex-1">
            <p className="font-semibold text-sm">Request Spike Alert</p>
            <p className="text-xs mt-1 text-red-100">{alert.message}</p>
          </div>
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-red-200 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertToast;