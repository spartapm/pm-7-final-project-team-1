"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, TabBar } from "@/components/ui";
import { IconBannerArrow, VionLogo } from "@/components/icons";
import { RankRow } from "@/components/rank-row";
import { HeadTools } from "@/components/head-tools";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { BANNERS, CATEGORY_IMAGE } from "@/lib/constants";
import { DEFAULT_PRICE, rankProducts } from "@/lib/ranking";
import { ageGroupFromYear } from "@/lib/skin-quiz";
import { SkinBar } from "@/components/skin-bar";

export default function HomePage() {
  const router = useRouter();
  const { hydrated, account } = useStore();
  const [banner, setBanner] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | null>(null);
  const swipeX = useRef<number | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
  }, [hydrated, account, router]);

  useEffect(() => {
    if (paused || BANNERS.length < 2) return;
    const t = window.setInterval(() => setBanner((n) => (n + 1) % BANNERS.length), 5000);
    return () => window.clearInterval(t);
  }, [paused]);

  const holdAuto = () => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 5000);
  };

  const goBanner = (dir: -1 | 1) => {
    setBanner((n) => (n + dir + BANNERS.length) % BANNERS.length);
    holdAuto();
  };

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
        <div className={`page-scroll bleed${!account.onboardingDone ? " home-locked" : ""}`}>
          <div className="home-head">
            <VionLogo variant="black" className="vion-mark" />
            <HeadTools />
          </div>

          {account.skinType ? <SkinBar skinType={account.skinType} concerns={account.concerns} /> : null}

          <div
            className="banner-wrap"
            onPointerDown={(e) => {
              swipeX.current = e.clientX;
            }}
            onPointerUp={(e) => {
              const start = swipeX.current;
              swipeX.current = null;
              if (start == null) return;
              const dx = e.clientX - start;
              if (Math.abs(dx) > 40) {
                swiped.current = true;
                goBanner(dx > 0 ? -1 : 1);
              }
            }}
          >
            <button
              className="banner-hit"
              type="button"
              onClick={() => {
                if (swiped.current) {
                  swiped.current = false;
                  return;
                }
                router.push(BANNERS[banner].href);
              }}
            >
              <img src={BANNERS[banner].src} alt={BANNERS[banner].alt} />
            </button>
            <button className="banner-nav prev" type="button" aria-label="이전 배너" onClick={() => goBanner(-1)}>
              <IconBannerArrow dir="prev" />
            </button>
            <button className="banner-nav next" type="button" aria-label="다음 배너" onClick={() => goBanner(1)}>
              <IconBannerArrow dir="next" />
            </button>
            <div className="banner-dots" aria-hidden>
              {BANNERS.map((item, i) => (
                <i key={item.src} className={i === banner ? "on" : ""} />
              ))}
            </div>
          </div>

          <div className="cat-picks">
            {CATEGORIES.map((c) => (
              <button key={c} className="cat-pick" type="button" onClick={() => router.push(`/ranking?cat=${encodeURIComponent(c)}`)}>
                <span className="cat-circle">
                  <img src={CATEGORY_IMAGE[c]} alt="" />
                </span>
                {c}
              </button>
            ))}
          </div>

          <div className="sec-head">
            <h2>나를 위한 맞춤 제품 랭킹</h2>
            <button className="all" type="button" onClick={() => router.push("/ranking")}>
              전체 랭킹보기 &gt;
            </button>
            <p>내 피부 타입에 잘 맞는 제품부터 보여드려요.</p>
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
              <h2>잠깐만요!</h2>
              <p>
                정보 입력을 완료해야
                <br />
                서비스를 이용할 수 있어요
              </p>
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
