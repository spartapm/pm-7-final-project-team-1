import type {
  AgeGroup,
  Category,
  PriceFilter,
  Product,
  RankMode,
  Review,
  SkinConcern,
  SkinType,
  SortKey,
} from "./types";
import { PRODUCTS } from "./products";
import { preferredFeel } from "./constants";

const FIT: Record<string, number> = {
  "적극 추천": 100,
  추천: 80,
  "조건부 추천": 50,
  주의: 20,
};

function fitScore(product: Product, skin: SkinType | null) {
  if (!skin) return 0;
  return FIT[product.typeFit[skin] ?? ""] ?? 0;
}

function cautionLevel(product: Product, skin: SkinType | null) {
  if (!skin) return 0;
  return product.caution[skin] ?? 0;
}

function safetyScore(level: number) {
  if (level <= 0) return 100;
  if (level === 1) return 75;
  if (level === 2) return 40;
  return 0;
}

function typeScore(product: Product, skin: SkinType | null) {
  return fitScore(product, skin) * 0.8 + safetyScore(cautionLevel(product, skin)) * 0.2;
}

function concernHits(product: Product, concerns: SkinConcern[]) {
  return concerns.filter((c) => (product.concernFit[c] ?? 0) >= 1);
}

function concernMatchRate(product: Product, concerns: SkinConcern[]) {
  if (!concerns.length) return 0;
  return (concernHits(product, concerns).length / concerns.length) * 100;
}

function concernFitSum(product: Product, concerns: SkinConcern[]) {
  return concerns.reduce((n, c) => n + (product.concernFit[c] ?? 0), 0);
}

function concernFitScore(product: Product, concerns: SkinConcern[]) {
  if (!concerns.length) return 0;
  return (concernFitSum(product, concerns) / (concerns.length * 3)) * 100;
}

function concernScore(product: Product, concerns: SkinConcern[]) {
  return concernMatchRate(product, concerns) * 0.6 + concernFitScore(product, concerns) * 0.4;
}

function ageScore(product: Product, age: AgeGroup | null) {
  if (!age) return 0;
  return product.ageRank[age] ?? 0;
}

function feelMatch(product: Product, skin: SkinType | null) {
  if (!skin) return 0;
  const want = preferredFeel(skin);
  return product.feelTags.filter((t) => want.includes(t)).length;
}

function overallScore(product: Product, skin: SkinType | null, concerns: SkinConcern[], age: AgeGroup | null) {
  return typeScore(product, skin) * 0.5 + concernScore(product, concerns) * 0.3 + ageScore(product, age) * 0.2;
}

function cmpNum(a: number, b: number) {
  return b - a;
}

function byId(a: Product, b: Product) {
  return Number(a.id) - Number(b.id);
}

function sortOverall(
  rows: Product[],
  skin: SkinType | null,
  concerns: SkinConcern[],
  age: AgeGroup | null
) {
  return [...rows].sort((a, b) => {
    const sa = overallScore(a, skin, concerns, age);
    const sb = overallScore(b, skin, concerns, age);
    if (sa !== sb) return cmpNum(sa, sb);
    if (fitScore(a, skin) !== fitScore(b, skin)) return cmpNum(fitScore(a, skin), fitScore(b, skin));
    if (cautionLevel(a, skin) !== cautionLevel(b, skin)) return cautionLevel(a, skin) - cautionLevel(b, skin);
    const ha = concernHits(a, concerns).length;
    const hb = concernHits(b, concerns).length;
    if (ha !== hb) return cmpNum(ha, hb);
    const suma = concernFitSum(a, concerns);
    const sumb = concernFitSum(b, concerns);
    if (suma !== sumb) return cmpNum(suma, sumb);
    const t3a = concerns.filter((c) => (a.concernFit[c] ?? 0) === 3).length;
    const t3b = concerns.filter((c) => (b.concernFit[c] ?? 0) === 3).length;
    if (t3a !== t3b) return cmpNum(t3a, t3b);
    if (ageScore(a, age) !== ageScore(b, age)) return cmpNum(ageScore(a, age), ageScore(b, age));
    return byId(a, b);
  });
}

function sortConcern(rows: Product[], concerns: SkinConcern[]) {
  return [...rows].sort((a, b) => {
    const sa = concernScore(a, concerns);
    const sb = concernScore(b, concerns);
    if (sa !== sb) return cmpNum(sa, sb);
    const ha = concernHits(a, concerns).length;
    const hb = concernHits(b, concerns).length;
    if (ha !== hb) return cmpNum(ha, hb);
    const mina = concerns.length ? Math.min(...concerns.map((c) => a.concernFit[c] ?? 0)) : 0;
    const minb = concerns.length ? Math.min(...concerns.map((c) => b.concernFit[c] ?? 0)) : 0;
    if (mina !== minb) return cmpNum(mina, minb);
    const suma = concernFitSum(a, concerns);
    const sumb = concernFitSum(b, concerns);
    if (suma !== sumb) return cmpNum(suma, sumb);
    const t3a = concerns.filter((c) => (a.concernFit[c] ?? 0) === 3).length;
    const t3b = concerns.filter((c) => (b.concernFit[c] ?? 0) === 3).length;
    if (t3a !== t3b) return cmpNum(t3a, t3b);
    return byId(a, b);
  });
}

function sortType(rows: Product[], skin: SkinType | null) {
  return [...rows].sort((a, b) => {
    if (fitScore(a, skin) !== fitScore(b, skin)) return cmpNum(fitScore(a, skin), fitScore(b, skin));
    if (cautionLevel(a, skin) !== cautionLevel(b, skin)) return cautionLevel(a, skin) - cautionLevel(b, skin);
    if (feelMatch(a, skin) !== feelMatch(b, skin)) return cmpNum(feelMatch(a, skin), feelMatch(b, skin));
    return byId(a, b);
  });
}

function sortAge(rows: Product[], age: AgeGroup | null, wishByAge: Record<string, number>) {
  return [...rows].sort((a, b) => {
    if (ageScore(a, age) !== ageScore(b, age)) return cmpNum(ageScore(a, age), ageScore(b, age));
    const wa = wishByAge[a.id] ?? 0;
    const wb = wishByAge[b.id] ?? 0;
    if (wa !== wb) return cmpNum(wa, wb);
    return byId(a, b);
  });
}

export function inPrice(product: Product, range: PriceFilter) {
  if (range.max == null) return product.price >= range.min;
  return product.price >= range.min && product.price <= range.max;
}

export const DEFAULT_PRICE: PriceFilter = { min: 0, max: null };

export function rankProducts(opts: {
  category: Category;
  skinType: SkinType | null;
  concerns: SkinConcern[];
  ageGroup: AgeGroup | null;
  mode: RankMode;
  sort: SortKey;
  price: PriceFilter;
  wishByAge?: Record<string, number>;
  reviews?: Review[];
}) {
  const base = PRODUCTS.filter((p) => p.category === opts.category).filter((p) => inPrice(p, opts.price));
  let ordered: Product[];
  if (opts.mode === "concern") ordered = sortConcern(base, opts.concerns);
  else if (opts.mode === "type") ordered = sortType(base, opts.skinType);
  else if (opts.mode === "age") ordered = sortAge(base, opts.ageGroup, opts.wishByAge ?? {});
  else ordered = sortOverall(base, opts.skinType, opts.concerns, opts.ageGroup);

  if (opts.sort === "rating") {
    ordered = [...ordered].sort((a, b) => b.rating - a.rating || byId(a, b));
  } else if (opts.sort === "reviews") {
    ordered = [...ordered].sort((a, b) => b.reviewCount - a.reviewCount || byId(a, b));
  }

  return ordered.map((product, i) => ({ product, rank: i + 1 }));
}

export function formatPrice(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function formatVolume(volume: string) {
  if (/ml|g|mg|ml/i.test(volume)) return volume;
  return `${volume}ml`;
}

export function formatVolumePrice(volume: string, price: number) {
  return `${formatVolume(volume)}  ·  ${formatPrice(price)}`;
}

export function formatDate(ts: number) {
  const d = new Date(ts);
  const yy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function categoryLabel(cat: Category) {
  return cat;
}

export function matchedReviews(reviews: Review[], skin: SkinType | null, _concerns: SkinConcern[]) {
  // 규칙서 3-3: 피부타입은 필수. 고민만 겹치면 비노출. 타입만 같아도 노출.
  if (!skin) return [];
  return reviews.filter((r) => r.skinType === skin);
}

export function liveRating(reviews: Review[], fallback: number) {
  if (!reviews.length) return fallback;
  return reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;
}
