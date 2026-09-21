"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, PhoneShell } from "@/components/ui";
import { IconBack, IconPen, IconStar } from "@/components/icons";
import { ProductFrame } from "@/components/product-frame";
import { ReviewPhotos } from "@/components/photo-lightbox";
import { useStore } from "@/lib/store";
import { formatShortDate, liveRating, matchedReviews } from "@/lib/ranking";
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

  const allPhotos = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const r of all) {
      for (const src of r.photos) {
        if (!src || seen.has(src)) continue;
        seen.add(src);
        out.push(src);
      }
    }
    return out;
  }, [all]);

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
  const avg = liveRating(all, product.rating);
  const avgStars = Math.round(avg);

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
        <div className="score-col">
          <p className="score-label">평균 평점</p>
          <p className="score-num">
            <strong>{avg.toFixed(1)}</strong>
            <em> / 5</em>
          </p>
          <span className="score-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <IconStar key={n} filled={n <= avgStars} size={12} />
            ))}
          </span>
          <span>리뷰 {all.length.toLocaleString("ko-KR")}</span>
        </div>
        {all.length > 0 ? (
          <div className="dist-h">
            {counts.map((n, i) => (
              <div key={5 - i} className="dist-row">
                <span>{5 - i}점</span>
                <i>
                  <b style={{ width: `${(n / all.length) * 100}%` }} />
                </i>
                <em>{n.toLocaleString("ko-KR")}</em>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {allPhotos.length ? (
        <div className="review-photo-strip" aria-label="제품 리뷰 사진">
          <ReviewPhotos photos={allPhotos} />
        </div>
      ) : null}
      <div className="review-head-row">
        <p>
          {mine ? (
            <>
              나와 같은 피부 타입을 가진
              <br />
              사용자들의 리뷰에요
            </>
          ) : (
            "전체 리뷰에요"
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

  return (
    <article className="review-card">
      <div className="review-user">
        <Avatar name={r.nickname} />
        <div className="review-user-main">
          <div className="review-user-top">
            <strong>{r.withdrawn ? "탈퇴한 회원의 리뷰입니다" : r.nickname}</strong>
            <div className="review-side">
              <span className="score-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <IconStar key={n} filled={n <= Math.round(r.rating)} size={12} />
                ))}
              </span>
              <span className="review-date">{formatShortDate(r.createdAt)}</span>
            </div>
          </div>
          <ReviewAuthorTags
            skinType={r.skinType}
            concerns={r.concerns}
            expanded={expanded}
            onToggle={r.concerns.length > 1 ? () => setExpanded((v) => !v) : undefined}
          />
        </div>
      </div>
      {r.text ? (
        <p ref={ref} className={`review-text${expanded ? "" : " clamp"}`}>
          {r.text}
        </p>
      ) : null}
      <div className="review-card-foot">
        <ReviewPhotos photos={r.photos} />
        {showMore && !expanded ? (
          <button className="more" type="button" onClick={() => setExpanded(true)}>
            더보기&gt;
          </button>
        ) : null}
        {expanded ? (
          <button className="more" type="button" onClick={() => setExpanded(false)}>
            닫기
          </button>
        ) : null}
      </div>
    </article>
  );
}
