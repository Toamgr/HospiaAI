# HESTIA Venue Intelligence UI Skill Audit

## 1. Executive Summary

The current Venue Intelligence UI is closer to persistent venue discovery than to a generic dashboard or form wizard. `src/features/venue-intelligence/VenueIntelligence.jsx` uses an owner/admin learning session, opening prompts, staged discovery, and a side panel for what HESTIA is learning. That is the right product direction.

The main gap is not layout. The gap is truth handling. The UI does not clearly separate confirmed facts, inferences, Venue DNA candidates, confirmed Venue DNA, contradictions, insufficient signal, and source-backed specialist impact. The underlying services are more disciplined than the visible interface: `src/services/venueBridge/venueBridgeService.js`, `src/services/venueBridge/operationalSignalsService.js`, `src/services/venueBridge/academyContextService.js`, `src/services/venueBridge/omerContextService.js`, and `src/services/venueBridge/ownerIntelligenceService.js` contain stronger no-invention and confidence rules than the main conversation screen exposes.

The first improvement should be small: make the existing understanding panel label all current learning as working understanding or Venue DNA candidates unless confirmed evidence exists. Do not redesign the screen, add a dashboard, or create a new module.

## 2. Skill Route Used

| Step | Skill | Purpose in this audit |
| --- | --- | --- |
| 1 | `hestia-skills-orchestrator` | Confirmed that HESTIA is under-connected, not under-built, and that domain truth must precede UI changes. |
| 2 | `hestia-product-design-judgment` | Checked whether the UI solves a real product workflow instead of adding decorative or generic interface patterns. |
| 3 | `hestia-venue-memory-provenance` | Evaluated source, confidence, venue boundary, role safety, and whether memory claims are treated as facts or candidates. |
| 4 | `hestia-venue-intelligence-ui` | Checked the Venue DNA conversation against the required UI model: persistent discovery, open questions, uncertainty, and specialist context. |
| 5 | `hestia-ui-design` | Checked whether the UI direction stays HESTIA-native and avoids generic SaaS/dashboard drift. |

## 3. Current UI Assessment

| Area | Assessment | Evidence |
| --- | --- | --- |
| Persistent discovery | Mostly compliant. The screen feels like an ongoing learning session, not a one-time onboarding form. | `src/features/venue-intelligence/VenueIntelligence.jsx` has opening prompts, staged discovery, and copy such as "The Venue Learning Session." |
| Chatbot risk | Moderate. The primary interaction is still message bubbles plus a textarea and send button. | `VenueIntelligence.jsx` renders chat messages, typing state, and prompt buttons. |
| Dashboard risk | Low in the main UI. It does not lead with KPI cards or generic metrics. | The main structure is conversation plus "What HESTIA is learning." |
| Form risk | Low. It avoids a questionnaire/wizard structure. | The empty state explicitly says "No forms. Just tell me about it..." |
| Role access | Strong baseline. Owner/admin gating exists. | `src/hooks/useVenueIntelligenceState.js` defines `LEARNING_ROLES = ['owner', 'admin']`; `VenueIntelligence.jsx` shows an access notice when blocked. |
| Data model honesty | Mixed. The empty model avoids fabricated data, but the UI does not show claim state clearly. | `src/features/venue-intelligence/venueDnaModel.js` initializes empty arrays and null summary, but has no provenance or confirmed/candidate fields. |
| Specialist connection | Present in services, weak in the main UI. | `src/services/venueBridge/venueBridgeService.js` creates Omer/F&B, training, service, event, and owner briefs; `VenueBridgeInspector.jsx` displays them, but the main conversation UI does not. |

Direct answer: the current UI feels more like persistent discovery than a generic chatbot/form/dashboard, but it still has chatbot drift because the main artifact is a chat transcript. The side panel is the correct antidote; it needs stronger truth structure.

## 4. Compliance With hestia-venue-memory-provenance

| Rule | Current compliance | Notes |
| --- | --- | --- |
| Venue is the memory unit | Mostly compliant | The feature is venue-scoped and tied to Venue DNA. |
| User is operator, not memory unit | Mostly compliant | The UI treats owner/admin input as teaching the venue, not as the user's personal profile. |
| Every intelligence claim has a source or is marked unknown/inferred/candidate | Not compliant in main UI | Signal chips, summaries, and open questions do not show source or claim state. |
| Memory candidates are not facts until confirmed | Weak | The UI says "What HESTIA is learning" and "Everything said here builds your Venue DNA," which can imply direct confirmation. |
| Venue DNA must be earned through evidence | Partially compliant | Services avoid fabrication, but UI language can overstate the certainty of conversation-derived DNA. |
| Owner/admin confirmation for high-impact Venue DNA changes | Unclear | The inspected UI does not expose a confirmation workflow for Venue DNA changes. |
| No cross-venue leakage | No issue observed | No obvious cross-venue display was found in inspected files, but this needs backend/role verification later. |
| Confidence explicit when interpreting | Partial | The UI has "Understanding depth" dots, but no confidence labels, source basis, or interpretation state. |
| Recommendations separate fact, interpretation, action | Not applicable in main UI yet | The current UI does not show operational recommendations directly. Bridge and owner services are more disciplined. |
| Sensitive guest/team data minimized | No issue observed | The inspected Venue Intelligence screen does not expose guest/team details. |

The strongest provenance work lives in services, not the visible UI. `src/services/venueBridge/venueBridgeService.js` explicitly avoids invented facts, prices, KPIs, and advice; it also emits `insufficient_signal` when no usable DNA exists. `src/services/venueBridge/operationalSignalsService.js` can produce tensions between owner priorities and operational reality. Those concepts should be surfaced later, but not by inventing new data.

## 5. Compliance With hestia-venue-intelligence-ui

| Requirement | Current state | Verdict |
| --- | --- | --- |
| Persistent discovery, not onboarding | The conversation model and stage indicator support this. | Pass |
| Show what HESTIA knows | Shows summary and signal groups. | Partial |
| Show what HESTIA thinks | Shows inferred summary and detected signals, but without labeling them as inferred. | Partial |
| Show what HESTIA is unsure about | Shows open questions and empty states. | Partial |
| Show what HESTIA needs to ask next | Focus suggestions and opening prompts support this. | Pass |
| Separate confirmed Venue DNA from candidates | Not visible. | Fail |
| Separate founder/owner intent from operational reality | Model has `ownerPriorities` and `operationalPainPoints`, but UI collapses them into similar signal chips. | Partial |
| Show contradictions and identity drift as open questions | Not visible in main UI. `operationalSignalsService.js` can generate tensions. | Fail |
| Do not present inferred identity as confirmed identity | Risk exists because current copy can read as confirmed DNA. | Partial/fail |
| Show specialist impacts | Present in bridge services and `VenueBridgeInspector.jsx`, not in the main UI. | Partial |
| Keep Venue Intelligence distinct from Event Manager | Current UI is distinct and does not become event control. | Pass |

The current screen should not be rebuilt from scratch. It needs clearer truth states inside the existing learning panel.

## 6. Product Risks

| Risk | Level | Finding |
| --- | --- | --- |
| Chatbot drift | Medium | The conversation is useful, but the interface can still read as a chat assistant unless the learning/evidence panel becomes more authoritative than the transcript. |
| Dashboard drift | Low | The current screen avoids KPI walls and generic analytics cards. |
| Fake Venue DNA | Medium | The model starts empty, which is good, but UI language risks treating conversation output as Venue DNA too early. |
| Weak provenance | High | The main UI does not show source, evidence count, timestamp, or whether a claim came from owner input, operational signal, or inferred bridge context. |
| Overconfident identity claims | Medium | `venueDNA.summary` is displayed as "In a sentence" without candidate/confirmed status. |
| Unclear founder intent vs operational reality | Medium | Owner priorities and operational pain points exist as separate model fields, but the UI does not make the distinction operationally clear. |
| Specialist impacts that are not source-backed | Medium | Specialist impacts exist in `VenueBridgeInspector.jsx` and bridge services, but if moved into the main UI later they must carry source/confidence/status. |
| Role leakage | Low observed, medium to verify | Owner/admin access is present, but future specialist impact panels must not expose owner-only context to lower roles. |
| Memory fragmentation | Medium | Conversation UI, bridge inspector, operational signals, and owner intelligence are connected in services but not yet visible as one coherent memory workflow. |

## 7. Recommended Improvements

### Must Fix Now

| Priority | Improvement | Why |
| --- | --- | --- |
| 1 | Rename visible learning states so current summary/signals are clearly "working understanding" or "Venue DNA candidates" unless confirmed. | Prevents inferred or early conversation content from reading as confirmed Venue DNA. |
| 2 | Add visible source/state language to the understanding panel using existing data only. | The UI needs to say when evidence is insufficient instead of implying certainty. |
| 3 | Change copy that says "Everything said here builds your Venue DNA." | This overstates the doctrine. Conversation should create candidates and questions, not automatic DNA. |

### Should Fix Soon

| Priority | Improvement | Why |
| --- | --- | --- |
| 1 | Add a small "Owner intent vs operational reality" section when data exists. | This is core to Venue Intelligence and already has support in `operationalSignalsService.js` through tensions. |
| 2 | Add a read-only specialist impact preview for Omer, Zohar/Event, Academy, and Owner Intelligence. | The bridge exists, but the main conversation does not show how memory affects specialists. |
| 3 | Replace confidence dots alone with confidence labels plus basis. | Dots are not enough for operational truth. |
| 4 | Make reset language safer. | "Start fresh" should clarify whether it resets the session, current draft understanding, or stored venue memory. |

### Later

| Priority | Improvement | Why |
| --- | --- | --- |
| 1 | Add an owner/admin confirmation flow for high-impact Venue DNA changes. | Required before moving candidates into confirmed Venue DNA. |
| 2 | Add source drill-down for memory claims. | Useful once provenance fields exist in the API/model. |
| 3 | Add contradiction/identity drift review. | Important, but should use real tensions and evidence, not generated drama. |
| 4 | Add role-specific specialist views. | Should happen after claim state and provenance are stable. |

## 8. Smallest Safe Next Implementation Task

Update only the labels and helper copy in `src/features/venue-intelligence/VenueIntelligence.jsx` so the existing understanding panel stops implying confirmed Venue DNA.

Narrow scope:

- Change "In a sentence" to "Working understanding".
- Add a short note near detected signals: "Signals are candidates until confirmed or supported by evidence."
- Change "Everything said here builds your Venue DNA" to language that says the conversation can create Venue DNA candidates, open questions, and memory signals.
- Do not change the backend schema.
- Do not add new modules.
- Do not add charts, dashboards, image generation, or 3D.
- Do not invent provenance fields that the API does not return.

This is the smallest safe task because it reduces overconfidence without changing system behavior.

## 9. Files That Would Likely Be Touched Later

| File | Why it may be touched later |
| --- | --- |
| `src/features/venue-intelligence/VenueIntelligence.jsx` | Main UI labels, learning panel structure, specialist impact preview, confidence display. |
| `src/features/venue-intelligence/venueDnaModel.js` | Future model fields for claim state, provenance, confirmed/candidate separation, contradictions, and source references. |
| `src/hooks/useVenueIntelligenceState.js` | Future API state if provenance, confirmed DNA, or specialist impact data is returned. |
| `src/services/api/venueIntelligenceApi.js` | Future API contract documentation for provenance, confidence, and confirmation states. |
| `src/features/venue-intelligence/VenueBridgeInspector.jsx` | Useful reference for specialist impact display; should remain inspector-oriented unless intentionally promoted. |
| `src/services/venueBridge/venueBridgeService.js` | Source of specialist brief status, confidence, source hash, and insufficient signal handling. |
| `src/services/venueBridge/operationalSignalsService.js` | Source for operational reality, tensions, and identity drift candidates. |
| `src/services/venueBridge/ownerIntelligenceService.js` | Source for owner-level "what HESTIA learned" context. |
| `src/services/venueBridge/academyContextService.js` | Source for Academy impact without inventing lessons or progress. |
| `src/services/venueBridge/omerContextService.js` | Source for beverage/F&B impact without inventing pricing, suppliers, or menu facts. |

## 10. Verification Plan For Later Implementation

| Check | Required verification |
| --- | --- |
| Build | Run the existing build script and confirm no compile errors. |
| Browser check | Open the Venue Intelligence screen and verify labels, empty states, message flow, and side panel rendering. |
| Role/access | Verify owner/admin can access the learning session and lower roles see the blocked state. |
| Mobile | Check the conversation and understanding panel on a narrow viewport; no text overlap or hidden action controls. |
| Provenance/confidence checks | Confirm the UI does not label unconfirmed content as fact, does not imply Venue DNA confirmation without evidence, and does not show fake source details. |
| Specialist impact checks | If specialist impacts are added later, verify each impact has status, confidence, and source basis from existing bridge services. |
| No fake data | Confirm no invented guest behavior, staff weakness, pricing trend, sales trend, event urgency, or venue signal is introduced. |

