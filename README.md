# Kiwi Supplement Watch

MVP dashboard for monitoring New Zealand supplement discounts, comparing stores, keeping price history, and preparing alert rules.

## Links

- Live site: https://kiwi-supplement-watch.vercel.app
- GitHub repository: https://github.com/ZiruiJia11/kiwi-supplement-watch

## Complete local workflow

```powershell
npm.cmd run refresh
```

This runs the live collectors, writes `src/data/live-deals.json`, builds the static app, and renders `dist/alert-email-preview.html`.

Open:

- `dist/index.html` for the dashboard
- `dist/alert-email-preview.html` for the email alert preview

## Data loading

Live deal data is stored in `src/data/live-deals.json` as the committed source dataset. During `npm run build`, `scripts/copy-live-data.mjs` copies it to `public/data/live-deals.json`, and Vite publishes it as `dist/data/live-deals.json`.

The React app fetches `/data/live-deals.json` at runtime instead of importing the full live dataset into the JavaScript bundle. If that request fails, the app falls back to the small seeded dataset in `src/data/deals.js` so the dashboard still renders.

This keeps the production JavaScript bundle small while allowing daily data refreshes to publish a standalone JSON file.

## Manual refresh and stale fallback

The deployed app exposes `POST /api/refresh` on Vercel. The dashboard's manual refresh button calls this endpoint, runs the live collectors, and updates the current browser session with the fresh result.

Retailer endpoints can rate-limit or block server requests. Recent examples:

- `429` from Shopify search suggest endpoints when a retailer rate-limits requests.
- `403` from Chemist Warehouse when its storefront blocks the runtime.

When a source fails, the collector keeps rows from the previous successful dataset for that store and marks them with `sourceStatus: "stale"`. Stale rows are still real historical rows, but they are not presented as freshly verified prices. The Sources view shows whether each source is `OK`, `Stale`, or `Failed`.

The collector currently keeps up to 1,200 selected rows and reserves baseline coverage per store before filling the rest by priority and discount. This avoids one retailer disappearing just because higher-priority rows from other stores filled the dataset first.

## Daily automatic updates

The repository includes a GitHub Actions workflow at `.github/workflows/daily-refresh.yml`.

It runs every day at `20:00 UTC`, which is roughly `08:00` in New Zealand standard time and `09:00` during daylight saving time. It can also be started manually from the GitHub Actions tab with `workflow_dispatch`.

Each daily run:

- installs dependencies with `npm ci`
- collects live prices with `npm run collect:live`
- rebuilds the dashboard with `npm run build`
- runs the smoke test with `npm run smoke`
- commits the refreshed `src/data/live-deals.json` back to GitHub when data changes

The current production Vercel project is connected to this GitHub repository, so every data-refresh commit should trigger a production deployment to the public URL.

As a fallback, the workflow can also deploy directly to Vercel if these GitHub repository secrets are added:

   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

Without the Vercel Git connection or those secrets, GitHub data will still refresh daily, but the public website will only update after a manual Vercel deploy.

## What is real vs seeded

Before the first live refresh, the UI uses seeded rows so the product experience is usable immediately. Seeded rows are marked with `sourceStatus: "seeded"` and link to the retailer source. They are not presented as live prices.

The live-data boundary is in `scripts/collect-live-deals.mjs` and `scripts/lib/collectors.mjs`. The collector currently uses:

- HealthPost: Shopify search suggest JSON for real product/price records.
- Bargain Chemist: Shopify search suggest JSON for real product/price records.
- Chemist Warehouse NZ: public predictive search JSON and search API data used by its storefront.
- Life Pharmacy: Shopify search suggest JSON for real product/price records.

The product priority model currently favours fish oil, eye health, sunscreen, vitamins, probiotics, calcium/bone, sleep support, liver support, CoQ10/heart health, beauty collagen, and joint support.

Production use should add or harden one adapter per retailer using the most compliant available source:

1. Official API, product feed, sitemap, or affiliate feed.
2. Public structured product data such as JSON-LD on product pages.
3. Browser-based scraping only when permitted by the retailer's terms and robots policy.

Each extracted price record should store:

- `store`
- `sourceUrl`
- `checkedAt`
- `brand`
- `productName`
- `canonicalId`
- `currentPrice`
- `previousPrice`
- `size`
- `units`
- `stockStatus`
- `sourceStatus`
- raw evidence or parser version

## Run locally

```bash
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if script execution blocks `npm`.

```powershell
npm.cmd install
npm.cmd run dev
```

## Build

```powershell
npm.cmd run build
```

## Fetch source report

```powershell
npm.cmd run fetch:deals
```

## Collect live prices

```powershell
npm.cmd run collect:live
```

## Generate alert email preview

```powershell
npm.cmd run email:preview
```

## Production roadmap

- Add PostgreSQL tables for products, stores, price snapshots, alerts, users, and notifications.
- Add daily scheduled job with retry/backoff and parser error reporting.
- Add email via Resend or SendGrid.
- Add Telegram bot webhook for instant alerts.
- Add product matching rules based on brand, barcode, size, unit count, and normalized title.
- Show confidence score when comparing the same product across stores.
