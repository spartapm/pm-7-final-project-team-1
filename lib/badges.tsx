import type { Product, SkinConcern, SkinType } from "./types";

const INGREDIENT_FIT: Record<string, { types?: SkinType[]; concerns?: SkinConcern[] }> = {
  세라마이드: { types: ["건성", "복합성", "수부지"], concerns: ["수분/보습"] },
  콜레스테롤: { types: ["건성"], concerns: ["수분/보습"] },
  지방산: { types: ["건성", "복합성"], concerns: ["수분/보습"] },
  히알루론산: { concerns: ["수분/보습"] },
  판테놀: { types: ["건성", "복합성"], concerns: ["수분/보습", "트러블/진정"] },
  스쿠알란: { types: ["건성", "중성"], concerns: ["수분/보습"] },
  글리세린: { concerns: ["수분/보습"] },
  병풀추출물: { concerns: ["트러블/진정"] },
  병풀: { concerns: ["트러블/진정"] },
  마데카소사이드: { concerns: ["트러블/진정"] },
  PDRN: { types: ["건성", "복합성"], concerns: ["수분/보습"] },
  시카: { concerns: ["트러블/진정"] },
  나이아신아마이드: { types: ["지성", "복합성"], concerns: ["트러블/진정"] },
  쉐어버터: { types: ["건성"], concerns: ["수분/보습"] },
  시어버터: { types: ["건성"], concerns: ["수분/보습"] },
  티트리: { types: ["지성"], concerns: ["트러블/진정"] },
  해수: { types: ["복합성", "수부지"], concerns: ["수분/보습", "트러블/진정"] },
  어성초: { types: ["지성", "복합성"], concerns: ["트러블/진정"] },
  온천수: { types: ["건성", "중성"], concerns: ["수분/보습"] },
  녹차: { types: ["지성", "복합성"], concerns: ["트러블/진정"] },
  아미노산: { concerns: ["수분/보습"] },
  약산성계면활성제: { types: ["지성", "복합성"], concerns: ["트러블/진정"] },
};

export type DisplayBadge = {
  label: string;
  tone: "accent" | "warn" | "muted";
};

export function matchingIngredientCount(
  product: Product,
  skinType: SkinType | null,
  concerns: SkinConcern[]
) {
  return product.ingredients.filter((name) => {
    const fit = INGREDIENT_FIT[name];
    if (!fit) return false;
    const typeHit = !!(skinType && fit.types?.includes(skinType));
    const concernHit = fit.concerns?.some((c) => concerns.includes(c)) ?? false;
    if (fit.types?.length && fit.concerns?.length) return typeHit || concernHit;
    if (fit.types?.length) return typeHit;
    return concernHit;
  }).length;
}

export function productBadges(
  product: Product,
  skinType: SkinType | null,
  concerns: SkinConcern[]
): DisplayBadge[] {
  const out: DisplayBadge[] = [];
  const n = matchingIngredientCount(product, skinType, concerns);
  if (n > 0) out.push({ label: `나에게 맞는 성분 ${n}개`, tone: "accent" });
  for (const b of product.badges) {
    if (out.length >= 3) break;
    out.push({ label: b.label, tone: b.tone });
  }
  return out.slice(0, 3);
}

export function BadgeRow({ badges }: { badges: DisplayBadge[] }) {
  if (!badges.length) return null;
  return (
    <div className="badges">
      {badges.map((b) => (
        <span key={b.label} className={`badge-pill ${b.tone}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}
