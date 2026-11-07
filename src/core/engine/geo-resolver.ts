import { Coordinates, MetroZone, QuickCommerceProvider, StoreServiceability } from '@/types';

// Preset Major Metros and Top Quick-Commerce Hubs in India
export const PRESET_METRO_ZONES: MetroZone[] = [
  {
    id: 'blr-indiranagar',
    city: 'Bengaluru',
    zoneName: 'Indiranagar 100ft Rd',
    displayName: 'Indiranagar, Bengaluru (KA)',
    coordinates: { latitude: 12.9784, longitude: 77.6408 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express', 'amazon_now'],
  },
  {
    id: 'blr-koramangala',
    city: 'Bengaluru',
    zoneName: 'Koramangala 4th Block',
    displayName: 'Koramangala, Bengaluru (KA)',
    coordinates: { latitude: 12.9352, longitude: 77.6245 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express', 'amazon_now'],
  },
  {
    id: 'del-gurgaon-cybercity',
    city: 'Delhi NCR',
    zoneName: 'DLF Cyber City, Gurgaon',
    displayName: 'Cyber City, Gurgaon (NCR)',
    coordinates: { latitude: 28.4950, longitude: 77.0895 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express', 'amazon_now'],
  },
  {
    id: 'del-south-gk',
    city: 'Delhi NCR',
    zoneName: 'Greater Kailash 1',
    displayName: 'Greater Kailash, South Delhi (NCR)',
    coordinates: { latitude: 28.5535, longitude: 77.2359 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express', 'amazon_now'],
  },
  {
    id: 'del-noida-sec18',
    city: 'Delhi NCR',
    zoneName: 'Sector 18, Noida',
    displayName: 'Sector 18, Noida (NCR)',
    coordinates: { latitude: 28.5708, longitude: 77.3260 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express'],
  },
  {
    id: 'mum-bandra-west',
    city: 'Mumbai',
    zoneName: 'Bandra West, Hill Road',
    displayName: 'Bandra West, Mumbai (MH)',
    coordinates: { latitude: 19.0596, longitude: 72.8295 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express', 'amazon_now'],
  },
  {
    id: 'mum-powai',
    city: 'Mumbai',
    zoneName: 'Hiranandani Gardens, Powai',
    displayName: 'Powai, Mumbai (MH)',
    coordinates: { latitude: 19.1176, longitude: 72.9060 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express'],
  },
  {
    id: 'hyd-hitec-city',
    city: 'Hyderabad',
    zoneName: 'HITEC City, Madhapur',
    displayName: 'HITEC City, Hyderabad (TS)',
    coordinates: { latitude: 17.4474, longitude: 78.3762 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express'],
  },
  {
    id: 'pun-koregaon-park',
    city: 'Pune',
    zoneName: 'Koregaon Park North Main Rd',
    displayName: 'Koregaon Park, Pune (MH)',
    coordinates: { latitude: 18.5362, longitude: 73.8940 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'flipkart_minutes', 'bigbasket_now', 'jiomart_express'],
  },
  {
    id: 'che-t-nagar',
    city: 'Chennai',
    zoneName: 'T. Nagar Panagal Park',
    displayName: 'T. Nagar, Chennai (TN)',
    coordinates: { latitude: 13.0418, longitude: 80.2341 },
    isServiceable: true,
    supportedProviders: ['blinkit', 'zepto', 'instamart', 'bigbasket_now', 'jiomart_express'],
  },
  {
    id: 'mng-kadri',
    city: 'Mangalore',
    zoneName: 'Kadri Hills & Mallikatte',
    displayName: 'Kadri, Mangalore (KA)',
    coordinates: { latitude: 12.8858, longitude: 74.8560 },
    isServiceable: true,
    // Note: Zepto and Flipkart Minutes are selective in Mangalore; Blinkit, BigBasket and JioMart are fully active
    supportedProviders: ['blinkit', 'bigbasket_now', 'jiomart_express', 'instamart'],
  },
];

// Dark Store Base Configuration for Top Quick Commerce Apps
export const PROVIDER_METADATA: Record<QuickCommerceProvider, {
  name: string;
  tagline: string;
  badgeColor: string;
  logoBg: string;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  handlingFee: number;
  platformFee: number;
  smallCartFee: number;
  smallCartThreshold: number;
  maxServiceRadiusKm: number;
}> = {
  blinkit: {
    name: 'Blinkit',
    tagline: 'Everything delivered in 10 minutes',
    badgeColor: 'bg-yellow-400 text-black',
    logoBg: '#F8CB46',
    baseDeliveryFee: 25,
    freeDeliveryThreshold: 199,
    handlingFee: 7,
    platformFee: 4,
    smallCartFee: 20,
    smallCartThreshold: 99,
    maxServiceRadiusKm: 3.5,
  },
  zepto: {
    name: 'Zepto',
    tagline: '10 min grocery delivery',
    badgeColor: 'bg-purple-700 text-white',
    logoBg: '#52057B',
    baseDeliveryFee: 30,
    freeDeliveryThreshold: 149,
    handlingFee: 8,
    platformFee: 5,
    smallCartFee: 25,
    smallCartThreshold: 99,
    maxServiceRadiusKm: 3.0,
  },
  instamart: {
    name: 'Swiggy Instamart',
    tagline: 'Groceries in 10-15 mins',
    badgeColor: 'bg-orange-600 text-white',
    logoBg: '#FC8019',
    baseDeliveryFee: 35,
    freeDeliveryThreshold: 199,
    handlingFee: 6,
    platformFee: 6,
    smallCartFee: 20,
    smallCartThreshold: 99,
    maxServiceRadiusKm: 4.0,
  },
  flipkart_minutes: {
    name: 'Flipkart Minutes',
    tagline: 'Hyperlocal 10 min groceries',
    badgeColor: 'bg-blue-600 text-white',
    logoBg: '#2874F0',
    baseDeliveryFee: 20,
    freeDeliveryThreshold: 99, // aggressive launch subsidy
    handlingFee: 4,
    platformFee: 3,
    smallCartFee: 15,
    smallCartThreshold: 75,
    maxServiceRadiusKm: 3.0,
  },
  bigbasket_now: {
    name: 'BB Now',
    tagline: 'Tata BigBasket 10-20 min express',
    badgeColor: 'bg-emerald-700 text-white',
    logoBg: '#84C225',
    baseDeliveryFee: 25,
    freeDeliveryThreshold: 249,
    handlingFee: 5,
    platformFee: 4,
    smallCartFee: 20,
    smallCartThreshold: 120,
    maxServiceRadiusKm: 4.5,
  },
  jiomart_express: {
    name: 'JioMart Quick',
    tagline: 'Reliance express grocery delivery',
    badgeColor: 'bg-sky-600 text-white',
    logoBg: '#0078AD',
    baseDeliveryFee: 20,
    freeDeliveryThreshold: 149,
    handlingFee: 5,
    platformFee: 3,
    smallCartFee: 15,
    smallCartThreshold: 99,
    maxServiceRadiusKm: 5.0,
  },
  amazon_now: {
    name: 'Amazon Fresh Fast',
    tagline: 'Ultra-fast 15 min essentials',
    badgeColor: 'bg-amber-600 text-black',
    logoBg: '#FF9900',
    baseDeliveryFee: 30,
    freeDeliveryThreshold: 249,
    handlingFee: 5,
    platformFee: 5,
    smallCartFee: 25,
    smallCartThreshold: 149,
    maxServiceRadiusKm: 3.5,
  },
};

/**
 * Calculates Great-Circle distance in kilometers between two GPS coordinates using the Haversine formula
 */
export function calculateHaversineDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Resolves user coordinates to the closest serviceable metro zone and dark stores.
 */
export function resolveDarkStores(userCoords: Coordinates): {
  closestZone: MetroZone;
  distanceToZoneCenterKm: number;
  isQuickCommerceAvailable: boolean;
  activeServiceCount: number;
  services: StoreServiceability[];
} {
  // Find nearest known metro cluster
  let closestZone = PRESET_METRO_ZONES[0];
  let minDistance = calculateHaversineDistanceKm(userCoords, closestZone.coordinates);

  for (const zone of PRESET_METRO_ZONES) {
    const dist = calculateHaversineDistanceKm(userCoords, zone.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone;
    }
  }

  // Quick commerce micro-warehouses are strictly within 5-8km radius of city hubs.
  // Beyond 15km, it is considered rural/fringe or unserviceable for 10-minute delivery.
  const isQuickCommerceAvailable = minDistance <= 15.0;

  const allProviders: QuickCommerceProvider[] = [
    'blinkit',
    'zepto',
    'instamart',
    'flipkart_minutes',
    'bigbasket_now',
    'jiomart_express',
    'amazon_now',
  ];

  const services: StoreServiceability[] = allProviders.map((provider) => {
    const meta = PROVIDER_METADATA[provider];
    const isSupportedInZone = closestZone.supportedProviders.includes(provider);
    
    // Simulate slight dark store offsets around the hub
    const storeOffsetKm = 0.5 + ((provider.length * 3) % 15) / 10;
    const effectiveDistanceKm = parseFloat((minDistance * 0.4 + storeOffsetKm).toFixed(1));
    const isDeliverable = isQuickCommerceAvailable && isSupportedInZone && effectiveDistanceKm <= meta.maxServiceRadiusKm;

    // Delivery ETA formula based on dark store distance
    // 1 km approx = 8-10 mins (including 2 min packing + 6 min transit)
    const basePrepTime = 3;
    const transitTime = Math.ceil(effectiveDistanceKm * 3.2);
    const etaMinutes = isDeliverable ? Math.max(8, Math.min(25, basePrepTime + transitTime)) : 0;

    // Surge pricing simulation: Active during peak hours or long distances
    const surgeActive = isDeliverable && (effectiveDistanceKm > 2.8);
    const surgeFee = surgeActive ? 15 : 0;

    return {
      provider,
      storeId: `${provider.toUpperCase()}_DS_${closestZone.id.toUpperCase()}_01`,
      storeName: `${meta.name} Dark Store #${closestZone.zoneName.slice(0, 8)}`,
      isDeliverable,
      etaMinutes,
      distanceKm: effectiveDistanceKm,
      surgeActive,
      surgeReason: surgeActive ? 'High demand in this delivery cluster' : undefined,
      surgeFee,
    };
  });

  const activeServiceCount = services.filter((s) => s.isDeliverable).length;

  return {
    closestZone,
    distanceToZoneCenterKm: minDistance,
    isQuickCommerceAvailable: isQuickCommerceAvailable && activeServiceCount > 0,
    activeServiceCount,
    services,
  };
}
