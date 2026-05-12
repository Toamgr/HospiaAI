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
