'use client';

import React, { useState } from 'react';
import { BasketAnalysis, BasketItem } from '@/types';
import { PROVIDER_METADATA } from '@/core/engine/geo-resolver';
import { X, Trash2, Plus, Minus, ArrowRight, Zap, Sparkles, AlertCircle, ShoppingBag, Share2, Copy, Check } from 'lucide-react';

interface BasketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: BasketItem[];
  analysis: BasketAnalysis | null;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearBasket: () => void;
}

export const BasketDrawer: React.FC<BasketDrawerProps> = ({
  isOpen,
  onClose,
  items,
  analysis,
  onUpdateQuantity,
  onRemoveItem,
  onClearBasket,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bestSingle = analysis?.bestSingleStore;
  const splitCart = analysis?.splitCartOption;

  const generateShareText = () => {
    if (!analysis || !bestSingle) return '';

    let text = `🛒 *QuickBuy 10M Grocery Price Comparison*\n\n`;
    text += `📦 *Items (${items.length}):*\n`;
    items.forEach((item, idx) => {
      text += `${idx + 1}. ${item.canonicalProduct.canonicalTitle} (${item.canonicalProduct.displayPackSize}) x${item.quantity}\n`;
    });

    text += `\n🏆 *Lowest Price Store: ${bestSingle.providerName}*\n`;
    text += `• Items Total: ₹${bestSingle.itemsSubtotal}\n`;
    text += `• Delivery Fee: ${bestSingle.deliveryFee === 0 ? 'FREE' : `₹${bestSingle.deliveryFee}`}\n`;
    text += `• Total Landed Cost: *₹${bestSingle.totalLandedCost}* (ETA: ~${bestSingle.etaMinutes} mins)\n\n`;

    text += `📊 *Price Breakdown Across Apps:*\n`;
    analysis.singleStoreOptions.forEach((s) => {
      text += `• ${s.providerName}: ₹${s.totalLandedCost} ${s.provider === bestSingle.provider ? '🥇 (Cheapest)' : ''}\n`;
    });

    if (splitCart && splitCart.isRecommended) {
      text += `\n💡 *Split-Cart Tip:* Split between ${splitCart.orders.map(o => o.provider).join(' & ')} to save ₹${splitCart.netSavingsComparedToBestSingle} more!\n`;
    }

    text += `\nCompare live on QuickBuy: http://localhost:3000`;
    return text;
  };

  const handleShareWhatsApp = () => {
    const text = generateShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-extrabold text-gray-900">
                Unified Multi-Cart Basket
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {items.length} items
              </span>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={onClearBasket}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold p-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                  title="Clear basket"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Your basket is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  Add milk, bread, eggs, chips, or cold drinks to compare live landed prices across 10-minute apps.
                </p>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                    Selected Items ({items.length})
                  </div>
                  {items.map((bItem) => {
                    const prod = bItem.canonicalProduct;
                    const lowest = prod.lowestPriceOffer;
                    const meta = PROVIDER_METADATA[lowest.provider];

                    return (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.imageUrl}
                            alt={prod.canonicalTitle}
                            className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">
                              {prod.canonicalTitle}
                            </h4>
                            <div className="text-[11px] text-gray-500">
                              {prod.displayPackSize} • Best: ₹{lowest.sellingPrice} ({meta.name})
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(prod.id, -1)}
                              className="p-1 text-gray-600 hover:text-gray-900"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-2">{bItem.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(prod.id, 1)}
                              className="p-1 text-gray-600 hover:text-gray-900"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(prod.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Split-Cart Recommendation Banner (if applicable) */}
                {splitCart && splitCart.isRecommended && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Smart Split-Cart Strategy</span>
                    </div>
                    <p className="text-xs text-purple-800 mt-1 font-medium leading-relaxed">
                      Split your items across 2 apps to save an extra{' '}
                      <span className="font-extrabold text-purple-950">
                        ₹{splitCart.netSavingsComparedToBestSingle}
                      </span>{' '}
                      even after paying delivery charges!
                    </p>

                    <div className="mt-2.5 space-y-1.5 text-xs">
                      {splitCart.orders.map((ord, idx) => {
                        const ordMeta = PROVIDER_METADATA[ord.provider];
                        return (
                          <div
                            key={idx}
                            className="bg-white/80 border border-purple-100 rounded-xl p-2 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-gray-900">{ordMeta.name}:</span>{' '}
                              <span className="text-gray-600">{ord.items.length} items</span>
                            </div>
                            <div className="font-extrabold text-gray-900">
                              ₹{ord.orderTotal}{' '}
                              <span className="text-[10px] font-normal text-gray-400">
                                (⚡️ {ord.etaMinutes}m)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 text-right">
                      <div className="text-xs font-bold text-purple-950">
                        Total Split Cost: ₹{splitCart.totalLandedCost}
                      </div>
                    </div>
                  </div>
                )}

                {/* Landed Cost Comparison Across All 10-Min Platforms */}
                {analysis && analysis.singleStoreOptions.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                        Final Landed Price (All Fees Included)
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        Ranked by lowest total
                      </span>
                    </div>

                    <div className="space-y-2">
                      {analysis.singleStoreOptions.map((store, index) => {
                        const meta = PROVIDER_METADATA[store.provider];
                        const isCheapest = index === 0;

                        return (
                          <div
                            key={store.provider}
                            className={`p-3 rounded-xl border transition-all ${
                              isCheapest
                                ? 'border-emerald-300 bg-emerald-50/70 shadow-xs'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-xs text-gray-900">
                                    {meta.name}
                                  </span>
                                  {isCheapest && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[9px] font-extrabold uppercase">
                                      Lowest Landed Cost
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-0.5">
                                    <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                    {store.etaMinutes} mins
                                  </span>
                                </div>

                                <div className="text-[11px] text-gray-500 mt-1 space-x-1">
                                  <span>Items: ₹{store.itemsSubtotal}</span>
                                  <span>•</span>
                                  <span>
                                    Delivery:{' '}
                                    {store.deliveryFee === 0 ? (
                                      <span className="text-emerald-700 font-bold">FREE</span>
                                    ) : (
                                      `₹${store.deliveryFee}`
                                    )}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Fees: ₹{store.handlingFee + store.platformFee + store.surgeFee + store.smallCartFee}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-base font-extrabold text-gray-950">
                                  ₹{store.totalLandedCost}
                                </div>
                                {store.itemSavings > 0 && (
                                  <div className="text-[10px] font-semibold text-emerald-700">
                                    Saved ₹{store.itemSavings}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Deep Link Action */}
                            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-[10px] text-gray-500">
                                {store.allInStock
                                  ? '✅ All items available'
                                  : `⚠️ ${store.itemsAvailable}/${store.totalItemsRequested} in stock`}
                              </span>

                              <a
                                href={store.deepLinkCheckoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                                  isCheapest
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                <span>Order on {meta.name}</span>
                                <ArrowRight className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Bottom Bar */}
          {items.length > 0 && bestSingle && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2.5">
              {/* WhatsApp Share & Copy Bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  title="Share breakdown on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={handleCopySummary}
                  className="py-1.5 px-3 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  title="Copy breakdown text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">
                    Cheapest Checkout ({bestSingle.providerName})
                  </div>
                  <div className="text-lg font-extrabold text-gray-950">
                    ₹{bestSingle.totalLandedCost}
                  </div>
                </div>

                <a
                  href={bestSingle.deepLinkCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>Proceed to {bestSingle.providerName}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
