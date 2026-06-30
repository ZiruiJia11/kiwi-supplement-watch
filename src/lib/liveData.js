import { deals as fallbackDeals, priceHistory as fallbackHistory, storeComparisons as fallbackComparisons } from "../data/deals.js";

const liveDataUrl = `${import.meta.env.BASE_URL}data/live-deals.json`;
const manualCacheKey = "ksw-manual-live-data";

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
  const cached = readManualCache();
  try {
    const response = await fetch(liveDataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Live data request failed: ${response.status}`);
    const fetched = await response.json();
    return toDashboardData(getNewerPayload(fetched, cached));
  } catch {
    return cached ? toDashboardData(cached) : getFallbackDashboardData();
  }
}

export function cacheManualDashboardData(payload) {
  try {
    localStorage.setItem(manualCacheKey, JSON.stringify(payload));
  } catch {
    // Manual refresh still works for the current session if storage is blocked.
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

function readManualCache() {
  try {
    const raw = localStorage.getItem(manualCacheKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getNewerPayload(fetched, cached) {
  if (!cached?.generatedAt) return fetched;
  if (!fetched?.generatedAt) return cached;
  return new Date(cached.generatedAt) > new Date(fetched.generatedAt) ? cached : fetched;
}
