import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const data = JSON.parse(await readFile(resolve("src/data/live-deals.json"), "utf8"));
const alerts = data.alerts ?? [];
const generatedAt = data.generatedAt ? new Date(data.generatedAt).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" }) : "not fetched";

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Kiwi Supplement Watch Alert Preview</title>
  </head>
  <body style="font-family:Arial,sans-serif;color:#17211d;margin:0;background:#f6f8f7;padding:24px;">
    <main style="max-width:720px;margin:auto;background:#fff;border:1px solid #e2e8e4;border-radius:8px;padding:24px;">
      <h1 style="margin:0 0 6px;font-size:22px;">Kiwi Supplement Watch</h1>
      <p style="margin:0 0 20px;color:#66736d;">Deal alert preview generated ${generatedAt}</p>
      ${alerts.length ? alerts.slice(0, 12).map((alert) => `
        <section style="border-top:1px solid #e2e8e4;padding:14px 0;">
          <strong>${escapeHtml(alert.title)}</strong>
          <p style="margin:6px 0;color:#66736d;">${escapeHtml(alert.store)} · ${alert.discount}% off · NZ$${alert.currentPrice.toFixed(2)}</p>
          <a href="${alert.sourceUrl}" style="color:#2c6fb5;">View source</a>
        </section>`).join("") : `<p>No alert rows yet. Run live collection first.</p>`}
    </main>
  </body>
</html>`;

const outPath = resolve("dist/alert-email-preview.html");
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, html);
console.log(`Wrote ${outPath}`);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}
