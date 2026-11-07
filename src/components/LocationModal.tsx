'use client';

import React, { useState } from 'react';
import { MetroZone } from '@/types';
import { PRESET_METRO_ZONES } from '@/core/engine/geo-resolver';
import { MapPin, Navigation, X, Check, AlertCircle } from 'lucide-react';

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

          {/* GPS Auto-Detect Button */}
          <div className="mt-4">
            <button
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs sm:text-sm hover:bg-amber-100 transition-colors"
            >
              <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Detecting exact GPS coordinates...' : 'Use My Current GPS Location'}</span>
            </button>

            {gpsError && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Preset Metros & Hubs */}
          <div className="mt-5">
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
              Popular Quick-Commerce Zones in India
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {PRESET_METRO_ZONES.map((zone) => {
                const isSelected = zone.id === currentZone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      onSelectZone(zone);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/70 font-semibold shadow-xs'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        {zone.displayName}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {zone.zoneName} • {zone.supportedProviders.length} Apps Active (Blinkit, Zepto, Instamart, etc.)
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
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
