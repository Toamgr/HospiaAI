import { useState, useEffect, useCallback } from 'react'
import { STORAGE } from '../config/systemConfig'
import { apiPost } from '../services/api/client'

export function useCocktailPipeline({ currentUser, pushNotification, addBusinessMemoryEvent }) {
  const [cocktailDrafts, setCocktailDrafts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.cocktailDrafts) || 'null')
      return Array.isArray(saved) ? saved : []
    } catch { return [] }
  })
  const [approvedCocktails, setApprovedCocktails] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.approvedCocktails) || 'null')
      return Array.isArray(saved) ? saved : []
    } catch { return [] }
  })
  const [archivedCocktails, setArchivedCocktails] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.archivedCocktails) || 'null')
      return Array.isArray(saved) ? saved : []
    } catch { return [] }
  })
  const [cocktailPractice, setCocktailPractice] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.cocktailPractice) || 'null')
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
    } catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE.cocktailDrafts, JSON.stringify(cocktailDrafts))
  }, [cocktailDrafts])

  useEffect(() => {
    localStorage.setItem(STORAGE.approvedCocktails, JSON.stringify(approvedCocktails))
  }, [approvedCocktails])

  useEffect(() => {
    localStorage.setItem(STORAGE.archivedCocktails, JSON.stringify(archivedCocktails))
  }, [archivedCocktails])

  useEffect(() => {
    localStorage.setItem(STORAGE.cocktailPractice, JSON.stringify(cocktailPractice))
  }, [cocktailPractice])

  const saveCocktailDraft = useCallback(cocktail => {
    if (!cocktail || typeof cocktail !== 'object') {
      throw new Error('No complete cocktail proposal was generated to save.')
    }
    const draft = {
      ...cocktail,
      id: cocktail.id || `cocktail-draft-${Date.now()}`,
      status: 'draft',
      createdBy: currentUser?.username || 'Bar Manager',
      created_at: cocktail.created_at || new Date().toISOString()
    }
    setCocktailDrafts(prev => [draft, ...prev.filter(item => item.id !== draft.id)].slice(0, 50))
    return draft
  }, [currentUser?.username])

  const submitCocktailForApproval = useCallback(cocktail => {
    const awaiting = {
      ...cocktail,
      id: cocktail.id || `cocktail-awaiting-${Date.now()}`,
      status: 'awaitingApproval',
      createdBy: cocktail.createdBy || currentUser?.username || 'Bar Manager',
      submitted_at: new Date().toISOString()
    }
    setCocktailDrafts(prev => [awaiting, ...prev.filter(item => item.id !== awaiting.id)].slice(0, 50))
    pushNotification({ roles: ['admin'], title: 'Cocktail awaiting approval', body: `${awaiting.name} is ready for approval review.`, type: 'cocktail', page: 'cocktailLab' })
    return awaiting
  }, [currentUser?.username, pushNotification])

  const approveCocktail = useCallback(cocktail => {
    const approved = {
      ...cocktail,
      id: cocktail.id || `cocktail-approved-${Date.now()}`,
      status: 'approved',
      approved_at: new Date().toISOString()
    }
    setApprovedCocktails(prev => [approved, ...prev.filter(item => item.id !== approved.id)].slice(0, 80))
    setCocktailDrafts(prev => prev.filter(item => item.id !== approved.id))
    apiPost('/api/cocktails', {
      name: approved.name,
      category: approved.style || approved.category || null,
      description: approved.description || approved.story || null,
      base_spirit: approved.baseSpirit || null,
      glass_type: approved.glassware || null,
      garnish: approved.garnish || null,
      method: approved.method || null,
      tags: approved.tags || [],
      ingredients: Array.isArray(approved.ingredients) ? approved.ingredients.map(i => typeof i === 'string' ? i : `${i.quantity || ''} ${i.name || ''}`.trim()) : []
    }).catch(() => {})
    addBusinessMemoryEvent({
      type: 'note',
      title: `Cocktail approved: ${approved.name}`,
      detail: `${approved.name} is now visible inside employee Approved Cocktails Library.`
    })
    pushNotification({ roles: ['employee', 'manager', 'admin'], title: 'New approved cocktail', body: `${approved.name} is now available for bar menu training.`, type: 'cocktail', page: 'approvedCocktails' })
    return approved
  }, [addBusinessMemoryEvent, pushNotification])

  const archiveCocktail = useCallback(cocktailInput => {
    if (cocktailInput && typeof cocktailInput === 'object') {
      setCocktailDrafts(prev => prev.filter(item => item.id !== cocktailInput.id))
      setApprovedCocktails(prev => prev.filter(item => item.id !== cocktailInput.id))
      setArchivedCocktails(prev => [{
        ...cocktailInput,
        id: cocktailInput.id || `cocktail-archived-${Date.now()}`,
        status: 'archived',
        archived_at: new Date().toISOString()
      }, ...prev].slice(0, 80))
      return
    }

    const cocktailId = cocktailInput
    setApprovedCocktails(prev => prev.filter(item => item.id !== cocktailId))
    setCocktailDrafts(prev => {
      const target = prev.find(item => item.id === cocktailId)
      if (target) setArchivedCocktails(old => [{ ...target, status: 'archived', archived_at: new Date().toISOString() }, ...old].slice(0, 80))
      return prev.filter(item => item.id !== cocktailId)
    })
  }, [])

  const markCocktailPracticed = useCallback((cocktailId, employeeName = currentUser?.username) => {
    if (!cocktailId || !employeeName) return
    setCocktailPractice(prev => ({
      ...prev,
      [employeeName]: {
        ...(prev[employeeName] || {}),
        [cocktailId]: {
          practiced: true,
          practiced_at: new Date().toISOString()
        }
      }
    }))
  }, [currentUser?.username])

  return {
    cocktailDrafts,
    approvedCocktails,
    archivedCocktails,
    cocktailPractice,
    saveCocktailDraft,
    submitCocktailForApproval,
    approveCocktail,
    archiveCocktail,
    markCocktailPracticed
  }
}
