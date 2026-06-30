import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  Eye,
  FileClock,
  Globe2,
  HeartPulse,
  Mail,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Store,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { cacheManualDashboardData, getFallbackDashboardData, loadDashboardData } from "./lib/liveData.js";
import {
  formatCurrency,
  freshnessLabel,
  getBestComparison,
  getDiscount,
  getPriceDrop,
  getUnitPrice,
  isTrustedSourceStatus,
} from "./lib/pricing.js";
import "./styles.css";

const CATEGORY_ORDER = [
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

const CATEGORY_ZH = {
  "All categories": "全部分类",
  "Fish oil": "鱼油 / Omega-3",
  "Eye health": "护眼 / 叶黄素",
  Sunscreen: "防晒 / SPF",
  Vitamins: "维生素",
  Probiotics: "益生菌",
  "Calcium & bone": "钙 / 骨骼",
  "Sleep support": "睡眠支持",
  "Liver support": "护肝",
  "Heart & CoQ10": "心血管 / CoQ10",
  "Beauty collagen": "美容胶原",
  "Joint support": "关节支持",
  Other: "其他",
};

const PRODUCT_TERM_ZH = [
  [/fish oil|omega[- ]?3|dha|epa/i, "鱼油 / Omega-3"],
  [/lutein|zeaxanthin|bilberry|eye|vision|macula|retina/i, "护眼营养"],
  [/sunscreen|sunblock|spf|anthelios|sun gel|zinc sunscreen/i, "防晒"],
  [/vitamin c|ascorb/i, "维生素 C"],
  [/vitamin d/i, "维生素 D"],
  [/vitamin b|b complex/i, "维生素 B"],
  [/multivitamin|multi[- ]?vitamin/i, "复合维生素"],
  [/probiotic|inner health|gut health|acidophilus|lactobacillus|digestive/i, "益生菌 / 肠道健康"],
  [/calcium|bone|osteo/i, "钙 / 骨骼健康"],
  [/magnesium|sleep|melatonin|relax|rest/i, "镁 / 睡眠支持"],
  [/milk thistle|liver|turmeric|curcumin/i, "护肝 / 姜黄"],
  [/coq10|coenzyme q10|heart|cardio/i, "辅酶 Q10 / 心血管"],
  [/collagen|hair skin nails|beauty/i, "胶原蛋白 / 美容"],
  [/glucosamine|chondroitin|joint|arthritis/i, "关节支持"],
  [/cleanser|cleansing bar/i, "清洁护理"],
];

const COPY = {
  en: {
    appName: "Kiwi Supplement Watch",
    strapline: "NZ supplement price monitor",
    deals: "Deals",
    watchlist: "Watchlist",
    history: "History",
    stores: "Stores",
    alerts: "Alerts",
    sources: "Sources",
    search: "Search brand, product, store",
    liveData: "Live data",
    demoData: "Demo data",
    lastChecked: "Last checked",
    products: "Products",
    healthySources: "Available sources",
    activeAlerts: "Alert matches",
    tracked: "Tracked",
    allStores: "All stores",
    allCategories: "All categories",
    filters: "Filters",
    verifiedOnly: "Verified only",
    discountOnly: "Discounted only",
    sortBy: "Sort by",
    highestDiscount: "Highest discount",
    lowestPrice: "Lowest price",
    priority: "Priority",
    latestMove: "Latest move",
    exportCsv: "Export CSV",
    product: "Product",
    store: "Store",
    now: "Now",
    was: "Was",
    discount: "Discount",
    movement: "Movement",
    source: "Source",
    watch: "Watch",
    selectedProduct: "Selected product",
    bestPrice: "Best price",
    storeComparison: "Store comparison",
    priceMovement: "Price movement",
    recentRecords: "Recent records",
    averagePrice: "Average",
    highestPrice: "Highest",
    alertRule: "Alert rule",
    threshold: "Threshold",
    email: "Email",
    telegram: "Telegram",
    saveSettings: "Save settings",
    refreshData: "Refresh data",
    refreshing: "Refreshing",
    refreshFailed: "Refresh failed",
    refreshedNow: "Refreshed",
    settings: "Settings",
    preferences: "Preferences",
    language: "Language",
    defaultSort: "Default sort",
    historyRange: "History range",
    days7: "7 days",
    days30: "30 days",
    days60: "60 days",
    savePreferences: "Save preferences",
    close: "Close",
    noRows: "No matching products",
    noHistory: "No price history yet",
    noWatchlist: "No watched products yet. Star products from Deals to track them here.",
    sourcesIntro: "Parser health from the latest live collection.",
    records: "records",
    parser: "Parser",
    status: "Status",
    checkedAt: "Checked at",
    ok: "OK",
    failed: "Failed",
    stale: "Stale",
    saved: "Saved",
    openSource: "Open source",
    lower: "down",
    higher: "up",
    unchanged: "flat",
    localOnly: "Saved in this browser",
  },
  zh: {
    appName: "Kiwi Supplement Watch",
    strapline: "新西兰保健品价格监控",
    deals: "折扣列表",
    watchlist: "关注商品",
    history: "价格记录",
    stores: "商店对比",
    alerts: "提醒",
    sources: "数据来源",
    search: "搜索品牌、商品、商店",
    liveData: "真实抓取",
    demoData: "示例数据",
    lastChecked: "最近更新",
    products: "商品",
    healthySources: "可用来源",
    activeAlerts: "符合提醒",
    tracked: "关注中",
    allStores: "全部商店",
    allCategories: "全部分类",
    filters: "筛选",
    verifiedOnly: "只看真实来源",
    discountOnly: "只看折扣",
    sortBy: "排序",
    highestDiscount: "折扣最高",
    lowestPrice: "价格最低",
    priority: "优先级",
    latestMove: "最近变动",
    exportCsv: "导出 CSV",
    product: "商品",
    store: "商店",
    now: "现价",
    was: "原价",
    discount: "折扣",
    movement: "浮动",
    source: "来源",
    watch: "关注",
    selectedProduct: "商品详情",
    bestPrice: "当前最低价",
    storeComparison: "商店价格对比",
    priceMovement: "价格浮动",
    recentRecords: "最近记录",
    averagePrice: "平均价",
    highestPrice: "最高价",
    alertRule: "提醒规则",
    threshold: "阈值",
    email: "邮件",
    telegram: "Telegram",
    saveSettings: "保存设置",
    refreshData: "手动刷新",
    refreshing: "刷新中",
    refreshFailed: "刷新失败",
    refreshedNow: "已刷新",
    settings: "设置",
    preferences: "偏好设置",
    language: "语言",
    defaultSort: "默认排序",
    historyRange: "记录范围",
    days7: "7 天",
    days30: "30 天",
    days60: "60 天",
    savePreferences: "保存偏好",
    close: "关闭",
    noRows: "没有符合条件的商品",
    noHistory: "还没有价格记录",
    noWatchlist: "还没有关注商品。在折扣列表里点星标即可关注。",
    sourcesIntro: "最近一次真实抓取的解析器状态。",
    records: "条记录",
    parser: "解析器",
    status: "状态",
    checkedAt: "抓取时间",
    ok: "正常",
    failed: "失败",
    stale: "旧数据",
    saved: "已保存",
    openSource: "打开来源",
    lower: "降价",
    higher: "涨价",
    unchanged: "持平",
    localOnly: "已保存到本机浏览器",
  },
};

const VIEW_ITEMS = [
  { id: "deals", icon: Activity },
  { id: "watchlist", icon: Star },
  { id: "history", icon: FileClock },
  { id: "stores", icon: Store },
  { id: "alerts", icon: Bell },
  { id: "sources", icon: ShieldCheck },
];

const DEFAULT_PREFERENCES = {
  language: "zh",
  sort: "discount",
  historyRange: 60,
  verifiedOnly: true,
};

const DEFAULT_ALERTS = {
  email: true,
  telegram: false,
  threshold: 18,
};

function App() {
  const [dashboardData, setDashboardData] = useState(() => getFallbackDashboardData());
  const [dataStatus, setDataStatus] = useState("loading");
  const { deals, priceHistory, storeComparisons, sourceHealth, alerts, generatedAt, mode, isLive } = dashboardData;
  const [preferences, setPreferences] = useStoredState("ksw-preferences", DEFAULT_PREFERENCES);
  const [alertSettings, setAlertSettings] = useStoredState("ksw-alerts", DEFAULT_ALERTS);
  const [watchlist, setWatchlist] = useStoredSet("ksw-watchlist", deals.slice(0, 2).map((deal) => deal.canonicalId));
  const [activeView, setActiveView] = useState("deals");
  const [query, setQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("All stores");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [discountOnly, setDiscountOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(deals[0]?.canonicalId ?? "");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState("");
  const [refreshState, setRefreshState] = useState("idle");
  const text = COPY[preferences.language];

  useEffect(() => {
    let active = true;
    loadDashboardData().then((data) => {
      if (!active) return;
      setDashboardData(data);
      setDataStatus(data.isLive ? "live" : "fallback");
    });
    return () => {
      active = false;
    };
  }, []);

  const stores = useMemo(() => ["All stores", ...new Set(deals.map((deal) => deal.store))], [deals]);
  const categories = useMemo(() => {
    const available = new Set(deals.map((deal) => deal.category));
    return ["All categories", ...CATEGORY_ORDER.filter((item) => available.has(item))];
  }, [deals]);

  const decoratedDeals = useMemo(() => {
    return deals.map((deal) => ({
      ...deal,
      movement: getMovement(priceHistory[deal.canonicalId] ?? [], deal.store),
      comparison: storeComparisons[deal.canonicalId] ?? [],
    }));
  }, [deals, priceHistory, storeComparisons]);

  const baseFilteredDeals = useMemo(() => {
    return decoratedDeals
      .filter((deal) => storeFilter === "All stores" || deal.store === storeFilter)
      .filter((deal) => categoryFilter === "All categories" || deal.category === categoryFilter)
      .filter((deal) => !preferences.verifiedOnly || isTrustedSourceStatus(deal.sourceStatus))
      .filter((deal) => !discountOnly || getDiscount(deal) > 0)
      .filter((deal) => {
        const haystack = `${deal.brand} ${deal.productName} ${deal.store} ${deal.category}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((a, b) => sortDeals(a, b, preferences.sort));
  }, [decoratedDeals, storeFilter, categoryFilter, preferences.verifiedOnly, preferences.sort, discountOnly, query]);

  const selectedDeal = decoratedDeals.find((deal) => deal.canonicalId === selectedId) ?? baseFilteredDeals[0] ?? decoratedDeals[0];
  const selectedHistory = useMemo(() => {
    return filterHistory(priceHistory[selectedDeal?.canonicalId] ?? [], preferences.historyRange);
  }, [priceHistory, preferences.historyRange, selectedDeal?.canonicalId]);
  const selectedComparison = storeComparisons[selectedDeal?.canonicalId] ?? [];
  const selectedStats = getHistoryStats(selectedHistory);
  const best = getBestComparison(selectedComparison);

  useEffect(() => {
    if (!baseFilteredDeals.length) return;
    if (!baseFilteredDeals.some((deal) => deal.canonicalId === selectedId)) {
      setSelectedId(baseFilteredDeals[0].canonicalId);
    }
  }, [baseFilteredDeals, selectedId]);

  const metrics = {
    products: deals.length,
    sources: sourceHealth.filter((source) => source.ok || source.staleRows > 0).length,
    alerts: alerts.length || decoratedDeals.filter((deal) => getDiscount(deal) >= alertSettings.threshold).length,
    watched: watchlist.size,
  };

  const visibleDeals = activeView === "watchlist"
    ? baseFilteredDeals.filter((deal) => watchlist.has(deal.canonicalId))
    : baseFilteredDeals;

  const categoryLabel = (value) => {
    if (value === "All categories") return text.allCategories;
    return preferences.language === "zh" ? CATEGORY_ZH[value] ?? value : value;
  };

  const productLabel = (deal) => getLocalizedProductLabel(deal, preferences.language);

  const storeLabel = (value) => value === "All stores" ? text.allStores : value;

  const toggleWatch = (id) => {
    setWatchlist((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updatePreferences = (patch) => {
    setPreferences((current) => ({ ...current, ...patch }));
  };

  const saveAlerts = () => {
    setAlertSettings({ ...alertSettings });
    showSaved(setSavedNotice, text.saved);
  };

  const refreshLiveData = async () => {
    setRefreshState("loading");
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      if (!response.ok) throw new Error(`Refresh failed: ${response.status}`);
      const data = await response.json();
      cacheManualDashboardData(data);
      setDashboardData({
        generatedAt: data.generatedAt,
        mode: data.mode,
        deals: data.deals ?? [],
        priceHistory: data.history ?? {},
        storeComparisons: data.comparisons ?? {},
        sourceHealth: data.sourceHealth ?? [],
        alerts: data.alerts ?? [],
        isLive: Array.isArray(data.deals) && data.deals.length > 0,
      });
      setDataStatus("live");
      setRefreshState("done");
      window.setTimeout(() => setRefreshState("idle"), 1800);
    } catch {
      setRefreshState("error");
      window.setTimeout(() => setRefreshState("idle"), 2400);
    }
  };

  const exportCsv = () => {
    const rows = visibleDeals.map((deal) => ({
      brand: deal.brand,
      product: deal.productName,
      category: deal.category,
      store: deal.store,
      currentPrice: deal.currentPrice,
      previousPrice: deal.previousPrice ?? "",
      discount: `${getDiscount(deal)}%`,
      movement: deal.movement.label,
      sourceUrl: deal.sourceUrl,
      checkedAt: deal.checkedAt,
    }));
    downloadCsv(rows, "kiwi-supplement-watch.csv");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <div className="brand-mark"><HeartPulse size={20} /></div>
          <div>
            <strong>{text.appName}</strong>
            <span>{text.strapline}</span>
          </div>
        </div>

        <nav className="nav-list">
          {VIEW_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.id ? "nav-item active" : "nav-item"}
                onClick={() => setActiveView(item.id)}
                key={item.id}
              >
                <Icon size={17} />
                <span>{text[item.id]}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-status">
          <div>
            <span>{isLive ? text.liveData : text.demoData}</span>
            <strong>{sourceHealth.filter((source) => source.ok || source.staleRows > 0).length}/{Math.max(sourceHealth.length, 1)} {text.sources}</strong>
          </div>
          <div>
            <span>{text.lastChecked}</span>
            <strong>{generatedAt ? formatDateTime(generatedAt, preferences.language) : "--"}</strong>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} />
          </div>
          <div className="top-actions">
            <StatusPill tone={isLive ? "ok" : "muted"} label={dataStatus === "loading" ? "Loading" : isLive ? text.liveData : text.demoData} />
            <button className="text-button" onClick={refreshLiveData} disabled={refreshState === "loading"}>
              <RefreshCw size={16} className={refreshState === "loading" ? "spin" : ""} />
              {refreshState === "loading" ? text.refreshing : refreshState === "done" ? text.refreshedNow : refreshState === "error" ? text.refreshFailed : text.refreshData}
            </button>
            <button className="text-button" onClick={() => updatePreferences({ language: preferences.language === "zh" ? "en" : "zh" })}>
              <Globe2 size={16} />
              {preferences.language === "zh" ? "EN" : "中文"}
            </button>
            <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label={text.settings}>
              <Settings size={18} />
            </button>
          </div>
        </header>

        <section className="metric-strip" aria-label="Dashboard summary">
          <Metric label={text.products} value={metrics.products} />
                <Metric label={text.healthySources} value={`${metrics.sources}/${sourceHealth.length || 4}`} tone="ok" />
          <Metric label={text.activeAlerts} value={metrics.alerts} tone="warn" />
          <Metric label={text.tracked} value={metrics.watched} tone="accent" />
        </section>

        <div className="content-grid">
          <section className="main-surface">
            {activeView !== "sources" && (
              <FilterBar
                text={text}
                stores={stores}
                categories={categories}
                storeFilter={storeFilter}
                categoryFilter={categoryFilter}
                sort={preferences.sort}
                verifiedOnly={preferences.verifiedOnly}
                discountOnly={discountOnly}
                storeLabel={storeLabel}
                categoryLabel={categoryLabel}
                onStore={setStoreFilter}
                onCategory={setCategoryFilter}
                onSort={(sort) => updatePreferences({ sort })}
                onVerified={(verifiedOnly) => updatePreferences({ verifiedOnly })}
                onDiscountOnly={setDiscountOnly}
                onExport={exportCsv}
              />
            )}

            {activeView === "deals" && (
              <DealsTable
                rows={visibleDeals}
                text={text}
                selectedId={selectedDeal?.canonicalId}
                watchlist={watchlist}
                onSelect={setSelectedId}
                onWatch={toggleWatch}
                categoryLabel={categoryLabel}
                productLabel={productLabel}
                emptyText={text.noRows}
              />
            )}

            {activeView === "watchlist" && (
              <DealsTable
                rows={visibleDeals}
                text={text}
                selectedId={selectedDeal?.canonicalId}
                watchlist={watchlist}
                onSelect={setSelectedId}
                onWatch={toggleWatch}
                categoryLabel={categoryLabel}
                productLabel={productLabel}
                emptyText={text.noWatchlist}
              />
            )}

            {activeView === "history" && (
              <HistoryView
                text={text}
                deals={decoratedDeals}
                priceHistory={priceHistory}
                historyRange={preferences.historyRange}
                onSelect={setSelectedId}
                productLabel={productLabel}
              />
            )}

            {activeView === "stores" && (
              <StoresView text={text} deals={decoratedDeals} sourceHealth={sourceHealth} />
            )}

            {activeView === "alerts" && (
              <AlertsView
                text={text}
                alertSettings={alertSettings}
                setAlertSettings={setAlertSettings}
                deals={decoratedDeals}
                watchlist={watchlist}
                selectedId={selectedDeal?.canonicalId}
                onSelect={setSelectedId}
                onWatch={toggleWatch}
                categoryLabel={categoryLabel}
                productLabel={productLabel}
                savedNotice={savedNotice}
                onSave={saveAlerts}
              />
            )}

            {activeView === "sources" && (
              <SourcesView text={text} sourceHealth={sourceHealth} mode={mode} generatedAt={generatedAt} language={preferences.language} />
            )}
          </section>

          <DetailPanel
            text={text}
            deal={selectedDeal}
            comparison={selectedComparison}
            history={selectedHistory}
            stats={selectedStats}
            best={best}
            categoryLabel={categoryLabel}
            productLabel={productLabel}
            watchlist={watchlist}
            alertSettings={alertSettings}
            setAlertSettings={setAlertSettings}
            onWatch={toggleWatch}
            onSaveAlerts={saveAlerts}
            savedNotice={savedNotice}
          />
        </div>
      </main>

      {settingsOpen && (
        <SettingsPanel
          text={text}
          preferences={preferences}
          updatePreferences={updatePreferences}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

function FilterBar({
  text,
  stores,
  categories,
  storeFilter,
  categoryFilter,
  sort,
  verifiedOnly,
  discountOnly,
  storeLabel,
  categoryLabel,
  onStore,
  onCategory,
  onSort,
  onVerified,
  onDiscountOnly,
  onExport,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-title">
        <SlidersHorizontal size={17} />
        <span>{text.filters}</span>
      </div>
      <Select value={storeFilter} options={stores} onChange={onStore} labeler={storeLabel} />
      <Select value={categoryFilter} options={categories} onChange={onCategory} labeler={categoryLabel} />
      <Select
        value={sort}
        options={["discount", "price", "priority", "movement"]}
        onChange={onSort}
        labeler={(value) => ({
          discount: text.highestDiscount,
          price: text.lowestPrice,
          priority: text.priority,
          movement: text.latestMove,
        })[value]}
      />
      <TogglePill checked={verifiedOnly} onChange={onVerified} label={text.verifiedOnly} />
      <TogglePill checked={discountOnly} onChange={onDiscountOnly} label={text.discountOnly} />
      <button className="text-button export-button" onClick={onExport}>
        <Download size={16} />
        {text.exportCsv}
      </button>
    </div>
  );
}

function DealsTable({ rows, text, selectedId, watchlist, onSelect, onWatch, categoryLabel, productLabel, emptyText }) {
  if (!rows.length) {
    return <EmptyState icon={<Search size={20} />} text={emptyText} />;
  }

  return (
    <div className="table-wrap">
      <table className="deals-table">
        <thead>
          <tr>
            <th>{text.product}</th>
            <th>{text.store}</th>
            <th>{text.now}</th>
            <th>{text.was}</th>
            <th>{text.discount}</th>
            <th>{text.movement}</th>
            <th>{text.source}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((deal) => (
            <tr
              key={deal.id}
              className={selectedId === deal.canonicalId ? "selected-row" : ""}
              onClick={() => onSelect(deal.canonicalId)}
            >
              <td>
                <div className="product-cell">
                  <button
                    className={watchlist.has(deal.canonicalId) ? "watch-button active" : "watch-button"}
                    onClick={(event) => {
                      event.stopPropagation();
                      onWatch(deal.canonicalId);
                    }}
                    aria-label={text.watch}
                  >
                    <Star size={15} />
                  </button>
                  {deal.imageUrl ? <img src={deal.imageUrl} alt="" loading="lazy" /> : <div className="product-fallback">{deal.brand.slice(0, 1)}</div>}
                  <div>
                    <strong>{deal.brand}</strong>
                    <span>{deal.productName}</span>
                    <small>{productLabel(deal)} · {categoryLabel(deal.category)} · {deal.size}</small>
                  </div>
                </div>
              </td>
              <td>{deal.store}</td>
              <td className="price">{formatCurrency(deal.currentPrice)}</td>
              <td className="muted">{deal.previousPrice ? formatCurrency(deal.previousPrice) : "--"}</td>
              <td><Discount value={getDiscount(deal)} /></td>
              <td><Movement movement={deal.movement} text={text} /></td>
              <td>
                <a className="source-link" href={deal.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                  {freshnessLabel(deal)}
                  <ExternalLink size={13} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailPanel({ text, deal, comparison, history, stats, best, categoryLabel, productLabel, watchlist, alertSettings, setAlertSettings, onWatch, onSaveAlerts, savedNotice }) {
  if (!deal) return null;
  const watched = watchlist.has(deal.canonicalId);

  return (
    <aside className="detail-panel">
      <div className="detail-heading">
        <span>{text.selectedProduct}</span>
        <button className={watched ? "watch-button active" : "watch-button"} onClick={() => onWatch(deal.canonicalId)}>
          <Star size={15} />
        </button>
      </div>
      <div className="detail-product">
        <strong>{deal.brand}</strong>
        <h2>{deal.productName}</h2>
        <p>{productLabel(deal)} · {categoryLabel(deal.category)} · {deal.size} · {getUnitPrice(deal)}</p>
      </div>

      <div className="best-price">
        <span>{text.bestPrice}</span>
        <strong>{best ? formatCurrency(best.currentPrice) : formatCurrency(deal.currentPrice)}</strong>
        <p>{best?.store ?? deal.store}</p>
      </div>

      <section className="detail-section">
        <h3>{text.storeComparison}</h3>
        <div className="comparison-list">
          {(comparison.length ? comparison : [{ ...deal, status: deal.sourceStatus }]).map((item) => (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="comparison-row" key={`${item.store}-${item.currentPrice}`}>
              <span>{item.store}</span>
              <strong>{formatCurrency(item.currentPrice)}</strong>
              <small>{item.discount ?? getDiscount(deal)}%</small>
            </a>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h3>{text.priceMovement}</h3>
        <Sparkline points={history} />
        <div className="history-stats">
          <Stat label={text.lowestPrice} value={formatCurrency(stats.min)} />
          <Stat label={text.averagePrice} value={formatCurrency(stats.average)} />
          <Stat label={text.highestPrice} value={formatCurrency(stats.max)} />
        </div>
        <RecentHistory text={text} history={history} />
      </section>

      <section className="detail-section">
        <h3>{text.alertRule}</h3>
        <label className="range-label">
          <span>{text.threshold}</span>
          <strong>{alertSettings.threshold}%</strong>
          <input
            type="range"
            min="5"
            max="50"
            value={alertSettings.threshold}
            onChange={(event) => setAlertSettings((current) => ({ ...current, threshold: Number(event.target.value) }))}
          />
        </label>
        <SwitchRow label={text.email} checked={alertSettings.email} onChange={(email) => setAlertSettings((current) => ({ ...current, email }))} icon={<Mail size={16} />} />
        <SwitchRow label={text.telegram} checked={alertSettings.telegram} onChange={(telegram) => setAlertSettings((current) => ({ ...current, telegram }))} icon={<Send size={16} />} />
        <button className="primary-button" onClick={onSaveAlerts}>
          <CheckCircle2 size={16} />
          {savedNotice || text.saveSettings}
        </button>
      </section>
    </aside>
  );
}

function HistoryView({ text, deals, priceHistory, historyRange, onSelect, productLabel }) {
  const rows = deals.flatMap((deal) =>
    filterHistory(priceHistory[deal.canonicalId] ?? [], historyRange).map((point) => ({
      ...point,
      canonicalId: deal.canonicalId,
      brand: deal.brand,
      productName: deal.productName,
      localizedName: productLabel(deal),
      category: deal.category,
    }))
  ).sort((a, b) => `${b.checkedAt ?? b.date}`.localeCompare(`${a.checkedAt ?? a.date}`));

  if (!rows.length) return <EmptyState icon={<FileClock size={20} />} text={text.noHistory} />;

  return (
    <div className="list-view">
      <div className="view-header">
        <div>
          <h1>{text.history}</h1>
          <p>{rows.length} {text.records}</p>
        </div>
      </div>
      <div className="history-list">
        {rows.slice(0, 120).map((row) => (
          <button className="history-row" onClick={() => onSelect(row.canonicalId)} key={`${row.canonicalId}-${row.store}-${row.date}-${row.price}`}>
            <div>
              <strong>{row.brand}</strong>
              <span>{row.productName}</span>
              <small>{row.localizedName}</small>
            </div>
            <span>{row.store}</span>
            <span>{formatShortDate(row.date)}</span>
            <strong>{formatCurrency(row.price)}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function StoresView({ text, deals, sourceHealth }) {
  const stores = Object.values(deals.reduce((acc, deal) => {
    acc[deal.store] ??= { store: deal.store, count: 0, total: 0, discounts: 0, best: Infinity };
    acc[deal.store].count += 1;
    acc[deal.store].total += deal.currentPrice;
    acc[deal.store].discounts += getDiscount(deal);
    acc[deal.store].best = Math.min(acc[deal.store].best, deal.currentPrice);
    return acc;
  }, {})).sort((a, b) => b.count - a.count);

  return (
    <div className="list-view">
      <div className="view-header">
        <div>
          <h1>{text.stores}</h1>
          <p>{stores.length} {text.stores}</p>
        </div>
      </div>
      <div className="store-grid">
        {stores.map((store) => {
          const health = sourceHealth.find((source) => source.store === store.store);
          const status = getSourceStatus(health, text);
          return (
            <article className="store-card" key={store.store}>
              <div className="store-card-head">
                <strong>{store.store}</strong>
                <span className={`status ${status.tone}`}>{status.label}</span>
              </div>
              <div className="store-card-stats">
                <Stat label={text.products} value={store.count} />
                <Stat label={text.averagePrice} value={formatCurrency(store.total / store.count)} />
                <Stat label={text.lowestPrice} value={formatCurrency(store.best)} />
                <Stat label={text.discount} value={`${Math.round(store.discounts / store.count)}%`} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function AlertsView({ text, alertSettings, setAlertSettings, deals, watchlist, selectedId, onSelect, onWatch, categoryLabel, productLabel, savedNotice, onSave }) {
  const matches = deals
    .filter((deal) => getDiscount(deal) >= alertSettings.threshold)
    .filter((deal) => !watchlist.size || watchlist.has(deal.canonicalId))
    .slice(0, 20);

  return (
    <div className="list-view">
      <div className="view-header">
        <div>
          <h1>{text.alerts}</h1>
          <p>{matches.length} {text.activeAlerts}</p>
        </div>
      </div>
      <div className="settings-card">
        <label className="range-label wide">
          <span>{text.threshold}</span>
          <strong>{alertSettings.threshold}%</strong>
          <input
            type="range"
            min="5"
            max="50"
            value={alertSettings.threshold}
            onChange={(event) => setAlertSettings((current) => ({ ...current, threshold: Number(event.target.value) }))}
          />
        </label>
        <SwitchRow label={text.email} checked={alertSettings.email} onChange={(email) => setAlertSettings((current) => ({ ...current, email }))} icon={<Mail size={16} />} />
        <SwitchRow label={text.telegram} checked={alertSettings.telegram} onChange={(telegram) => setAlertSettings((current) => ({ ...current, telegram }))} icon={<Send size={16} />} />
        <button className="primary-button compact" onClick={onSave}>
          <CheckCircle2 size={16} />
          {savedNotice || text.saveSettings}
        </button>
        <small>{text.localOnly}</small>
      </div>
      <DealsTable
        rows={matches}
        text={text}
        selectedId={selectedId}
        watchlist={watchlist}
        onSelect={onSelect}
        onWatch={onWatch}
        categoryLabel={categoryLabel}
        productLabel={productLabel}
        emptyText={text.noRows}
      />
    </div>
  );
}

function SourcesView({ text, sourceHealth, mode, generatedAt, language }) {
  return (
    <div className="list-view">
      <div className="view-header">
        <div>
          <h1>{text.sources}</h1>
          <p>{text.sourcesIntro}</p>
        </div>
        <StatusPill tone="muted" label={mode} />
      </div>
      <div className="sources-table">
        <div className="source-head">
          <span>{text.store}</span>
          <span>{text.status}</span>
          <span>{text.records}</span>
          <span>{text.checkedAt}</span>
          <span>{text.parser}</span>
        </div>
        {sourceHealth.map((source) => (
          <a className="source-row" href={source.sourceUrl} target="_blank" rel="noreferrer" key={source.id}>
            <strong>{source.store}</strong>
            <span className={`status ${getSourceStatus(source, text).tone}`}>
              {source.ok ? <Wifi size={14} /> : <WifiOff size={14} />}
              {getSourceStatus(source, text).label}
            </span>
            <span>{source.extracted}{source.staleRows ? ` + ${source.staleRows}` : ""}</span>
            <span>{source.checkedAt ? formatDateTime(source.checkedAt, language) : "--"}</span>
            <small>{source.note}</small>
          </a>
        ))}
      </div>
      <p className="source-footnote">{text.lastChecked}: {generatedAt ? formatDateTime(generatedAt, language) : "--"}</p>
    </div>
  );
}

function SettingsPanel({ text, preferences, updatePreferences, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="settings-panel" role="dialog" aria-modal="true" aria-label={text.settings}>
        <div className="settings-head">
          <div>
            <span>{text.settings}</span>
            <h2>{text.preferences}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label={text.close}>
            <X size={18} />
          </button>
        </div>
        <label className="field">
          <span>{text.language}</span>
          <select value={preferences.language} onChange={(event) => updatePreferences({ language: event.target.value })}>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="field">
          <span>{text.defaultSort}</span>
          <select value={preferences.sort} onChange={(event) => updatePreferences({ sort: event.target.value })}>
            <option value="discount">{text.highestDiscount}</option>
            <option value="price">{text.lowestPrice}</option>
            <option value="priority">{text.priority}</option>
            <option value="movement">{text.latestMove}</option>
          </select>
        </label>
        <label className="field">
          <span>{text.historyRange}</span>
          <select value={preferences.historyRange} onChange={(event) => updatePreferences({ historyRange: Number(event.target.value) })}>
            <option value={7}>{text.days7}</option>
            <option value={30}>{text.days30}</option>
            <option value={60}>{text.days60}</option>
          </select>
        </label>
        <SwitchRow label={text.verifiedOnly} checked={preferences.verifiedOnly} onChange={(verifiedOnly) => updatePreferences({ verifiedOnly })} icon={<ShieldCheck size={16} />} />
        <button className="primary-button" onClick={onClose}>
          <Check size={16} />
          {text.savePreferences}
        </button>
      </section>
    </div>
  );
}

function Sparkline({ points }) {
  const chartPoints = getDailyLowestPoints(points);
  if (!chartPoints.length) return <div className="empty-chart">--</div>;
  const width = 360;
  const height = 126;
  const prices = chartPoints.map((point) => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const spread = Math.max(maxPrice - minPrice, 1);
  const min = minPrice - spread * 0.16;
  const max = maxPrice + spread * 0.16;
  const step = width / Math.max(chartPoints.length - 1, 1);
  const coords = chartPoints.map((point, index) => {
    const x = index * step;
    const y = height - ((point.price - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Price movement">
      <polyline points={`0,${height} ${coords} ${width},${height}`} fill="rgba(46, 125, 99, 0.08)" stroke="none" />
      <polyline points={coords} fill="none" stroke="#23745b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {chartPoints.map((point, index) => {
        const [x, y] = coords.split(" ")[index].split(",").map(Number);
        return <circle key={`${point.date}-${point.store ?? index}`} cx={x} cy={y} r="3.5" fill="#ffffff" stroke="#23745b" strokeWidth="2" />;
      })}
    </svg>
  );
}

function RecentHistory({ text, history }) {
  const recent = sortHistory(history).slice(-5).reverse();
  if (!recent.length) return <div className="empty-chart">{text.noHistory}</div>;
  return (
    <div className="recent-history">
      <div className="mini-head">
        <span>{text.recentRecords}</span>
      </div>
      {recent.map((point) => (
        <a className="mini-row" href={point.sourceUrl} target="_blank" rel="noreferrer" key={`${point.date}-${point.store}-${point.price}`}>
          <span>{formatShortDate(point.date)}</span>
          <span>{point.store}</span>
          <strong>{formatCurrency(point.price)}</strong>
        </a>
      ))}
    </div>
  );
}

function Movement({ movement, text }) {
  const Icon = movement.value < 0 ? TrendingDown : movement.value > 0 ? TrendingUp : ChevronDown;
  const label = movement.value < 0 ? text.lower : movement.value > 0 ? text.higher : text.unchanged;
  return (
    <span className={`movement ${movement.value < 0 ? "down" : movement.value > 0 ? "up" : "flat"}`}>
      <Icon size={14} />
      {movement.hasPrevious ? `${label} ${formatCurrency(Math.abs(movement.value))}` : "--"}
    </span>
  );
}

function Discount({ value }) {
  return <span className={value >= 30 ? "discount hot" : "discount"}>{value}%</span>;
}

function Metric({ label, value, tone = "" }) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Select({ value, options, onChange, labeler = (item) => item }) {
  return (
    <label className="select-control">
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{labeler(option)}</option>)}
      </select>
    </label>
  );
}

function TogglePill({ checked, onChange, label }) {
  return (
    <button className={checked ? "toggle-pill active" : "toggle-pill"} onClick={() => onChange(!checked)}>
      <span>{checked ? <Check size={13} /> : null}</span>
      {label}
    </button>
  );
}

function SwitchRow({ label, checked, onChange, icon }) {
  return (
    <label className="switch-row">
      <span>{icon}{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function StatusPill({ label, tone }) {
  return <span className={`status-pill ${tone}`}>{label}</span>;
}

function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function getSourceStatus(source, text) {
  if (source?.ok) return { tone: "ok", label: text.ok };
  if (source?.staleRows > 0) return { tone: "stale", label: text.stale };
  return { tone: "fail", label: text.failed };
}

function getLocalizedProductLabel(deal, language) {
  if (language !== "zh") return deal.category;
  const haystack = `${deal.brand} ${deal.productName} ${deal.category}`;
  const match = PRODUCT_TERM_ZH.find(([pattern]) => pattern.test(haystack));
  return match?.[1] ?? CATEGORY_ZH[deal.category] ?? deal.category;
}

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? { ...initialValue, ...JSON.parse(saved) } : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function useStoredSet(key, initialItems) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return new Set(saved ? JSON.parse(saved) : initialItems);
    } catch {
      return new Set(initialItems);
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify([...value]));
  }, [key, value]);

  return [value, setValue];
}

function sortDeals(a, b, sort) {
  if (sort === "price") return a.currentPrice - b.currentPrice;
  if (sort === "priority") return (b.priority ?? 0) - (a.priority ?? 0) || getDiscount(b) - getDiscount(a);
  if (sort === "movement") return Math.abs(b.movement.value) - Math.abs(a.movement.value);
  return getDiscount(b) - getDiscount(a) || a.currentPrice - b.currentPrice;
}

function getMovement(history, store) {
  const rows = sortHistory(history).filter((point) => !store || point.store === store);
  const latest = rows[rows.length - 1];
  const previous = rows[rows.length - 2];
  if (!latest || !previous) return { value: 0, hasPrevious: false, label: "flat" };
  const value = roundMoney(latest.price - previous.price);
  return { value, hasPrevious: true, label: value < 0 ? "down" : value > 0 ? "up" : "flat" };
}

function getHistoryStats(history) {
  const rows = sortHistory(history);
  if (!rows.length) return { min: 0, max: 0, average: 0 };
  const prices = rows.map((row) => row.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: roundMoney(prices.reduce((sum, price) => sum + price, 0) / prices.length),
  };
}

function filterHistory(history, range) {
  if (!history.length) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(range));
  return history.filter((point) => new Date(`${point.date}T23:59:59+12:00`) >= cutoff);
}

function getDailyLowestPoints(points) {
  const byDate = new Map();
  for (const point of sortHistory(points)) {
    const existing = byDate.get(point.date);
    if (!existing || point.price < existing.price) byDate.set(point.date, point);
  }
  return [...byDate.values()];
}

function sortHistory(points) {
  return [...points].sort((a, b) => {
    const aTime = a.checkedAt ?? a.date;
    const bTime = b.checkedAt ?? b.date;
    return `${aTime}-${a.store}`.localeCompare(`${bTime}-${b.store}`);
  });
}

function downloadCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => csvCell(row[header])).join(","));
  const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function formatDateTime(value, language = "en") {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Pacific/Auckland",
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-NZ", {
    month: "short",
    day: "numeric",
    timeZone: "Pacific/Auckland",
  }).format(new Date(`${value}T00:00:00+12:00`));
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function showSaved(setSavedNotice, text) {
  setSavedNotice(text);
  window.setTimeout(() => setSavedNotice(""), 1600);
}

createRoot(document.getElementById("root")).render(<App />);
