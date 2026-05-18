import { useState, useEffect, useCallback } from 'react'
import { STORAGE } from '../config/systemConfig'
import { PAGE_META } from '../config/navigationConfig'
import { allowedPagesForArea, firstAllowedArea, firstAllowedPage, isAllowed, isAllowedPage } from '../config/roleConfig'
export function useNavigationState({ currentUser }) {
  const [area, setAreaState] = useState(() => localStorage.getItem(STORAGE.area) || firstAllowedArea('employee'))
  const [page, setPageState] = useState(() => localStorage.getItem(STORAGE.page) || firstAllowedPage('employee'))
  const [pageContext, setPageContext] = useState(null)
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE.collapsed)
    if (saved !== null) return saved === 'true'
    return window.innerWidth < 1024
  })

  useEffect(() => {
    localStorage.setItem(STORAGE.collapsed, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    if (!currentUser) return
    if (!isAllowed(currentUser, area, page)) {
      const nextArea = firstAllowedArea(currentUser)
      const nextPage = firstAllowedPage(currentUser, nextArea)
      setAreaState(nextArea)
      setPageState(nextPage)
      localStorage.setItem(STORAGE.area, nextArea)
      localStorage.setItem(STORAGE.page, nextPage)
    }
  }, [currentUser, area, page])

  const navigate = useCallback((nextArea, nextPage) => {
    setAreaState(nextArea)
    setPageState(nextPage)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }, [])

  const goToArea = useCallback((nextArea) => {
    if (!currentUser || !allowedPagesForArea(currentUser, nextArea).length) return
    const nextPage = firstAllowedPage(currentUser, nextArea)
    setAreaState(nextArea)
    setPageState(nextPage)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }, [currentUser])

  const goToPage = useCallback((nextPage, context = null) => {
    if (!currentUser || !isAllowedPage(currentUser, nextPage)) return
    const nextArea = PAGE_META[nextPage].area
    setAreaState(nextArea)
    setPageState(nextPage)
    setPageContext(context)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }, [currentUser])

  return { area, page, collapsed, setCollapsed, navigate, goToArea, goToPage, pageContext }
}
