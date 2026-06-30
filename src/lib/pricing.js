export function formatCurrency(value) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function getDiscount(deal) {
  if (!deal.previousPrice || deal.previousPrice <= deal.currentPrice) return 0;
  return Math.round(((deal.previousPrice - deal.currentPrice) / deal.previousPrice) * 100);
}

export function getPriceDrop(deal) {
  return Math.max(0, Number((deal.previousPrice - deal.currentPrice).toFixed(2)));
}

export function getUnitPrice(deal) {
  if (!deal.units) return "N/A";
  return `${formatCurrency(deal.currentPrice / deal.units.count)} / ${deal.units.label}`;
}

export function freshnessLabel(deal) {
  if (deal.sourceStatus === "seeded") return "seeded";
  if (deal.sourceStatus === "verified") return "verified";
  if (deal.sourceStatus === "stale") return "stale";
  return "pending";
}

export function isTrustedSourceStatus(status) {
  return status === "verified" || status === "stale";
}

export function getBestComparison(rows) {
  return rows.filter((row) => row.status !== "out of stock").sort((a, b) => a.currentPrice - b.currentPrice)[0];
}
