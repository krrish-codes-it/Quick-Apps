'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  BasketAnalysis,
  BasketItem,
  CanonicalProductGroup,
  MetroZone,
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
import { Zap, ShieldCheck, MapPin, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [currentZone, setCurrentZone] = useState<MetroZone>(PRESET_METRO_ZONES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<CanonicalProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Drawers & Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isBasketDrawerOpen, setIsBasketDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // User Profile
  const [profile, setProfile] = useState<UserProfileState>(SessionManager.getProfile());

  // Basket State
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [basketAnalysis, setBasketAnalysis] = useState<BasketAnalysis | null>(null);

  // Serviceability stats
  const [activeServicesCount, setActiveServicesCount] = useState(7);
  const [isQuickCommerceAvailable, setIsQuickCommerceAvailable] = useState(true);

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
    }, 200); // 200ms debounce

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

  return (
    <div className="min-h-screen bg-gray-50/60 text-gray-900 flex flex-col font-sans">
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
      />

      {/* Category Pills Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Serviceability & Live Zone Banner */}
        <div className="mb-6 rounded-2xl bg-white border border-gray-200/80 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-gray-900">
                    {currentZone.displayName}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Dark Stores
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comparing prices & stock across{' '}
                  <span className="font-bold text-gray-800">
                    Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, BigBasket BB Now, JioMart & Amazon Now
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-right hidden sm:block">
                <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1 justify-end">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{activeServicesCount} Apps Active</span>
                </div>
                <div className="text-[10px] text-gray-400">Typical ETA: 8-15 mins</div>
              </div>

              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                Change Area
              </button>
            </div>
          </div>

          {!isQuickCommerceAvailable && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2">
              <span className="font-bold">Notice:</span>
              <span>
                You are outside the standard 10-minute micro-warehouse delivery radius. Standard 2-day delivery applies in this zone. Please switch to a metropolitan hub like Bengaluru or Delhi NCR to see live quick commerce rates.
              </span>
            </div>
          )}
        </div>

        {/* Product Cards Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Essential Daily Groceries'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {products.length} standardized products with live unit pricing
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {loading && (
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking dark stores...</span>
              </span>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 && !loading ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 p-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">No items found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Try searching for &quot;milk&quot;, &quot;eggs&quot;, &quot;bread&quot;, &quot;chips&quot;, or &quot;coke&quot; to see real-time price comparisons.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const basketItem = basketItems.find((i) => i.canonicalProductId === product.id);
              const qty = basketItem ? basketItem.quantity : 0;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  basketQuantity={qty}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Mobile Floating Basket Sticky Bar */}
      {totalBasketCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-30 sm:hidden">
          <button
            onClick={() => setIsBasketDrawerOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between font-bold text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center text-xs">
                {totalBasketCount}
              </span>
              <span>
                {basketAnalysis?.bestSingleStore
                  ? `Cheapest: ₹${basketAnalysis.bestSingleStore.totalLandedCost} on ${basketAnalysis.bestSingleStore.providerName}`
                  : 'View Basket'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-white">
              <span>View Multi-Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-gray-600">
            QuickBuy 10M • India&apos;s 10-Minute Grocery & Essentials Price Aggregator
          </p>
          <p className="mt-1 text-[11px] text-gray-400">
            Live integration architecture spanning Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, BigBasket BB Now, JioMart Express, and Amazon Fresh Fast.
          </p>
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
      />

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
      />
    </div>
  );
}
