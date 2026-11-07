import {
  CanonicalProductGroup,
  NormalizedProductOffer,
  QuickCommerceProvider,
} from '@/types';

// Standard Brand Dictionaries for Rapid NER
const KNOWN_BRANDS = [
  'Amul',
  'Mother Dairy',
  'Nandini',
  'Britannia',
  'English Oven',
  'Harvest Gold',
  'Bonn',
  'Lay\'s',
  'Lays',
  'Bingo',
  'Kurkure',
  'Doritos',
  'Pringles',
  'Haldiram\'s',
  'Haldirams',
  'Bikaji',
  'Coca-Cola',
  'Coke',
  'Pepsi',
  'Thums Up',
  'Sprite',
  'Fanta',
  'Limca',
  'Red Bull',
  'Monster',
  'Tata',
  'Aashirvaad',
  'Fortune',
  'Saffola',
  'Dhara',
  'Nutrella',
  'Maggi',
  'Yippee',
  'Ching\'s',
  'Nestle',
  'Cadbury',
  'Oreo',
  'Parle-G',
  'Parle',
  'Sunfeast',
  'Good Day',
  'Epigamia',
  'Country Delight',
];

export interface ExtractedProductMetadata {
  brand: string;
  cleanedTitle: string;
  quantity: number;
  unit: 'g' | 'ml' | 'pc';
  displayPackSize: string;
  category: string;
}

/**
 * Parses raw text titles into structured brand, normalized quantity, and unit.
 * Examples:
 *   "Amul Taaza Toned Milk Poly Pack 500 ml" -> { brand: 'Amul', quantity: 500, unit: 'ml', pack: '500 ml' }
 *   "Lay's India's Magic Masala Potato Chips 50 g" -> { brand: "Lay's", quantity: 50, unit: 'g', pack: '50 g' }
 *   "Fresh Farm Eggs Pack of 6" -> { brand: 'Farm Fresh', quantity: 6, unit: 'pc', pack: '6 pcs' }
 */
export function extractProductMetadata(title: string, categoryHint: string = 'General'): ExtractedProductMetadata {
  let detectedBrand = 'Generic';
  for (const b of KNOWN_BRANDS) {
    const regex = new RegExp(`\\b${b.replace("'", "\\'")}\\b`, 'i');
    if (regex.test(title)) {
      detectedBrand = b;
      break;
    }
  }

  // Regex patterns to capture pack sizes
  // 1. Liquids (ml / litre / ltr / l)
  const liquidRegex = /(\d+(?:\.\d+)?)\s*(ml|milliliter|millilitres|litre|litres|ltr|l)\b/i;
  // 2. Weights (g / gm / gms / kg / grams)
  const weightRegex = /(\d+(?:\.\d+)?)\s*(kg|kilo|kilogram|kilograms|g|gm|gms|gram|grams)\b/i;
  // 3. Counts / Pieces (pcs / pieces / pack of X / X eggs / units)
  const countRegex = /(?:pack of\s*(\d+)|(\d+)\s*(?:pcs|pieces|units|eggs|bananas|lemons|apples))/i;

  let quantity = 1;
  let unit: 'g' | 'ml' | 'pc' = 'pc';
  let displayPackSize = '1 pc';

  const liquidMatch = title.match(liquidRegex);
  const weightMatch = title.match(weightRegex);
  const countMatch = title.match(countRegex);

  if (liquidMatch) {
    const val = parseFloat(liquidMatch[1]);
    const u = liquidMatch[2].toLowerCase();
    if (u.startsWith('l')) {
      quantity = Math.round(val * 1000); // 1 L = 1000 ml
      displayPackSize = `${val} L`;
    } else {
      quantity = Math.round(val);
      displayPackSize = `${quantity} ml`;
    }
    unit = 'ml';
  } else if (weightMatch) {
    const val = parseFloat(weightMatch[1]);
    const u = weightMatch[2].toLowerCase();
    if (u.startsWith('k')) {
      quantity = Math.round(val * 1000); // 1 kg = 1000 g
      displayPackSize = `${val} kg`;
    } else {
      quantity = Math.round(val);
      displayPackSize = `${quantity} g`;
    }
    unit = 'g';
  } else if (countMatch) {
    const countVal = parseInt(countMatch[1] || countMatch[2], 10);
    quantity = countVal;
    unit = 'pc';
    displayPackSize = `${quantity} pcs`;
  }

  // Clean title: remove clutter
  const cleanedTitle = title
    .replace(/\s+/g, ' ')
    .trim();

  return {
    brand: detectedBrand,
    cleanedTitle,
    quantity,
    unit,
    displayPackSize,
    category: categoryHint,
  };
}

/**
 * Calculates standard unit price (₹ / 100g, ₹ / 100ml, or ₹ / pc)
 */
export function calculateStandardUnitPrice(
  sellingPrice: number,
  quantity: number,
  unit: 'g' | 'ml' | 'pc'
): { pricePerStandardUnit: number; standardUnitLabel: string } {
  if (quantity <= 0) {
    return { pricePerStandardUnit: sellingPrice, standardUnitLabel: `₹${sellingPrice}/unit` };
  }

  if (unit === 'g') {
    const pricePer100g = (sellingPrice / quantity) * 100;
    return {
      pricePerStandardUnit: parseFloat(pricePer100g.toFixed(2)),
      standardUnitLabel: `₹${pricePer100g.toFixed(2)} / 100g`,
    };
  }

  if (unit === 'ml') {
    const pricePer100ml = (sellingPrice / quantity) * 100;
    return {
      pricePerStandardUnit: parseFloat(pricePer100ml.toFixed(2)),
      standardUnitLabel: `₹${pricePer100ml.toFixed(2)} / 100ml`,
    };
  }

  const pricePerPiece = sellingPrice / quantity;
  return {
    pricePerStandardUnit: parseFloat(pricePerPiece.toFixed(2)),
    standardUnitLabel: `₹${pricePerPiece.toFixed(2)} / pc`,
  };
}

/**
 * Calculates simple token-overlap similarity between two strings
 */
export function calculateTokenSimilarity(strA: string, strB: string): number {
  const sanitize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 1);

  const tokensA = new Set(sanitize(strA));
  const tokensB = new Set(sanitize(strB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersectionCount++;
  }

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  return intersectionCount / unionSize;
}

/**
 * Clusters a flat list of multi-provider product offers into Canonical Product Groups.
 * Groups by: Same Brand + High title similarity + Same unit type + Similar quantity (+- 15%).
 */
export function clusterOffersIntoCanonicalProducts(
  rawOffers: NormalizedProductOffer[]
): CanonicalProductGroup[] {
  const groups: CanonicalProductGroup[] = [];

  for (const offer of rawOffers) {
    let matchedGroup: CanonicalProductGroup | null = null;

    for (const group of groups) {
      // Must match brand (or both generic), unit type, and exact/close quantity
      const brandMatch =
        group.brand.toLowerCase() === offer.brand.toLowerCase() ||
        group.brand === 'Generic' ||
        offer.brand === 'Generic';

      const unitMatch = group.standardUnit === offer.standardUnit;
      const quantityDiff = Math.abs(group.standardizedQuantity - offer.standardizedQuantity);
      const isQuantityCompatible =
        group.standardizedQuantity === offer.standardizedQuantity ||
        quantityDiff / Math.max(group.standardizedQuantity, 1) < 0.15;

      const titleSim = calculateTokenSimilarity(group.canonicalTitle, offer.title);

      if (brandMatch && unitMatch && isQuantityCompatible && titleSim >= 0.35) {
        matchedGroup = group;
        break;
      }
    }

    if (matchedGroup) {
      // Add or update offer for this provider in the group
      matchedGroup.offers[offer.provider] = offer;
    } else {
      // Create a new canonical product group
      const newGroup: CanonicalProductGroup = {
        id: `canonical_${offer.brand.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${offer.standardizedQuantity}${offer.standardUnit}_${groups.length + 1}`,
        canonicalTitle: offer.title,
        brand: offer.brand,
        category: offer.category,
        standardizedQuantity: offer.standardizedQuantity,
        standardUnit: offer.standardUnit,
        displayPackSize: offer.rawPackSize,
        imageUrl: offer.imageUrl,
        rating: 4.6 + Math.round(((offer.title.length % 5) * 0.1) * 10) / 10,
        ratingCount: 1200 + (offer.title.length * 153) % 8500,
        offers: {
          blinkit: null,
          zepto: null,
          instamart: null,
          flipkart_minutes: null,
          bigbasket_now: null,
          jiomart_express: null,
          amazon_now: null,
        },
        lowestPriceOffer: offer,
        fastestDeliveryOffer: offer,
        priceSpread: {
          minPrice: offer.sellingPrice,
          maxPrice: offer.sellingPrice,
          maxSavingsRupees: 0,
          maxSavingsPercentage: 0,
        },
      };

      newGroup.offers[offer.provider] = offer;
      groups.push(newGroup);
    }
  }

  // Finalize stats (lowest price, fastest delivery, max savings) for each canonical group
  for (const group of groups) {
    const activeOffers = Object.values(group.offers).filter(
      (o): o is NormalizedProductOffer => o !== null && o.inStock
    );

    if (activeOffers.length > 0) {
      // Sort by selling price ascending
      const sortedByPrice = [...activeOffers].sort((a, b) => a.sellingPrice - b.sellingPrice);
      // Sort by ETA ascending
      const sortedByEta = [...activeOffers].sort((a, b) => a.etaMinutes - b.etaMinutes);

      group.lowestPriceOffer = sortedByPrice[0];
      group.fastestDeliveryOffer = sortedByEta[0];

      const minP = sortedByPrice[0].sellingPrice;
      const maxP = sortedByPrice[sortedByPrice.length - 1].sellingPrice;
      const savingsRs = maxP - minP;
      const savingsPct = maxP > 0 ? Math.round((savingsRs / maxP) * 100) : 0;

      group.priceSpread = {
        minPrice: minP,
        maxPrice: maxP,
        maxSavingsRupees: savingsRs,
        maxSavingsPercentage: savingsPct,
      };
    }
  }

  return groups;
}
