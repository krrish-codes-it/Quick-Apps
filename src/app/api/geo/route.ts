import { NextRequest, NextResponse } from 'next/server';
import { PRESET_METRO_ZONES, resolveDarkStores } from '@/core/engine/geo-resolver';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

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
