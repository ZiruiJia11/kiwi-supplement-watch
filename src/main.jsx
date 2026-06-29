import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlarmClock,
  Bell,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Filter,
  LineChart,
  Mail,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Store,
  Terminal,
  TrendingDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { getDashboardData } from "./lib/liveData.js";
import {
  formatCurrency,
  freshnessLabel,
  getBestComparison,
  getDiscount,
  getPriceDrop,
  getUnitPrice,
} from "./lib/pricing.js";
import "./styles.css";

const dashboardData = getDashboardData();
const priorityCategories = [
  "Fish oil",
  "Eye health",
  "Sunscreen",
  "Vitamins",
  "Probiotics",
  "Calcium & bone",
  "Sleep support",
  "Liver support",
  "Heart & CoQ10",
  "Beauty collagen",
  "Joint support",
  "Other",
];

const zhCategory = {
  "All categories": "全部分类",
  "Fish oil": "鱼油 / Omega-3",
  "Eye health": "护眼 / 叶黄素",
  "Sunscreen": "防晒霜 / SPF",
  "Vitamins": "维生素",
  "Probiotics": "益生菌 / 肠道",
  "Calcium & bone": "钙 / 骨骼",
  "Sleep support": "睡眠支持",
  "Liver support": "护肝",
  "Heart & CoQ10": "心血管 / CoQ10",
  "Beauty collagen": "美容胶原",
  "Joint support": "关节支持",
  "Other": "其它",
};

const zh = {
  navDeals: "折扣",
  navHistory: "价格历史",
  navStores: "商店",
  navAlerts: "提醒",
  navSources: "数据来源",
  title: "健康品折扣监控",
  subtitle: "优先监测适合中国市场的热门品类，以及鱼油、护眼、防晒霜和维生素。",
  search: "搜索品牌、商品、商店",
  lastDataset: "最近成功数据",
  notFetched: "尚未抓取",
  sourceMode: "数据模式",
  liveFetch: "真实商店抓取",
  seededMode: "首次抓取前使用示例数据",
  refreshCommand: "刷新命令",
  trackedProducts: "追踪商品",
  activeDeals: "有效折扣",
  priceDrops: "降价商品",
  alertsReady: "待提醒",
  store: "商店",
  category: "分类",
  verifiedOnly: "只看已验证来源",
  discountRadar: "折扣雷达",
  rowsFrom: "条来自 NZ 商店的数据",
  exportCsv: "导出 CSV",
  product: "商品",
  now: "现价",
  was: "原价",
  drop: "折扣",
  priority: "优先级",
  unit: "单位价",
  source: "来源",
  sourceHealth: "来源状态",
  parserStatus: "解析器状态",
  storeComparison: "商店对比",
  bestPrice: "当前最低价",
  priceHistory: "价格历史",
  trend: "最低价与当前趋势",
  currentPrice: "当前价格",
  alertThreshold: "提醒阈值",
  alertRules: "提醒规则",
  notifyText: "当收藏商品达到折扣阈值时提醒",
  discountThreshold: "折扣阈值",
  emailDigest: "邮件摘要",
  telegramAlert: "Telegram 提醒",
  matchingRows: "条符合提醒条件",
  saveSettings: "保存提醒设置",
  sourceNote: "每条记录都保留来源链接、抓取时间、解析器名称和状态。运行实时采集即可刷新真实数据。",
  runRefresh: "运行 npm.cmd run refresh 生成实时来源状态。",
};

const en = {
  navDeals: "Deals",
  navHistory: "Price history",
  navStores: "Stores",
  navAlerts: "Alerts",
  navSources: "Sources",
  title: "Health deal monitor",
  subtitle: "Priority NZ price checks for Chinese-market favourites plus fish oil, eye health, sunscreen, and vitamins.",
  search: "Search brand, product, store",
  lastDataset: "Last successful dataset",
  notFetched: "Not fetched yet",
  sourceMode: "Source mode",
  liveFetch: "Live retailer fetch",
  seededMode: "Seeded demo until first fetch",
  refreshCommand: "Refresh command",
  trackedProducts: "Tracked products",
  activeDeals: "Active deals",
  priceDrops: "Price drops",
  alertsReady: "Alerts ready",
  store: "Store",
  category: "Category",
  verifiedOnly: "Only verified sources",
  discountRadar: "Discount radar",
  rowsFrom: "rows from monitored NZ retailers",
  exportCsv: "Export CSV",
  product: "Product",
  now: "Now",
  was: "Was",
  drop: "Drop",
  priority: "Priority",
  unit: "Unit",
  source: "Source",
  sourceHealth: "Source health",
  parserStatus: "parser status",
  storeComparison: "Store comparison",
  bestPrice: "Best current price",
  priceHistory: "Price history",
  trend: "Lowest vs current trend",
  currentPrice: "Current price",
  alertThreshold: "Alert threshold",
  alertRules: "Alert rules",
  notifyText: "Notify when watched products cross your threshold",
  discountThreshold: "Discount threshold",
  emailDigest: "Email digest",
  telegramAlert: "Telegram alert",
  matchingRows: "matching rows ready for notification",
  saveSettings: "Save alert settings",
  sourceNote: "Every record keeps source URL, timestamp, parser name, and extraction status. Run the live collector to refresh real rows.",
  runRefresh: "Run npm.cmd run refresh to populate live source health.",
};

function App() {
  const { deals, priceHistory, storeComparisons, sourceHealth, alerts, generatedAt, mode, isLive } = dashboardData;
  const stores = useMemo(() => ["All stores", ...new Set(deals.map((deal) => deal.store))], [deals]);
  const categories = useMemo(() => {
    const available = new Set(deals.map((deal) => deal.category));
    return ["All categories", ...priorityCategories.filter((item) => available.has(item))];
  }, [deals]);
  const [query, setQuery] = useState("");
  const [store, setStore] = useState(stores[0]);
  const [category, setCategory] = useState(categories[0]);
  const [selectedId, setSelectedId] = useState(deals[0]?.canonicalId);
  const [watchlist, setWatchlist] = useState(new Set(deals.slice(0, 2).map((deal) => deal.canonicalId)));
  const [emailOn, setEmailOn] = useState(true);
  const [telegramOn, setTelegramOn] = useState(false);
  const [threshold, setThreshold] = useState(18);
  const [language, setLanguage] = useState("en");
  const text = language === "zh" ? zh : en;
  const categoryLabel = (value) => language === "zh" ? (zhCategory[value] ?? value) : value;

  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => store === "All stores" || deal.store === store)
      .filter((deal) => category === "All categories" || deal.category === category)
      .filter((deal) => {
        const haystack = `${deal.brand} ${deal.productName} ${deal.store} ${deal.category}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((a, b) => getDiscount(b) - getDiscount(a));
  }, [query, store, category]);

  const selectedComparison = storeComparisons[selectedId] ?? [];
  const selectedDeal = deals.find((deal) => deal.canonicalId === selectedId) ?? filteredDeals[0] ?? deals[0];
  const selectedHistory = priceHistory[selectedId] ?? [];
  const best = getBestComparison(selectedComparison);

  const metrics = {
    tracked: deals.length,
    activeDeals: deals.filter((deal) => getDiscount(deal) >= 15).length,
    priceDrops: deals.filter((deal) => getPriceDrop(deal) > 0).length,
    alerts: alerts.length || deals.filter((deal) => watchlist.has(deal.canonicalId) && getDiscount(deal) >= threshold).length,
  };

  const toggleWatch = (id) => {
    const next = new Set(watchlist);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setWatchlist(next);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <div className="brand">
          <div className="brand-mark">K</div>
          <div>
            <strong>Kiwi Supplement Watch</strong>
            <span>NZ deal monitor</span>
          </div>
        </div>
        <nav className="nav-list">
          <button className="nav-item active"><Activity size={18} /> {text.navDeals}</button>
          <button className="nav-item"><LineChart size={18} /> {text.navHistory}</button>
          <button className="nav-item"><Store size={18} /> {text.navStores}</button>
          <button className="nav-item"><Bell size={18} /> {text.navAlerts}</button>
          <button className="nav-item"><ShieldCheck size={18} /> {text.navSources}</button>
        </nav>
        <div className="source-note">
          <ShieldCheck size={17} />
          <p>{text.sourceNote}</p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>
          <div className="top-actions">
            <div className="search">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} />
            </div>
            <button className="secondary-button" onClick={() => setLanguage(language === "zh" ? "en" : "zh")}>
              {language === "zh" ? "EN" : "中文"}
            </button>
            <button className="icon-button" aria-label="Filter"><SlidersHorizontal size={18} /></button>
          </div>
        </header>

        <section className="status-strip" aria-label="Data status">
          <div>
            <span>{text.lastDataset}</span>
            <strong>{generatedAt ? formatDateTime(generatedAt) : text.notFetched}</strong>
          </div>
          <div>
            <span>{text.sourceMode}</span>
            <strong>{isLive ? text.liveFetch : text.seededMode}</strong>
          </div>
          <div>
            <span>{text.refreshCommand}</span>
            <strong>npm.cmd run refresh</strong>
          </div>
        </section>

        <section className="metric-grid">
          <Metric icon={<Store size={20} />} label={text.trackedProducts} value={metrics.tracked} />
          <Metric icon={<TrendingDown size={20} />} label={text.activeDeals} value={metrics.activeDeals} tone="green" />
          <Metric icon={<AlarmClock size={20} />} label={text.priceDrops} value={metrics.priceDrops} tone="amber" />
          <Metric icon={<Bell size={20} />} label={text.alertsReady} value={metrics.alerts} tone="blue" />
        </section>

        <section className="control-row">
          <Select label={text.store} value={store} options={stores} onChange={setStore} getLabel={(value) => value === "All stores" && language === "zh" ? "全部商店" : value} />
          <Select label={text.category} value={category} options={categories} onChange={setCategory} getLabel={categoryLabel} />
          <button className="secondary-button"><Filter size={16} /> {text.verifiedOnly}</button>
        </section>

        <div className="content-grid">
          <section className="panel deal-table-panel">
            <div className="panel-header">
              <div>
                <h2>{text.discountRadar}</h2>
                <p>{filteredDeals.length} {text.rowsFrom}</p>
              </div>
              <button className="secondary-button">{text.exportCsv}</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{text.product}</th>
                    <th>{text.store}</th>
                    <th>{text.now}</th>
                    <th>{text.was}</th>
                    <th>{text.drop}</th>
                    <th>{text.priority}</th>
                    <th>{text.unit}</th>
                    <th>{text.source}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className={selectedId === deal.canonicalId ? "selected-row" : ""} onClick={() => setSelectedId(deal.canonicalId)}>
                      <td>
                        <div className="product-cell">
                          <button
                            className={watchlist.has(deal.canonicalId) ? "watch active" : "watch"}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleWatch(deal.canonicalId);
                            }}
                            aria-label="Toggle watch"
                          >
                            <Star size={15} />
                          </button>
                          <div>
                            <strong>{deal.brand}</strong>
                            <span>{deal.productName}</span>
                          </div>
                        </div>
                      </td>
                      <td>{deal.store}</td>
                      <td className="price">{formatCurrency(deal.currentPrice)}</td>
                      <td className="muted">{formatCurrency(deal.previousPrice)}</td>
                      <td><span className="deal-pill">{getDiscount(deal)}%</span></td>
                      <td><span className={deal.priority >= 90 ? "priority-pill high" : "priority-pill"}>{deal.priority ?? 20}</span></td>
                      <td>{getUnitPrice(deal)}</td>
                      <td>
                        <a href={deal.sourceUrl} target="_blank" rel="noreferrer" className="source-link">
                          {freshnessLabel(deal)} <ExternalLink size={13} />
                        </a>
                      </td>
                      <td><ChevronDown size={16} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="right-rail">
            <section className="panel health-panel">
              <div className="panel-header tight">
                <div>
                  <h2>Source health</h2>
                  <p>{mode} · {text.parserStatus}</p>
                </div>
              </div>
              <div className="health-list">
                {sourceHealth.length ? sourceHealth.map((source) => (
                  <a className="health-row" href={source.sourceUrl} target="_blank" rel="noreferrer" key={source.id}>
                    <span className={source.ok ? "health-icon ok" : "health-icon fail"}>
                      {source.ok ? <Wifi size={15} /> : <WifiOff size={15} />}
                    </span>
                    <div>
                      <strong>{source.store}</strong>
                      <span>{source.extracted} rows · {source.durationMs} ms</span>
                    </div>
                  </a>
                )) : (
                  <div className="empty-state">
                    <Terminal size={18} />
                    <span>{text.runRefresh}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="panel compare-panel">
              <div className="panel-header tight">
                <div>
                  <h2>{text.storeComparison}</h2>
                  <p>{selectedDeal.brand} · {selectedDeal.size}</p>
                </div>
              </div>
              <div className="best-box">
                <span>{text.bestPrice}</span>
                <strong>{best ? formatCurrency(best.currentPrice) : "N/A"}</strong>
                <p>{best ? best.store : "No comparison rows"}</p>
              </div>
              <div className="comparison-list">
                {selectedComparison.map((item) => (
                  <a className="comparison-row" href={item.sourceUrl} target="_blank" rel="noreferrer" key={item.store}>
                    <div>
                      <strong>{item.store}</strong>
                      <span>{item.status}</span>
                    </div>
                    <div>
                      <strong>{formatCurrency(item.currentPrice)}</strong>
                      <span>{item.discount}% off</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section className="panel chart-panel">
              <div className="panel-header tight">
                <div>
                  <h2>{text.priceHistory}</h2>
                  <p>{text.trend}</p>
                </div>
              </div>
              <Sparkline points={selectedHistory} />
              <div className="chart-legend">
                <span><i className="dot green"></i> {text.currentPrice}</span>
                <span><i className="dot amber"></i> {text.alertThreshold}</span>
              </div>
            </section>

            <section className="panel alerts-panel">
              <div className="panel-header tight">
                <div>
                  <h2>{text.alertRules}</h2>
                  <p>{text.notifyText}</p>
                </div>
              </div>
              <label className="range-label">
                {text.discountThreshold} <strong>{threshold}%</strong>
                <input type="range" min="5" max="45" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
              </label>
              <Toggle icon={<Mail size={17} />} label={text.emailDigest} checked={emailOn} onChange={setEmailOn} />
              <Toggle icon={<Send size={17} />} label={text.telegramAlert} checked={telegramOn} onChange={setTelegramOn} />
              <div className="alert-preview">
                <strong>{metrics.alerts}</strong>
                <span>{text.matchingRows}</span>
              </div>
              <button className="primary-button"><CheckCircle2 size={17} /> {text.saveSettings}</button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Pacific/Auckland",
  }).format(new Date(value));
}

function Metric({ icon, label, value, tone = "neutral" }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Select({ label, value, options, onChange, getLabel = (item) => item }) {
  return (
    <label className="select-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{getLabel(option)}</option>)}
      </select>
    </label>
  );
}

function Toggle({ icon, label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{icon}{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function Sparkline({ points }) {
  const width = 460;
  const height = 164;
  if (!points.length) return <div className="empty-chart">No history yet</div>;
  const prices = points.map((point) => point.price);
  const min = Math.min(...prices) - 2;
  const max = Math.max(...prices) + 2;
  const step = width / Math.max(points.length - 1, 1);
  const coords = points.map((point, index) => {
    const x = index * step;
    const y = height - ((point.price - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Price history chart">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e7d63" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2e7d63" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${coords} ${width},${height}`} fill="url(#lineFill)" stroke="none" />
      <polyline points={coords} fill="none" stroke="#2e7d63" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => {
        const [x, y] = coords.split(" ")[index].split(",").map(Number);
        return <circle key={point.date} cx={x} cy={y} r="4.5" fill="#ffffff" stroke="#2e7d63" strokeWidth="3" />;
      })}
    </svg>
  );
}

createRoot(document.getElementById("root")).render(<App />);
