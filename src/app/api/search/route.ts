import { NextRequest, NextResponse } from 'next/server';
import { PRESET_METRO_ZONES, resolveDarkStores } from '@/core/engine/geo-resolver';
import { ADAPTER_REGISTRY } from '@/core/adapters/all-adapters';
import { clusterOffersIntoCanonicalProducts } from '@/core/engine/entity-matcher';
import { NormalizedProductOffer } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const latStr = searchParams.get('lat') || PRESET_METRO_ZONES[0].coordinates.latitude.toString();
    const lngStr = searchParams.get('lng') || PRESET_METRO_ZONES[0].coordinates.longitude.toString();

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lngStr);
    const coords = { latitude, longitude };

    // Resolve dark store serviceability for this location
    const geoResolution = resolveDarkStores(coords);

    if (!geoResolution.isQuickCommerceAvailable) {
      return NextResponse.json({
        ok: true,
        geo: geoResolution,
        canonicalProducts: [],
        message: '10-minute delivery is not currently available at this location.',
      });
    }

    // Call active providers in parallel
    const activeServices = geoResolution.services.filter((s) => s.isDeliverable);
    
    const searchPromises = activeServices.map(async (service) => {
      const adapter = ADAPTER_REGISTRY[service.provider];
      if (!adapter) return [];
      try {
        return await adapter.search({
          query,
          category,
          coordinates: coords,
          storeServiceability: service,
        });
      } catch (err) {
        console.warn(`Adapter search error for ${service.provider}:`, err);
        return [];
      }
    });

    const resultsByProvider = await Promise.all(searchPromises);
    const allRawOffers: NormalizedProductOffer[] = resultsByProvider.flat();

    // Cluster into Canonical Product Cards (merging identical products across providers)
    const canonicalProducts = clusterOffersIntoCanonicalProducts(allRawOffers);

    return NextResponse.json({
      ok: true,
      geo: {
        zone: geoResolution.closestZone,
        isQuickCommerceAvailable: geoResolution.isQuickCommerceAvailable,
        activeServiceCount: geoResolution.activeServiceCount,
        services: geoResolution.services,
      },
      totalItemsFound: canonicalProducts.length,
      canonicalProducts,
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal Search Error' },
      { status: 500 }
    );
  }
}
