"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, PhoneShell, Stars, Thumb } from "@/components/ui";
import { IconBack, IconPen } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/ranking";
import { track } from "@/lib/analytics";

export default function ReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, account, reviews, showToast } = useStore();
  const [mine, setMine] = useState(true);

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

  if (!hydrated) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="topbar review">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>제품 리뷰</h1>
          <div className="toggle-inline">
            내 피부 맞춤
            <button className={`toggle${mine ? " on" : ""}`} type="button" onClick={() => setMine((v) => !v)} aria-label="내 피부 맞춤">
              <i />
            </button>
          </div>
        </div>
        <div className="page-scroll bleed">
        <div className="review-list">
          {list.length === 0 ? (
            <div className="empty" style={{ paddingTop: 48 }}>
              <div className="icon-wrap">
                <IconPen />
              </div>
              <h2>아직 리뷰가 없어요</h2>
              <p>첫 리뷰를 남겨보세요</p>
            </div>
          ) : null}
          {list.map((r) => {
            return (
              <article key={r.id} className="review-card">
                <div className="review-user">
                  <Avatar name={r.nickname} />
                  <div>
                    <strong>{r.nickname}</strong>
                    <div className="tags">
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
                {r.text ? <ClampedReview text={r.text} /> : null}
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
        </div>
        <button
          className="fab-pen"
          type="button"
          aria-label="리뷰 작성"
          onClick={() => {
            track("click_write_review", { item_id: id });
            router.push(`/products/${id}/reviews/write`);
          }}
        >
          <IconPen />
        </button>
      </div>
    </PhoneShell>
  );
}

function ClampedReview({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    setShowMore(el.scrollHeight - el.clientHeight > 1);
  }, [text, expanded]);

  return (
    <>
      <p ref={ref} className={`review-text${expanded ? "" : " clamp"}`}>
        {text}
      </p>
      {showMore && !expanded ? (
        <button className="more" type="button" onClick={() => setExpanded(true)}>
          더보기 &gt;
        </button>
      ) : null}
    </>
  );
}
