'use client';

import React from 'react';

export interface CategoryOption {
  id: string;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All Items', icon: '⚡️' },
  { id: 'Dairy, Bread & Eggs', label: 'Dairy & Bread', icon: '🥛' },
  { id: 'Snacks & Munchies', label: 'Chips & Snacks', icon: '🍟' },
  { id: 'Cold Drinks & Juices', label: 'Drinks & Juices', icon: '🥤' },
  { id: 'Vegetables & Fruits', label: 'Fresh Produce', icon: '🥦' },
  { id: 'Instant & Packaged Food', label: 'Instant Food', icon: '🍜' },
  { id: 'Cooking Staples & Atta', label: 'Atta & Staples', icon: '🌾' },
];

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border-b border-gray-100 py-2.5 overflow-x-auto scrollbar-none shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-500 text-gray-950 border-amber-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
