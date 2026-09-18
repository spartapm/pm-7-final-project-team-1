"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, Stars, Thumb } from "@/components/ui";
import { IconBack } from "@/components/icons";
import { ReviewPhotos } from "@/components/photo-lightbox";
import { useStore } from "@/lib/store";
import { CATEGORIES, type Category } from "@/lib/types";
import { productById } from "@/lib/products";
import { formatDate, formatVolumePrice } from "@/lib/ranking";
import { ReviewAuthorTags } from "@/lib/badges";

export default function MyReviewsPage() {
  const router = useRouter();
  const { hydrated, account, reviews } = useStore();
  const [cat, setCat] = useState<"전체" | Category>("전체");
  const [dir, setDir] = useState<"desc" | "asc">("desc");
  const [open, setOpen] = useState<string | null>(null);

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

  const cats = ["전체" as const, ...CATEGORIES.filter((c) => mine.some((x) => x.p!.category === c))];
  const list = mine
    .filter((x) => cat === "전체" || x.p!.category === cat)
    .sort((a, b) => (dir === "desc" ? b.r.createdAt - a.r.createdAt : a.r.createdAt - b.r.createdAt));

  const detail = open ? list.find((x) => x.r.id === open) : null;

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  if (detail) {
    const { r, p } = detail;
    return (
      <PhoneShell>
        <div className="page">
          <div className="topbar">
            <button className="side" type="button" onClick={() => setOpen(null)} aria-label="뒤로">
              <IconBack />
            </button>
            <h1>내가 쓴 리뷰</h1>
            <span />
          </div>
          <div className="page-scroll">
            <div className="write-product">
              <Thumb src={p!.image} alt={p!.name} />
              <div>
                <h3>{p!.name}</h3>
                <p>{p!.brand}</p>
                <p>{formatVolumePrice(p!.volume, p!.price)}</p>
              </div>
            </div>
            <article className="review-card">
              <ReviewAuthorTags skinType={r.skinType} concerns={r.concerns} expanded onToggle={() => undefined} />
              <Stars value={r.rating} />
              <p>{formatDate(r.createdAt)}</p>
              <p className="review-text">{r.text || "별점만 등록된 리뷰"}</p>
              <ReviewPhotos photos={r.photos} />
            </article>
            <button className="btn-primary" type="button" onClick={() => router.push(`/products/${r.productId}/reviews/write?edit=${r.id}`)}>
              수정하기
            </button>
          </div>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>내가 쓴 리뷰</h1>
          <button className="side accent" type="button" onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))}>
            {dir === "desc" ? "최신순" : "오래된순"}
          </button>
        </div>
        {mine.length === 0 ? (
          <div className="empty">
            <h2>아직 등록한 리뷰가 없어요</h2>
            <button className="btn-primary" type="button" onClick={() => router.push("/home")}>
              홈으로가기
            </button>
          </div>
        ) : (
          <div className="page-scroll bleed">
            <div className="cats">
              {cats.map((c) => (
                <button key={c} className={`chip soft${cat === c ? " on" : ""}`} type="button" onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="review-list">
              {list.map(({ r, p }) => (
                <article key={r.id} className="review-card">
                  <button type="button" className="write-product" style={{ margin: 0, boxShadow: "none", padding: 0, width: "100%", textAlign: "left" }} onClick={() => setOpen(r.id)}>
                    <Thumb src={p!.image} alt={p!.name} />
                    <div>
                      <h3>{p!.name}</h3>
                      <Stars value={r.rating} />
                      <p>{formatDate(r.createdAt)}</p>
                    </div>
                  </button>
                  <p className="review-text">{r.text || "별점만 등록된 리뷰"}</p>
                  <button className="edit-link" type="button" onClick={() => router.push(`/products/${r.productId}/reviews/write?edit=${r.id}`)}>
                    수정하기
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
