"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconBack, IconClock } from "@/components/icons";
import { HeadTools } from "@/components/head-tools";
import { RankRow } from "@/components/rank-row";
import { useStore } from "@/lib/store";
import { type Category } from "@/lib/types";
import { productById } from "@/lib/products";

export default function RecentPage() {
  const router = useRouter();
  const { hydrated, account, viewed } = useStore();
  const [cat, setCat] = useState<"전체" | Category>("전체");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  const ordered = dir === "desc" ? viewed : [...viewed].reverse();
  const items = ordered.map(productById).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 20);
  const filters = ["전체" as const, "크림", "토너", "클렌징폼"] as const;
  const list = items.filter((p) => cat === "전체" || p.category === cat);

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar start">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>최근 본 제품</h1>
          <HeadTools />
        </div>
        {items.length === 0 ? (
          <div className="empty">
            <div className="icon-wrap">
              <IconClock size={32} />
            </div>
            <h2>아직 살펴본 제품이 없어요</h2>
            <p>제품을 살펴보면 최근 본 제품이 여기에 표시돼요</p>
            <button className="btn-primary" type="button" onClick={() => router.push("/home")}>
              홈으로 가기
            </button>
          </div>
        ) : (
          <div className="page-scroll bleed">
            <div className="list-meta">
              <span>총 {list.length}개</span>
              <button type="button" onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))}>
                {dir === "desc" ? "최신순 ▾" : "오래된순 ▾"}
              </button>
            </div>
            <div className="cats recent-cats">
              {filters.map((c) => (
                <button key={c} className={`chip soft${cat === c ? " on" : ""}`} type="button" onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="rank-list">
              {list.map((p) => (
                <RankRow key={p.id} product={p} source="recent" />
              ))}
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
