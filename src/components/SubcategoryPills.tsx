'use client';

import React from 'react';

export const SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  'all': ['All Items', 'Top Deals', 'Under ₹50', 'Daily Essentials', 'Breakfast', 'Late Night'],
  'Dairy, Bread & Eggs': ['All', 'Milk', 'Butter & Cheese', 'Paneer & Tofu', 'Curd & Yogurt', 'Bread', 'Eggs'],
  'Snacks & Munchies': ['All', 'Chips & Crisps', 'Namkeen & Puffs', 'Namkeen', 'Nachos'],
  'Cold Drinks & Juices': ['All', 'Soft Drinks', 'Diet Soft Drinks', 'Energy Drinks', 'Juices', 'Water'],
  'Vegetables & Fruits': ['All', 'Vegetables', 'Herbs & Seasoning', 'Citrus', 'Fruits'],
  'Instant & Packaged Food': ['All', 'Noodles', 'Sauces & Spreads', 'Soups'],
  'Cooking Staples & Atta': ['All', 'Flours & Atta', 'Edible Oils', 'Dals & Pulses', 'Salt & Spices', 'Rice & Grains'],
  'Chocolates & Desserts': ['All', 'Chocolates', 'Bars', 'Gift Packs'],
  'Cleaning & Household': ['All', 'Dishwash', 'Bathroom Cleaning', 'Detergents'],
};

interface SubcategoryPillsProps {
  category: string;
  selectedSubcategory: string;
  onSelectSubcategory: (subcat: string) => void;
}

export const SubcategoryPills: React.FC<SubcategoryPillsProps> = ({
  category,
  selectedSubcategory,
  onSelectSubcategory,
}) => {
  const subcats = SUBCATEGORIES_BY_CATEGORY[category] || ['All'];

  return (
    <div className="bg-gray-50/80 border-b border-gray-200/60 py-2 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mr-1 shrink-0">
            Subcategories:
          </span>
          {subcats.map((subcat) => {
            const isSelected =
              selectedSubcategory === subcat ||
              (selectedSubcategory === 'all' && (subcat === 'All' || subcat === 'All Items'));

            return (
              <button
                key={subcat}
                onClick={() => onSelectSubcategory(subcat === 'All' || subcat === 'All Items' ? 'all' : subcat)}
                className={`text-[11px] px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-400 text-gray-950 border-amber-500 shadow-2xs font-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100/70'
                }`}
              >
                {subcat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
