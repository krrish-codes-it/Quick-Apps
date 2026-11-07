import { NextRequest, NextResponse } from 'next/server';
import { PRESET_METRO_ZONES, resolveDarkStores } from '@/core/engine/geo-resolver';
import { analyzeBasket } from '@/core/engine/basket-optimizer';
import { BasketItem, Coordinates } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items: BasketItem[] = body.items || [];
    const coords: Coordinates = body.coordinates || PRESET_METRO_ZONES[0].coordinates;

    const geoResolution = resolveDarkStores(coords);
    const analysis = analyzeBasket(items, geoResolution.services);

    return NextResponse.json({
      ok: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Basket API Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal Basket Error' },
      { status: 500 }
    );
  }
}
