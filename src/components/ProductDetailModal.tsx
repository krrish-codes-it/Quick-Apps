'use client';

import React from 'react';
import { CanonicalProductGroup, QuickCommerceProvider } from '@/types';
import { PROVIDER_METADATA } from '@/core/engine/geo-resolver';
import { X, Star, Zap, Check, AlertCircle, ExternalLink, Plus, Minus, ShoppingBag } from 'lucide-react';

interface ProductDetailModalProps {
  product: CanonicalProductGroup | null;
  isOpen: boolean;
  onClose: () => void;
  basketQuantity: number;
  onAddToCart: (product: CanonicalProductGroup) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  basketQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  if (!isOpen || !product) return null;

  const lowest = product.lowestPriceOffer;
  const fastest = product.fastestDeliveryOffer;
  const lowestMeta = PROVIDER_METADATA[lowest.provider];

  const providerList: QuickCommerceProvider[] = [
    'blinkit',
    'zepto',
    'instamart',
    'flipkart_minutes',
    'bigbasket_now',
    'jiomart_express',
    'amazon_now',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center bg-black/50 backdrop-blur-xs">
        <div className="w-full max-w-xl transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
                {product.brand} • {product.category}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug">
                {product.canonicalTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Overview Row */}
          <div className="py-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-2">
              <img
                src={product.imageUrl}
                alt={product.canonicalTitle}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800">
                  Pack Size: {product.displayPackSize}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  Unit Price: {lowest.standardUnitLabel}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold ml-1 text-gray-900">{product.rating}</span>
                </div>
                <span>•</span>
                <span>{product.ratingCount.toLocaleString()} verified buyers</span>
              </div>

              {product.priceSpread.maxSavingsRupees > 0 && (
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  🎉 Save up to ₹{product.priceSpread.maxSavingsRupees} ({product.priceSpread.maxSavingsPercentage}%) by choosing {lowestMeta.name}!
                </div>
              )}
            </div>
          </div>

          {/* Detailed Price Comparison Table */}
          <div className="mt-2">
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
              Real-Time Pricing Across 10-Minute Delivery Apps
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 text-xs">
              {providerList.map((providerKey) => {
                const offer = product.offers[providerKey];
                const meta = PROVIDER_METADATA[providerKey];

                if (!offer) {
                  return (
                    <div
                      key={providerKey}
                      className="p-3 bg-gray-50/50 flex items-center justify-between text-gray-400 opacity-60"
                    >
                      <div className="font-semibold">{meta.name}</div>
                      <div>Out of delivery range</div>
                    </div>
                  );
                }

                const isLowest = offer.id === lowest.id;

                return (
                  <div
                    key={providerKey}
                    className={`p-3 flex items-center justify-between transition-colors ${
                      isLowest ? 'bg-emerald-50/70 font-semibold' : 'bg-white hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.logoBg }} />
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <span>{meta.name}</span>
                          {isLowest && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded-md font-extrabold">
                              Lowest Price
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 font-normal">
                          ⚡️ {offer.etaMinutes} mins delivery • {offer.standardUnitLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      {offer.inStock ? (
                        <div>
                          <div className={`text-sm font-extrabold ${isLowest ? 'text-emerald-700' : 'text-gray-900'}`}>
                            ₹{offer.sellingPrice}
                          </div>
                          {offer.mrp > offer.sellingPrice && (
                            <div className="text-[10px] text-gray-400 line-through">
                              MRP ₹{offer.mrp}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-red-600">Out of Stock</span>
                      )}

                      <a
                        href={offer.deepLinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        title={`Open on ${meta.name}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Best Price Offer</div>
              <div className="text-lg font-extrabold text-gray-950">
                ₹{lowest.sellingPrice}{' '}
                <span className="text-xs font-semibold text-emerald-700">on {lowestMeta.name}</span>
              </div>
            </div>

            {basketQuantity === 0 ? (
              <button
                onClick={() => onAddToCart(product)}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Basket</span>
              </button>
            ) : (
              <div className="flex items-center bg-gray-900 text-white rounded-xl px-2.5 py-1.5 gap-3 shadow-xs">
                <button
                  onClick={() => onUpdateQuantity(product.id, -1)}
                  className="p-1 hover:bg-gray-800 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm font-bold px-2">{basketQuantity} in Basket</span>
                <button
                  onClick={() => onUpdateQuantity(product.id, 1)}
                  className="p-1 hover:bg-gray-800 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
