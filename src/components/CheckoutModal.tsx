'use client';

import React, { useState } from 'react';
import { ProviderCartBreakdown, SplitCartOption } from '@/types';
import { STORE_CONFIG } from './StoreBadge';
import { X, CheckCircle2, MapPin, Zap, ExternalLink, ShieldCheck, ArrowRight, Clock } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleStore: ProviderCartBreakdown | null;
  splitOption: SplitCartOption | null;
  mode: 'single' | 'split';
  deliveryAddress: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  singleStore,
  splitOption,
  mode,
  deliveryAddress,
}) => {
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const conf = singleStore ? STORE_CONFIG[singleStore.provider] : null;

  const handleLaunchApp = (url: string) => {
    setOrderPlaced(true);
    setTimeout(() => {
      window.open(url, '_blank');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                  Instant 10-Min Dispatch
                </h3>
                <p className="text-[11px] text-gray-500">
                  {mode === 'single' && singleStore
                    ? `Direct checkout via ${singleStore.providerName}`
                    : 'Split cart order execution'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Location Banner */}
          <div className="mt-4 p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-900">Delivering to</div>
              <div className="text-[11px] text-gray-600 truncate">{deliveryAddress}</div>
            </div>
          </div>

          {/* ETA & Dark Store Live Routing Status */}
          <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-extrabold text-emerald-950">
                  Estimated Delivery: ~{singleStore ? singleStore.etaMinutes : 12} mins
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                Express Route
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
              Order will be routed to the closest micro-warehouse dark store in your cluster. Packing takes 2 minutes; delivery transit takes 7-9 minutes.
            </p>
          </div>

          {/* Price & Fee Summary */}
          {mode === 'single' && singleStore && conf && (
            <div className="mt-4 border border-gray-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{singleStore.itemsSubtotal}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-bold text-emerald-700">
                  {singleStore.deliveryFee === 0 ? 'FREE' : `₹${singleStore.deliveryFee}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Handling & Platform Fees</span>
                <span className="font-bold text-gray-900">
                  ₹{singleStore.handlingFee + singleStore.platformFee + singleStore.surgeFee + singleStore.smallCartFee}
                </span>
              </div>
              {singleStore.itemSavings > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-700">
                  <span className="font-medium">Total Savings vs MRP</span>
                  <span className="font-bold">-₹{singleStore.itemSavings}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Total Landed Amount</div>
                  <div className="text-xl font-black text-gray-950">₹{singleStore.totalLandedCost}</div>
                </div>

                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${conf.bgColor} ${conf.textColor}`}>
                  {conf.shortName}
                </div>
              </div>
            </div>
          )}

          {/* Split-Cart Details */}
          {mode === 'split' && splitOption && (
            <div className="mt-4 border border-purple-200 rounded-2xl p-4 space-y-3 bg-purple-50/40">
              <div className="text-xs font-bold text-purple-950">
                Split Cart Execution (Save ₹{splitOption.netSavingsComparedToBestSingle} more):
              </div>
              <div className="space-y-2">
                {splitOption.orders.map((ord, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-purple-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900">{ord.provider.toUpperCase()}</div>
                      <div className="text-[10px] text-gray-500">{ord.items.length} items • ⚡️ {ord.etaMinutes}m</div>
                    </div>
                    <a
                      href={ord.deepLinkCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                    >
                      <span>Pay ₹{ord.orderTotal}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & Action */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct app deep link guarantee • No markups or middleman commissions</span>
            </div>

            {mode === 'single' && singleStore && (
              <button
                onClick={() => handleLaunchApp(singleStore.deepLinkCheckoutUrl)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Launch {singleStore.providerName} to Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
