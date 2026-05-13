import { apiDelete, apiGet, apiPost } from './client'

export async function fetchVerifiedPriceOverrides() {
  const data = await apiGet('/api/verified-price-overrides')
  return Array.isArray(data.overrides) ? data.overrides : []
}

export async function saveVerifiedPriceOverrideToServer(productId, normalizedUpdate, savedBy) {
  return apiPost(`/api/verified-price-overrides/${productId}`, { normalizedUpdate, savedBy })
}

export async function deleteVerifiedPriceOverrideFromServer(productId) {
  return apiDelete(`/api/verified-price-overrides/${productId}`)
}

export async function fetchVerifiedPriceAuditLog(productId, limit = 20) {
  const data = await apiGet(`/api/verified-price-audit-log?product_id=${encodeURIComponent(productId)}&limit=${limit}`)
  return Array.isArray(data.log) ? data.log : []
}
