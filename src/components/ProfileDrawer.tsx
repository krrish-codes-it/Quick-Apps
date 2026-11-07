'use client';

import React, { useState } from 'react';
import { UserProfileState, UserSavedAddress } from '@/types';
import { SessionManager } from '@/core/profile/session-manager';
import { X, User, MapPin, ShieldCheck, Check, Globe, Plus } from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileState;
  onUpdateProfile: (updated: UserProfileState) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [userName, setUserName] = useState(profile.name);
  const [priorityMode, setPriorityMode] = useState(profile.preferences.priorityMode);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: UserProfileState = {
      ...profile,
      name: userName,
      preferences: {
        ...profile.preferences,
        priorityMode,
      },
    };
    SessionManager.saveProfile(updated);
    onUpdateProfile(updated);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-gray-900 leading-tight">
                  User Profile & Preferences
                </h2>
                <div className="text-[10px] text-gray-500">
                  {profile.isGuest ? 'Guest Session Active' : 'Account Linked'}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {isSavedAlert && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile preferences updated successfully!</span>
              </div>
            )}

            {/* Profile Identity */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider">
                Profile Identity
              </label>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-600 block mb-1">Display Name</span>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-amber-400 font-semibold text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Price vs Speed Priority Mode */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider">
                Ranking Priority Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPriorityMode('cheapest')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    priorityMode === 'cheapest'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xs">💰 Lowest Landed Price</div>
                  <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                    Ranks by minimum cart total (including delivery fees)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPriorityMode('fastest')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    priorityMode === 'fastest'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xs">⚡️ Fastest Delivery</div>
                  <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                    Prioritizes 8-10 min dark stores over price savings
                  </div>
                </button>
              </div>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Saved Delivery Addresses
                </label>
                <span className="text-[10px] text-amber-600 font-semibold cursor-pointer hover:underline">
                  + Add Address
                </span>
              </div>

              <div className="space-y-2">
                {profile.savedAddresses.map((addr) => {
                  const isActive = addr.id === profile.activeAddressId;
                  return (
                    <div
                      key={addr.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        isActive
                          ? 'border-amber-300 bg-amber-50/50 font-semibold'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-gray-900">{addr.label}</div>
                          <div className="text-gray-500 text-[11px] truncate max-w-[200px]">
                            {addr.addressLine}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {addr.city} • {addr.pincode}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Future Google Chrome & OAuth Account Link Architecture */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-extrabold text-gray-900">
                  Google & Backend Provider Accounts
                </span>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed">
                This architecture provides a clean abstracted profile facade. When ready, Google Chrome OAuth will securely link your Blinkit, Flipkart Minutes, and Zepto backends so your orders sync directly behind the scenes.
              </p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => alert('Google OAuth module is ready to be linked in next phase!')}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Account Integration Stub Ready</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-gray-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
