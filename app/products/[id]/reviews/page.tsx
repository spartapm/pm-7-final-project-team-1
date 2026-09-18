"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, PhoneShell } from "@/components/ui";
import { IconBack, IconPen } from "@/components/icons";
import { ProductFrame } from "@/components/product-frame";
import { ReviewPhotos } from "@/components/photo-lightbox";
import { useStore } from "@/lib/store";
import { formatDate, liveRating, matchedReviews } from "@/lib/ranking";
import { ReviewAuthorTags } from "@/lib/badges";
import { productById } from "@/lib/products";
import { track } from "@/lib/analytics";
import type { Review } from "@/lib/types";

export default function ReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, account, reviews, showToast } = useStore();
  const [mine, setMine] = useState(true);
  const product = productById(id);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  const all = useMemo(
    () => reviews.filter((r) => r.productId === id).sort((a, b) => b.createdAt - a.createdAt),
    [reviews, id]
  );

  const list = useMemo(() => {
    if (!mine || !account) return all;
    return matchedReviews(all, account.skinType, account.concerns);
  }, [all, mine, account]);

  useEffect(() => {
    if (!hydrated || !account || !mine) return;
    const matched = matchedReviews(all, account.skinType, account.concerns);
    if (all.length > 0 && matched.length === 0) {
      showToast("내 피부와 일치하는 리뷰가 없어요");
      setMine(false);
    }
  }, [hydrated, account, all, mine, showToast]);

  if (!hydrated || !product) {
    return (
      <PhoneShell>
        <div className="page">
          <div className="close-bar">
            <button className="close-bar-btn" type="button" onClick={() => router.back()} aria-label="뒤로">
              <IconBack />
            </button>
          </div>
        </div>
      </PhoneShell>
    );
  }

  const counts = [5, 4, 3, 2, 1].map((n) => all.filter((r) => r.rating === n).length);
  const max = Math.max(1, ...counts);

  return (
    <ProductFrame
      product={product}
      tab="reviews"
      overlay={
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
      }
    >
      <div className="review-score">
        <div>
          <p className="score-label">평균 평점</p>
          <strong>{liveRating(all, product.rating).toFixed(1)} / 5</strong>
          <span>리뷰 {all.length.toLocaleString("ko-KR")}</span>
        </div>
        <div className="dist-h">
          {counts.map((n, i) => (
            <div key={5 - i} className="dist-row">
              <span>{5 - i}점</span>
              <i>
                <b style={{ width: `${Math.max(6, (n / max) * 100)}%` }} />
              </i>
              <em>{n}</em>
            </div>
          ))}
        </div>
      </div>
      <div className="review-head-row">
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
          {mine ? (
            <>
              나와 같은 피부 타입을 가진
              <br />
              사용자들의 리뷰예요
            </>
          ) : (
            "전체 리뷰예요"
          )}
        </p>
        <div className="toggle-inline">
          내 타입만 보기
          <button className={`toggle${mine ? " on" : ""}`} type="button" onClick={() => setMine((v) => !v)} aria-label="내 타입만 보기">
            <i />
          </button>
        </div>
      </div>
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
        {list.map((r) => (
          <ReviewCard key={r.id} r={r} />
        ))}
      </div>
    </ProductFrame>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const [showMore, setShowMore] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    setShowMore(el.scrollHeight - el.clientHeight > 1);
  }, [r.text, expanded]);

  const tagsOpen = expanded || !showMore;

  return (
    <article className="review-card">
      <div className="review-user">
        <Avatar name={r.nickname} />
        <div>
          <strong>{r.withdrawn ? "탈퇴한 회원의 리뷰입니다" : r.nickname}</strong>
          <ReviewAuthorTags skinType={r.skinType} concerns={r.concerns} expanded={tagsOpen} />
          <div className="review-meta">
            ★ {r.rating.toFixed(1)}
            <span>{formatDate(r.createdAt)}</span>
            {r.purchased ? <span className="badge">구매리뷰</span> : null}
          </div>
        </div>
      </div>
      {r.text ? (
        <>
          <p ref={ref} className={`review-text${expanded ? "" : " clamp"}`}>
            {r.text}
          </p>
          {showMore && !expanded ? (
            <button className="more" type="button" onClick={() => setExpanded(true)}>
              더보기 &gt;
            </button>
          ) : null}
          {expanded ? (
            <button className="more" type="button" onClick={() => setExpanded(false)}>
              닫기
            </button>
          ) : null}
        </>
      ) : null}
      <ReviewPhotos photos={r.photos} />
    </article>
  );
}
