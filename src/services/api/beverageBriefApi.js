// Beverage Brief API client — Beverage Slice 1A (Owner Beverage Direction Brief → F&B Inbox).
// Uses the shared client.js helpers (auth token + X-HESTIA-Venue injected automatically; the
// backend validates both — the header is a hint, never a grant). No AI, no generation calls.

import { apiGet, apiPost, apiPut, apiPatch } from './client'

// ── Owner — Beverage Direction Brief ──────────────────────────────────────────

// Create a draft brief. fields: { venue_type, service_style, intent_statement, guest_profile,
// flavor_direction, cocktail_count, zero_proof_stance, constraints, price_range,
// staff_capability_note, season_context } — all optional; empty stays empty.
export const createBeverageBrief = (fields) =>
  apiPost('/api/owner-beverage-briefs', { fields })

// Update a draft brief (author-only; a submitted brief returns 409).
export const updateBeverageBrief = (briefId, fields) =>
  apiPut(`/api/owner-beverage-briefs/${briefId}`, { fields })

// Submit a draft to the F&B Director (one-way; the owner version becomes read-only).
export const submitBeverageBrief = (briefId) =>
  apiPost(`/api/owner-beverage-briefs/${briefId}/submit`, {})

// List the venue's briefs (with review state), newest first.
export const listBeverageBriefs = () => apiGet('/api/owner-beverage-briefs')

// Read one brief + its audit events.
export const getBeverageBrief = (briefId) => apiGet(`/api/owner-beverage-briefs/${briefId}`)

// ── F&B Director — Beverage Brief Inbox ───────────────────────────────────────

// List submitted briefs with review state, newest submission first.
export const listBriefInbox = () => apiGet('/api/fnb-beverage-brief-inbox')

// Read one submitted brief + its review (or null) + audit events.
export const getInboxBrief = (briefId) => apiGet(`/api/fnb-beverage-brief-inbox/${briefId}`)

// Open a review (in_review) on a submitted brief.
export const createBriefReview = (briefId) =>
  apiPost('/api/fnb-brief-reviews', { brief_id: briefId })

// Update a review: { notes?, adjustments?: [{ field, adjusted_value, note }], status? } where
// status is one of approved | declined | clarification_requested. Closed once decided.
export const updateBriefReview = (reviewId, payload) =>
  apiPatch(`/api/fnb-brief-reviews/${reviewId}`, payload)
