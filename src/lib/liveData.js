import { deals as fallbackDeals, priceHistory as fallbackHistory, storeComparisons as fallbackComparisons } from "../data/deals.js";

const liveDataUrl = `${import.meta.env.BASE_URL}data/live-deals.json`;

export function getFallbackDashboardData() {
  return {
    generatedAt: null,
    mode: "seeded-demo",
    deals: fallbackDeals,
    priceHistory: fallbackHistory,
    storeComparisons: fallbackComparisons,
    sourceHealth: [],
    alerts: [],
    isLive: false,
  };
}

export async function loadDashboardData() {
  try {
    const response = await fetch(liveDataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Live data request failed: ${response.status}`);
    return toDashboardData(await response.json());
  } catch {
    return getFallbackDashboardData();
  }
}

function toDashboardData(payload) {
  const liveDeals = Array.isArray(payload?.deals) ? payload.deals : [];
  const hasLiveRows = liveDeals.length > 0;
  if (!hasLiveRows) return getFallbackDashboardData();

  return {
    generatedAt: payload.generatedAt,
    mode: payload.mode,
    deals: liveDeals,
    priceHistory: payload.history ?? {},
    storeComparisons: payload.comparisons ?? {},
    sourceHealth: payload.sourceHealth ?? [],
    alerts: payload.alerts ?? [],
    isLive: true,
  };
}
