"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, TabBar, Thumb } from "@/components/ui";
import { IconHeart } from "@/components/icons";
import { HeadTools } from "@/components/head-tools";
import { useStore } from "@/lib/store";
import { type Category } from "@/lib/types";
import { productById } from "@/lib/products";
import { formatVolumePrice } from "@/lib/ranking";
import { setSourceScreen } from "@/lib/analytics";

const PAGE = 10;
const CAT_ORDER: Category[] = ["크림", "토너", "클렌징폼"];

export default function WishlistPage() {
  const router = useRouter();
  const { hydrated, account, wishlist, toggleWish } = useStore();
  const [cat, setCat] = useState<"전체" | Category>("전체");
  const [dir, setDir] = useState<"desc" | "asc">("desc");
  const [shown, setShown] = useState(PAGE);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  const all = useMemo(() => {
    return [...wishlist]
      .sort((a, b) => (dir === "desc" ? b.savedAt - a.savedAt : a.savedAt - b.savedAt))
      .map((w) => productById(w.productId))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [wishlist, dir]);
  const filters = ["전체" as const, ...CAT_ORDER.filter((c) => all.some((p) => p.category === c))];
  const items = cat === "전체" ? all : all.filter((p) => p.category === cat);

  useEffect(() => {
    if (cat !== "전체" && !filters.includes(cat)) setCat("전체");
  }, [cat, filters]);

  useEffect(() => setShown(PAGE), [cat, wishlist, dir]);

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div
          className="page-scroll bleed"
          ref={scroller}
          onScroll={() => {
            const el = scroller.current;
            if (!el) return;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) setShown((n) => n + PAGE);
          }}
        >
          <div className="home-head">
            <h1>찜한 제품</h1>
            <HeadTools />
          </div>
          {all.length > 0 ? (
            <>
              <div className="list-meta">
                <span>총 {all.length}개</span>
                <button type="button" onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))}>
                  {dir === "desc" ? "최신순 ▾" : "오래된순 ▴"}
                </button>
              </div>
              <div className="cats wish-cats">
                {filters.map((c) => (
                  <button key={c} className={`chip soft${cat === c ? " on" : ""}`} type="button" onClick={() => setCat(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {items.length === 0 ? (
            <div className="empty">
              <div className="icon-wrap">
                <IconHeart size={32} />
              </div>
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
                  <Thumb src={p.image} alt={p.name}>
                    <button className="heart on" type="button" aria-label="찜 해제" onClick={() => toggleWish(p.id)}>
                      <IconHeart filled />
                    </button>
                  </Thumb>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceScreen("wishlist");
                      router.push(`/products/${p.id}`);
                    }}
                    style={{ width: "100%", textAlign: "left" }}
                  >
                    <div className="body">
                      <h3>{p.name}</h3>
                      <p className="brand-name">{p.brand}</p>
                      <strong>{formatVolumePrice(p.volume, p.price)}</strong>
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
