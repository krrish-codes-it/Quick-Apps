import { NormalizedProductOffer, QuickCommerceProvider, StoreServiceability } from '@/types';
import { ESSENTIAL_CATALOG, RawProductDefinition } from '../data/dynamic-catalog';
import { extractProductMetadata, calculateStandardUnitPrice } from '../engine/entity-matcher';

/**
 * Provider-specific dynamic pricing & discount behavior generator.
 * This simulates real-world pricing dynamics across Indian quick commerce:
 * - Flipkart Minutes: Aggressive launch discounts to acquire users
 * - JioMart Express: Lowest prices on pantry staples (oil, atta, salt)
 * - BigBasket BB Now: Lowest prices on fresh produce & vegetables
 * - Zepto: Heavy discounts on snacks, soft drinks, and late-night munchies
 * - Blinkit: Reliable standard pricing with targeted flash deals
 * - Instamart: Flat platform discounts & brand partnerships
 * - Amazon Fresh/Now: Prime exclusive discounts on packaged foods
 */
export function generateProviderOffer(
  item: RawProductDefinition,
  provider: QuickCommerceProvider,
  serviceability: StoreServiceability
): NormalizedProductOffer {
  const meta = extractProductMetadata(`${item.baseTitle} ${item.rawPackSize}`, item.category);

  // Generate realistic deterministic variance based on provider & item sku
  const hash = (item.sku + provider).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let priceDiscountRate = 0.0;
  let isStockOut = false;

  switch (provider) {
    case 'flipkart_minutes':
      // Most aggressive launch discounts: 6% to 16% off MRP
      priceDiscountRate = 0.08 + (hash % 9) * 0.01;
      isStockOut = hash % 13 === 0; // occasional high-demand stockout
      break;

    case 'jiomart_express':
      // Very cheap on staples and oils
      if (item.category.includes('Staples') || item.category.includes('Atta')) {
        priceDiscountRate = 0.10 + (hash % 8) * 0.01;
      } else {
        priceDiscountRate = 0.04 + (hash % 5) * 0.01;
      }
      isStockOut = hash % 17 === 0;
      break;

    case 'bigbasket_now':
      // Best on vegetables and fruits
      if (item.category.includes('Vegetables') || item.category.includes('Fruits')) {
        priceDiscountRate = 0.12 + (hash % 7) * 0.01;
      } else {
        priceDiscountRate = 0.05 + (hash % 6) * 0.01;
      }
      isStockOut = hash % 19 === 0;
      break;

    case 'zepto':
      // Heavy discounts on snacks, drinks, and instant foods
      if (item.category.includes('Snacks') || item.category.includes('Cold Drinks')) {
        priceDiscountRate = 0.09 + (hash % 6) * 0.01;
      } else {
        priceDiscountRate = 0.03 + (hash % 5) * 0.01;
      }
      isStockOut = hash % 15 === 0;
      break;

    case 'blinkit':
      // Balanced pricing, rarely discounts milk (statutory MRP), good offers on snacks
      if (item.subcategory === 'Milk') {
        priceDiscountRate = 0.0; // Milk strictly at MRP on Blinkit
      } else {
        priceDiscountRate = 0.04 + (hash % 7) * 0.01;
      }
      isStockOut = hash % 23 === 0;
      break;

    case 'instamart':
      // Moderate discounts across the board
      priceDiscountRate = 0.04 + (hash % 8) * 0.01;
      isStockOut = hash % 16 === 0;
      break;

    case 'amazon_now':
      // Good discounts on multi-packs and packaged brands
      priceDiscountRate = 0.06 + (hash % 6) * 0.01;
      isStockOut = hash % 14 === 0;
      break;
  }

  // Fresh milk is usually sold at exact MRP or max ₹1-₹2 discount across Indian platforms
  if (item.subcategory === 'Milk' && priceDiscountRate > 0.04) {
    priceDiscountRate = 0.02;
  }

  // Compute calculated selling price
  const rawSellingPrice = Math.round(item.mrp * (1 - priceDiscountRate));
  const sellingPrice = Math.max(1, rawSellingPrice);
  const discountPct = Math.round(((item.mrp - sellingPrice) / item.mrp) * 100);

  const { pricePerStandardUnit, standardUnitLabel } = calculateStandardUnitPrice(
    sellingPrice,
    meta.quantity,
    meta.unit
  );

  // Generate deep link
  const encodedTitle = encodeURIComponent(item.baseTitle);
  const deepLinkUrl = `https://www.google.com/search?q=${provider}+${encodedTitle}`;

  return {
    id: `${provider}_${item.sku}`,
    provider,
    providerProductId: item.sku,
    title: item.baseTitle,
    brand: item.brand,
    category: item.category,
    subcategory: item.subcategory,
    imageUrl: item.imageUrl,
    rawPackSize: item.rawPackSize,
    standardizedQuantity: meta.quantity,
    standardUnit: meta.unit,
    mrp: item.mrp,
    sellingPrice,
    discountPercentage: discountPct,
    pricePerStandardUnit,
    standardUnitLabel,
    inStock: !isStockOut,
    inventoryCount: isStockOut ? 0 : 5 + (hash % 20),
    etaMinutes: serviceability.etaMinutes,
    storeId: serviceability.storeId,
    deepLinkUrl,
  };
}

/**
 * Live search query across the catalog returning matches
 */
export function queryDynamicCatalog(
  searchQuery: string,
  categoryFilter?: string,
  limit: number = 30
): RawProductDefinition[] {
  const query = searchQuery.toLowerCase().trim();
  const queryTokens = query.split(/\s+/).filter((t) => t.length > 0);

  let results = ESSENTIAL_CATALOG;

  if (categoryFilter && categoryFilter !== 'all') {
    results = results.filter(
      (item) => item.category.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }

  if (queryTokens.length > 0) {
    results = results.filter((item) => {
      const searchTarget = `${item.baseTitle} ${item.brand} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
      // Match if all query tokens are present, or if at least one token matches with high relevance
      return queryTokens.every((token) => searchTarget.includes(token));
    });
  }

  return results.slice(0, limit);
}
