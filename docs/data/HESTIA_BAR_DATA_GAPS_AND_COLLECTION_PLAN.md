# HESTIA Bar Data Gaps and Collection Plan

## Critical Gaps (Block Costing Decisions)

| Gap | Impact | Collection Method |
|-----|--------|-------------------|
| No venue invoice prices | Cannot confirm actual costs | Request invoices from distributor |
| No supplier names | Cannot place orders via HESTIA | Identify current suppliers per category |
| VAT status unknown | 17% pricing error risk | Confirm with supplier per invoice |

## High Priority Gaps (Material Costing Impact)

| Gap | Impact | Collection Method |
|-----|--------|-------------------|
| No fresh produce pricing | Cannot cost citrus cocktails accurately | Record weekly produce order price |
| No real-time inventory counts | Cannot do par-level planning | Weekly physical count via Inventory Overview |
| Labor rate not validated | Default assumption (50 NIS/hr) may be wrong | Confirm with management |
| Ultra-premium prices volatile | Don Julio 1942, Clase Azul may be ±30% | Verify directly with importer before repricing |
| Scotch allocation pricing | Lagavulin 16 scarce — retail price unreliable | Confirm current allocation with distributor |

## Medium Priority Gaps (Operational Efficiency)

| Gap | Impact | Collection Method |
|-----|--------|-------------------|
| No price range tracking | Cannot identify best buying channels | Compare 3+ suppliers per product over 90 days |
| No cocktail recipe → product_id links | Costing not automated | Migrate approved recipes into cocktailSeed format |
| Syrup costs not tracked | Signature cocktail costing incomplete | Calculate per-batch cost and yield |
| Tequila/Mezcal import duties | 2025 customs changes may affect prices | Confirm with importer |
| Bitters not seeded | Cocktail costing missing bitters contribution | Add Angostura, Peychaud's in next cycle |
| MOQs and lead times unknown | Cannot plan orders or set safety stock | Request from each supplier next order cycle |

## Low Priority Gaps (Future Precision)

| Gap | Impact | Collection Method |
|-----|--------|-------------------|
| Garnish cost per cocktail | Small but accumulates | Estimate per-cocktail garnish overhead |
| Glassware breakage | Small overhead | Track monthly breakage and divide by volume |
| Juice yield per fruit | Current assumptions may be ±20% | Measure 10 fruits of each type |
| No price history | Cannot detect inflation | Timestamp all price updates once system live |

## Collection Ownership

| Owner | Gaps |
|-------|------|
| Bar Manager | Product prices, supplier contacts, MOQs, produce costs, fresh juice yields |
| Manager | Labor rate confirmation, breakage tracking |
| Owner / Admin | VAT status confirmation, labor rate approval |
| HESTIA Development | Price history system, cocktail → product_id linking |

## When Data Is Collected

Data collected in the field is entered into HESTIA by updating the relevant product record in the bar domain layer. Once a Supabase schema is live, data will be submitted via the Bottle Prices admin view.

All price updates must include: price, source, date verified, VAT status.
