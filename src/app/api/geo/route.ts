import { NextRequest, NextResponse } from 'next/server';
import { PRESET_METRO_ZONES, resolveDarkStores } from '@/core/engine/geo-resolver';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const addressQuery = searchParams.get('address') || searchParams.get('q');
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    // If an address or pincode is queried, geocode it dynamically
    if (addressQuery && (!latStr || !lngStr)) {
      try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          addressQuery + ', India'
        )}&format=json&limit=1&countrycodes=in`;
        
        const geoRes = await fetch(geocodeUrl, {
          headers: { 'User-Agent': 'QuickBuy-Aggregator/1.0' },
        });
        const geoData = await geoRes.json();

        if (Array.isArray(geoData) && geoData.length > 0) {
          const matchedLat = parseFloat(geoData[0].lat);
          const matchedLng = parseFloat(geoData[0].lon);
          const resolution = resolveDarkStores({ latitude: matchedLat, longitude: matchedLng });

          return NextResponse.json({
            ok: true,
            data: {
              ...resolution,
              searchedAddress: geoData[0].display_name,
              coordinates: { latitude: matchedLat, longitude: matchedLng },
            },
          });
        }
      } catch (err) {
        console.warn('Geocoding fallback triggered:', err);
      }
    }

    if (!latStr || !lngStr) {
      // Return list of popular metro zones
      return NextResponse.json({
        ok: true,
        presets: PRESET_METRO_ZONES,
        defaultZone: PRESET_METRO_ZONES[0],
      });
    }

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lngStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ ok: false, error: 'Invalid coordinates' }, { status: 400 });
    }

    const resolution = resolveDarkStores({ latitude, longitude });

    return NextResponse.json({
      ok: true,
      data: resolution,
    });
  } catch (error: any) {
    console.error('Geo API Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed resolving dark stores' },
      { status: 500 }
    );
  }
}
