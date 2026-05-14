import { TEXT } from '../../config/textConfig'
import { PAGE_META } from '../../config/navigationConfig'

export function getAreaLabel(t, area) {
  return t.areas?.[area] || TEXT.en.areas[area] || area
}

export function getAreaDescription(t, area) {
  return t.areaDescriptions?.[area] || TEXT.en.areaDescriptions[area] || ''
}

export function getPageLabel(t, page) {
  return t.pages?.[page] || TEXT.en.pages[page] || page
}

export function groupPagesBySection(pages) {
  return pages.reduce((groups, pageKey) => {
    const section = PAGE_META[pageKey]?.section || 'Core'
    const existing = groups.find(group => group.section === section)
    if (existing) {
      existing.pages.push(pageKey)
      return groups
    }
    return [...groups, { section, pages: [pageKey] }]
  }, [])
}
