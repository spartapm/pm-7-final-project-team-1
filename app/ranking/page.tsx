"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneShell, TabBar } from "@/components/ui";
import { IconClose, IconFilter, IconRefresh, IconWarn } from "@/components/icons";
import { RankRow } from "@/components/rank-row";
import { useStore } from "@/lib/store";
import { CATEGORIES, type Category, type PriceFilter, type RankMode, type SortKey } from "@/lib/types";
import { CATEGORY_IMAGE, RANK_HELP, rankModeCopy, rankingUpdatedLabel } from "@/lib/constants";
import { DEFAULT_PRICE, rankProducts } from "@/lib/ranking";
import { ageGroupFromYear } from "@/lib/skin-quiz";
import { concernShort } from "@/lib/badges";
import { track } from "@/lib/analytics";
import { fetchWishCountsByAge } from "@/lib/db";
import { HeadTools } from "@/components/head-tools";

function RankingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { hydrated, account, bootError, retryBoot } = useStore();
  const startCat = (params.get("cat") as Category) || "토너";
  const startMode = (params.get("mode") as RankMode) || "overall";
  const [category, setCategory] = useState<Category>(CATEGORIES.includes(startCat) ? startCat : "토너");
  const [mode, setMode] = useState<RankMode>(["overall", "concern", "type", "age"].includes(startMode) ? startMode : "overall");
  const [wishByAge, setWishByAge] = useState<Record<string, number>>({});
  const [sort, setSort] = useState<SortKey>("match");
  const [price, setPrice] = useState<PriceFilter>(DEFAULT_PRICE);
  const [draftSort, setDraftSort] = useState<SortKey>("match");
  const [draftMin, setDraftMin] = useState(0);
  const [draftMax, setDraftMax] = useState(50000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  const ageGroup = account?.birthYear ? ageGroupFromYear(account.birthYear) : "20대";

  useEffect(() => {
    if (!account?.onboardingDone) return;
    void fetchWishCountsByAge(ageGroup).then(setWishByAge).catch(() => setWishByAge({}));
  }, [account?.onboardingDone, ageGroup]);

  const ranked = useMemo(() => {
    if (!account?.skinType) return [];
    return rankProducts({
      category,
      skinType: account.skinType,
      concerns: account.concerns,
      ageGroup,
      mode,
      sort,
      price,
      wishByAge,
    });
  }, [account, category, mode, sort, price, ageGroup, wishByAge]);

  if (bootError) {
    return (
      <PhoneShell>
        <div className="page">
          <div className="empty">
            <div className="icon-wrap">
              <IconWarn />
            </div>
            <h2>랭킹을 불러오지 못했어요</h2>
            <p>네트워크 상태를 확인하고 다시 시도해주세요.</p>
            <button className="btn-primary" type="button" disabled={!hydrated} onClick={retryBoot}>
              다시 시도
            </button>
          </div>
          <TabBar />
        </div>
      </PhoneShell>
    );
  }

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  const priceLabel =
    draftMax >= 50000 && draftMin >= 50000
      ? "50,000원 이상"
      : draftMin === draftMax
        ? `0원~${draftMax.toLocaleString("ko-KR")}원`
        : `${draftMin.toLocaleString("ko-KR")}원~${draftMax >= 50000 ? "50,000원 이상" : `${draftMax.toLocaleString("ko-KR")}원`}`;

  const clampPair = (min: number, max: number) => {
    let a = min;
    let b = max;
    if (a > b) a = b;
    if (a === 10000 && b === 10000) return { min: 0, max: 10000 };
    return { min: a, max: b };
  };

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="page-scroll bleed">
          <div className="home-head">
            <button type="button" onClick={() => setModeOpen(true)} style={{ fontSize: 18, fontWeight: 800 }}>
              {rankModeCopy(mode, account.skinType ?? "", ageGroup).title} ›
            </button>
            <HeadTools />
          </div>
          <div className="rank-meta" style={{ paddingLeft: 16 }}>
            {rankingUpdatedLabel()}
          </div>
          <div className="skin-bar">
            <div>
              <strong>{account.skinType}타입</strong>
              <span>{account.concerns.map(concernShort).join(",")}</span>
            </div>
            <button className="redo" type="button" onClick={() => router.push("/onboarding?edit=1")}>
              다시진단 ›
            </button>
          </div>
          <div className="rank-cats">
            {CATEGORIES.map((c) => (
              <button key={c} className={category === c ? "on" : ""} type="button" onClick={() => setCategory(c)}>
                <img src={CATEGORY_IMAGE[c]} alt="" />
                {c}
              </button>
            ))}
          </div>
          <button className="help-link" type="button" onClick={() => setHelpOpen(true)}>
            랭킹 산정 기준 보러가기 ›
          </button>
          <div className="rank-title">
            <span />
            <button
              className={`filter-btn${sort !== "match" || price.min > 0 || price.max != null ? " on" : ""}`}
              type="button"
              aria-label="필터"
              onClick={() => {
                track("click_filter_button");
                setDraftSort(sort);
                setDraftMin(price.min);
                setDraftMax(price.max ?? 50000);
                setFilterOpen(true);
              }}
            >
              <IconFilter />
            </button>
          </div>
          <div className="rank-list">
            {ranked.map((row) => (
              <RankRow key={row.product.id} product={row.product} rank={row.rank} source="home_ranking" />
            ))}
          </div>
        </div>
        <TabBar />

        {modeOpen ? (
          <div className="dim" onClick={() => setModeOpen(false)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-handle" />
              <h2>원하는 랭킹을 선택해 주세요</h2>
              {(["overall", "type", "concern", "age"] as RankMode[]).map((k) => {
                const copy = rankModeCopy(k, account.skinType ?? "", ageGroup);
                return (
                  <button
                    key={k}
                    className={`mode-card${mode === k ? " on" : ""}`}
                    type="button"
                    onClick={() => {
                      setMode(k);
                      window.setTimeout(() => setModeOpen(false), 300);
                    }}
                  >
                    <strong>{copy.title}</strong>
                    <span>{copy.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {helpOpen ? (
          <div className="dim center" onClick={() => setHelpOpen(false)}>
            <div className="modal" style={{ textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>랭킹 산정 방식 안내</h2>
                <button type="button" onClick={() => setHelpOpen(false)} aria-label="닫기">
                  <IconClose />
                </button>
              </div>
              {RANK_HELP.map((line) => (
                <p key={line} style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : null}

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
                    setDraftMin(0);
                    setDraftMax(50000);
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
              <div className="filter-label">가격대 · {priceLabel}</div>
              <div className="price-track">
                <div className="price-rail" />
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={10000}
                  value={draftMin}
                  onChange={(e) => {
                    const next = clampPair(Number(e.target.value), draftMax);
                    setDraftMin(next.min);
                    setDraftMax(next.max);
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={10000}
                  value={draftMax}
                  onChange={(e) => {
                    const next = clampPair(draftMin, Number(e.target.value));
                    setDraftMin(next.min);
                    setDraftMax(next.max);
                  }}
                />
              </div>
              <button
                className="btn-primary apply"
                type="button"
                onClick={() => {
                  const both50 = draftMin >= 50000 && draftMax >= 50000;
                  const both10 = draftMin === 10000 && draftMax === 10000;
                  const next: PriceFilter = both50
                    ? { min: 50000, max: null }
                    : both10
                      ? { min: 0, max: 10000 }
                      : draftMax >= 50000
                        ? { min: draftMin, max: null }
                        : { min: draftMin, max: draftMax };
                  track("apply_filter", { sort_type: draftSort, price_range_list: [priceLabel] });
                  setSort(draftSort);
                  setPrice(next);
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

export default function RankingPage() {
  return (
    <Suspense fallback={<PhoneShell />}>
      <RankingInner />
    </Suspense>
  );
}
