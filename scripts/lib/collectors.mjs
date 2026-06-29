const PRIORITY_CATEGORIES = [
  { category: "Fish oil", priority: 100, terms: ["fish oil", "omega 3", "dha", "epa"] },
  { category: "Eye health", priority: 98, terms: ["lutein", "eye health", "vision supplement", "bilberry"] },
  { category: "Sunscreen", priority: 96, terms: ["sunscreen", "spf50", "sunblock", "anthelios"] },
  { category: "Vitamins", priority: 94, terms: ["vitamin c", "multivitamin", "vitamin d", "vitamin b"] },
  { category: "Probiotics", priority: 88, terms: ["probiotic", "inner health", "gut health", "acidophilus"] },
  { category: "Calcium & bone", priority: 84, terms: ["calcium", "bone health", "vitamin d calcium"] },
  { category: "Sleep support", priority: 80, terms: ["sleep", "melatonin", "magnesium sleep"] },
  { category: "Liver support", priority: 76, terms: ["milk thistle", "liver support", "turmeric"] },
  { category: "Heart & CoQ10", priority: 72, terms: ["coq10", "coenzyme q10", "heart health"] },
  { category: "Beauty collagen", priority: 68, terms: ["collagen", "hair skin nails", "beauty supplement"] },
  { category: "Joint support", priority: 64, terms: ["glucosamine", "chondroitin", "joint support"] },
];

export const SOURCES = [
  {
    id: "healthpost",
    store: "HealthPost",
    type: "shopify-search",
    baseUrl: "https://www.healthpost.co.nz",
    terms: flattenPrioritySearches(),
  },
  {
    id: "bargainchemist",
    store: "Bargain Chemist",
    type: "shopify-search",
    baseUrl: "https://www.bargainchemist.co.nz",
    terms: flattenPrioritySearches(),
  },
  {
    id: "chemistwarehouse",
    store: "Chemist Warehouse NZ",
    type: "chemistwarehouse-predictive",
    baseUrl: "https://www.chemistwarehouse.co.nz",
    url: "https://www.chemistwarehouse.co.nz/cmsglobalfiles/handlers/predictive_search.ashx",
    terms: flattenPrioritySearches(),
  },
  {
    id: "lifepharmacy",
    store: "Life Pharmacy",
    type: "shopify-search",
    baseUrl: "https://www.lifepharmacy.co.nz",
    terms: flattenPrioritySearches(),
  },
];

const CATEGORY_PATTERNS = [
  ["Fish oil", /fish oil|omega|dha|epa/i],
  ["Eye health", /lutein|vision|eye health|bilberry|macula|retina|zeaxanthin/i],
  ["Sunscreen", /sunscreen|spf ?\d+|sunblock|anthelios|zinc sunscreen|sun gel|sungel/i],
  ["Vitamins", /vitamin|multi[- ]?vitamin|multivitamin|ascorb|effervescent/i],
  ["Probiotics", /probiotic|inner health|gut health|acidophilus|lactobacillus|digestive/i],
  ["Calcium & bone", /calcium|bone health|osteo|vitamin d calcium/i],
  ["Sleep support", /sleep|melatonin|rest|relax|magnesium sleep/i],
  ["Liver support", /milk thistle|liver|turmeric|curcumin/i],
  ["Heart & CoQ10", /coq10|coenzyme q10|heart health|cardio/i],
  ["Beauty collagen", /collagen|hair skin nails|beauty supplement|skin hair nails/i],
  ["Joint support", /glucosamine|chondroitin|joint support|arthritis/i],
];

const PRIORITY_BY_CATEGORY = Object.fromEntries(PRIORITY_CATEGORIES.map((item) => [item.category, item.priority]));

export async function collectAllSources() {
  const checkedAt = new Date().toISOString();
  const sourceHealth = [];
  const rows = [];

  for (const source of SOURCES) {
    const startedAt = Date.now();
    try {
      const products = await collectSource(source, checkedAt);
      rows.push(...products);
      sourceHealth.push({
        id: source.id,
        store: source.store,
        ok: true,
        status: 200,
        checkedAt,
        durationMs: Date.now() - startedAt,
        extracted: products.length,
        sourceUrl: source.url ?? source.baseUrl,
        note: products.length ? "Extracted real product records." : "Reachable, but no product parser produced rows.",
      });
    } catch (error) {
      sourceHealth.push({
        id: source.id,
        store: source.store,
        ok: false,
        status: error.status ?? "error",
        checkedAt,
        durationMs: Date.now() - startedAt,
        extracted: 0,
        sourceUrl: source.url ?? source.baseUrl,
        note: error.message,
      });
    }
  }

  return { checkedAt, rows: dedupeRows(rows), sourceHealth };
}

async function collectSource(source, checkedAt) {
  if (source.type === "shopify-search") return collectShopifySearch(source, checkedAt);
  if (source.type === "shopify-collection") return collectShopifyCollection(source, checkedAt);
  if (source.type === "chemistwarehouse-api") return collectChemistWarehouseApi(source, checkedAt);
  if (source.type === "chemistwarehouse-predictive") return collectChemistWarehousePredictive(source, checkedAt);
  if (source.type === "html-category") return collectChemistWarehouse(source, checkedAt);
  await fetchText(source.url, { expected: "text" });
  return [];
}

async function collectShopifySearch(source, checkedAt) {
  const rows = [];
  for (const search of source.terms) {
    const term = typeof search === "string" ? search : search.term;
    const category = typeof search === "string" ? null : search.category;
    const url = `${source.baseUrl}/search/suggest.json?q=${encodeURIComponent(term)}&resources[type]=product&resources[limit]=10`;
    const json = await fetchJson(url);
    const products = json?.resources?.results?.products ?? [];
    rows.push(...products.map((product) => fromSearchProduct(source, product, checkedAt, term, category)));
  }
  return rows.filter(Boolean);
}

async function collectShopifyCollection(source, checkedAt) {
  const url = `${source.baseUrl}/collections/${source.collection}/products.json?limit=100`;
  const json = await fetchJson(url);
  return (json.products ?? []).map((product) => fromShopifyProduct(source, product, checkedAt)).filter(Boolean);
}

async function collectChemistWarehouse(source, checkedAt) {
  const html = await fetchText(source.url, { expected: "html" });
  const rows = [];
  const productRegex = /href=["'](?<url>\/buy\/[^"']+)["'][\s\S]{0,1200}?(?<name>[A-Z][^<]{8,160})[\s\S]{0,1200}?\$(?<price>\d+(?:\.\d{2})?)/gi;
  for (const match of html.matchAll(productRegex)) {
    const name = cleanText(match.groups?.name);
    const currentPrice = toNumber(match.groups?.price);
    if (!name || !currentPrice || /script|function|price/i.test(name)) continue;
    rows.push(makeDeal({
      store: source.store,
      sourceId: source.id,
      brand: getBrand(name),
      productName: name,
      currentPrice,
      previousPrice: null,
      sourceUrl: absoluteUrl(source.baseUrl, match.groups.url),
      checkedAt,
      sourceStatus: "verified",
      parser: "chemistwarehouse-html-category-v1",
    }));
  }
  return rows.slice(0, 30);
}

async function collectChemistWarehouseApi(source, checkedAt) {
  const rows = [];
  const pageErrors = [];
  for (const start of [0, 48, 96]) {
    const location = `//catalog01/en_AU/categories%3C%7Bcatalog01_chemnz%7D/categories%3C%7Bchemnz${source.categoryId}%7D`;
    const url = `${source.baseUrl}/searchapiv2/search?&identifier=nz&fh_location=${location}&fh_start_index=${start}`;
    try {
      const json = await fetchJson(url);
      const items = json?.universes?.universe?.[0]?.["items-section"]?.items?.item ?? [];
      rows.push(...items.map((item) => fromChemistWarehouseItem(source, item, checkedAt)).filter(Boolean));
    } catch (error) {
      pageErrors.push(`start ${start}: ${error.message}`);
    }
  }
  if (!rows.length && pageErrors.length) throw new Error(pageErrors.join("; "));
  return rows;
}

async function collectChemistWarehousePredictive(source, checkedAt) {
  const rows = [];
  for (const search of source.terms) {
    const url = `${source.url}?term=${encodeURIComponent(search.term)}`;
    const products = await fetchJson(url);
    rows.push(...products.map((product) => fromChemistPredictiveProduct(source, product, checkedAt, search.term, search.category)).filter(Boolean));
  }
  return rows;
}

function fromSearchProduct(source, product, checkedAt, term, categoryOverride) {
  const currentPrice = toNumber(product.price_min ?? product.price);
  const previousPrice = toNumber(product.compare_at_price_max) || toNumber(product.compare_at_price_min) || null;
  if (!product.title || !currentPrice) return null;
  const vendor = cleanText(product.vendor);
  const productTitle = cleanText(product.title);
  const title = vendor && !productTitle.toLowerCase().startsWith(vendor.toLowerCase())
    ? `${vendor} ${productTitle}`
    : productTitle;
  return makeDeal({
    store: source.store,
    sourceId: source.id,
    brand: vendor || getBrand(title),
    productName: title,
    currentPrice,
    previousPrice: previousPrice && previousPrice > currentPrice ? previousPrice : null,
    sourceUrl: absoluteUrl(source.baseUrl, product.url ?? `/products/${product.handle}`),
    checkedAt,
    sourceStatus: "verified",
    imageUrl: product.image,
    parser: `shopify-search:${term}`,
    categoryOverride,
  });
}

function fromShopifyProduct(source, product, checkedAt) {
  const firstVariant = product.variants?.[0] ?? {};
  const currentPrice = toNumber(firstVariant.price);
  const previousPrice = toNumber(firstVariant.compare_at_price);
  if (!product.title || !currentPrice) return null;
  const title = cleanText(product.title);
  return makeDeal({
    store: source.store,
    sourceId: source.id,
    brand: cleanText(product.vendor) || getBrand(title),
    productName: title,
    currentPrice,
    previousPrice: previousPrice && previousPrice > currentPrice ? previousPrice : null,
    sourceUrl: absoluteUrl(source.baseUrl, `/products/${product.handle}`),
    checkedAt,
    sourceStatus: "verified",
    imageUrl: product.images?.[0]?.src,
    parser: `shopify-collection:${source.collection}`,
  });
}

function fromChemistWarehouseItem(source, item, checkedAt) {
  const name = getAttribute(item, "name");
  const currentPrice = toNumber(getAttribute(item, "price_cw_nz"));
  const previousPrice = toNumber(getAttribute(item, "rrp_cw_nz"));
  const sourceUrl = getAttribute(item, "producturl");
  if (!name || !currentPrice || !sourceUrl) return null;

  return makeDeal({
    store: source.store,
    sourceId: source.id,
    brand: getBrand(name),
    productName: name,
    currentPrice,
    previousPrice: previousPrice && previousPrice > currentPrice ? previousPrice : null,
    sourceUrl,
    checkedAt,
    sourceStatus: "verified",
    imageUrl: getAttribute(item, "_thumburl"),
    parser: `chemistwarehouse-searchapiv2:category-${source.categoryId}`,
  });
}

function fromChemistPredictiveProduct(source, product, checkedAt, term, categoryOverride) {
  if (product.category !== "Product") return null;
  const currentPrice = toNumber(product.Price);
  const savings = toNumber(product.Savings);
  if (!product.label || !currentPrice) return null;
  const previousPrice = savings && savings > 0 ? currentPrice + savings : null;
  return makeDeal({
    store: source.store,
    sourceId: source.id,
    brand: getBrand(product.label),
    productName: product.label,
    currentPrice,
    previousPrice,
    sourceUrl: absoluteUrl(source.baseUrl, `/buy/${product.id}/${slugify(product.value || product.label)}`),
    checkedAt,
    sourceStatus: "verified",
    imageUrl: `https://static.chemistwarehouse.co.nz/ams/media/pi/${product.id}/F2D_200.jpg`,
    parser: `chemistwarehouse-predictive:${term}`,
    categoryOverride,
  });
}

function makeDeal(input) {
  const size = extractSize(input.productName);
  const brand = input.brand || getBrand(input.productName);
  const productName = input.productName.replace(new RegExp(`^${escapeRegex(brand)}\\s+`, "i"), "").trim();
  const canonicalId = canonicalize(`${brand} ${productName}`);
  const units = extractUnits(input.productName);
  const previousPrice = input.previousPrice ?? null;

  return {
    id: `${input.sourceId}-${canonicalId}`,
    canonicalId,
    brand,
    productName,
    category: input.categoryOverride || getCategory(input.productName),
    priority: getPriority(input.categoryOverride || getCategory(input.productName)),
    size,
    store: input.store,
    currentPrice: roundMoney(input.currentPrice),
    previousPrice: previousPrice ? roundMoney(previousPrice) : null,
    sourceUrl: input.sourceUrl,
    checkedAt: input.checkedAt,
    sourceStatus: input.sourceStatus,
    parser: input.parser,
    imageUrl: input.imageUrl ?? null,
    units,
  };
}

export function buildDerivedData(rows, existingHistory = {}) {
  const comparisons = {};
  const history = { ...existingHistory };
  const alerts = [];

  for (const row of rows) {
    comparisons[row.canonicalId] ??= [];
    comparisons[row.canonicalId].push({
      store: row.store,
      currentPrice: row.currentPrice,
      discount: getDiscount(row),
      status: row.sourceStatus,
      sourceUrl: row.sourceUrl,
      checkedAt: row.checkedAt,
    });

    history[row.canonicalId] ??= [];
    history[row.canonicalId] = appendHistory(history[row.canonicalId], row);

    if (getDiscount(row) >= 15) {
      alerts.push({
        id: `alert-${row.id}`,
        canonicalId: row.canonicalId,
        title: `${row.brand} ${row.productName}`,
        store: row.store,
        currentPrice: row.currentPrice,
        discount: getDiscount(row),
        sourceUrl: row.sourceUrl,
        channel: "email-ready",
        reason: `Discount is ${getDiscount(row)}% or more`,
      });
    }
  }

  for (const key of Object.keys(comparisons)) {
    comparisons[key].sort((a, b) => a.currentPrice - b.currentPrice);
  }

  return { comparisons, history, alerts };
}

function appendHistory(points, row) {
  const day = row.checkedAt.slice(0, 10);
  const next = points.filter((point) => point.date !== day);
  next.push({ date: day, price: row.currentPrice, store: row.store });
  return next.slice(-60);
}

async function fetchJson(url) {
  const text = await fetchText(url, { expected: "json" });
  return JSON.parse(text);
}

async function fetchText(url, { expected }) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "accept": expected === "json" ? "application/json,text/plain,*/*" : "text/html,application/xhtml+xml,*/*",
          "user-agent": "KiwiSupplementWatch/0.2 (+local personal price monitoring)",
        },
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status} from ${url}`);
        error.status = response.status;
        throw error;
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      await sleep(400 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

function dedupeRows(rows) {
  const seen = new Map();
  for (const row of rows) {
    const key = `${row.store}:${row.canonicalId}`;
    const existing = seen.get(key);
    if (!existing || getDiscount(row) > getDiscount(existing)) seen.set(key, row);
  }
  const sorted = [...seen.values()].sort((a, b) => (b.priority - a.priority) || (getDiscount(b) - getDiscount(a)));
  const selected = [];
  const selectedKeys = new Set();
  for (const category of PRIORITY_CATEGORIES.map((item) => item.category)) {
    const categoryRows = sorted.filter((row) => row.category === category).slice(0, 45);
    for (const row of categoryRows) {
      selected.push(row);
      selectedKeys.add(row.id);
    }
  }
  for (const row of sorted) {
    if (selected.length >= 500) break;
    if (!selectedKeys.has(row.id)) selected.push(row);
  }
  return selected.sort((a, b) => (b.priority - a.priority) || (getDiscount(b) - getDiscount(a)));
}

function getDiscount(row) {
  if (!row.previousPrice || row.previousPrice <= row.currentPrice) return 0;
  return Math.round(((row.previousPrice - row.currentPrice) / row.previousPrice) * 100);
}

function getCategory(text) {
  const match = CATEGORY_PATTERNS.find(([, pattern]) => pattern.test(text));
  return match ? match[0] : "Other";
}

function getPriority(category) {
  return PRIORITY_BY_CATEGORY[category] ?? 20;
}

function getBrand(text) {
  const cleaned = cleanText(text);
  const known = ["Blackmores", "Swisse", "GO Healthy", "Good Health", "Solgar", "Clinicians", "Radiance", "Inner Health", "Thompson's", "Ethical Nutrients", "Healtheries"];
  return known.find((brand) => cleaned.toLowerCase().startsWith(brand.toLowerCase())) ?? cleaned.split(" ").slice(0, 2).join(" ");
}

function extractSize(text) {
  return cleanText(text).match(/\b\d+\s?(?:capsules|caps|tablets|tabs|softgels|gummies|pastilles|ml|g|kg|serves)\b/i)?.[0] ?? "size unknown";
}

function extractUnits(text) {
  const match = cleanText(text).match(/\b(\d+)\s?(capsules|caps|tablets|tabs|softgels|gummies|pastilles|serves)\b/i);
  if (!match) return null;
  return { count: Number(match[1]), label: match[2].toLowerCase().replace(/s$/, "") };
}

function canonicalize(text) {
  return cleanText(text).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

function slugify(text) {
  return cleanText(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function flattenPrioritySearches() {
  return PRIORITY_CATEGORIES.flatMap((item) =>
    item.terms.map((term) => ({ term, category: item.category }))
  );
}

function cleanText(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function absoluteUrl(baseUrl, path) {
  return new URL(path, baseUrl).toString();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAttribute(item, name) {
  const attribute = item?.attribute?.find((entry) => entry.name === name);
  return attribute?.value?.[0]?.value ?? null;
}
