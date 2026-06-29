# Kiwi Supplement Watch

MVP dashboard for monitoring New Zealand supplement discounts, comparing stores, keeping price history, and preparing alert rules.

## Complete local workflow

```powershell
npm.cmd run refresh
```

This runs the live collectors, writes `src/data/live-deals.json`, builds the static app, and renders `dist/alert-email-preview.html`.

Open:

- `dist/index.html` for the dashboard
- `dist/alert-email-preview.html` for the email alert preview

## What is real vs seeded

Before the first live refresh, the UI uses seeded rows so the product experience is usable immediately. Seeded rows are marked with `sourceStatus: "seeded"` and link to the retailer source. They are not presented as live prices.

The live-data boundary is in `scripts/collect-live-deals.mjs` and `scripts/lib/collectors.mjs`. The collector currently uses:

- HealthPost: Shopify search suggest JSON for real product/price records.
- Bargain Chemist: Shopify collection JSON for real product/price records.
- Chemist Warehouse NZ: HTML category reachability plus an experimental parser.
- Life Pharmacy: reachability status until a permitted feed/parser is confirmed.

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
