'use client';

import React from 'react';
import { StoreServiceability } from '@/types';
import { STORE_CONFIG } from './StoreBadge';
import { PROVIDER_METADATA } from '@/core/engine/geo-resolver';
import { X, Radio, MapPin, Zap, Clock, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DarkStoreRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: StoreServiceability[];
  zoneName: string;
  cityName: string;
}

export const DarkStoreRadarModal: React.FC<DarkStoreRadarModalProps> = ({
  isOpen,
  onClose,
  services,
  zoneName,
  cityName,
}) => {
  if (!isOpen) return null;

  const deliverableCount = services.filter((s) => s.isDeliverable).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                    Hyper-Local Dark Store Radar
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Micro-warehouses currently fulfilling 10-minute orders around{' '}
                  <span className="font-bold text-gray-800">{zoneName}, {cityName}</span>
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

          {/* Quick Metrics Bar */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80">
              <div className="text-lg font-black text-emerald-600">{deliverableCount} / 7</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Dark Stores Online</div>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80">
              <div className="text-lg font-black text-gray-900">8 - 14m</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Typical Rider ETA</div>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80">
              <div className="text-lg font-black text-amber-600">1.2 - 3.5 km</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Cluster Radius</div>
            </div>
          </div>

          {/* Store Radar List */}
          <div className="mt-5 space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {services.map((service) => {
              const conf = STORE_CONFIG[service.provider];
              const meta = PROVIDER_METADATA[service.provider];

              return (
                <div
                  key={service.provider}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    service.isDeliverable
                      ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                      : 'bg-gray-50/60 border-dashed border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs shrink-0 ${conf.bgColor} ${conf.textColor}`}
                      >
                        {conf.logoLetter}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-gray-900">{meta.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">({service.storeId})</span>
                          {service.isDeliverable ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.2 rounded-md">
                              Out of Range
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span>{service.distanceKm} km away</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>ETA: {service.etaMinutes} mins</span>
                          </span>
                          <span>•</span>
                          <span>Free over ₹{meta.freeDeliveryThreshold}</span>
                        </div>
                      </div>
                    </div>

                    {/* Surge Status */}
                    <div className="text-right shrink-0">
                      {service.surgeActive ? (
                        <div className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>+₹{service.surgeFee} Surge</span>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          No Surge
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Data queried via real-time dark store inventory gateways</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors"
            >
              Close Radar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
