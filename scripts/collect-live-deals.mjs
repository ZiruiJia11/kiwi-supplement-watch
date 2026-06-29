import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildDerivedData, collectAllSources } from "./lib/collectors.mjs";

const outPath = resolve("src/data/live-deals.json");
const previous = await readPrevious(outPath);
const { checkedAt, rows, sourceHealth } = await collectAllSources();
const derived = buildDerivedData(rows, previous.history ?? {});

const payload = {
  generatedAt: checkedAt,
  mode: "live-fetch",
  deals: rows,
  comparisons: derived.comparisons,
  history: derived.history,
  sourceHealth,
  alerts: derived.alerts,
};

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
console.log(`Live rows: ${rows.length}`);
console.log(`Alerts ready: ${derived.alerts.length}`);
for (const source of sourceHealth) {
  console.log(`${source.ok ? "OK" : "FAIL"} ${source.store}: ${source.extracted} rows (${source.note})`);
}

async function readPrevious(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return {};
  }
}
