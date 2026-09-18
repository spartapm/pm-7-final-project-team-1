"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, TabBar } from "@/components/ui";
import { VionLogo } from "@/components/icons";
import { RankRow } from "@/components/rank-row";
import { HeadTools } from "@/components/head-tools";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { BANNERS, CATEGORY_IMAGE } from "@/lib/constants";
import { DEFAULT_PRICE, rankProducts } from "@/lib/ranking";
import { ageGroupFromYear } from "@/lib/skin-quiz";
import { concernShort } from "@/lib/badges";

export default function HomePage() {
  const router = useRouter();
  const { hydrated, account } = useStore();
  const [banner, setBanner] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
  }, [hydrated, account, router]);

  useEffect(() => {
    if (paused || BANNERS.length < 2) return;
    const t = window.setInterval(() => setBanner((n) => (n + 1) % BANNERS.length), 5000);
    return () => window.clearInterval(t);
  }, [paused]);

  const ranked = useMemo(() => {
    if (!account?.skinType) return [];
    return rankProducts({
      category: "토너",
      skinType: account.skinType,
      concerns: account.concerns,
      ageGroup: account.birthYear ? ageGroupFromYear(account.birthYear) : "20대",
      mode: "overall",
      sort: "match",
      price: DEFAULT_PRICE,
    }).slice(0, 3);
  }, [account]);

  if (!hydrated || !account) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="page-scroll bleed">
          <div className="home-head">
            <VionLogo className="vion-mark" />
            <HeadTools />
          </div>

          {account.skinType ? (
            <div className="skin-bar">
              <div>
                <strong>{account.skinType}타입</strong>
                <span>{account.concerns.map(concernShort).join(",")}</span>
              </div>
              <button className="redo" type="button" onClick={() => router.push("/onboarding?edit=1")}>
                다시진단 ›
              </button>
            </div>
          ) : null}

          <button
            className="banner-wrap"
            type="button"
            onClick={() => router.push(BANNERS[banner].href)}
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => window.setTimeout(() => setPaused(false), 5000)}
          >
            <img src={BANNERS[banner].src} alt="" />
            {BANNERS.length > 1 ? (
              <div className="banner-dots">
                {BANNERS.map((_, i) => (
                  <i key={i} className={i === banner ? "on" : ""} />
                ))}
              </div>
            ) : null}
          </button>

          <div className="cat-picks">
            {CATEGORIES.map((c) => (
              <button key={c} className="cat-pick" type="button" onClick={() => router.push(`/ranking?cat=${encodeURIComponent(c)}`)}>
                <img src={CATEGORY_IMAGE[c]} alt="" />
                {c}
              </button>
            ))}
          </div>

          <div className="sec-head">
            <div>
              <h2>나를 위한 맞춤 제품 랭킹</h2>
              <p>내 피부 타입에 잘 맞는 제품부터 보여드려요.</p>
            </div>
            <button className="all" type="button" onClick={() => router.push("/ranking")}>
              전체 랭킹보기
            </button>
          </div>
          <div className="rank-list">
            {ranked.map((row) => (
              <RankRow key={row.product.id} product={row.product} rank={row.rank} source="home_ranking" />
            ))}
          </div>
        </div>
        <TabBar />

        {!account.onboardingDone ? (
          <div className="dim center">
            <div className="modal">
              <h2>
                잠깐만요! 정보 입력을 완료해야
                <br />
                서비스를 이용할 수 있어요
              </h2>
              <div className="modal-btns" style={{ gridTemplateColumns: "1fr" }}>
                <button className="main" type="button" onClick={() => router.push("/onboarding")}>
                  입력하기
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}
