export const FEATURE_FLAGS = {
  ownerCommandCenter: false,
  ownerBudgetApprovals: false,
  ownerOperationalRequests: false,
  ownerBusinessMRI: false,
  ownerExecutiveOverview: false,
  ownerStrategicRecommendations: false,
  ownerProfitLeaks: false,
  ownerWeeklySummary: false,
  ownerReport: false,
  ownerBusinessMemory: false,
}

export function isEnabled(flagName) {
  return FEATURE_FLAGS[flagName] === true
}
