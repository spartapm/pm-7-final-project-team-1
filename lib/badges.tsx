"use client";

import type { Product, SkinConcern, SkinType } from "./types";

export type DisplayBadge = {
  label: string;
  tone: "accent" | "warn" | "muted";
};

export function productBadges(product: Product, skinType: SkinType | null): DisplayBadge[] {
  const out: DisplayBadge[] = [];
  if (skinType && (product.caution[skinType] ?? 0) >= 2) {
    out.push({ label: `${skinType} 주의`, tone: "warn" });
  }
  for (const tag of product.featureTags) {
    if (out.length >= 3) break;
    if (out.some((b) => b.label === tag)) continue;
    out.push({ label: tag, tone: "muted" });
  }
  return out.slice(0, 3);
}

export function feelPreview(product: Product) {
  if (product.feelTags.length <= 2) return { shown: product.feelTags, extra: 0 };
  return { shown: product.feelTags.slice(0, 2), extra: product.feelTags.length - 2 };
}

export function feelTone(tag: string): "cyan" | "lime" | "peach" {
  if (["촉촉함", "수분감", "쿨링감", "윤광", "광채"].includes(tag)) return "cyan";
  if (["끈적임 적음", "산뜻함", "보송함", "가벼움", "빠른 흡수", "적은 유분감"].includes(tag)) return "lime";
  return "peach";
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

export function ReviewAuthorTags({
  skinType,
  concerns,
  expanded,
  onToggle,
}: {
  skinType: SkinType;
  concerns: SkinConcern[];
  expanded: boolean;
  onToggle?: () => void;
}) {
  const extra = concerns.length > 1;
  const shown = expanded || !extra ? concerns : concerns.slice(0, 1);
  return (
    <div className="tags">
      <span className="tag">{skinType}</span>
      {shown.map((c) => (
        <span className="tag" key={c}>
          {concernShort(c)}
        </span>
      ))}
      {extra && !expanded ? (
        onToggle ? (
          <button className="tag more-tag" type="button" onClick={onToggle}>
            …
          </button>
        ) : (
          <span className="tag more-tag">…</span>
        )
      ) : null}
    </div>
  );
}

export function concernShort(c: SkinConcern) {
  if (c === "피지/블랙헤드") return "피지·블랙헤드";
  if (c === "미백/잡티") return "미백·잡티";
  if (c === "탄력/주름") return "탄력·주름";
  return c;
}
