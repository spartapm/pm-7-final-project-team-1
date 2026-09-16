export const GA4_MEASUREMENT_ID = "G-EY6SBKRBM5";

export type AnalyticsParams = Record<string, string | number | boolean | string[] | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function send(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments);
    };
  }
  window.gtag(...args);
}

function flatten(value: string | number | boolean | string[]) {
  return Array.isArray(value) ? value.join(",") : value;
}

export function track(event: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  const payload: Record<string, string | number | boolean> = {
    send_to: GA4_MEASUREMENT_ID,
  };
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) payload[key] = flatten(value);
  }
  send("event", event, payload);
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
