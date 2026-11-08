'use client';

import React, { useState } from 'react';
import { CanonicalProductGroup, QuickCommerceProvider } from '@/types';
import { PROVIDER_METADATA } from '@/core/engine/geo-resolver';
import { StoreBadge, STORE_CONFIG } from './StoreBadge';
import { Star, Zap, Plus, Minus, ExternalLink, Heart, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: CanonicalProductGroup;
  basketQuantity: number;
  onAddToCart: (product: CanonicalProductGroup) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onOpenDetail?: (product: CanonicalProductGroup) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  basketQuantity,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetail,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const lowest = product.lowestPriceOffer;
  const lowestMeta = PROVIDER_METADATA[lowest.provider];
  const lowestConf = STORE_CONFIG[lowest.provider];

  const providerList: QuickCommerceProvider[] = [
    'blinkit',
    'zepto',
    'instamart',
    'flipkart_minutes',
    'bigbasket_now',
    'jiomart_express',
    'amazon_now',
  ];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);
    if (onToggleFavorite) onToggleFavorite(product.id);
  };

  // Max discount calculation across any provider
  const maxDiscountPct = Math.max(
    ...Object.values(product.offers)
      .filter((o) => o && o.inStock)
      .map((o) => o?.discountPercentage || 0)
  );

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Top Floating Strip: Discount + Unit Price + Wishlist */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {maxDiscountPct > 0 ? (
              <span className="text-[10px] font-black tracking-tight px-2 py-0.5 rounded-full bg-red-500 text-white shadow-2xs">
                {maxDiscountPct}% OFF
              </span>
            ) : null}

            <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200/80">
              {lowest.standardUnitLabel}
            </span>
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full transition-colors ${
              favorite ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
            }`}
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Product Image & Title Area */}
        <div
          onClick={() => onOpenDetail && onOpenDetail(product)}
          className="flex gap-3.5 mb-3.5 cursor-pointer"
        >
          <div className="w-22 h-22 sm:w-26 sm:h-26 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-2 group-hover:border-amber-300 transition-colors">
            <img
              src={product.imageUrl}
              alt={product.canonicalTitle}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">
              {product.brand}
            </div>
            <h3 className="font-extrabold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
              {product.canonicalTitle}
            </h3>
            <div className="text-xs text-gray-500 mt-0.5 font-semibold">
              Pack: {product.displayPackSize}
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                <span>{product.rating}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] text-gray-400 font-medium">({product.ratingCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Hero Best Price Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/80 p-3 mb-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <span>Lowest Price Found</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-gray-950">
                  ₹{lowest.sellingPrice}
                </span>
                {lowest.mrp > lowest.sellingPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{lowest.mrp}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-700">
                  on {lowestMeta.name}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-extrabold text-gray-800 bg-white/90 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{lowest.etaMinutes} mins</span>
              </div>
              {product.priceSpread.maxSavingsRupees > 0 && (
                <div className="text-[10px] font-bold text-emerald-700 mt-1">
                  Save ₹{product.priceSpread.maxSavingsRupees}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Multi-App Comparison Grid with Authentic Store Badges */}
        <div className="space-y-1.5 mb-3.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
              Live App Prices (10m Delivery)
            </span>
            <span className="text-[9px] text-gray-400 font-medium">Updated live</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {providerList.map((providerKey) => {
              const offer = product.offers[providerKey];
              return (
                <StoreBadge
                  key={providerKey}
                  provider={providerKey}
                  price={offer?.sellingPrice}
                  mrp={offer?.mrp}
                  etaMinutes={offer?.etaMinutes}
                  isLowest={offer?.id === lowest.id}
                  inStock={offer?.inStock ?? false}
                  size="sm"
                  onClick={() => onOpenDetail && onOpenDetail(product)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Action Button / Quantity Stepper */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
        <a
          href={lowest.deepLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline"
          title={`Open directly on ${lowestMeta.name}`}
        >
          <span>Order on {lowestMeta.name}</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {basketQuantity === 0 ? (
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-black text-xs rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>ADD</span>
          </button>
        ) : (
          <div className="flex items-center bg-gray-950 text-white rounded-xl px-1.5 py-1 gap-2 shadow-xs">
            <button
              onClick={() => onUpdateQuantity(product.id, -1)}
              className="p-1 hover:bg-gray-800 active:scale-90 rounded-lg transition-transform"
            >
              <Minus className="w-3 h-3 stroke-[3]" />
            </button>
            <span className="text-xs font-black px-1.5">{basketQuantity}</span>
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="p-1 hover:bg-gray-800 active:scale-90 rounded-lg transition-transform"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
