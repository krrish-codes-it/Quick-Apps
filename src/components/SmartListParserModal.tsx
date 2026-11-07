'use client';

import React, { useState } from 'react';
import { CanonicalProductGroup } from '@/types';
import { FileText, Sparkles, X, Plus, CheckCircle, ArrowRight } from 'lucide-react';

interface SmartListParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItemsToBasket: (products: CanonicalProductGroup[]) => void;
  lat: number;
  lng: number;
}

const SAMPLE_LISTS = [
  {
    name: '🍳 Breakfast Pack',
    text: 'Amul Taaza Milk\nEnglish Oven Brown Bread\nEggoz Farm Fresh Eggs 6\nAmul Salted Butter',
  },
  {
    name: '🍿 Party Munchies',
    text: 'Lays Magic Masala\nCoca Cola Zero\nDoritos Cheese Nachos\nRed Bull Energy Drink',
  },
  {
    name: '🥘 Sabzi & Kitchen Staples',
    text: 'Fresh Red Onion 1kg\nFresh Potato 1kg\nFresh Tomato 1kg\nAashirvaad Atta 5kg\nFortune Sunflower Oil',
  },
];

export const SmartListParserModal: React.FC<SmartListParserModalProps> = ({
  isOpen,
  onClose,
  onAddItemsToBasket,
  lat,
  lng,
}) => {
  const [listText, setListText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseAndAdd = async () => {
    const lines = listText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 1);

    if (lines.length === 0) return;

    setIsProcessing(true);
    setMatchStatus(`Matching ${lines.length} items across 7 delivery apps...`);

    const matchedProducts: CanonicalProductGroup[] = [];

    try {
      for (const line of lines) {
        // Query search API for each line
        const res = await fetch(`/api/search?q=${encodeURIComponent(line)}&lat=${lat}&lng=${lng}`);
        const data = await res.json();
        if (data.ok && data.canonicalProducts && data.canonicalProducts.length > 0) {
          // Take the highest relevance match
          matchedProducts.push(data.canonicalProducts[0]);
        }
      }

      setIsProcessing(false);
      if (matchedProducts.length > 0) {
        onAddItemsToBasket(matchedProducts);
        onClose();
      } else {
        setMatchStatus('Could not match any items from your list. Please check keywords.');
      }
    } catch (e) {
      console.error('List parse error:', e);
      setIsProcessing(false);
      setMatchStatus('Error processing your list. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center bg-black/40 backdrop-blur-xs">
        <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-5 text-left align-middle shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 leading-tight">
                  Smart Grocery List Comparison
                </h3>
                <p className="text-[11px] text-gray-500">
                  Paste your grocery list (from WhatsApp or Notes) to compare live total prices
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">
              Try a Quick Template:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_LISTS.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => setListText(sample.text)}
                  className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-gray-200 text-gray-700 hover:text-purple-900 text-xs font-semibold transition-all"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="mt-3">
            <textarea
              rows={6}
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              placeholder={"Enter one item per line, e.g.:\nAmul Taaza Milk\nBrown Bread\nLays Blue Chips\n1kg Onion\nCoca Cola Zero"}
              className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-hidden focus:border-purple-400 font-mono text-gray-900 bg-gray-50/50"
            />
          </div>

          {matchStatus && (
            <div className="mt-2 text-xs font-semibold text-purple-700 flex items-center gap-1.5">
              <span>{matchStatus}</span>
            </div>
          )}

          {/* Footer Action */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={handleParseAndAdd}
              disabled={isProcessing || !listText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <span>{isProcessing ? 'Comparing Carts...' : 'Match & Add to Basket'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
