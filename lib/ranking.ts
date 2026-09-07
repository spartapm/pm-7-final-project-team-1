import type { Category, PriceRange, Product, Review, SkinConcern, SkinType, SortKey } from "./types";
import { PRODUCTS } from "./products";

export function matchScore(product: Product, skinType: SkinType | null, concerns: SkinConcern[]) {
  let score = product.fit * 0.2;
  if (skinType && product.skinTypes.includes(skinType)) score += 40;
  for (const c of concerns) {
    if (product.concerns.includes(c)) score += 25;
  }
  return score;
}

export function inPrice(product: Product, range: PriceRange) {
  if (range === "all") return true;
  if (range === "under30") return product.price <= 30000;
  if (range === "30to50") return product.price > 30000 && product.price <= 50000;
  return product.price > 50000;
}

export function rankProducts(opts: {
  category: Category;
  skinType: SkinType | null;
  concerns: SkinConcern[];
  sort: SortKey;
  price: PriceRange;
  reviews?: Review[];
}) {
  const similar = (opts.reviews ?? []).filter(
    (r) =>
      (opts.skinType && r.skinType === opts.skinType) ||
      r.concerns.some((c) => opts.concerns.includes(c))
  );
  const similarAvg = (productId: string) => {
    const rows = similar.filter((r) => r.productId === productId);
    if (!rows.length) return 0;
    return rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
  };
  const scored = PRODUCTS.filter((p) => p.category === opts.category)
    .filter((p) => inPrice(p, opts.price))
    .map((p) => ({
      product: p,
      score: matchScore(p, opts.skinType, opts.concerns) + similarAvg(p.id) * 4,
    }));

  scored.sort((a, b) => {
    if (opts.sort === "rating") return b.product.rating - a.product.rating;
    if (opts.sort === "reviews") return b.product.reviewCount - a.product.reviewCount;
    if (b.score !== a.score) return b.score - a.score;
    return b.product.rating - a.product.rating;
  });

  return scored;
}

export function formatPrice(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function formatDate(ts: number) {
  const d = new Date(ts);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function categoryLabel(cat: Category) {
  return cat === "클렌징 폼" ? "클렌징폼" : cat;
}
