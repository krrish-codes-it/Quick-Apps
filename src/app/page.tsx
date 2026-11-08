'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BasketAnalysis,
  BasketItem,
  CanonicalProductGroup,
  MetroZone,
  ProviderCartBreakdown,
  UserProfileState,
} from '@/types';
import { PRESET_METRO_ZONES } from '@/core/engine/geo-resolver';
import { SessionManager } from '@/core/profile/session-manager';
import { Navbar } from '@/components/Navbar';
import { CategoryBar } from '@/components/CategoryBar';
import { ProductCard } from '@/components/ProductCard';
import { BasketDrawer } from '@/components/BasketDrawer';
import { LocationModal } from '@/components/LocationModal';
import { ProfileDrawer } from '@/components/ProfileDrawer';
import { SmartListParserModal } from '@/components/SmartListParserModal';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { STORE_CONFIG } from '@/components/StoreBadge';
import {
  Zap,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Check,
  TrendingDown,
  ShieldCheck,
  Heart,
  Store,
  Layers,
} from 'lucide-react';

const POPULAR_BRANDS = [
  'All Brands',
  'Amul',
  "Lay's",
  'Coca-Cola',
  'Mother Dairy',
  'Britannia',
  'Nandini',
  'Eggoz',
  'Bingo',
  'Tata',
  'Fortune',
  'Maggi',
  'Cadbury',
  'Doritos',
];

export default function HomePage() {
  const [currentZone, setCurrentZone] = useState<MetroZone>(PRESET_METRO_ZONES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [priceRange, setPriceRange] = useState<'all' | 'under50' | '50-150' | '150plus'>('all');
  const [products, setProducts] = useState<CanonicalProductGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Filter State
  const [sortBy, setSortBy] = useState<'cheapest' | 'savings' | 'fastest' | 'unit_price'>('cheapest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Drawers & Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isBasketDrawerOpen, setIsBasketDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isSmartListModalOpen, setIsSmartListModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<CanonicalProductGroup | null>(null);

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedCheckoutStore, setSelectedCheckoutStore] = useState<ProviderCartBreakdown | null>(null);

  // User Profile
  const [profile, setProfile] = useState<UserProfileState>(SessionManager.getProfile());

  // Basket State
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [basketAnalysis, setBasketAnalysis] = useState<BasketAnalysis | null>(null);

  // Serviceability stats
  const [activeServicesCount, setActiveServicesCount] = useState(7);
  const [isQuickCommerceAvailable, setIsQuickCommerceAvailable] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('quickbuy_favorites');
      if (stored) setFavoriteIds(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const handleToggleFavorite = (productId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('quickbuy_favorites', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Fetch products whenever zone, search query, or category changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams({
        lat: currentZone.coordinates.latitude.toString(),
        lng: currentZone.coordinates.longitude.toString(),
        q: searchQuery,
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      fetch(`/api/search?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          if (!isCancelled && data.ok) {
            setProducts(data.canonicalProducts || []);
            setActiveServicesCount(data.geo?.activeServiceCount || 0);
            setIsQuickCommerceAvailable(data.geo?.isQuickCommerceAvailable ?? true);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Fetch error:', err);
            setLoading(false);
          }
        });
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentZone, searchQuery, selectedCategory]);

  // Recalculate basket whenever items or location change
  useEffect(() => {
    if (basketItems.length === 0) {
      setBasketAnalysis(null);
      return;
    }

    fetch('/api/basket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: basketItems,
        coordinates: currentZone.coordinates,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setBasketAnalysis(data.data);
        }
      })
      .catch((err) => console.error('Basket analysis error:', err));
  }, [basketItems, currentZone]);

  // Sorted and filtered products
  const displayProducts = useMemo(() => {
    let list = [...products];

    // Filter by Brand
    if (selectedBrand !== 'All Brands') {
      list = list.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Filter by Price Range
    if (priceRange === 'under50') {
      list = list.filter((p) => p.lowestPriceOffer.sellingPrice <= 50);
    } else if (priceRange === '50-150') {
      list = list.filter(
        (p) => p.lowestPriceOffer.sellingPrice > 50 && p.lowestPriceOffer.sellingPrice <= 150
      );
    } else if (priceRange === '150plus') {
      list = list.filter((p) => p.lowestPriceOffer.sellingPrice > 150);
    }

    // Filter by In-Stock
    if (inStockOnly) {
      list = list.filter((p) => Object.values(p.offers).some((o) => o && o.inStock));
    }

    // Filter by Favorites
    if (showFavoritesOnly) {
      list = list.filter((p) => favoriteIds.includes(p.id));
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'cheapest') {
        return a.lowestPriceOffer.sellingPrice - b.lowestPriceOffer.sellingPrice;
      }
      if (sortBy === 'savings') {
        return b.priceSpread.maxSavingsRupees - a.priceSpread.maxSavingsRupees;
      }
      if (sortBy === 'fastest') {
        return a.fastestDeliveryOffer.etaMinutes - b.fastestDeliveryOffer.etaMinutes;
      }
      if (sortBy === 'unit_price') {
        return a.lowestPriceOffer.pricePerStandardUnit - b.lowestPriceOffer.pricePerStandardUnit;
      }
      return 0;
    });

    return list;
  }, [products, selectedBrand, priceRange, inStockOnly, showFavoritesOnly, favoriteIds, sortBy]);

  // Basket Handlers
  const handleAddToCart = (product: CanonicalProductGroup) => {
    setBasketItems((prev) => {
      const existing = prev.find((i) => i.canonicalProductId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.canonicalProductId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { canonicalProductId: product.id, canonicalProduct: product, quantity: 1 }];
    });
  };

  const handleAddMultipleToBasket = (newProducts: CanonicalProductGroup[]) => {
    setBasketItems((prev) => {
      const updated = [...prev];
      for (const prod of newProducts) {
        const existingIdx = updated.findIndex((i) => i.canonicalProductId === prod.id);
        if (existingIdx >= 0) {
          updated[existingIdx].quantity += 1;
        } else {
          updated.push({
            canonicalProductId: prod.id,
            canonicalProduct: prod,
            quantity: 1,
          });
        }
      }
      return updated;
    });
    setIsBasketDrawerOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setBasketItems((prev) => {
      return prev
        .map((item) => {
          if (item.canonicalProductId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((i): i is BasketItem => i !== null);
    });
  };

  const handleRemoveItem = (productId: string) => {
    setBasketItems((prev) => prev.filter((i) => i.canonicalProductId !== productId));
  };

  const handleClearBasket = () => {
    setBasketItems([]);
  };

  const handleProceedCheckout = (store: ProviderCartBreakdown) => {
    setSelectedCheckoutStore(store);
    setIsBasketDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleGpsDetect = (coords: { latitude: number; longitude: number }) => {
    fetch(`/api/geo?lat=${coords.latitude}&lng=${coords.longitude}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data) {
          setCurrentZone({
            ...res.data.closestZone,
            displayName: `GPS Pin (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`,
            coordinates: coords,
          });
        }
      })
      .catch((e) => console.error('GPS Resolve error:', e));
  };

  const totalBasketCount = basketItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalBasketLanded = basketAnalysis?.bestSingleStore?.totalLandedCost || 0;
  const bestSingle = basketAnalysis?.bestSingleStore;

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        currentZone={currentZone}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        basketCount={totalBasketCount}
        basketTotal={totalBasketLanded}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenBasketDrawer={() => setIsBasketDrawerOpen(true)}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
        onOpenSmartListModal={() => setIsSmartListModalOpen(true)}
      />

      {/* Category Pills Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Top Hero Brand & Savings Live Bar */}
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 p-5 sm:p-7 shadow-lg text-gray-950 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-repeat bg-center pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 backdrop-blur-xs text-gray-950 text-xs font-black uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5 fill-gray-950" />
                <span>India&apos;s First 10-Minute Grocery Aggregator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                One Search. 7 Delivery Apps. Lowest Landed Price Guaranteed.
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-900/80 mt-1.5">
                We compare Blinkit, Zepto, Instamart, Flipkart Minutes, BigBasket BB Now, JioMart & Amazon Now in real-time — including delivery & surge fees.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsSmartListModalOpen(true)}
                className="px-4 py-2.5 bg-gray-950 hover:bg-black text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Paste Grocery List</span>
              </button>

              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-4 py-2.5 bg-white/90 hover:bg-white text-gray-950 text-xs sm:text-sm font-extrabold rounded-2xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>{currentZone.city}</span>
              </button>
            </div>
          </div>

          {/* Quick Active App Pills */}
          <div className="mt-5 pt-4 border-t border-black/10 flex flex-wrap items-center gap-2 text-xs font-extrabold">
            <span className="text-[11px] uppercase tracking-wider text-black/70 mr-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              <span>Live Apps:</span>
            </span>
            {['Blinkit (10m)', 'Zepto (10m)', 'Instamart (12m)', 'Flipkart Minutes (10m)', 'BB Now (15m)', 'JioMart Quick (15m)', 'Amazon Fresh (15m)'].map(
              (name) => (
                <span
                  key={name}
                  className="px-2.5 py-0.5 rounded-full bg-white/40 backdrop-blur-xs text-[11px] text-gray-950 border border-black/5"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>

        {/* Location & Delivery Hub Status Bar */}
        <div className="mb-5 rounded-2xl bg-white border border-gray-200/80 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                <span>{currentZone.displayName}</span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeServicesCount} Dark Stores Active
                </span>
              </div>
              <div className="text-[11px] text-gray-500">
                Pincode & GPS mapped to nearest 10-minute micro-warehouses
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              Change Location
            </button>
          </div>
        </div>

        {/* Popular Brand Rail */}
        <div className="mb-4 overflow-x-auto scrollbar-none pb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
              Top Brands:
            </span>
            {POPULAR_BRANDS.map((brand) => {
              const isSelected = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-gray-950 text-white border-black shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Sorting Controls Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
          {/* Sorting Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            {[
              { id: 'cheapest', label: 'Lowest Price' },
              { id: 'savings', label: 'Max Savings' },
              { id: 'unit_price', label: 'Unit Price (₹/100g)' },
              { id: 'fastest', label: 'Fastest 10m ETA' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                  sortBy === opt.id
                    ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Price Range & Quick Filter Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Price Pills */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                onClick={() => setPriceRange('all')}
                className={`px-2 py-0.5 rounded-lg ${priceRange === 'all' ? 'bg-white shadow-2xs font-bold' : 'text-gray-500'}`}
              >
                All
              </button>
              <button
                onClick={() => setPriceRange('under50')}
                className={`px-2 py-0.5 rounded-lg ${priceRange === 'under50' ? 'bg-white shadow-2xs font-bold' : 'text-gray-500'}`}
              >
                &lt; ₹50
              </button>
              <button
                onClick={() => setPriceRange('50-150')}
                className={`px-2 py-0.5 rounded-lg ${priceRange === '50-150' ? 'bg-white shadow-2xs font-bold' : 'text-gray-500'}`}
              >
                ₹50-150
              </button>
              <button
                onClick={() => setPriceRange('150plus')}
                className={`px-2 py-0.5 rounded-lg ${priceRange === '150plus' ? 'bg-white shadow-2xs font-bold' : 'text-gray-500'}`}
              >
                ₹150+
              </button>
            </div>

            {/* In-Stock Toggle */}
            <label className="flex items-center gap-1.5 text-xs text-gray-700 font-bold cursor-pointer select-none px-2 py-1 bg-gray-50 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-600 rounded-sm focus:ring-amber-500"
              />
              <span>In-Stock Only</span>
            </label>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl border transition-colors ${
                showFavoritesOnly
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
              <span>Saved ({favoriteIds.length})</span>
            </button>

            {loading && (
              <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </span>
            )}
          </div>
        </div>

        {/* Product Cards Section Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-base font-black text-gray-900">
              {searchQuery
                ? `Search: "${searchQuery}"`
                : selectedBrand !== 'All Brands'
                ? `${selectedBrand} Essentials`
                : selectedCategory !== 'all'
                ? selectedCategory
                : 'Essential Daily Groceries'}
            </h2>
            <p className="text-xs text-gray-500">
              Showing {displayProducts.length} verified products with real-time dark store pricing
            </p>
          </div>
        </div>

        {/* Product Grid */}
        {displayProducts.length === 0 && !loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-gray-800 text-base">No matching products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Try adjusting your filters or search for staples like &quot;milk&quot;, &quot;eggs&quot;, &quot;chips&quot;, or &quot;bread&quot;.
            </p>
            <button
              onClick={() => {
                setSelectedBrand('All Brands');
                setPriceRange('all');
                setSelectedCategory('all');
                setSearchQuery('');
                setShowFavoritesOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {displayProducts.map((product) => {
              const basketItem = basketItems.find((i) => i.canonicalProductId === product.id);
              const qty = basketItem ? basketItem.quantity : 0;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  basketQuantity={qty}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onOpenDetail={(prod) => setSelectedProductForDetail(prod)}
                  isFavorite={favoriteIds.includes(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar for Mobile & Desktop */}
      {totalBasketCount > 0 && bestSingle && (
        <div className="sticky bottom-4 z-30 max-w-4xl mx-auto px-4 w-full">
          <div className="bg-gray-950 text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-gray-950 flex items-center justify-center font-black text-sm shrink-0">
                {totalBasketCount}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black truncate flex items-center gap-1.5">
                  <span>Cheapest: ₹{bestSingle.totalLandedCost}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded-md">
                    on {bestSingle.providerName}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 truncate">
                  ⚡️ ~{bestSingle.etaMinutes} mins delivery • Landed cost includes all fees
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsBasketDrawerOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1"
              >
                <span>View Multi-Cart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200 py-10 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="font-extrabold text-sm text-gray-900">
            QuickBuy 10M • India&apos;s Unified Quick-Commerce Comparison Platform
          </div>
          <p className="max-w-2xl mx-auto text-gray-500 text-[11px] leading-relaxed">
            Real-time hyper-local price discovery spanning Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, BigBasket BB Now, JioMart Express, and Amazon Fresh Fast.
          </p>
          <div className="pt-2 text-[10px] text-gray-400 font-medium">
            Open-source architecture • Created with Next.js 15, TypeScript & Tailwind CSS • GitHub: @krrish-codes-it
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentZone={currentZone}
        onSelectZone={setCurrentZone}
        onGpsDetect={handleGpsDetect}
      />

      <BasketDrawer
        isOpen={isBasketDrawerOpen}
        onClose={() => setIsBasketDrawerOpen(false)}
        items={basketItems}
        analysis={basketAnalysis}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearBasket={handleClearBasket}
        onProceedCheckout={handleProceedCheckout}
      />

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
      />

      <SmartListParserModal
        isOpen={isSmartListModalOpen}
        onClose={() => setIsSmartListModalOpen(false)}
        onAddItemsToBasket={handleAddMultipleToBasket}
        lat={currentZone.coordinates.latitude}
        lng={currentZone.coordinates.longitude}
      />

      <ProductDetailModal
        product={selectedProductForDetail}
        isOpen={selectedProductForDetail !== null}
        onClose={() => setSelectedProductForDetail(null)}
        basketQuantity={
          selectedProductForDetail
            ? basketItems.find((i) => i.canonicalProductId === selectedProductForDetail.id)?.quantity || 0
            : 0
        }
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        singleStore={selectedCheckoutStore}
        splitOption={basketAnalysis?.splitCartOption || null}
        mode={selectedCheckoutStore ? 'single' : 'split'}
        deliveryAddress={`${currentZone.displayName} (Dark Store Area)`}
      />
    </div>
  );
}
