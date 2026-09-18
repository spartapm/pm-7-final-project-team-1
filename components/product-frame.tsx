"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, SafeImg } from "@/components/ui";
import { IconBack, IconCart, IconClose, IconHeart, IconKakao, IconLink, IconShare, IconStar, IconUp } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";
import { formatPrice, formatVolume, liveRating } from "@/lib/ranking";
import { feelTone } from "@/lib/badges";
import { track } from "@/lib/analytics";
import { shareKakao } from "@/lib/share";
import type { Product } from "@/lib/types";

export function ProductFrame({
  product,
  tab,
  overlay,
  children,
}: {
  product: Product;
  tab: "info" | "reviews";
  overlay?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const { isWished, toggleWish, isInCart, addToCart, showToast, cart, reviews } = useStore();
  const [share, setShare] = useState(false);
  const [top, setTop] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const wished = isWished(product.id);
  const inCart = isInCart(product.id);
  const cartCount = cart.reduce((n, c) => n + c.qty, 0);
  const mine = reviews.filter((r) => r.productId === product.id);
  const rating = liveRating(mine, product.rating);
  const reviewCount = mine.length || product.reviewCount;

  const wish = () => {
    const on = toggleWish(product.id);
    if (on) track("add_to_wishlist", { item_id: product.id, item_name: product.name, price: product.price });
  };

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div
          className="page-scroll bleed"
          ref={scroller}
          onScroll={() => setTop((scroller.current?.scrollTop ?? 0) > 240)}
        >
          <div className="product-hero">
            <SafeImg src={product.image} className="hero-img" />
            <button className="back-fab" type="button" aria-label="뒤로" onClick={() => router.back()}>
              <IconBack />
            </button>
            <button className="back-fab" type="button" aria-label="장바구니" style={{ left: "auto", right: 56 }} onClick={() => router.push("/cart")}>
              <IconCart />
              {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
            </button>
            <button className="back-fab" type="button" aria-label="공유" style={{ left: "auto", right: 12 }} onClick={() => setShare(true)}>
              <IconShare />
            </button>
          </div>
          <div className="product-info">
            <div className="product-head">
              <div className="product-copy">
                <div className="brand">{product.brand}</div>
                <h1>{product.name}</h1>
              </div>
              <button className={`heart circle${wished ? " on" : ""}`} type="button" aria-label="찜" onClick={wish}>
                <IconHeart filled={wished} size={18} />
              </button>
            </div>
            <p className="vol-price">
              {formatVolume(product.volume)}
              <span>  ·  </span>
              <strong>{formatPrice(product.price)}</strong>
            </p>
            <button className="product-rating" type="button" onClick={() => router.push(`/products/${product.id}/reviews`)}>
              <span className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <IconStar key={n} filled={n <= Math.round(rating)} size={14} />
                ))}
              </span>
              {rating.toFixed(1)} ({reviewCount.toLocaleString("ko-KR")})
            </button>
            {product.feelTags.length ? (
              <div className="feel-pills">
                {product.feelTags.map((t) => (
                  <span className={`feel-pill ${feelTone(t)}`} key={t}>
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="cat-bar tabs">
            <button
              className={`cat${tab === "info" ? " on" : ""}`}
              type="button"
              onClick={() => router.replace(`/products/${product.id}`)}
            >
              상품 정보
            </button>
            <button
              className={`cat${tab === "reviews" ? " on" : ""}`}
              type="button"
              onClick={() => router.replace(`/products/${product.id}/reviews`)}
            >
              리뷰 ({reviewCount.toLocaleString("ko-KR")})
            </button>
          </div>
          {children}
        </div>
        {top ? (
          <button
            className="up-fab"
            type="button"
            aria-label="맨 위로"
            onClick={() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <IconUp />
          </button>
        ) : null}
        {overlay}
        <div className="buybar">
          <button className={`wish-btn${wished ? " on" : ""}`} type="button" aria-label="찜" onClick={wish}>
            <IconHeart filled={wished} size={18} />
          </button>
          <button
            className="btn-line"
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
              track("add_to_cart", { item_id: product.id, price: product.price });
              showToast("장바구니에 담았어요");
            }}
          >
            장바구니 담기
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              track("begin_checkout", { item_id: product.id, price: product.price });
              showToast("아직 구현되지 않은 영역입니다");
            }}
          >
            바로 구매
          </button>
        </div>

        {share ? (
          <div className="dim center" onClick={() => setShare(false)}>
            <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
              <button className="share-x" type="button" onClick={() => setShare(false)} aria-label="닫기">
                <IconClose />
              </button>
              <h2>공유하기</h2>
              <div className="share-row">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await shareKakao({
                        title: product.name,
                        image: product.image,
                        url: window.location.href,
                      });
                    } catch {
                      showToast("카카오 공유를 열 수 없어요");
                    }
                  }}
                >
                  <span className="share-circle kakao">
                    <IconKakao />
                  </span>
                  카카오
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast("링크를 복사했어요");
                    setShare(false);
                  }}
                >
                  <span className="share-circle url">
                    <IconLink />
                  </span>
                  URL
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}

export function useProductOrRedirect(id: string) {
  return productById(id);
}
