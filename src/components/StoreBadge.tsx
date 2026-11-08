'use client';

import React from 'react';
import { QuickCommerceProvider } from '@/types';
import { Zap } from 'lucide-react';

interface StoreBadgeProps {
  provider: QuickCommerceProvider;
  price?: number;
  mrp?: number;
  etaMinutes?: number;
  isLowest?: boolean;
  inStock?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showEta?: boolean;
  onClick?: () => void;
}

export const STORE_CONFIG: Record<
  QuickCommerceProvider,
  {
    name: string;
    shortName: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    accentColor: string;
    logoLetter: string;
    tagline: string;
  }
> = {
  blinkit: {
    name: 'Blinkit',
    shortName: 'Blinkit',
    bgColor: 'bg-yellow-400',
    textColor: 'text-gray-950',
    borderColor: 'border-yellow-500',
    accentColor: '#F8CB46',
    logoLetter: '⚡️',
    tagline: '10 min delivery',
  },
  zepto: {
    name: 'Zepto',
    shortName: 'Zepto',
    bgColor: 'bg-purple-900',
    textColor: 'text-white',
    borderColor: 'border-purple-800',
    accentColor: '#52057B',
    logoLetter: 'Z',
    tagline: '10 min grocery',
  },
  instamart: {
    name: 'Swiggy Instamart',
    shortName: 'Instamart',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    borderColor: 'border-orange-600',
    accentColor: '#FC8019',
    logoLetter: 'S',
    tagline: 'Instant grocery',
  },
  flipkart_minutes: {
    name: 'Flipkart Minutes',
    shortName: 'Flipkart',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-700',
    accentColor: '#2874F0',
    logoLetter: 'F',
    tagline: 'Minutes delivery',
  },
  bigbasket_now: {
    name: 'BB Now (Tata)',
    shortName: 'BB Now',
    bgColor: 'bg-emerald-600',
    textColor: 'text-white',
    borderColor: 'border-emerald-700',
    accentColor: '#84C225',
    logoLetter: 'bb',
    tagline: 'Tata express',
  },
  jiomart_express: {
    name: 'JioMart Quick',
    shortName: 'JioMart',
    bgColor: 'bg-sky-600',
    textColor: 'text-white',
    borderColor: 'border-sky-700',
    accentColor: '#0078AD',
    logoLetter: 'J',
    tagline: 'Reliance quick',
  },
  amazon_now: {
    name: 'Amazon Fresh Fast',
    shortName: 'Amazon',
    bgColor: 'bg-amber-500',
    textColor: 'text-gray-950',
    borderColor: 'border-amber-600',
    accentColor: '#FF9900',
    logoLetter: 'a',
    tagline: 'Prime fast',
  },
};

export const StoreBadge: React.FC<StoreBadgeProps> = ({
  provider,
  price,
  mrp,
  etaMinutes,
  isLowest = false,
  inStock = true,
  size = 'md',
  showEta = true,
  onClick,
}) => {
  const conf = STORE_CONFIG[provider];

  if (!inStock) {
    return (
      <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-400 opacity-60 text-xs">
        <span className="font-semibold">{conf.shortName}</span>
        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
          Out of Stock
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between rounded-xl border transition-all ${
        onClick ? 'cursor-pointer hover:shadow-xs' : ''
      } ${
        isLowest
          ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs ring-1 ring-emerald-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      } ${size === 'sm' ? 'p-1.5 text-xs' : size === 'lg' ? 'p-3 text-sm' : 'p-2 text-xs'}`}
    >
      {/* Store Logo & ETA */}
      <div className="flex items-center gap-2 min-w-0 pr-1">
        <div
          className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px] shadow-2xs shrink-0 ${conf.bgColor} ${conf.textColor}`}
        >
          {conf.logoLetter}
        </div>
        <div className="truncate">
          <div className="font-bold text-gray-900 leading-tight truncate flex items-center gap-1">
            <span>{conf.shortName}</span>
            {isLowest && (
              <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1 py-0.2 rounded-xs">
                Cheapest
              </span>
            )}
          </div>
          {showEta && etaMinutes && (
            <div className="text-[10px] text-gray-500 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              <span>{etaMinutes}m</span>
            </div>
          )}
        </div>
      </div>

      {/* Price */}
      {price !== undefined && (
        <div className="text-right shrink-0">
          <div className={`font-black ${isLowest ? 'text-emerald-700' : 'text-gray-900'}`}>
            ₹{price}
          </div>
          {mrp && mrp > price && (
            <div className="text-[9px] text-gray-400 line-through">
              ₹{mrp}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
