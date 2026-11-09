'use client';

import React, { useState } from 'react';
import { CanonicalProductGroup } from '@/types';
import { Bookmark, ShoppingBag, Plus, Check, ArrowRight, X, Sparkles, Trash2 } from 'lucide-react';

interface SavedBasketPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  skus: string[];
}

export const POPULAR_PRESETS: SavedBasketPreset[] = [
  {
    id: 'preset_breakfast',
    name: 'Morning Breakfast Bundle',
    emoji: '🍳',
    description: 'Milk, Brown Bread, Farm Eggs & Salted Butter',
    skus: ['amul-taaza-500', 'english-oven-brown-bread-400', 'fresh-farm-eggs-6', 'amul-salted-butter-100'],
  },
  {
    id: 'preset_party',
    name: 'Weekend Party Munchies',
    emoji: '🍿',
    description: 'Lays Masala, Coke Zero, Doritos & Red Bull Energy',
    skus: ['lays-india-magic-masala-50', 'coca-cola-zero-300', 'doritos-cheese-supreme-60', 'red-bull-energy-can-250'],
  },
  {
    id: 'preset_sabzi',
    name: 'Fresh Sabzi Daily Pack',
    emoji: '🥗',
    description: 'Onions 1kg, Potatoes 1kg, Tomatoes 1kg, Coriander & Chillies',
    skus: ['fresh-onion-1kg', 'fresh-potato-1kg', 'fresh-tomato-hybrid-1kg', 'fresh-coriander-100g', 'fresh-green-chillies-100g'],
  },
  {
    id: 'preset_pantry',
    name: 'Kitchen Pantry Essentials',
    emoji: '🌾',
    description: 'Aashirvaad Atta 5kg, Sunflower Oil 1L, Tata Salt & Toor Dal',
    skus: ['aashirvaad-shudh-chakki-atta-5kg', 'fortune-sunflower-oil-1l', 'tata-salt-iodized-1kg', 'tata-sampann-toor-dal-1kg'],
  },
  {
    id: 'preset_late_night',
    name: 'Late Night Cravings',
    emoji: '🌙',
    description: 'Maggi 4-pack, Thums Up, Dairy Milk Silk & YiPPee Noodles',
    skus: ['maggi-masala-noodles-4pack', 'thums-up-can-300', 'cadbury-dairy-milk-silk-60', 'yippee-magic-masala-4pack'],
  },
];

interface SavedBasketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: CanonicalProductGroup[];
  onLoadPreset: (products: CanonicalProductGroup[]) => void;
}

export const SavedBasketsModal: React.FC<SavedBasketsModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onLoadPreset,
}) => {
  const [loadedPresetId, setLoadedPresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: SavedBasketPreset) => {
    // Find canonical products matching these skus or titles
    const matchedProducts: CanonicalProductGroup[] = [];

    for (const sku of preset.skus) {
      const found = allProducts.find((p) => {
        return (
          Object.values(p.offers).some((o) => o?.providerProductId === sku) ||
          p.id.toLowerCase().includes(sku.replace(/-/g, '_')) ||
          p.canonicalTitle.toLowerCase().includes(sku.split('-')[0])
        );
      });
      if (found) matchedProducts.push(found);
    }

    if (matchedProducts.length > 0) {
      setLoadedPresetId(preset.id);
      setTimeout(() => {
        onLoadPreset(matchedProducts);
        onClose();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-xl transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                  1-Click Saved Baskets
                </h3>
                <p className="text-[11px] text-gray-500">
                  Instant grocery bundles ready for price comparison across 10-minute apps
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

          {/* Preset Cards List */}
          <div className="mt-4 space-y-2.5">
            {POPULAR_PRESETS.map((preset) => {
              const isLoaded = loadedPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  className="p-3.5 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {preset.emoji}
                    </div>

                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-gray-900 truncate">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {preset.description}
                      </div>
                      <div className="text-[10px] text-purple-700 font-bold mt-1">
                        {preset.skus.length} curated essentials
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      isLoaded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95 shadow-2xs'
                    }`}
                  >
                    {isLoaded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Loaded!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Load Basket</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Baskets update dynamically with live lowest prices</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
