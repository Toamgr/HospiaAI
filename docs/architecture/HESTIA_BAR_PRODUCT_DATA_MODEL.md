# HESTIA Bar Product Data Model

## Overview

This document describes the planned Supabase SQL schema for the bar product intelligence system. It is a planning document — no tables exist yet. The current implementation uses the code-level seed in `src/domain/hospitality/bar/`.

## Core Tables

### bar_products

```sql
CREATE TABLE bar_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        UUID NOT NULL REFERENCES venues(id),
  product_id_code TEXT NOT NULL,           -- e.g. 'gin-001'
  brand           TEXT NOT NULL,
  product_name    TEXT NOT NULL,
  category_id     TEXT NOT NULL,           -- references bar_product_categories.id
  subcategory     TEXT,
  bottle_size_ml  INTEGER NOT NULL,
  abv_percent     NUMERIC(5,2),
  tier            TEXT,
  fast_moving     BOOLEAN,
  storage_req     TEXT DEFAULT 'ambient',
  common_usage    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### bar_product_prices

```sql
CREATE TABLE bar_product_prices (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            UUID NOT NULL REFERENCES bar_products(id),
  venue_id              UUID NOT NULL REFERENCES venues(id),
  benchmark_price_nis   NUMERIC(10,2),
  actual_venue_price_nis NUMERIC(10,2),
  lowest_known_price    NUMERIC(10,2),
  highest_known_price   NUMERIC(10,2),
  vat_included          BOOLEAN,
  data_status           TEXT NOT NULL DEFAULT 'benchmark_estimate',
  confidence_level      TEXT NOT NULL DEFAULT 'medium',
  source_quality        TEXT DEFAULT 'unknown',
  source_url            TEXT,
  supplier_id           UUID REFERENCES bar_suppliers(id),
  last_verified_at      TIMESTAMPTZ,
  verified_by           UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);
```

### bar_suppliers

```sql
CREATE TABLE bar_suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id      UUID NOT NULL REFERENCES venues(id),
  name          TEXT NOT NULL,
  contact_name  TEXT,
  phone         TEXT,
  email         TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### bar_inventory_counts

```sql
CREATE TABLE bar_inventory_counts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID NOT NULL REFERENCES venues(id),
  product_id  UUID NOT NULL REFERENCES bar_products(id),
  units       INTEGER NOT NULL,
  count_date  DATE NOT NULL,
  counted_by  UUID REFERENCES users(id),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### bar_cocktails

```sql
CREATE TABLE bar_cocktails (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id                UUID NOT NULL REFERENCES venues(id),
  name                    TEXT NOT NULL,
  description             TEXT,
  category                TEXT,
  glassware               TEXT,
  garnish                 TEXT,
  method                  TEXT,
  serve_temp              TEXT,
  complexity_level        INTEGER CHECK (complexity_level BETWEEN 1 AND 5),
  status                  TEXT NOT NULL DEFAULT 'draft',
  approved_by             UUID REFERENCES users(id),
  approved_at             TIMESTAMPTZ,
  menu_price_nis          NUMERIC(10,2),
  target_cost_percentage  NUMERIC(5,4),
  venue_type              TEXT,
  tags                    TEXT[],
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);
```

### bar_cocktail_ingredients

```sql
CREATE TABLE bar_cocktail_ingredients (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cocktail_id          UUID NOT NULL REFERENCES bar_cocktails(id) ON DELETE CASCADE,
  product_id           UUID REFERENCES bar_products(id),
  ingredient_name      TEXT NOT NULL,
  pour_ml              NUMERIC(8,2) NOT NULL,
  apply_spillage       BOOLEAN DEFAULT true,
  ingredient_type      TEXT NOT NULL,
  cost_per_ml_override NUMERIC(10,6),
  notes                TEXT,
  sort_order           INTEGER DEFAULT 0
);
```

### bar_price_history

```sql
CREATE TABLE bar_price_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES bar_products(id),
  venue_id      UUID NOT NULL REFERENCES venues(id),
  price_nis     NUMERIC(10,2) NOT NULL,
  price_type    TEXT NOT NULL,    -- 'benchmark' | 'actual'
  source        TEXT,
  recorded_at   TIMESTAMPTZ NOT NULL,
  recorded_by   UUID REFERENCES users(id)
);
```

## Indexes

```sql
CREATE INDEX idx_bar_products_venue    ON bar_products(venue_id);
CREATE INDEX idx_bar_products_category ON bar_products(category_id);
CREATE INDEX idx_bar_prices_product    ON bar_product_prices(product_id);
CREATE INDEX idx_bar_prices_venue      ON bar_product_prices(venue_id);
CREATE INDEX idx_cocktails_venue       ON bar_cocktails(venue_id);
CREATE INDEX idx_cocktails_status      ON bar_cocktails(status);
CREATE INDEX idx_inventory_product     ON bar_inventory_counts(product_id, count_date);
```

## Row-Level Security

All tables will use `venue_id`-based RLS. Bar Manager and Admin can write. Bottle Prices page enforces identity gate at app layer — the database layer enforces role access only.

## Migration Path

1. Run `barProductSeed.placeholders.js` as a seed script into `bar_products` + `bar_product_prices`
2. Seed suppliers table as quotes arrive
3. Migrate approved cocktails from `cocktailDrafts` localStorage into `bar_cocktails` + `bar_cocktail_ingredients`
4. Once price history is live, deprecate benchmark_estimate records as invoices arrive
