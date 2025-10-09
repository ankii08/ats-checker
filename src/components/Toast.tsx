// Toast notification component
'use client';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = 'info') {
  const toast: Toast = { id: toastId++, message, type };
  toastListeners.forEach(listener => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };

    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-6 py-4 rounded-lg shadow-2xl animate-slide-in-right ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            toast.type === 'warning' ? 'bg-yellow-600 text-white' :
            'bg-indigo-600 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {toast.type === 'success' ? '✓' :
               toast.type === 'error' ? '✕' :
               toast.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
