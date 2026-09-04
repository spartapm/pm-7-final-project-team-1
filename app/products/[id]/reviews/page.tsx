"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PhoneShell, Stars, Thumb } from "@/components/ui";
import { IconBack, IconPen } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/ranking";

export default function ReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, account, reviews, showToast } = useStore();
  const [mine, setMine] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/onboarding");
  }, [hydrated, account, router]);

  const list = useMemo(() => {
    const all = reviews
      .filter((r) => r.productId === id)
      .sort((a, b) => b.createdAt - a.createdAt);
    if (!mine || !account) return all;
    return all.filter(
      (r) => r.skinType === account.skinType || r.concerns.some((c) => account.concerns.includes(c))
    );
  }, [reviews, id, mine, account]);

  useEffect(() => {
    if (!hydrated || !account || !mine) return;
    const all = reviews.filter((r) => r.productId === id);
    const matched = all.filter(
      (r) => r.skinType === account.skinType || r.concerns.some((c) => account.concerns.includes(c))
    );
    if (all.length > 0 && matched.length === 0) {
      showToast("내 피부와 일치하는 리뷰가 없어요");
      setMine(false);
    }
  }, [hydrated, account, reviews, id, mine, showToast]);

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="topbar">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>제품 리뷰</h1>
          <span />
        </div>
        <div className="toggle-row">
          내 피부 맞춤
          <button className={`toggle${mine ? " on" : ""}`} type="button" onClick={() => setMine((v) => !v)} aria-label="내 피부 맞춤">
            <i />
          </button>
        </div>
        <div className="review-list">
          {list.length === 0 ? (
            <div className="empty" style={{ paddingTop: 48 }}>
              <h2>아직 리뷰가 없어요</h2>
              <p>첫 리뷰를 남겨보세요</p>
            </div>
          ) : null}
          {list.map((r) => {
            const long = r.text.length > 90;
            const expanded = open[r.id];
            return (
              <article key={r.id} className="review-card">
                <div className="review-user">
                  <div className="avatar" />
                  <div>
                    <strong>{r.nickname}</strong>
                    <div className="tags" style={{ padding: "6px 0 0" }}>
                      <span className="tag">{r.skinType}</span>
                      {r.concerns.map((c) => (
                        <span className="tag" key={c}>
                          {c}
                        </span>
                      ))}
                    </div>
                    <div className="review-meta">
                      <Stars value={r.rating} />
                      <span>{formatDate(r.createdAt)}</span>
                      {r.purchased ? <span className="badge">구매리뷰</span> : null}
                    </div>
                  </div>
                </div>
                {r.text ? (
                  <>
                    <p className={`review-text${long && !expanded ? " clamp" : ""}`}>{r.text}</p>
                    {long && !expanded ? (
                      <button className="more" type="button" onClick={() => setOpen((o) => ({ ...o, [r.id]: true }))}>
                        더보기 &gt;
                      </button>
                    ) : null}
                  </>
                ) : null}
                {r.photos.length ? (
                  <div className="review-photos">
                    {r.photos.map((src, i) => (
                      <Thumb key={i} src={src} alt="" />
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        <button
          className="fab-pen"
          type="button"
          aria-label="리뷰 작성"
          onClick={() => router.push(`/products/${id}/reviews/write`)}
        >
          <IconPen />
        </button>
      </div>
    </PhoneShell>
  );
}
