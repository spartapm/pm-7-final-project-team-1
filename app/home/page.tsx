"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, TabBar, Thumb } from "@/components/ui";
import { IconCart, IconFilter, IconRefresh, IconSearch, LogoMark } from "@/components/icons";
import { useStore } from "@/lib/store";
import { CATEGORIES, SKIN_CONCERNS, SKIN_TYPES, type Category, type PriceRange, type SkinConcern, type SkinType, type SortKey } from "@/lib/types";
import { rankProducts } from "@/lib/ranking";
import { BadgeRow, productBadges } from "@/lib/badges";
import { readRankingView, writeRankingView } from "@/lib/ranking-view";

function sameConcerns(a: SkinConcern[], b: SkinConcern[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

const PAGE = 10;

export default function HomePage() {
  const router = useRouter();
  const { hydrated, account, cart } = useStore();
  const [category, setCategory] = useState<Category>("크림");
  const [sort, setSort] = useState<SortKey>("match");
  const [price, setPrice] = useState<PriceRange>("all");
  const [draftSort, setDraftSort] = useState<SortKey>("match");
  const [draftPrice, setDraftPrice] = useState<PriceRange>("under30");
  const [filterOpen, setFilterOpen] = useState(false);
  const [error, setError] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [viewSkin, setViewSkin] = useState<SkinType | null>(null);
  const [viewConcerns, setViewConcerns] = useState<SkinConcern[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/onboarding");
  }, [hydrated, account, router]);

  useEffect(() => {
    if (!account?.skinType) return;
    const saved = readRankingView(account);
    setViewSkin(saved.skin);
    setViewConcerns(saved.concerns);
  }, [account?.id, account?.skinType, account?.concerns]);

  useEffect(() => {
    if (!account?.skinType || !viewSkin) return;
    writeRankingView(account, viewSkin, viewConcerns);
  }, [account, viewSkin, viewConcerns]);

  const ranked = useMemo(
    () =>
      rankProducts({
        category,
        skinType: viewSkin,
        concerns: viewConcerns,
        sort,
        price,
      }),
    [category, viewSkin, viewConcerns, sort, price]
  );

  useEffect(() => {
    setShown(PAGE);
    setError(false);
  }, [category, sort, price, viewSkin, viewConcerns]);

  const visible = ranked.slice(0, shown);
  const isMine = !!account?.skinType && viewSkin === account.skinType && sameConcerns(viewConcerns, account.concerns);
  const concernText = viewConcerns.join(" · ");
  const title = concernText
    ? `${viewSkin ?? ""} · ${concernText}을 위한 ${category}`
    : `${viewSkin ?? ""}을 위한 ${category}`;

  const resetMine = () => {
    if (!account?.skinType) return;
    setViewSkin(account.skinType);
    setViewConcerns(account.concerns);
  };

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      setShown((n) => Math.min(ranked.length, n + PAGE));
    }
  };

  if (!hydrated || !account?.onboardingDone || !viewSkin) return <PhoneShell />;

  if (error) {
    return (
      <PhoneShell>
        <div className="page">
          <div className="empty">
            <div className="icon-wrap">⚠</div>
            <h2>랭킹을 불러오지 못했어요</h2>
            <p>네트워크 상태를 확인하고 다시 시도해주세요.</p>
            <button className="btn-primary" type="button" onClick={() => setError(false)}>
              다시 시도
            </button>
          </div>
          <TabBar />
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="page-scroll bleed" ref={scroller} onScroll={onScroll}>
          <div className="home-head">
            <div className="brand">
              <LogoMark className="logo" color="#C85C78" />
              ONE&BEAUTY
            </div>
            <button className="cart-head" type="button" aria-label="장바구니" onClick={() => router.push("/cart")}>
              <IconCart />
              {cart.length > 0 ? <span className="cart-badge">{cart.reduce((n, c) => n + c.qty, 0)}</span> : null}
            </button>
          </div>
          <div className="mytype-row">
            <div className="mytype">MY Type</div>
            {!isMine ? (
              <button className="mine-reset" type="button" onClick={resetMine}>
                내 피부로
              </button>
            ) : null}
          </div>
          <div className="tags wrap">
            {SKIN_TYPES.map((t) => (
              <button
                key={t}
                className={`tag btn${viewSkin === t ? " on" : ""}`}
                type="button"
                onClick={() => setViewSkin(t)}
              >
                {t}
              </button>
            ))}
            {SKIN_CONCERNS.map((c) => {
              const on = viewConcerns.includes(c);
              return (
                <button
                  key={c}
                  className={`tag btn${on ? " on" : ""}`}
                  type="button"
                  onClick={() =>
                    setViewConcerns((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))
                  }
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="cats">
            {CATEGORIES.map((c) => (
              <button key={c} className={`cat${category === c ? " on" : ""}`} type="button" onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="rank-meta">“피부타입/피부 고민 기반 적합 성분 순위에 따른 안내”</div>
          <div className="rank-title">
            <span>{title}</span>
            <button className="filter-btn" type="button" aria-label="필터" onClick={() => { setDraftSort(sort); setDraftPrice(price === "all" ? "under30" : price); setFilterOpen(true); }}>
              <IconFilter />
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="empty" style={{ paddingTop: 40 }}>
              <div className="icon-wrap">
                <IconSearch />
              </div>
              <h2>조건에 맞는 제품이 아직 없어요</h2>
              <p>다른 피부 타입이나 카테고리를 선택해 보세요</p>
              <button className="btn-primary" type="button" onClick={() => { setPrice("all"); setSort("match"); setFilterOpen(true); }}>
                필터 변경하기
              </button>
            </div>
          ) : (
            <div className="rank-list">
              {visible.map((row, i) => (
                <button
                  key={row.product.id}
                  className="rank-card"
                  type="button"
                  onClick={() => router.push(`/products/${row.product.id}`)}
                >
                  <span className="rank-no">{i + 1}</span>
                  <Thumb src={row.product.image} alt={row.product.name} />
                  <div>
                    <h3>{row.product.name}</h3>
                    <p>
                      ★ {row.product.rating.toFixed(1)} · {row.product.brand}
                    </p>
                    <BadgeRow badges={productBadges(row.product, viewSkin, viewConcerns)} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <TabBar />

        {filterOpen ? (
          <div className="dim" onClick={() => setFilterOpen(false)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-handle" />
              <div className="sheet-head">
                <h2>필터</h2>
                <button
                  className="reset"
                  type="button"
                  onClick={() => {
                    setDraftSort("match");
                    setDraftPrice("under30");
                  }}
                >
                  <IconRefresh />
                  초기화
                </button>
              </div>
              <div className="filter-label">정렬 기준</div>
              <div className="filter-row">
                {(
                  [
                    ["match", "맞춤순"],
                    ["rating", "평점순"],
                    ["reviews", "리뷰순"],
                  ] as const
                ).map(([k, label]) => (
                  <button key={k} className={`pill${draftSort === k ? " on-line" : ""}`} type="button" onClick={() => setDraftSort(k)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="filter-label">가격대</div>
              <div className="filter-row">
                {(
                  [
                    ["under30", "3만원 이하"],
                    ["30to50", "3~5만원"],
                    ["over50", "5만원 이상"],
                  ] as const
                ).map(([k, label]) => (
                  <button key={k} className={`pill${draftPrice === k ? " on-fill" : ""}`} type="button" onClick={() => setDraftPrice(k)}>
                    {label}
                  </button>
                ))}
              </div>
              <button
                className="btn-primary apply"
                type="button"
                onClick={() => {
                  setSort(draftSort);
                  setPrice(draftPrice);
                  setFilterOpen(false);
                }}
              >
                적용하기
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}
