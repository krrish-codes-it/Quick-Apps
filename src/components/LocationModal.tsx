'use client';

import React, { useState } from 'react';
import { MetroZone } from '@/types';
import { PRESET_METRO_ZONES } from '@/core/engine/geo-resolver';
import { MapPin, Navigation, X, Check, AlertCircle, Search, Loader2 } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentZone: MetroZone;
  onSelectZone: (zone: MetroZone) => void;
  onGpsDetect: (coords: { latitude: number; longitude: number }) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentZone,
  onSelectZone,
  onGpsDetect,
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Address search state
  const [addressInput, setAddressInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUseGps = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        onGpsDetect({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        onClose();
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('Could not fetch GPS location. Please select your city zone below.');
      },
      { timeout: 8000 }
    );
  };

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/geo?address=${encodeURIComponent(addressInput)}`);
      const data = await res.json();

      if (data.ok && data.data && data.data.coordinates) {
        setSearchLoading(false);
        onSelectZone({
          id: `custom_${Date.now()}`,
          city: data.data.closestZone.city,
          zoneName: addressInput,
          displayName: addressInput,
          coordinates: data.data.coordinates,
          isServiceable: data.data.isQuickCommerceAvailable,
          supportedProviders: data.data.services
            .filter((s: any) => s.isDeliverable)
            .map((s: any) => s.provider),
        });
        onClose();
      } else {
        setSearchLoading(false);
        setSearchError('Could not pinpoint that address. Please try with a pincode or nearby locality.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setSearchLoading(false);
      setSearchError('Error finding location. Please try again or select a preset below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center bg-black/40 backdrop-blur-xs">
        <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-5 text-left align-middle shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-gray-900">
                Choose Delivery Location
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search any address or pincode */}
          <form onSubmit={handleAddressSearch} className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Type any Indian pincode or area (e.g. 560034, Koramangala, Connaught Place)..."
                className="w-full pl-9 pr-20 py-2.5 text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:border-amber-400 rounded-xl focus:outline-hidden font-medium text-gray-900 placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                disabled={searchLoading || !addressInput.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
              >
                {searchLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Locate</span>}
              </button>
            </div>

            {searchError && (
              <div className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{searchError}</span>
              </div>
            )}
          </form>

          {/* GPS Auto-Detect Button */}
          <div className="mt-3">
            <button
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Detecting exact GPS coordinates...' : 'Auto-Detect via GPS'}</span>
            </button>

            {gpsError && (
              <div className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Preset Metros & Hubs */}
          <div className="mt-4">
            <div className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2">
              Popular Quick-Commerce Metro Clusters
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {PRESET_METRO_ZONES.map((zone) => {
                const isSelected = zone.id === currentZone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      onSelectZone(zone);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/70 font-semibold shadow-xs'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        {zone.displayName}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {zone.zoneName} • {zone.supportedProviders.length} Apps Active (Blinkit, Zepto, Instamart, etc.)
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
