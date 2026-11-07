import {
  BasketAnalysis,
  BasketItem,
  CanonicalProductGroup,
  ProviderCartBreakdown,
  QuickCommerceProvider,
  SplitCartOption,
  StoreServiceability,
} from '@/types';
import { PROVIDER_METADATA } from './geo-resolver';

/**
 * Calculates landed cart cost for a specific provider
 */
export function calculateSingleStoreLandedCost(
  items: BasketItem[],
  provider: QuickCommerceProvider,
  serviceability: StoreServiceability
): ProviderCartBreakdown | null {
  if (!serviceability.isDeliverable) return null;

  const meta = PROVIDER_METADATA[provider];
  let itemsAvailable = 0;
  let itemsSubtotal = 0;
  let itemsMrpTotal = 0;
  let allInStock = true;

  for (const basketItem of items) {
    const offer = basketItem.canonicalProduct.offers[provider];
    if (offer && offer.inStock) {
      itemsAvailable++;
      itemsSubtotal += offer.sellingPrice * basketItem.quantity;
      itemsMrpTotal += offer.mrp * basketItem.quantity;
    } else {
      allInStock = false;
    }
  }

  if (itemsAvailable === 0) return null;

  // Fee Calculations
  const deliveryFee =
    itemsSubtotal >= meta.freeDeliveryThreshold ? 0 : meta.baseDeliveryFee;

  const smallCartFee =
    itemsSubtotal > 0 && itemsSubtotal < meta.smallCartThreshold ? meta.smallCartFee : 0;

  const handlingFee = meta.handlingFee;
  const platformFee = meta.platformFee;
  const surgeFee = serviceability.surgeActive ? serviceability.surgeFee : 0;

  const totalLandedCost =
    itemsSubtotal + deliveryFee + handlingFee + platformFee + surgeFee + smallCartFee;

  const itemSavings = Math.max(0, itemsMrpTotal - itemsSubtotal);

  return {
    provider,
    providerName: meta.name,
    itemsAvailable,
    totalItemsRequested: items.length,
    allInStock,
    itemsSubtotal,
    itemsMrpTotal,
    itemSavings,
    deliveryFee,
    handlingFee,
    platformFee,
    surgeFee,
    smallCartFee,
    totalLandedCost,
    etaMinutes: serviceability.etaMinutes,
    deepLinkCheckoutUrl: `https://www.google.com/search?q=${provider}+cart+checkout`,
  };
}

/**
 * Evaluates whether splitting items across two top providers saves net money after paying two delivery fees
 */
export function evaluateSplitCart(
  items: BasketItem[],
  singleStoreOptions: ProviderCartBreakdown[],
  serviceabilityMap: Record<QuickCommerceProvider, StoreServiceability>
): SplitCartOption | null {
  if (items.length < 2 || singleStoreOptions.length < 2) return null;

  const bestSingle = singleStoreOptions[0];
  const activeProviders = singleStoreOptions.map((s) => s.provider);

  let bestSplitCost = Infinity;
  let bestSplitResult: SplitCartOption | null = null;

  // Test pairs of top providers
  for (let i = 0; i < activeProviders.length; i++) {
    for (let j = i + 1; j < activeProviders.length; j++) {
      const p1 = activeProviders[i];
      const p2 = activeProviders[j];
      const s1 = serviceabilityMap[p1];
      const s2 = serviceabilityMap[p2];

      const p1Items: Array<{ productId: string; title: string; quantity: number; price: number }> = [];
      const p2Items: Array<{ productId: string; title: string; quantity: number; price: number }> = [];

      let p1Subtotal = 0;
      let p2Subtotal = 0;
      let isValidSplit = true;

      for (const bItem of items) {
        const off1 = bItem.canonicalProduct.offers[p1];
        const off2 = bItem.canonicalProduct.offers[p2];

        if (!off1 && !off2) {
          isValidSplit = false;
          break;
        }

        // Put on whichever is cheaper and in stock
        if (off1 && off1.inStock && (!off2 || !off2.inStock || off1.sellingPrice <= off2.sellingPrice)) {
          p1Items.push({
            productId: off1.providerProductId,
            title: off1.title,
            quantity: bItem.quantity,
            price: off1.sellingPrice,
          });
          p1Subtotal += off1.sellingPrice * bItem.quantity;
        } else if (off2 && off2.inStock) {
          p2Items.push({
            productId: off2.providerProductId,
            title: off2.title,
            quantity: bItem.quantity,
            price: off2.sellingPrice,
          });
          p2Subtotal += off2.sellingPrice * bItem.quantity;
        } else {
          isValidSplit = false;
          break;
        }
      }

      if (!isValidSplit || p1Items.length === 0 || p2Items.length === 0) continue;

      // Calculate fees for Store 1
      const meta1 = PROVIDER_METADATA[p1];
      const del1 = p1Subtotal >= meta1.freeDeliveryThreshold ? 0 : meta1.baseDeliveryFee;
      const small1 = p1Subtotal < meta1.smallCartThreshold ? meta1.smallCartFee : 0;
      const fees1 = del1 + meta1.handlingFee + meta1.platformFee + (s1.surgeActive ? s1.surgeFee : 0) + small1;
      const total1 = p1Subtotal + fees1;

      // Calculate fees for Store 2
      const meta2 = PROVIDER_METADATA[p2];
      const del2 = p2Subtotal >= meta2.freeDeliveryThreshold ? 0 : meta2.baseDeliveryFee;
      const small2 = p2Subtotal < meta2.smallCartThreshold ? meta2.smallCartFee : 0;
      const fees2 = del2 + meta2.handlingFee + meta2.platformFee + (s2.surgeActive ? s2.surgeFee : 0) + small2;
      const total2 = p2Subtotal + fees2;

      const combinedSplitTotal = total1 + total2;

      if (combinedSplitTotal < bestSplitCost) {
        bestSplitCost = combinedSplitTotal;
        const netSavings = bestSingle.totalLandedCost - combinedSplitTotal;

        bestSplitResult = {
          isRecommended: netSavings >= 15, // Only recommend if net savings are at least ₹15 to justify 2 deliveries
          totalLandedCost: combinedSplitTotal,
          netSavingsComparedToBestSingle: Math.max(0, netSavings),
          orders: [
            {
              provider: p1,
              items: p1Items,
              subtotal: p1Subtotal,
              fees: fees1,
              orderTotal: total1,
              etaMinutes: s1.etaMinutes,
              deepLinkCheckoutUrl: `https://www.google.com/search?q=${p1}+checkout`,
            },
            {
              provider: p2,
              items: p2Items,
              subtotal: p2Subtotal,
              fees: fees2,
              orderTotal: total2,
              etaMinutes: s2.etaMinutes,
              deepLinkCheckoutUrl: `https://www.google.com/search?q=${p2}+checkout`,
            },
          ],
        };
      }
    }
  }

  return bestSplitResult;
}

/**
 * Main Basket Optimizer: Computes comprehensive landed cost across all providers and evaluates split-cart
 */
export function analyzeBasket(
  items: BasketItem[],
  services: StoreServiceability[]
): BasketAnalysis {
  const serviceabilityMap: Record<QuickCommerceProvider, StoreServiceability> = {} as any;
  for (const s of services) {
    serviceabilityMap[s.provider] = s;
  }

  const singleStoreOptions: ProviderCartBreakdown[] = [];

  for (const s of services) {
    const breakdown = calculateSingleStoreLandedCost(items, s.provider, s);
    if (breakdown) {
      singleStoreOptions.push(breakdown);
    }
  }

  // Sort single store options:
  // First priority: all requested items in stock
  // Second priority: lowest total landed cost
  singleStoreOptions.sort((a, b) => {
    if (a.allInStock && !b.allInStock) return -1;
    if (!a.allInStock && b.allInStock) return 1;
    return a.totalLandedCost - b.totalLandedCost;
  });

  const bestSingleStore = singleStoreOptions.length > 0 ? singleStoreOptions[0] : null;
  const splitCartOption = evaluateSplitCart(items, singleStoreOptions, serviceabilityMap);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    itemsCount: items.length,
    totalQuantity,
    singleStoreOptions,
    bestSingleStore,
    splitCartOption,
  };
}
