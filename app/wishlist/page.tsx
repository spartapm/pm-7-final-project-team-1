"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, TabBar, Thumb } from "@/components/ui";
import { IconHeart } from "@/components/icons";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { productById } from "@/lib/products";
import { formatPrice } from "@/lib/ranking";

const PAGE = 10;
const FILTERS = ["전체", ...CATEGORIES] as const;

export default function WishlistPage() {
  const router = useRouter();
  const { hydrated, account, wishlist, toggleWish } = useStore();
  const [cat, setCat] = useState<(typeof FILTERS)[number]>("전체");
  const [shown, setShown] = useState(PAGE);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/onboarding");
  }, [hydrated, account, router]);

  const items = useMemo(() => {
    const list = [...wishlist]
      .sort((a, b) => b.savedAt - a.savedAt)
      .map((w) => productById(w.productId))
      .filter((p): p is NonNullable<typeof p> => !!p);
    if (cat === "전체") return list;
    return list.filter((p) => p.category === cat);
  }, [wishlist, cat]);

  useEffect(() => setShown(PAGE), [cat, wishlist]);

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="page-scroll" ref={scroller} onScroll={() => {
          const el = scroller.current;
          if (!el) return;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) setShown((n) => n + PAGE);
        }}>
          <div className="home-head">
            <h1 style={{ margin: 0, fontSize: 20 }}>찜한 제품</h1>
          </div>
          <div className="cats">
            {FILTERS.map((c) => (
              <button key={c} className={`chip${cat === c ? " on" : ""}`} type="button" onClick={() => setCat(c)}>
                {c === "클렌징 폼" ? "클렌징폼" : c}
              </button>
            ))}
          </div>
          {items.length === 0 ? (
            <div className="empty">
              <div className="icon-wrap">♡</div>
              {wishlist.length === 0 ? (
                <>
                  <h2>아직 찜한 제품이 없어요</h2>
                  <p>마음에 드는 제품을 찜하고 모아보세요</p>
                  <button className="btn-primary" type="button" onClick={() => router.push("/home")}>
                    홈으로 가기
                  </button>
                </>
              ) : (
                <>
                  <h2>이 카테고리에 찜한 제품이 없어요</h2>
                  <p>다른 카테고리를 선택해 보세요</p>
                </>
              )}
            </div>
          ) : (
            <div className="wish-grid">
              {items.slice(0, shown).map((p) => (
                <div key={p.id} className="wish-card">
                  <div className="thumb" style={{ backgroundImage: `url("${p.image}")`, width: "100%", height: 120, borderRadius: 0, position: "relative" }}>
                    <button
                      className="heart"
                      type="button"
                      aria-label="찜 해제"
                      onClick={() => toggleWish(p.id)}
                    >
                      <IconHeart filled />
                    </button>
                  </div>
                  <button type="button" onClick={() => router.push(`/products/${p.id}`)} style={{ width: "100%", textAlign: "left" }}>
                    <div className="body">
                      <h3>{p.name}</h3>
                      <p>
                        {p.brand} · ★{p.rating.toFixed(1)}
                      </p>
                      <strong>{formatPrice(p.price)}</strong>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <TabBar />
      </div>
    </PhoneShell>
  );
}
