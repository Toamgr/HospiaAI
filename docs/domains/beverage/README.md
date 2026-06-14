# Domain: Beverage

Bar program domain — Cocktail Intelligence, the Cocktail Lab, the Wine Atlas, costing honesty, bar product data, and the beverage director workflow.

## Related Existing Documentation

- `docs/cocktail-intelligence/` — CI research and master intelligence document
- `docs/data/` — Bar product data, confidence rules, supplier ingestion, data gaps
- `docs/architecture/HESTIA_BAR_PRODUCT_FOUNDATION.md` — Bar product domain spec
- `docs/architecture/HESTIA_BAR_PRODUCT_DATA_MODEL.md` — Data model spec
- `docs/architecture/HESTIA_COCKTAIL_LAB_COSTING_MODEL.md` — Costing honesty model
- `docs/architecture/HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md` — Cocktail Lab checkpoint
- `skills/user/hestia-hospitality-intelligence/SKILL.md` — Beverage program intelligence section

## Current State (as of 2026-06-14)

**Production-ready:** Cocktail Intelligence (~120 backend routes), CI Director Chat, Rejection Memory, Taste DNA, AI menu generation, visual menu builder, DALL-E image generation.

**Partially connected:** Cocktail Lab (approval pipeline is localStorage-only — migration blocked per master memory A5). Approved event cocktail menus do not enter `cocktail_lifecycle`.

**Phase 3:** Cocktail Lab → backend persistence (architecturally blocked until client_id column added).

## Future domain intelligence to place here

- Event cocktail menu → CI lifecycle integration docs
- Cocktail acceptance memory models (alongside rejection memory)
- Wine program product thinking
- Beverage service readiness framework
- Bar program hospitality outcomes
