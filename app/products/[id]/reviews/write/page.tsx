"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PhoneShell, Thumb } from "@/components/ui";
import { IconStar } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";
import { track } from "@/lib/analytics";
import { SKIN_CONCERNS } from "@/lib/types";
import { concernShort } from "@/lib/badges";
import { formatVolumePrice } from "@/lib/ranking";

const WRITE_TAGS = [...SKIN_CONCERNS.map(concernShort), "끈적임 적음", "촉촉함"];

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<PhoneShell />}>
      <WriteInner />
    </Suspense>
  );
}

function WriteInner() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const editId = params.get("edit");
  const router = useRouter();
  const { hydrated, account, reviews, upsertReview, showToast, myReviewFor } = useStore();
  const product = productById(id);
  const existing = reviews.find((r) => r.id === editId) ?? (account ? myReviewFor(id) : undefined);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [leave, setLeave] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  useEffect(() => {
    if (!existing) return;
    setRating(existing.rating);
    setText(existing.text);
    setPhotos(existing.photos);
    setTags(existing.tags ?? []);
  }, [existing?.id]);

  const rated = rating >= 1 && rating <= 5;
  const enabled = rated && tags.length >= 1;

  const onFiles = (files: FileList | null) => {
    if (!files || !rated) return;
    const left = 3 - photos.length;
    Array.from(files)
      .slice(0, left)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => setPhotos((p) => [...p, String(reader.result)].slice(0, 3));
        reader.readAsDataURL(file);
      });
  };

  const submit = async () => {
    if (!enabled || busy || !product) {
      if (rating < 1) showToast("별점을 입력해 주세요");
      else if (!tags.length) showToast("사용감 태그를 선택해 주세요");
      return;
    }
    setBusy(true);
    const saved = await upsertReview({
      id: existing?.id,
      productId: product.id,
      rating,
      text,
      photos,
      tags,
    });
    if (!saved) {
      setBusy(false);
      return;
    }
    showToast("리뷰가 등록되었습니다");
    track("write_review_complete", {
      item_id: product.id,
      rating,
      tag_list: [
        ...(account?.skinType ? [account.skinType] : []),
        ...(account?.concerns ?? []),
      ],
    });
    if (existing) router.replace("/reviews");
    else router.replace(`/products/${product.id}`);
  };

  if (!product) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar">
          <button className="side accent" type="button" onClick={() => setLeave(true)}>
            취소
          </button>
          <h1>{existing ? "리뷰 수정" : "리뷰 작성"}</h1>
          <span className="side" />
        </div>
        <div className="page-scroll write">
          <div className="write-product">
            <Thumb src={product.image} alt={product.name} />
            <div>
              <h3>
                {product.name} <span className="review-brand">{product.brand}</span>
              </h3>
              <p>{formatVolumePrice(product.volume, product.price)}</p>
            </div>
          </div>
          <div className="field-label">별점 (필수)</div>
          <div className="star-pick">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={rating >= n ? "on" : ""} type="button" onClick={() => setRating(n)}>
                <IconStar filled={rating >= n} size={28} />
              </button>
            ))}
          </div>
          <div className="field-label">사용감 (필수)</div>
          <div className="chips" style={{ flexWrap: "wrap", marginBottom: 16 }}>
            {WRITE_TAGS.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  className={`chip${on ? " on" : ""}`}
                  type="button"
                  onClick={() =>
                    setTags((prev) => {
                      if (on) return prev.filter((x) => x !== t);
                      if (prev.length >= 5) return prev;
                      return [...prev, t];
                    })
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="field-label">리뷰 내용 (선택 · 최대 1,000자)</div>
          <textarea
            value={text}
            maxLength={1000}
            disabled={!rated}
            placeholder="사용감, 피부 변화 등을 입력"
            onChange={(e) => setText(e.target.value)}
          />
          <div className="char-count">{text.length.toLocaleString("ko-KR")} / 1,000</div>
          <div className="field-label">사진 등록 (선택 · 최대 3장)</div>
          <div className="photos">
            {photos.map((src, i) => (
              <div key={i} className="photo-item thumb">
                <img src={src} alt="" />
                <button type="button" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}>
                  ×
                </button>
              </div>
            ))}
            {photos.length < 3 ? (
              <button className="photo-add" type="button" disabled={!rated} onClick={() => fileRef.current?.click()}>
                +
              </button>
            ) : null}
            {photos.length < 2 ? <span className="photo-add ghost" aria-hidden>+</span> : null}
            {photos.length < 1 ? <span className="photo-add ghost" aria-hidden>+</span> : null}
            <input
              ref={fileRef}
              className="hidden-file"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>
        </div>
        <div className="nick-cta">
          <button className="btn-primary" type="button" disabled={!enabled || busy} onClick={submit}>
            등록하기
          </button>
        </div>
        {leave ? (
          <div className="dim center">
            <div className="modal">
              <h2>잠깐만요!</h2>
              <p>
                리뷰 작성 화면을 나갈까요?
                <br />
                입력하신 내용은 저장되지 않습니다.
              </p>
              <div className="modal-btns">
                <button className="sub" type="button" onClick={() => setLeave(false)}>
                  계속하기
                </button>
                <button className="main" type="button" onClick={() => router.back()}>
                  나가기
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}
