import seeded from "../data/live-deals.json";
import { deals as fallbackDeals, priceHistory as fallbackHistory, storeComparisons as fallbackComparisons } from "../data/deals.js";

export function getDashboardData() {
  const liveDeals = Array.isArray(seeded.deals) ? seeded.deals : [];
  const hasLiveRows = liveDeals.length > 0;

  return {
    generatedAt: seeded.generatedAt,
    mode: hasLiveRows ? seeded.mode : "seeded-demo",
    deals: hasLiveRows ? liveDeals : fallbackDeals,
    priceHistory: hasLiveRows ? seeded.history ?? {} : fallbackHistory,
    storeComparisons: hasLiveRows ? seeded.comparisons ?? {} : fallbackComparisons,
    sourceHealth: seeded.sourceHealth ?? [],
    alerts: seeded.alerts ?? [],
    isLive: hasLiveRows,
  };
}
