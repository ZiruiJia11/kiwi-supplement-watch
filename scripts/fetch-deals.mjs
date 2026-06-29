import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const stores = [
  {
    name: "Chemist Warehouse NZ",
    categoryUrl: "https://www.chemistwarehouse.co.nz/shop-online/81/vitamins",
    mode: "browser-or-feed",
  },
  {
    name: "HealthPost",
    categoryUrl: "https://www.healthpost.co.nz/",
    mode: "browser-or-feed",
  },
  {
    name: "Bargain Chemist",
    categoryUrl: "https://www.bargainchemist.co.nz/",
    mode: "browser-or-feed",
  },
  {
    name: "Life Pharmacy",
    categoryUrl: "https://www.lifepharmacy.co.nz/",
    mode: "browser-or-feed",
  },
];

async function fetchHead(url) {
  const startedAt = new Date().toISOString();
  try {
    const response = await fetch(url, {
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent": "KiwiSupplementWatch/0.1 (+price monitoring; contact owner before production use)",
      },
    });
    return {
      ok: response.ok,
      status: response.status,
      checkedAt: startedAt,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      note: response.ok
        ? "Reachable with standard fetch. Add parser for product JSON-LD or category API."
        : "Reachability failed. Use official feed/API or Playwright adapter if permitted.",
    };
  } catch (error) {
    return {
      ok: false,
      status: "network-error",
      checkedAt: startedAt,
      finalUrl: url,
      contentType: null,
      note: error.message,
    };
  }
}

const results = [];
for (const store of stores) {
  results.push({
    store: store.name,
    sourceUrl: store.categoryUrl,
    mode: store.mode,
    reachability: await fetchHead(store.categoryUrl),
    extractedProducts: [],
  });
}

const outPath = resolve("src/data/live-fetch-report.json");
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
console.log("Next step: implement a store adapter per retailer once the allowed data source is confirmed.");
