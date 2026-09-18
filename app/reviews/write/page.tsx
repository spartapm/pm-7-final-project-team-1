"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconCircleX, IconSearchSm, IconSearchX } from "@/components/icons";
import { RankRow } from "@/components/rank-row";
import { useStore } from "@/lib/store";
import { PRODUCTS, productById } from "@/lib/products";

function fold(s: string) {
  return s.replace(/\s+/g, "").toLowerCase();
}

export default function ReviewPickPage() {
  const router = useRouter();
  const { hydrated, account, viewed } = useStore();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  const recents = useMemo(
    () => viewed.map(productById).filter((p): p is NonNullable<typeof p> => !!p),
    [viewed]
  );

  const hits = useMemo(() => {
    const query = fold(q);
    if (!query) return [];
    return PRODUCTS.filter((p) => fold(p.name).includes(query) || fold(p.brand).includes(query));
  }, [q]);

  const searching = Boolean(q.trim());

  const goWrite = (id: string) => {
    router.push(`/products/${id}/reviews/write`);
  };

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar write-pick">
          <button className="side accent" type="button" onClick={() => router.back()}>
            취소
          </button>
          <h1>리뷰 작성</h1>
          <span className="side" />
        </div>
        <div className="page-scroll bleed">
          <p className="pick-prompt">리뷰할 제품을 선택해 주세요.</p>
          <div className="search-box pick-search">
            <span className="search-ico">
              <IconSearchSm />
            </span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="정확한 제품명을 입력해 주세요" />
            <button type="button" className="search-clear" onClick={() => setQ("")} aria-label="지우기">
              <IconCircleX />
            </button>
          </div>
          {searching ? (
            hits.length ? (
              <div className="rank-list pick-list">
                {hits.map((p) => (
                  <RankRow key={p.id} product={p} source="review_pick" onPick={() => goWrite(p.id)} />
                ))}
              </div>
            ) : (
              <div className="search-empty">
                <div className="icon-wrap">
                  <IconSearchX />
                </div>
                <h2>일치하는 제품이 없어요</h2>
                <p>검색어를 바꾸거나 다른 제품을 찾아보세요</p>
              </div>
            )
          ) : recents.length ? (
            <>
              <h2 className="pick-label">최근 본 제품</h2>
              <div className="rank-list pick-list">
                {recents.map((p) => (
                  <RankRow key={p.id} product={p} source="review_pick" onPick={() => goWrite(p.id)} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </PhoneShell>
  );
}
