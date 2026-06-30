import { buildDerivedData, collectAllSources, mergeWithStaleFallback } from "../scripts/lib/collectors.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const previous = await readPreviousDataset(request);
    const collected = await collectAllSources();
    const { rows, sourceHealth } = mergeWithStaleFallback(collected.rows, collected.sourceHealth, previous.deals ?? []);
    const derived = buildDerivedData(rows, previous.history ?? {});

    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({
      generatedAt: collected.checkedAt,
      mode: "manual-live-fetch",
      deals: rows,
      comparisons: derived.comparisons,
      history: derived.history,
      sourceHealth,
      alerts: derived.alerts,
    });
  } catch (error) {
    response.status(500).json({
      error: "Manual refresh failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function readPreviousDataset(request) {
  try {
    const protocol = request.headers["x-forwarded-proto"] ?? "https";
    const host = request.headers.host;
    if (!host) return {};
    const url = `${protocol}://${host}/data/live-deals.json`;
    const previous = await fetch(url, { cache: "no-store" });
    if (!previous.ok) return {};
    return await previous.json();
  } catch {
    return {};
  }
}
