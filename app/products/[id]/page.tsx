"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconBack, IconHeart, IconUp } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";
import { formatPrice } from "@/lib/ranking";
import { BadgeRow, productBadges } from "@/lib/badges";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, account, addView, isWished, toggleWish, isInCart, addToCart, showToast } = useStore();
  const product = productById(id);
  const [more, setMore] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const wished = product ? isWished(product.id) : false;
  const inCart = product ? isInCart(product.id) : false;

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
        <div className="page-scroll bleed" ref={scroller}>
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
            <BadgeRow badges={productBadges(product, account?.skinType ?? null, account?.concerns ?? [])} />
          </div>
          <div className="cat-bar tabs">
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
          {product.detailGallery.length > 0 ? (
            <div className={`detail-gallery${more ? "" : " collapsed"}`}>
              {(more ? product.detailGallery : product.detailGallery.slice(0, 1)).map((src) => (
                <img key={src} className="detail-img" src={src} alt="" referrerPolicy="no-referrer" />
              ))}
            </div>
          ) : null}
          {product.detailGallery.length > 0 ? (
            <button className="more-btn" type="button" onClick={() => setMore((v) => !v)}>
              {more ? "상세 접기" : "상세 더보기"}
            </button>
          ) : null}
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
          <button
            className={inCart ? "btn-line" : "btn-primary"}
            type="button"
            onClick={() => {
              if (inCart) {
                router.push("/cart");
                return;
              }
              const result = addToCart(product.id);
              if (!result.ok) {
                showToast("일시적인 오류입니다. 잠시 후 다시 시도해주세요");
                return;
              }
              showToast("장바구니에 담았어요");
            }}
          >
            {inCart ? "장바구니 보기" : "장바구니 담기"}
          </button>
          <button className="btn-disabled" type="button" disabled>
            바로 구매
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}
