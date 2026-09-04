"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconBack, IconHeart, IconUp } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";
import { formatPrice } from "@/lib/ranking";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, account, addView, isWished, toggleWish } = useStore();
  const product = productById(id);
  const [more, setMore] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const wished = product ? isWished(product.id) : false;

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/onboarding");
  }, [hydrated, account, router]);

  useEffect(() => {
    if (product) addView(product.id);
  }, [product, addView]);

  if (!hydrated || !product) {
    return (
      <PhoneShell>
        <div className="page">
          <button className="x-btn" type="button" onClick={() => router.back()}>
            <IconBack />
          </button>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="page-scroll" ref={scroller}>
          <div
            className="product-hero"
            style={{ backgroundImage: `url("${product.detailImage ?? product.image}")` }}
          >
            <button className="back-fab" type="button" aria-label="뒤로" onClick={() => router.back()}>
              <IconBack />
            </button>
          </div>
          <div className="product-info">
            <div className="brand" style={{ fontWeight: 600, fontSize: 12, color: "var(--muted)" }}>
              {product.brand}
            </div>
            <h1>{product.name}</h1>
            <div className="price">{formatPrice(product.price)}</div>
          </div>
          <div className="seg">
            <button className="cat on" type="button">
              제품 상세보기
            </button>
            <button className="cat" type="button" onClick={() => router.push(`/products/${product.id}/reviews`)}>
              제품 리뷰
            </button>
          </div>
          <div className="detail-banner">
            <span className="new">NEW</span>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.4 }}>
              {product.brand}
              <br />
              {product.name}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.92 }}>
              {product.ingredients.join(" · ")} 성분을 담아 {product.concerns.join("·")}에 맞춰 설계된 제품입니다.
            </p>
          </div>
          {more ? (
            <div style={{ padding: 20, fontSize: 13, lineHeight: 1.7, color: "var(--text)" }}>
              전성분 {product.ingredients.join(", ")} 외 보습·진정 베이스. 피부 타입 {product.skinTypes.join(", ")}에
              적합하도록 적합 성분을 배치했습니다. 사용감은 가벼운 제형부터 장벽 케어까지 제품별로 다릅니다.
            </div>
          ) : null}
          <button className="more-btn" type="button" onClick={() => setMore((v) => !v)}>
            {more ? "상세 접기" : "상세 더보기"}
          </button>
        </div>
        {more ? (
          <button className="up-fab" type="button" aria-label="맨 위로" onClick={() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" })}>
            <IconUp />
          </button>
        ) : null}
        <div className="buybar">
          <button className={`wish-btn${wished ? " on" : ""}`} type="button" onClick={() => toggleWish(product.id)}>
            <IconHeart filled={wished} />
            찜하기
          </button>
          <button className="btn-disabled" type="button">
            장바구니 담기
          </button>
          <button className="btn-disabled" type="button">
            바로 구매
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}
