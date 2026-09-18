"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, Stars, Thumb } from "@/components/ui";
import { IconBack, IconComment } from "@/components/icons";
import { HeadTools } from "@/components/head-tools";
import { useStore } from "@/lib/store";
import { type Category } from "@/lib/types";
import { productById } from "@/lib/products";
import { formatShortDate, formatVolumePrice } from "@/lib/ranking";

const CAT_ORDER: Category[] = ["크림", "토너", "클렌징폼"];

export default function MyReviewsPage() {
  const router = useRouter();
  const { hydrated, account, reviews } = useStore();
  const [cat, setCat] = useState<"전체" | Category>("전체");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  const mine = useMemo(() => {
    const rows = reviews
      .filter((r) => r.accountId === account?.id)
      .map((r) => ({ r, p: productById(r.productId) }))
      .filter((x) => x.p);
    return rows;
  }, [reviews, account]);

  const filters = ["전체" as const, ...CAT_ORDER.filter((c) => mine.some((x) => x.p!.category === c))];
  const list = mine
    .filter((x) => cat === "전체" || x.p!.category === cat)
    .sort((a, b) => (dir === "desc" ? b.r.createdAt - a.r.createdAt : a.r.createdAt - b.r.createdAt));

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar start">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>내가 쓴 리뷰</h1>
          <HeadTools />
        </div>
        {mine.length === 0 ? (
          <div className="empty">
            <div className="icon-wrap">
              <IconComment size={32} />
            </div>
            <h2>아직 등록한 리뷰가 없어요</h2>
            <p>맞춤 랭킹 확인하고 제품의 첫 리뷰를 남겨보세요</p>
            <button className="btn-primary" type="button" onClick={() => router.push("/home")}>
              홈으로 가기
            </button>
          </div>
        ) : (
          <div className="page-scroll bleed">
            <div className="list-meta">
              <span>총 {list.length}개</span>
              <button type="button" onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))}>
                등록순 ▾
              </button>
            </div>
            <div className="cats review-cats">
              {filters.map((c) => (
                <button key={c} className={`chip soft${cat === c ? " on" : ""}`} type="button" onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="my-rev-list">
              {list.map(({ r, p }) => (
                <article key={r.id} className="my-rev-card">
                  <button type="button" className="my-rev-open" onClick={() => router.push(`/products/${p!.id}/reviews`)}>
                    <Thumb src={p!.image} alt={p!.name} />
                    <div className="my-rev-main">
                      <p className="my-rev-brand">{p!.brand}</p>
                      <h3>{p!.name}</h3>
                      <p className="my-rev-vol">{formatVolumePrice(p!.volume, p!.price)}</p>
                    </div>
                  </button>
                  <div className="my-rev-side">
                    <Stars value={r.rating} size={12} />
                    <span className="my-rev-date">{formatShortDate(r.createdAt)}</span>
                    <button
                      className="edit-link"
                      type="button"
                      onClick={() => router.push(`/products/${r.productId}/reviews/write?edit=${r.id}`)}
                    >
                      수정하기
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
