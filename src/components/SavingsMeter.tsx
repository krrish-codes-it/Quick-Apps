'use client';

import React, { useState } from 'react';
import { ProviderCartBreakdown } from '@/types';
import { STORE_CONFIG } from './StoreBadge';
import { Trophy, TrendingDown, Info, Zap } from 'lucide-react';

interface SavingsMeterProps {
  stores: ProviderCartBreakdown[];
  bestStore: ProviderCartBreakdown | null;
}

export const SavingsMeter: React.FC<SavingsMeterProps> = ({ stores, bestStore }) => {
  const [viewMode, setViewMode] = useState<'landed' | 'items'>('landed');

  if (!stores || stores.length === 0 || !bestStore) return null;

  // Find max cost to scale bars proportionally
  const maxCost = Math.max(
    ...stores.map((s) => (viewMode === 'landed' ? s.totalLandedCost : s.itemsSubtotal))
  );

  const highestStore = stores[stores.length - 1];
  const maxSavings = Math.max(
    0,
    viewMode === 'landed'
      ? highestStore.totalLandedCost - bestStore.totalLandedCost
      : highestStore.itemsSubtotal - bestStore.itemsSubtotal
  );

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-gray-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-900/50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Multi-App Price Radar</span>
          </div>
          <h3 className="text-lg font-black text-white mt-1">
            Compare Final Checkout Price
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time landed cost comparison across 7 quick-commerce platforms
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-gray-800/80 p-1 rounded-xl flex items-center border border-gray-700 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setViewMode('landed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'landed'
                ? 'bg-emerald-500 text-gray-950 shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Final Landed Total
          </button>
          <button
            onClick={() => setViewMode('items')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'items'
                ? 'bg-emerald-500 text-gray-950 shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Items Only
          </button>
        </div>
      </div>

      {/* Best Price Highlight Banner */}
      {maxSavings > 0 && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-gray-950 flex items-center justify-center font-black">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                You save <span className="text-emerald-400 font-extrabold text-sm">₹{maxSavings}</span> by ordering on {bestStore.providerName}!
              </div>
              <div className="text-[10px] text-gray-400">
                Cheapest landed price factoring in handling, delivery & platform fees.
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-emerald-400">⚡️ ~{bestStore.etaMinutes} mins</div>
            <div className="text-[10px] text-gray-400">Fastest dark store</div>
          </div>
        </div>
      )}

      {/* Comparison Bars */}
      <div className="space-y-3">
        {stores.map((store, index) => {
          const conf = STORE_CONFIG[store.provider];
          const isCheapest = store.provider === bestStore.provider;
          const cost = viewMode === 'landed' ? store.totalLandedCost : store.itemsSubtotal;
          const percentage = Math.max(30, Math.round((cost / maxCost) * 100));

          return (
            <div key={store.provider} className="group">
              <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-black ${conf.bgColor} ${conf.textColor}`}
                  >
                    {conf.logoLetter}
                  </span>
                  <span className={isCheapest ? 'text-white font-extrabold' : 'text-gray-300'}>
                    {store.providerName}
                  </span>
                  {isCheapest && (
                    <span className="text-[9px] font-black uppercase bg-emerald-500 text-gray-950 px-1.5 py-0.2 rounded-md">
                      Lowest Cost
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    {store.etaMinutes}m
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {viewMode === 'landed' && store.deliveryFee === 0 && (
                    <span className="text-[10px] font-bold text-emerald-400">FREE DEL</span>
                  )}
                  <span className={`text-sm font-black ${isCheapest ? 'text-emerald-400' : 'text-white'}`}>
                    ₹{cost}
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="h-3 w-full bg-gray-800/80 rounded-full overflow-hidden p-0.5 border border-gray-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isCheapest
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm shadow-emerald-500/50'
                      : 'bg-gradient-to-r from-gray-600 to-gray-500 opacity-60 group-hover:opacity-80'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Fee Breakdown subtitle on hover or viewMode landed */}
              {viewMode === 'landed' && (
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5 px-0.5">
                  <span>Items: ₹{store.itemsSubtotal} • Delivery: {store.deliveryFee === 0 ? 'FREE' : `₹${store.deliveryFee}`}</span>
                  <span>Handling/Surge: ₹{store.handlingFee + store.platformFee + store.surgeFee + store.smallCartFee}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
