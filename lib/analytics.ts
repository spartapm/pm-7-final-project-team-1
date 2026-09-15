export type AnalyticsParams = Record<string, string | number | boolean | string[] | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

const SOURCE_KEY = "ob:source_screen";

export function setSourceScreen(screen: string) {
  try {
    sessionStorage.setItem(SOURCE_KEY, screen);
  } catch {
    /* ignore */
  }
}

const recentViewItems = new Map<string, number>();

export function trackViewItem(params: AnalyticsParams & { item_id: string }) {
  const now = Date.now();
  const last = recentViewItems.get(params.item_id);
  if (last && now - last < 1000) return;
  recentViewItems.set(params.item_id, now);
  track("view_item", params);
}

export function consumeSourceScreen(fallback = "unknown") {
  try {
    const value = sessionStorage.getItem(SOURCE_KEY);
    if (value) sessionStorage.removeItem(SOURCE_KEY);
    return value || fallback;
  } catch {
    return fallback;
  }
}
