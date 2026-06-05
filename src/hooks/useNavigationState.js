import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate as useRouterNavigate, useLocation } from 'react-router-dom'
import { STORAGE } from '../config/systemConfig'
import { PAGE_META } from '../config/navigationConfig'
import { PAGE_ROUTES, ROUTE_PAGES } from '../config/routes'
import { allowedPagesForArea, firstAllowedArea, firstAllowedPage, isAllowed, isAllowedPage } from '../config/roleConfig'

export function useNavigationState({ currentUser }) {
  const routerNavigate = useRouterNavigate()
  const location = useLocation()

  // Capture the URL the user first arrived on — used after login to redirect to
  // the intended destination (if authorized), rather than always going to the default.
  const intendedPathRef = useRef(location.pathname)

  // URL is now the primary navigation source.
  // Falls back to localStorage, then role default for unknown or root paths.
  const [area, setAreaState] = useState(() => {
    const pageFromUrl = ROUTE_PAGES[location.pathname]
    return (pageFromUrl && PAGE_META[pageFromUrl]?.area)
      || localStorage.getItem(STORAGE.area)
      || firstAllowedArea('employee')
  })
  const [page, setPageState] = useState(() => {
    return ROUTE_PAGES[location.pathname]
      || localStorage.getItem(STORAGE.page)
      || firstAllowedPage('employee')
  })
  const [pageContext, setPageContext] = useState(null)
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE.collapsed)
    if (saved !== null) return saved === 'true'
    return window.innerWidth < 1024
  })

  useEffect(() => {
    localStorage.setItem(STORAGE.collapsed, String(collapsed))
  }, [collapsed])

  // Sync page/area state when the browser URL changes (back/forward navigation).
  // Programmatic navigation (goToPage, goToArea) sets state directly before pushing
  // the URL, so this effect is mainly exercised by browser history buttons.
  useEffect(() => {
    const pageFromUrl = ROUTE_PAGES[location.pathname]
    if (!pageFromUrl) return
    const areaFromMeta = PAGE_META[pageFromUrl]?.area
    if (!areaFromMeta) return
    setAreaState(areaFromMeta)
    setPageState(pageFromUrl)
    localStorage.setItem(STORAGE.area, areaFromMeta)
    localStorage.setItem(STORAGE.page, pageFromUrl)
  }, [location.pathname])

  // Enforce role-based access after session restore or currentUser change.
  // Redirects unauthorized users to their allowed default page.
  useEffect(() => {
    if (!currentUser) return
    if (!isAllowed(currentUser, area, page)) {
      const nextArea = firstAllowedArea(currentUser)
      const nextPage = firstAllowedPage(currentUser, nextArea)
      const nextUrl = PAGE_ROUTES[nextPage] || '/'
      setAreaState(nextArea)
      setPageState(nextPage)
      localStorage.setItem(STORAGE.area, nextArea)
      localStorage.setItem(STORAGE.page, nextPage)
      routerNavigate(nextUrl, { replace: true })
    }
  }, [currentUser, area, page, routerNavigate])

  // After login: navigate to the originally intended URL if the user is authorized,
  // otherwise navigate to their role default.
  const navigateAfterLogin = useCallback((sessionUser) => {
    const intended = intendedPathRef.current
    const intendedPage = intended && ROUTE_PAGES[intended]
    if (intendedPage && isAllowedPage(sessionUser, intendedPage)) {
      const nextArea = PAGE_META[intendedPage].area
      setAreaState(nextArea)
      setPageState(intendedPage)
      localStorage.setItem(STORAGE.area, nextArea)
      localStorage.setItem(STORAGE.page, intendedPage)
      routerNavigate(intended)
    } else {
      const nextArea = firstAllowedArea(sessionUser)
      const nextPage = firstAllowedPage(sessionUser, nextArea)
      const nextUrl = PAGE_ROUTES[nextPage] || '/'
      setAreaState(nextArea)
      setPageState(nextPage)
      localStorage.setItem(STORAGE.area, nextArea)
      localStorage.setItem(STORAGE.page, nextPage)
      routerNavigate(nextUrl)
    }
    intendedPathRef.current = null
  }, [routerNavigate])

  const navigate = useCallback((nextArea, nextPage) => {
    setAreaState(nextArea)
    setPageState(nextPage)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
    routerNavigate(PAGE_ROUTES[nextPage] || '/')
  }, [routerNavigate])

  const goToArea = useCallback((nextArea) => {
    if (!currentUser || !allowedPagesForArea(currentUser, nextArea).length) return
    const nextPage = firstAllowedPage(currentUser, nextArea)
    setAreaState(nextArea)
    setPageState(nextPage)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
    routerNavigate(PAGE_ROUTES[nextPage] || '/')
  }, [currentUser, routerNavigate])

  const goToPage = useCallback((nextPage, context = null) => {
    if (!currentUser || !isAllowedPage(currentUser, nextPage)) return
    const nextArea = PAGE_META[nextPage].area
    setAreaState(nextArea)
    setPageState(nextPage)
    setPageContext(context)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
    routerNavigate(PAGE_ROUTES[nextPage] || '/')
  }, [currentUser, routerNavigate])

  return { area, page, collapsed, setCollapsed, navigate, goToArea, goToPage, pageContext, navigateAfterLogin }
}
