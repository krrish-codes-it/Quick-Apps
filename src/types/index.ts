// Strict TypeScript definitions for the 7-Layer Quick-Commerce Aggregator

export type QuickCommerceProvider = 
  | 'blinkit'
  | 'zepto'
  | 'instamart'
  | 'flipkart_minutes'
  | 'bigbasket_now'
  | 'jiomart_express'
  | 'amazon_now';

export interface ProviderMeta {
  id: QuickCommerceProvider;
  name: string;
  tagline: string;
  badgeColor: string;
  logoBg: string;
  typicalDeliveryTime: string; // e.g. "9-12 mins"
  freeDeliveryThreshold: number; // e.g. ₹199
  baseDeliveryFee: number; // e.g. ₹25
  handlingFee: number; // e.g. ₹7
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MetroZone {
  id: string;
  city: string;
  zoneName: string;
  displayName: string;
  coordinates: Coordinates;
  isServiceable: boolean;
  supportedProviders: QuickCommerceProvider[];
}

export interface StoreServiceability {
  provider: QuickCommerceProvider;
  storeId: string;
  storeName: string;
  isDeliverable: boolean;
  etaMinutes: number;
  distanceKm: number;
  surgeActive: boolean;
  surgeReason?: string;
  surgeFee: number;
}

export interface NormalizedProductOffer {
  id: string;
  provider: QuickCommerceProvider;
  providerProductId: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  
  // Pack & Units
  rawPackSize: string; // e.g. "500 ml", "1 kg", "400 g", "6 pcs"
  standardizedQuantity: number; // in grams or ml
  standardUnit: 'g' | 'ml' | 'pc';
  
  // Pricing
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  pricePerStandardUnit: number; // ₹ per 100g, ₹ per 100ml, or ₹ per pc
  standardUnitLabel: string; // e.g. "₹5.40 / 100ml"
  
  // Inventory & Delivery
  inStock: boolean;
  inventoryCount?: number;
  etaMinutes: number;
  storeId: string;
  deepLinkUrl: string;
}

export interface CanonicalProductGroup {
  id: string;
  canonicalTitle: string;
  brand: string;
  category: string;
  standardizedQuantity: number;
  standardUnit: 'g' | 'ml' | 'pc';
  displayPackSize: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  
  // Aggregated Offers across all 7 providers
  offers: Record<QuickCommerceProvider, NormalizedProductOffer | null>;
  
  // Calculated Bests
  lowestPriceOffer: NormalizedProductOffer;
  fastestDeliveryOffer: NormalizedProductOffer;
  priceSpread: {
    minPrice: number;
    maxPrice: number;
    maxSavingsRupees: number;
    maxSavingsPercentage: number;
  };
}

export interface BasketItem {
  canonicalProductId: string;
  canonicalProduct: CanonicalProductGroup;
  quantity: number;
  preferredProvider?: QuickCommerceProvider;
}

export interface ProviderCartBreakdown {
  provider: QuickCommerceProvider;
  providerName: string;
  itemsAvailable: number;
  totalItemsRequested: number;
  allInStock: boolean;
  itemsSubtotal: number;
  itemsMrpTotal: number;
  itemSavings: number;
  
  // Ancillary Fees
  deliveryFee: number;
  handlingFee: number;
  platformFee: number;
  surgeFee: number;
  smallCartFee: number;
  
  totalLandedCost: number;
  etaMinutes: number;
  deepLinkCheckoutUrl: string;
}

export interface SplitCartOption {
  isRecommended: boolean;
  totalLandedCost: number;
  netSavingsComparedToBestSingle: number;
  orders: Array<{
    provider: QuickCommerceProvider;
    items: Array<{
      productId: string;
      title: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    fees: number;
    orderTotal: number;
    etaMinutes: number;
    deepLinkCheckoutUrl: string;
  }>;
}

export interface BasketAnalysis {
  itemsCount: number;
  totalQuantity: number;
  singleStoreOptions: ProviderCartBreakdown[];
  bestSingleStore: ProviderCartBreakdown | null;
  splitCartOption: SplitCartOption | null;
}

export interface UserSavedAddress {
  id: string;
  label: string; // 'Home', 'Work', 'Other'
  addressLine: string;
  zoneName: string;
  city: string;
  pincode: string;
  coordinates: Coordinates;
  isDefault: boolean;
}

export interface UserProfileState {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isGuest: boolean;
  savedAddresses: UserSavedAddress[];
  activeAddressId: string;
  preferences: {
    priorityMode: 'cheapest' | 'fastest' | 'balanced';
    maxEtaMinutes: number;
    favoriteProviders: QuickCommerceProvider[];
  };
}
