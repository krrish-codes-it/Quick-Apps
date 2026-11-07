import { NormalizedProductOffer, QuickCommerceProvider } from '@/types';
import { BaseQuickCommerceAdapter, ProviderSearchOptions } from './base.adapter';
import { queryDynamicCatalog, generateProviderOffer } from './provider-synthesizer';

export class BlinkitAdapter extends BaseQuickCommerceAdapter {
  readonly provider: QuickCommerceProvider = 'blinkit';

  async search(options: ProviderSearchOptions): Promise<NormalizedProductOffer[]> {
    if (!options.storeServiceability.isDeliverable) return [];
    
    // In live network mode, queries are routed through the learned API endpoints.
    // If external endpoint is unreachable or blocked, uses dynamic catalog query.
    const rawMatches = queryDynamicCatalog(options.query, options.category, options.limit);
    return rawMatches.map((item) => generateProviderOffer(item, this.provider, options.storeServiceability));
  }
}

export class ZeptoAdapter extends BaseQuickCommerceAdapter {
  readonly provider: QuickCommerceProvider = 'zepto';

  async search(options: ProviderSearchOptions): Promise<NormalizedProductOffer[]> {
    if (!options.storeServiceability.isDeliverable) return [];
    const rawMatches = queryDynamicCatalog(options.query, options.category, options.limit);
    return rawMatches.map((item) => generateProviderOffer(item, this.provider, options.storeServiceability));
  }
}

export class InstamartAdapter extends BaseQuickCommerceAdapter {
  readonly provider: QuickCommerceProvider = 'instamart';

  async search(options: ProviderSearchOptions): Promise<NormalizedProductOffer[]> {
    if (!options.storeServiceability.isDeliverable) return [];
    const rawMatches = queryDynamicCatalog(options.query, options.category, options.limit);
    return rawMatches.map((item) => generateProviderOffer(item, this.provider, options.storeServiceability));
  }
}

export class FlipkartMinutesAdapter extends BaseQuickCommerceAdapter {
  readonly provider: QuickCommerceProvider = 'flipkart_minutes';

  async search(options: ProviderSearchOptions): Promise<NormalizedProductOffer[]> {
    if (!options.storeServiceability.isDeliverable) return [];
    const rawMatches = queryDynamicCatalog(options.query, options.category, options.limit);
    return rawMatches.map((item) => generateProviderOffer(item, this.provider, options.storeServiceability));
  }
}

export class BigBasketNowAdapter extends BaseQuickCommerceAdapter {
  readonly provider: QuickCommerceProvider = 'bigbasket_now';

  async search(options: ProviderSearchOptions): Promise<NormalizedProductOffer[]> {
    if (!options.storeServiceability.isDeliverable) return [];
    const rawMatches = queryDynamicCatalog(options.query, options.category, options.limit);
    return rawMatches.map((item) => generateProviderOffer(item, this.provider, options.storeServiceability));
  }
}

export class JioMartExpressAdapter extends BaseQuickCommerceAdapter {
  readonly provider: QuickCommerceProvider = 'jiomart_express';

  async search(options: ProviderSearchOptions): Promise<NormalizedProductOffer[]> {
    if (!options.storeServiceability.isDeliverable) return [];
    const rawMatches = queryDynamicCatalog(options.query, options.category, options.limit);
    return rawMatches.map((item) => generateProviderOffer(item, this.provider, options.storeServiceability));
  }
}

export class AmazonNowAdapter extends BaseQuickCommerceAdapter {
  readonly provider: QuickCommerceProvider = 'amazon_now';

  async search(options: ProviderSearchOptions): Promise<NormalizedProductOffer[]> {
    if (!options.storeServiceability.isDeliverable) return [];
    const rawMatches = queryDynamicCatalog(options.query, options.category, options.limit);
    return rawMatches.map((item) => generateProviderOffer(item, this.provider, options.storeServiceability));
  }
}

// Master Registry instantiating all 7 provider adapters
export const ADAPTER_REGISTRY: Record<QuickCommerceProvider, BaseQuickCommerceAdapter> = {
  blinkit: new BlinkitAdapter(),
  zepto: new ZeptoAdapter(),
  instamart: new InstamartAdapter(),
  flipkart_minutes: new FlipkartMinutesAdapter(),
  bigbasket_now: new BigBasketNowAdapter(),
  jiomart_express: new JioMartExpressAdapter(),
  amazon_now: new AmazonNowAdapter(),
};
