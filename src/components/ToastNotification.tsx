'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, Zap, X, ShoppingBag } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  subtitle: string;
  providerName: string;
  price: number;
  etaMinutes: number;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
  onViewBasket: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  onViewBasket,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-gray-950 text-white rounded-2xl p-3.5 shadow-2xl border border-gray-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-gray-950 flex items-center justify-center shrink-0 font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-white truncate">
              {toast.title}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 truncate">
              <span className="text-emerald-400 font-bold">Lowest: ₹{toast.price}</span>
              <span>on {toast.providerName}</span>
              <span className="text-amber-400 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-amber-400" />
                {toast.etaMinutes}m
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onViewBasket}
            className="text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg transition-colors"
          >
            View Cart
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
