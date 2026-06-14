// CI MODULE ADDITION — hook that owns all Cocktail Intelligence state
import { useState, useEffect, useCallback } from 'react'
import {
  fetchDna, saveDna, fetchCICocktails, fetchTasteDna,
  generateCocktails, saveCICocktail, saveRejection,
  fetchMenus, createMenu as apiCreateMenu, fetchMenu, // CI MODULE ADDITION — menus
  chatWithDirector
} from '../services/api/cocktailIntelligenceApi'

export function useCocktailIntelligenceState({ currentUser } = {}) {
  const [dna, setDna]               = useState(null)
  const [dnaLoading, setDnaLoading] = useState(true)
  const [dnaError, setDnaError]     = useState(null)
  const [tasteDna, setTasteDna]     = useState(null)
  const [ciCocktails, setCiCocktails] = useState([])
  const [ciMenus, setCiMenus]       = useState([]) // CI MODULE ADDITION — named menus
  const [savingDna, setSavingDna]   = useState(false)

  useEffect(() => {
    // Guard: wait for a logged-in user before fetching (token is set during login)
    if (!currentUser?.id) {
      setDnaLoading(false)
      return
    }
    // Guard: CI data is only relevant to bar/operations roles.
    // events_manager and other non-CI roles do not need bar DNA, CI cocktails, or CI menus.
    // Skipping the fetch prevents 403 console errors for those users.
    const CI_ROLES = ['owner', 'manager', 'bar_manager', 'admin', 'fb_director']
    if (!CI_ROLES.includes(currentUser.role)) {
      setDnaLoading(false)
      return
    }
    let cancelled = false
    setDnaLoading(true)
    setDnaError(null)
    // allSettled so a failure in one secondary fetch (menus, taste DNA) doesn't block DNA loading
    Promise.allSettled([fetchDna(), fetchCICocktails(), fetchTasteDna(), fetchMenus()])
      .then(([dnaRes, cocktailsRes, tasteDnaRes, menusRes]) => {
        if (cancelled) return
        const dna = dnaRes.status === 'fulfilled' ? dnaRes.value?.dna || null : null
        setDna(dna)
        if (!dna && dnaRes.status === 'rejected') setDnaError('Could not load Bar DNA.')
        const cocktails = cocktailsRes.status === 'fulfilled' ? cocktailsRes.value?.cocktails : null
        setCiCocktails(Array.isArray(cocktails) ? cocktails : [])
        const taste = tasteDnaRes.status === 'fulfilled' ? tasteDnaRes.value?.taste_dna : null
        setTasteDna(taste || null)
        const menus = menusRes.status === 'fulfilled' ? menusRes.value?.menus : null
        setCiMenus(Array.isArray(menus) ? menus : []) // CI MODULE ADDITION
      })
      .finally(() => { if (!cancelled) setDnaLoading(false) })
    return () => { cancelled = true }
  }, [currentUser?.id])

  const updateDna = useCallback(async (formData) => {
    setSavingDna(true)
    setDnaError(null)
    try {
      const res = await saveDna(formData)
      setDna(res?.dna || formData)
      return { ok: true }
    } catch {
      setDnaError('Failed to save Bar DNA. Please try again.')
      return { ok: false }
    } finally {
      setSavingDna(false)
    }
  }, [])

  const generateMenu = useCallback(async (params) => {
    const res = await generateCocktails('full_menu', params)
    // Server wraps AI output in { ok, flow_type, result }
    return res?.result || res
  }, [])

  const regenerateSingle = useCallback(async (params) => {
    const res = await generateCocktails('single_cocktail', params)
    const raw = res?.result || res
    // single_cocktail returns { cocktail: {...} } — normalize to menu-card format
    const c = raw?.cocktail
    if (!c) return null
    return {
      name:                 c.name,
      tagline:              c.description || c.tagline || '',
      base_spirit:          c.base_spirit,
      ingredients:          c.ingredients || [],
      method:               c.method,
      glass:                c.glass,
      garnish:              c.garnish,
      flavor_profile:       c.flavor_profile || [],
      prep_complexity:      c.prep_complexity,
      speed_of_service:     c.speed_of_service,
      estimated_cost_ils:   c.estimated_cost_ils,
      suggested_price_ils:  c.estimated_sell_price_ils || c.suggested_price_ils,
      estimated_gp_percent: c.estimated_gp_percent || null,
      why_this_venue:       c.business_rationale || c.why_this_venue || '',
      kosher_flags:         c.kosher_ready === false ? ['Verify kosher status with supplier'] : (c.kosher_flags || []),
      warnings:             c.warnings || []
    }
  }, [])

  const approveMenuCocktail = useCallback(async (cocktailData) => {
    try {
      const res = await saveCICocktail(cocktailData)
      const saved = res?.cocktail || cocktailData
      setCiCocktails(prev => [saved, ...prev])
      return { ok: true, cocktailId: saved?.id || null }
    } catch {
      return { ok: false, cocktailId: null, error: 'Failed to save cocktail.' }
    }
  }, [])

  const saveMenuRejection = useCallback(async (data) => {
    try {
      await saveRejection(data)
    } catch {
      // rejection save failure is non-critical
    }
  }, [])

  // CI MODULE ADDITION — Flow 2: Menu Audit
  const auditMenu = useCallback(async (params) => {
    const res = await generateCocktails('menu_audit', params)
    return res?.result || res
  }, [])

  // CI MODULE ADDITION — create a named menu record before saving cocktails
  const createMenuRecord = useCallback(async (menuData) => {
    try {
      const res = await apiCreateMenu(menuData)
      if (res?.menu) {
        // Prepend the new menu (no cocktails yet, count=0)
        setCiMenus(prev => [{ ...res.menu, cocktail_count: 0, preview_names: [] }, ...prev])
      }
      return { ok: true, menuId: res?.menu?.id || null }
    } catch (err) {
      return { ok: false, menuId: null, error: err?.message || 'Server error' }
    }
  }, [])

  // CI MODULE ADDITION — refresh menus list (called after cocktails are saved to a menu)
  const refreshMenus = useCallback(async () => {
    try {
      const res = await fetchMenus()
      setCiMenus(Array.isArray(res?.menus) ? res.menus : [])
    } catch { /* non-critical */ }
  }, [])

  const sendDirectorMessage = useCallback(async (message, history, menuCocktails = []) => {
    const res = await chatWithDirector(message, history, menuCocktails)
    // Returns the reply plus whether Venue Intelligence context was injected
    // (Phase 3 — Omer reads the Venue Bridge F&B brief). Back-compatible: callers
    // that only read `.reply` are unaffected.
    return { reply: res?.reply || '', venueContextActive: Boolean(res?.venueContextActive) }
  }, [])

  const loadMenuDetail = useCallback(async (id) => {
    const res = await fetchMenu(id)
    return res?.menu || null
  }, [])

  return {
    dna,
    dnaLoading,
    dnaError,
    savingDna,
    tasteDna,
    ciCocktails,
    ciMenus,        // CI MODULE ADDITION
    updateDna,
    generateMenu,
    regenerateSingle,
    approveMenuCocktail,
    saveMenuRejection,
    auditMenu,          // CI MODULE ADDITION
    createMenuRecord,   // CI MODULE ADDITION
    refreshMenus,       // CI MODULE ADDITION
    sendDirectorMessage,
    loadMenuDetail
  }
}
