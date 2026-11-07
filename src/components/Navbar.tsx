'use client';

import React from 'react';
import { MapPin, Search, ShoppingBag, User, Zap, ChevronDown } from 'lucide-react';
import { MetroZone } from '@/types';

interface NavbarProps {
  currentZone: MetroZone;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  basketCount: number;
  basketTotal: number;
  onOpenLocationModal: () => void;
  onOpenBasketDrawer: () => void;
  onOpenProfileDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentZone,
  searchQuery,
  onSearchChange,
  basketCount,
  basketTotal,
  onOpenLocationModal,
  onOpenBasketDrawer,
  onOpenProfileDrawer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Logo & Quick Commerce Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-gray-950 fill-gray-950" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-gray-900">
                  Quick<span className="text-amber-500">Buy</span>
                </span>
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  10 Min
                </span>
              </div>
            </div>

            {/* Location Selector Trigger */}
            <button
              onClick={onOpenLocationModal}
              className="hidden md:flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/70 hover:bg-gray-100/70 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="max-w-[180px] truncate">
                <div className="text-[10px] font-bold uppercase text-gray-400 leading-tight">Delivery Zone</div>
                <div className="text-xs font-semibold text-gray-800 truncate flex items-center gap-1">
                  <span>{currentZone.zoneName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder='Search "milk", "eggs", "chips", "coke", "atta"...'
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-amber-400 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-200 transition-all placeholder:text-gray-400 font-medium text-gray-900"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Right Action Icons: Mobile Location, Basket & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Location Icon */}
            <button
              onClick={onOpenLocationModal}
              className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              title="Change location"
            >
              <MapPin className="w-5 h-5 text-amber-600" />
            </button>

            {/* Unified Basket Trigger */}
            <button
              onClick={onOpenBasketDrawer}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all font-semibold text-xs sm:text-sm"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {basketCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-gray-950 text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-emerald-600">
                    {basketCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {basketCount === 0 ? 'Basket' : `₹${basketTotal}`}
              </span>
            </button>

            {/* Profile Trigger */}
            <button
              onClick={onOpenProfileDrawer}
              className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title="User Profile & Settings"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
