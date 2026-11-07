'use client';

import React from 'react';
import { CanonicalProductGroup, QuickCommerceProvider } from '@/types';
import { PROVIDER_METADATA } from '@/core/engine/geo-resolver';
import { Star, Zap, Plus, Minus, Check, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: CanonicalProductGroup;
  basketQuantity: number;
  onAddToCart: (product: CanonicalProductGroup) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onOpenDetail?: (product: CanonicalProductGroup) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  basketQuantity,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetail,
}) => {
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
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-300 transition-all p-4 shadow-xs hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top Badges: Savings & Unit Price */}
        <div className="flex items-center justify-between mb-2">
          {product.priceSpread.maxSavingsRupees > 0 ? (
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Save up to ₹{product.priceSpread.maxSavingsRupees} ({product.priceSpread.maxSavingsPercentage}%)
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-gray-500">
              Standard Price
            </span>
          )}

          <span className="text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {lowest.standardUnitLabel}
          </span>
        </div>

        {/* Product Image & Core Details */}
        <div 
          onClick={() => onOpenDetail && onOpenDetail(product)}
          className="flex gap-3 mb-3 cursor-pointer group"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-1 group-hover:border-amber-300 transition-colors">
            <img
              src={product.imageUrl}
              alt={product.canonicalTitle}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
              {product.brand}
            </div>
            <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
              {product.canonicalTitle}
            </h3>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">
              Pack: {product.displayPackSize}
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-600">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold ml-1 text-gray-800">{product.rating}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] text-gray-400">({product.ratingCount} ratings)</span>
            </div>
          </div>
        </div>

        {/* Hero Best Price Strip */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-2.5 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                <span>Best Available Price</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-extrabold text-gray-900">
                  ₹{lowest.sellingPrice}
                </span>
                {lowest.mrp > lowest.sellingPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{lowest.mrp}
                  </span>
                )}
                <span className="text-xs font-semibold text-emerald-700">
                  on {lowestMeta.name}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-white/80 px-2 py-1 rounded-lg border border-amber-200">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{lowest.etaMinutes} mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-App Provider Comparison Table */}
        <div className="space-y-1.5 mb-3">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">
            Live Prices Across 10-Min Delivery Apps
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {providerList.map((providerKey) => {
              const offer = product.offers[providerKey];
              const meta = PROVIDER_METADATA[providerKey];
              if (!offer) {
                return (
                  <div
                    key={providerKey}
                    className="p-1.5 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-[11px] text-gray-400 flex items-center justify-between opacity-60"
                  >
                    <span>{meta.name}</span>
                    <span className="text-[10px]">Unserviceable</span>
                  </div>
                );
              }

              const isBest = offer.id === lowest.id;

              return (
                <div
                  key={providerKey}
                  className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between transition-colors ${
                    isBest
                      ? 'border-emerald-400 bg-emerald-50/60 font-semibold'
                      : offer.inStock
                      ? 'border-gray-200 bg-white'
                      : 'border-red-100 bg-red-50/40 opacity-70'
                  }`}
                >
                  <div className="truncate pr-1">
                    <span className="block truncate font-medium text-gray-800">
                      {meta.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ⚡️ {offer.etaMinutes}m
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    {offer.inStock ? (
                      <div>
                        <div className={`font-bold ${isBest ? 'text-emerald-700' : 'text-gray-900'}`}>
                          ₹{offer.sellingPrice}
                        </div>
                        {isBest && (
                          <span className="text-[9px] font-bold text-emerald-600 uppercase block">
                            Lowest
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-red-600">
                        OOS
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Action Button / Quantity Stepper */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
        <a
          href={lowest.deepLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 hover:underline"
          title={`Open directly on ${lowestMeta.name}`}
        >
          <span>Order on {lowestMeta.name}</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {basketQuantity === 0 ? (
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Basket</span>
          </button>
        ) : (
          <div className="flex items-center bg-gray-900 text-white rounded-xl px-1.5 py-1 gap-2 shadow-xs">
            <button
              onClick={() => onUpdateQuantity(product.id, -1)}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold px-1">{basketQuantity}</span>
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
