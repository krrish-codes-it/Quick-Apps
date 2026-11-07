// Automated Core Engine Test Suite for Quick-Apps

import { calculateHaversineDistanceKm, resolveDarkStores, PRESET_METRO_ZONES } from '../src/core/engine/geo-resolver';
import { extractProductMetadata, calculateStandardUnitPrice, clusterOffersIntoCanonicalProducts } from '../src/core/engine/entity-matcher';
import { analyzeBasket } from '../src/core/engine/basket-optimizer';
import { ESSENTIAL_CATALOG } from '../src/core/data/dynamic-catalog';
import { ADAPTER_REGISTRY } from '../src/core/adapters/all-adapters';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

async function runTestSuite() {
  console.log('\n=============================================');
  console.log('🧪 RUNNING QUICK-APPS CORE TEST SUITE');
  console.log('=============================================\n');

  // --- 1. GEO RESOLVER TESTS ---
  console.log('--- 1. Testing Hyper-Local Geo Resolver ---');
  
  // Test Indiranagar coordinates
  const indiranagarCoords = PRESET_METRO_ZONES[0].coordinates;
  const blrResolution = resolveDarkStores(indiranagarCoords);
  assert(blrResolution.isQuickCommerceAvailable === true, 'Indiranagar is serviceable for 10-min delivery');
  assert(blrResolution.activeServiceCount === 7, 'All 7 delivery apps are active in Indiranagar');

  // Test Mangalore coordinates
  const mangaloreZone = PRESET_METRO_ZONES.find((z) => z.city === 'Mangalore');
  assert(mangaloreZone !== undefined, 'Mangalore preset exists');
  if (mangaloreZone) {
    const mngResolution = resolveDarkStores(mangaloreZone.coordinates);
    assert(mngResolution.isQuickCommerceAvailable === true, 'Mangalore is serviceable for 10-min delivery');
    assert(mngResolution.activeServiceCount === 4, 'Selective providers active in Mangalore');
  }

  // Test Rural / Remote coordinates (e.g. 100km away in deep hills)
  const ruralCoords = { latitude: 13.5000, longitude: 78.5000 };
  const ruralResolution = resolveDarkStores(ruralCoords);
  assert(ruralResolution.isQuickCommerceAvailable === false, 'Rural fringe area correctly marked unserviceable for 10-min delivery');

  // --- 2. ENTITY RESOLUTION & UNIT PRICING TESTS ---
  console.log('\n--- 2. Testing Entity Resolution & Normalization ---');

  const metaMilk = extractProductMetadata('Amul Taaza Toned Fresh Milk 500 ml', 'Dairy');
  assert(metaMilk.brand === 'Amul', 'Brand extracted: Amul');
  assert(metaMilk.quantity === 500 && metaMilk.unit === 'ml', 'Quantity parsed: 500 ml');

  const unitPriceMilk = calculateStandardUnitPrice(27, 500, 'ml');
  assert(unitPriceMilk.pricePerStandardUnit === 5.4, 'Standard unit price calculated: ₹5.40 / 100ml');

  const metaChips = extractProductMetadata("Lay's India's Magic Masala Potato Chips 50 g", 'Snacks');
  assert(metaChips.brand === "Lay's", "Brand extracted: Lay's");
  assert(metaChips.quantity === 50 && metaChips.unit === 'g', 'Quantity parsed: 50 g');

  const unitPriceChips = calculateStandardUnitPrice(20, 50, 'g');
  assert(unitPriceChips.pricePerStandardUnit === 40, 'Standard unit price calculated: ₹40.00 / 100g');

  const metaEggs = extractProductMetadata('Fresh Farm Eggs Pack of 6', 'Dairy');
  assert(metaEggs.quantity === 6 && metaEggs.unit === 'pc', 'Count parsed: 6 pcs');

  // --- 3. DYNAMIC CATALOG INTEGRITY ---
  console.log('\n--- 3. Testing Dynamic Catalog Blueprint ---');
  assert(ESSENTIAL_CATALOG.length >= 35, `Catalog contains comprehensive essentials (${ESSENTIAL_CATALOG.length} SKUs)`);
  const milkItems = ESSENTIAL_CATALOG.filter((i) => i.subcategory === 'Milk');
  assert(milkItems.length >= 4, 'Multiple competing milk brands exist (Amul, Mother Dairy, Nandini)');

  // --- 4. BASKET OPTIMIZER & FEE FORMULA TESTS ---
  console.log('\n--- 4. Testing Multi-Cart Landed Fee Optimizer ---');
  
  // Search for 2 items
  const service = blrResolution.services[0]; // Blinkit
  const rawOffers = await ADAPTER_REGISTRY.blinkit.search({
    query: 'milk',
    coordinates: indiranagarCoords,
    storeServiceability: service,
  });

  const canonicalGroups = clusterOffersIntoCanonicalProducts(rawOffers);
  assert(canonicalGroups.length > 0, 'Canonical products generated from raw search');

  const item1 = canonicalGroups[0];
  const basketItems = [{ canonicalProductId: item1.id, canonicalProduct: item1, quantity: 2 }];

  const basketAnalysis = analyzeBasket(basketItems, blrResolution.services);
  assert(basketAnalysis.singleStoreOptions.length > 0, 'Basket returns ranked single store options');
  assert(basketAnalysis.bestSingleStore !== null, 'Best single store identified');
  
  const winner = basketAnalysis.bestSingleStore;
  if (winner) {
    const expectedTotal = winner.itemsSubtotal + winner.deliveryFee + winner.handlingFee + winner.platformFee + winner.surgeFee + winner.smallCartFee;
    assert(winner.totalLandedCost === expectedTotal, `Landed cost math verified (₹${winner.totalLandedCost} === ₹${expectedTotal})`);
  }

  // --- SUMMARY ---
  console.log('\n=============================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('=============================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite();
