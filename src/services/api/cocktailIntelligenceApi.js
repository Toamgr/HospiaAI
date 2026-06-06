// CI MODULE ADDITION — Cocktail Intelligence API client
// All calls route to /api/ci/* on the Express backend.
// Uses the shared apiGet/apiPost/apiPatch/apiPut/apiDelete from client.js.

import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './client'
import { API_BASE } from '../../config/systemConfig'

// ── DNA ───────────────────────────────────────────────────────────────────────
export const fetchDna    = ()      => apiGet('/api/ci/dna')
export const saveDna     = (data)  => apiPost('/api/ci/dna', data)

// ── AI Generation ─────────────────────────────────────────────────────────────
// flow_type: 'full_menu' | 'menu_audit' | 'single_cocktail' |
//            'bottle_optimizer' | 'staff_briefing' | 'signature_drink' | 'beverage_director'
export const generateCocktails = (flowType, params) =>
  apiPost('/api/ci/generate', { flow_type: flowType, ...params })

// ── Rejections & Taste DNA ────────────────────────────────────────────────────
export const fetchRejections = ()     => apiGet('/api/ci/rejections')
export const saveRejection   = (data) => apiPost('/api/ci/rejections', data)
export const fetchTasteDna   = ()     => apiGet('/api/ci/taste-dna')

// ── CI Cocktails (saved library) ──────────────────────────────────────────────
export const fetchCICocktails  = ()     => apiGet('/api/ci/cocktails')
export const saveCICocktail    = (data) => apiPost('/api/ci/cocktails', data)
export const archiveCICocktail = (id)   => apiDelete(`/api/ci/cocktails/${id}`)

// ── CI Menus (named menu collections) ─────────────────────────────────────────
// CI MODULE ADDITION — menu grouping for approved cocktails
export const fetchMenus       = ()             => apiGet('/api/ci/menus')
export const fetchPublishedMenus = ()          => apiGet('/api/ci/menus/published')
export const createMenu       = (data)         => apiPost('/api/ci/menus', data)
export const fetchMenu        = (id)           => apiGet(`/api/ci/menus/${id}`)
export const updateMenu       = (id, data)     => apiPatch(`/api/ci/menus/${id}`, data)
export const patchMenuVisible = (id, visible)  => apiPatch(`/api/ci/menus/${id}/visible`, { visible_to_staff: visible ? 1 : 0 })
export const archiveMenu      = (id)           => apiDelete(`/api/ci/menus/${id}`)

// ── Sales Tracker ─────────────────────────────────────────────────────────────
export const fetchSales      = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return apiGet(`/api/ci/sales${qs ? '?' + qs : ''}`)
}
export const createSaleEntry = (data)        => apiPost('/api/ci/sales', data)
export const updateSaleEntry = (id, data)    => apiPatch(`/api/ci/sales/${id}`, data)
export const deleteSaleEntry = (id)          => apiDelete(`/api/ci/sales/${id}`)

// ── Narratives ────────────────────────────────────────────────────────────────
export const fetchNarrative     = (cocktailId) => apiGet(`/api/ci/narratives/${cocktailId}`)
export const generateNarrative  = (cocktailId) => apiPost(`/api/ci/narratives/${cocktailId}`, {})

// ── Scores ────────────────────────────────────────────────────────────────────
export const fetchScores  = (cocktailId) => apiGet(`/api/ci/scores/${cocktailId}`)
export const saveScores   = (cocktailId, data) => apiPost(`/api/ci/scores/${cocktailId}`, data)

// ── Lifecycle ─────────────────────────────────────────────────────────────────
export const fetchLifecycle      = ()          => apiGet('/api/ci/lifecycle')
export const createLifecycle     = (data)      => apiPost('/api/ci/lifecycle', data)
export const updateLifecycle     = (id, patch) => apiPatch(`/api/ci/lifecycle/${id}`, patch)

// ── Trends Engine ─────────────────────────────────────────────────────────────
export const fetchTrends  = ()        => apiGet('/api/ci/trends')
export const updateTrend  = (id, data) => apiPut(`/api/ci/trends/${id}`, data)

// ── Emergency Mode ────────────────────────────────────────────────────────────
export const fetchLastEmergencySession = ()     => apiGet('/api/ci/emergency/last')
export const analyzeEmergency          = (data) => apiPost('/api/ci/emergency', data)
export const saveEmergencySession      = (data) => apiPost('/api/ci/emergency', { ...data, confirmed_decisions: data.decisions })

// ── Beverage Director Chat ────────────────────────────────────────────────────
export const chatWithDirector = (message, history, menuCocktails = []) =>
  apiPost('/api/ci/director/chat', { message, history, menuCocktails })

// ── Visual Menu ───────────────────────────────────────────────────────────────
export const fetchVisualMenu  = (menuId)           => apiGet(`/api/ci/visual-menu/${menuId}`)
export const saveVisualDesign = (cocktailId, data) => apiPost(`/api/ci/visual-menu/${cocktailId}/save`, data)

// ── Final Menu Design (HESTIA Cocktail Menu Skill v5.2) ───────────────────────
export const generateMenuDesign = (data)   => apiPost('/api/ci/generate-menu-design', data)
export const fetchMenuDesign    = (menuId) => apiGet(`/api/ci/generate-menu-design/${menuId}`)

// Gemini image generation — sends full cocktail object; server builds the intelligent prompt.
// Returns { imageData: "data:image/png;base64,...", prompt: string }
export const generateCocktailImage = (cocktail) => apiPost('/api/ci/cocktail-image', cocktail)

// ── Daily Close ────────────────────────────────────────────────────────────────
export const fetchDailyCloseActiveMenu    = (venueId)  => apiGet(`/api/ci/daily-close/active-menu/${venueId}`)
export const fetchDailyCloseCocktails     = (menuId)   => apiGet(`/api/ci/daily-close/cocktails/${menuId}`)
export const submitDailyClose             = (data)     => apiPost('/api/ci/daily-close/submit', data)

// ── Exports ───────────────────────────────────────────────────────────────────
// Returns a URL to open in a new tab (printable HTML page).
// type: 'guest_menu' | 'spec_sheet' | 'staff_briefing' | 'costing_sheet' | 'sales_report'
export const getExportUrl = (type, cocktailIds = []) => {
  const qs = cocktailIds.length ? `?cocktail_ids=${cocktailIds.join(',')}` : ''
  return `${API_BASE}/api/ci/export/${type}${qs}`
}
