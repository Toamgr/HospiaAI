# Beverage Intelligence Brain — Gap Analysis (2026-07)

**Status:** Doctrine / gap analysis. No implementation is mandated by this document.
**Scope companion:** `BEVERAGE_UX_SYSTEM_OWNER_BRIEF_AND_REPORT_MEMORY_2026_07.md`
**Binding doctrine:** HESTIA is the service; Ember is the intelligence engine; Shift is the
evidence layer; Academy is the improvement engine. Venue Memory = raw evidence; Venue
Intelligence = interpretation; Venue DNA = crystallized identity. No fake data, no fake AI
fallback drafts, no fake success states, honest empty/error states.

---

## 1. Why this document exists

There is a recurring temptation to frame the "Beverage Intelligence Brain" as a RAG problem:
embed the cocktail research corpus, embed venue documents, retrieve, generate. This document
records why that framing is mostly wrong as a *first* move, what the real moat is, and what the
safe first working slice actually is.

## 2. RAG is mostly the wrong first framing

- Retrieval-augmented generation answers "what text is similar to this question." The beverage
  decisions HESTIA must support are not similarity problems — they are **evidence and
  attribution problems**: what was on the menu, when, what sold, under which conditions, and
  what the humans decided about it.
- A vector DB over research notes produces fluent, plausible drafts — exactly the class of
  output PR #1 (`7dedb47`) and PR #2 (`5e8bcda`) spent production effort *removing* when it
  appeared as fake fallback content. Adding a retrieval layer before an evidence layer
  re-creates the fake-data risk with better prose.
- RAG becomes appropriate **later**, narrowly: retrieving *venue-scoped, provenance-tagged
  evidence records* (not generic research) into an already-structured decision context. That is
  retrieval over Venue Memory, not retrieval over a corpus.

## 3. The existing cocktail research is a strong expert prior — not evidence

The repo already carries a deterministic expert layer under `src/domain/hospitality/bar/`
(taste profile schema, classic taste calibration, cocktail family ratios, ingredient taste
impact, micro-adjustment prediction, venue taste profile mapping) plus the cocktail knowledge
base. This is a real asset:

- It is an **expert prior**: what a world-class beverage director believes before seeing this
  venue's data.
- It must never be presented as venue evidence. "The Negroni family skews bitter-forward" is a
  prior; "your guests loved the Negroni riff" is a claim that requires venue evidence that does
  not exist yet.
- The prior layer stays deterministic, versioned in code, and testable — it does not need
  embeddings to be useful.

## 4. The deep moat is evidence plumbing (later phases, in order)

The durable, hard-to-copy asset is not generation. It is the pipeline that turns messy venue
reality into attributable evidence:

1. **POS / Tabit import** — raw sales report ingestion (files first, API later). Raw rows land
   in Venue Memory untouched, with source, period, and import provenance.
2. **Item mapping** — POS item names → HESTIA cocktail/menu entities. Human-confirmed mapping
   with confidence per link; unmapped items stay visibly unmapped (honest gaps, no fuzzy
   auto-merge presented as fact).
3. **Menu-period timeline** — which menu, which items, which prices were live during which date
   range. Without the timeline, sales cannot be attributed to a menu decision at all.
4. **Attribution model** — connect sold quantities to menu items *within a period*, adjusting
   for availability, seasonality, and events. Attribution outputs are interpretations and are
   labeled as such.
5. **Confidence composition** — every derived claim carries how it was derived: which raw
   records, which mapping links, which period assumptions. Confidence is composed upward, never
   asserted.
6. **Outcome loop** — a decision (menu change, new cocktail) is recorded, then later scored
   against the evidence that followed it. This is what makes Ember compound instead of chat.

Each stage is venue-scoped, provenance-tagged, and human-reviewable. None of it exists yet, and
none of it is built in Slice 1A.

## 5. "Sold well" is a fact; "is loved" is a hypothesis

The core epistemic rule for everything in this domain:

- **Fact (Venue Memory):** "Item X sold 214 units in period P" — importable, auditable.
- **Hypothesis (Venue Intelligence):** "Guests love X", "X sells because of the menu position",
  "X should anchor next season's menu" — interpretations that must carry confidence and
  provenance, and must remain revisable.
- Sales performance may **influence recommendations** later. It must **never rewrite Venue
  DNA**. Venue DNA is crystallized identity (aspiration and observed identity, never
  collapsed); a good quarter for espresso martinis does not change who the venue is. Any
  DNA-adjacent proposal derived from sales must go through the existing human-approval
  promotion pattern (see the owner-meaning promotion slices) — AI may propose; humans approve.
- This slice (1A) additionally **must not infer guest preferences or sales performance at
  all** — there is no sales data in the system yet, and inventing any would violate doctrine.

## 6. Gap map (current state → Brain)

| Capability | Exists today | Gap |
| --- | --- | --- |
| Expert prior (ratios, taste calibration, KB) | Yes — deterministic, tested | None for this phase |
| AI cocktail proposal route (neutral, hardened) | Yes — `/api/ai/cocktail-proposal` | Do not touch |
| Owner beverage direction (structured, persisted) | **No** | **Slice 1A (this branch)** |
| F&B review of owner direction | **No** | **Slice 1A (this branch)** |
| POS/Tabit import | No | Later — evidence plumbing stage 1 |
| Item mapping | No | Later — stage 2 |
| Menu-period timeline | No | Later — stage 3 |
| Attribution + confidence composition | No | Later — stages 4–5 |
| Outcome loop / experiments | No | Later — stage 6 |
| RAG over venue evidence | No | Only after stages 1–5 exist |

## 7. The first safe working slice

**Owner Beverage Direction Brief → F&B Director review** is the correct first slice because:

- It captures the highest-authority signal in the system (the owner's stated direction) as
  typed, with provenance, before any interpretation exists.
- It exercises the full doctrine surface — venue scoping, role boundaries, append-only audit,
  immutability of the human's words, review-as-layer (F&B adjustments never overwrite the
  owner's values) — on a small schema, before the expensive evidence plumbing is built.
- It contains **zero AI generation**, so it cannot introduce fake content, and it produces the
  structured input that any later generation step would consume.

Slice 1A's contract, schema, and UX are specified in
`BEVERAGE_UX_SYSTEM_OWNER_BRIEF_AND_REPORT_MEMORY_2026_07.md`.

## 8. Explicitly out of scope (this phase)

Cocktail menu generation, images, POS report upload, sales analysis, improvement briefs,
30-day experiments, Academy integration, recipe/prep/SOP generation, costing engine changes,
vector DB / embeddings, any Venue DNA write.
