export const FEATURE_FLAGS = {
  ownerBusinessMRI: false,
  ownerExecutiveOverview: false,
  ownerStrategicRecommendations: false,
  ownerProfitLeaks: false,
  ownerWeeklySummary: false,
}

export function isEnabled(flagName) {
  return FEATURE_FLAGS[flagName] === true
}
