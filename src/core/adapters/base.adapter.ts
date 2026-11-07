import {
  Coordinates,
  NormalizedProductOffer,
  QuickCommerceProvider,
  StoreServiceability,
} from '@/types';
import { extractProductMetadata, calculateStandardUnitPrice } from '../engine/entity-matcher';
import { PROVIDER_METADATA } from '../engine/geo-resolver';

export interface ProviderSearchOptions {
  query: string;
  category?: string;
  limit?: number;
  coordinates: Coordinates;
  storeServiceability: StoreServiceability;
}

export abstract class BaseQuickCommerceAdapter {
  abstract readonly provider: QuickCommerceProvider;

  /**
   * Performs dynamic search across this provider's dark store for a query or category
   */
  abstract search(options: ProviderSearchOptions): Promise<NormalizedProductOffer[]>;

  /**
   * Standardizes a raw item into the unified NormalizedProductOffer schema
   */
  protected normalizeItem(
    rawItem: {
      id: string;
      title: string;
      brand?: string;
      mrp: number;
      sellingPrice: number;
      imageUrl: string;
      packSizeText?: string;
      inStock: boolean;
      inventoryCount?: number;
      categoryHint?: string;
    },
    storeServiceability: StoreServiceability
  ): NormalizedProductOffer {
    const meta = extractProductMetadata(
      rawItem.packSizeText ? `${rawItem.title} ${rawItem.packSizeText}` : rawItem.title,
      rawItem.categoryHint || 'Grocery'
    );

    const brand = rawItem.brand && rawItem.brand !== 'Generic' ? rawItem.brand : meta.brand;
    const { pricePerStandardUnit, standardUnitLabel } = calculateStandardUnitPrice(
      rawItem.sellingPrice,
      meta.quantity,
      meta.unit
    );

    const discountPct =
      rawItem.mrp > rawItem.sellingPrice
        ? Math.round(((rawItem.mrp - rawItem.sellingPrice) / rawItem.mrp) * 100)
        : 0;

    const deepLinkUrl = this.generateDeepLink(rawItem.id, rawItem.title);

    return {
      id: `${this.provider}_${rawItem.id}`,
      provider: this.provider,
      providerProductId: rawItem.id,
      title: meta.cleanedTitle,
      brand,
      category: meta.category,
      imageUrl: rawItem.imageUrl || '/placeholder-grocery.png',
      rawPackSize: meta.displayPackSize,
      standardizedQuantity: meta.quantity,
      standardUnit: meta.unit,
      mrp: rawItem.mrp,
      sellingPrice: rawItem.sellingPrice,
      discountPercentage: discountPct,
      pricePerStandardUnit,
      standardUnitLabel,
      inStock: rawItem.inStock,
      inventoryCount: rawItem.inventoryCount,
      etaMinutes: storeServiceability.etaMinutes,
      storeId: storeServiceability.storeId,
      deepLinkUrl,
    };
  }

  /**
   * Generates app/web deep link for direct checkout
   */
  protected generateDeepLink(productId: string, title: string): string {
    const encoded = encodeURIComponent(title);
    switch (this.provider) {
      case 'blinkit':
        return `https://blinkit.com/prn/${encoded}/prid/${productId}`;
      case 'zepto':
        return `https://www.zeptonow.com/pn/${encoded}/pvid/${productId}`;
      case 'instamart':
        return `https://www.swiggy.com/instamart/item/${productId}`;
      case 'flipkart_minutes':
        return `https://www.flipkart.com/search?q=${encoded}&minutes=true`;
      case 'bigbasket_now':
        return `https://www.bigbasket.com/pd/${productId}/${encoded}/`;
      case 'jiomart_express':
        return `https://www.jiomart.com/search/${encoded}`;
      case 'amazon_now':
        return `https://www.amazon.in/s?k=${encoded}&i=nowstore`;
      default:
        return `#`;
    }
  }

  /**
   * Helper to format HTTP headers mimicking mobile/PWA web clients
   */
  protected getStandardHeaders(coords: Coordinates): Record<string, string> {
    return {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-IN,en;q=0.9',
      'x-lat': coords.latitude.toString(),
      'x-lon': coords.longitude.toString(),
      'x-platform': 'web',
    };
  }
}
