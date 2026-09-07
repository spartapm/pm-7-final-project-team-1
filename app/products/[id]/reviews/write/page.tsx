"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PhoneShell, Thumb } from "@/components/ui";
import { IconStar } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";

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
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/onboarding");
  }, [hydrated, account, router]);

  useEffect(() => {
    if (!existing) return;
    setRating(existing.rating);
    setText(existing.text);
    setPhotos(existing.photos);
  }, [existing?.id]);

  const enabled = rating >= 1 && rating <= 5;

  const onFiles = (files: FileList | null) => {
    if (!files || !enabled) return;
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
      if (!enabled) showToast("별점을 입력해 주세요");
      return;
    }
    setBusy(true);
    const saved = await upsertReview({
      id: existing?.id,
      productId: product.id,
      rating,
      text,
      photos,
    });
    if (!saved) {
      setBusy(false);
      return;
    }
    showToast("리뷰가 등록 되었습니다");
    if (existing) router.replace("/profile");
    else router.replace(`/products/${product.id}/reviews`);
  };

  if (!product) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar">
          <button className="side" type="button" onClick={() => router.back()}>
            취소
          </button>
          <h1>{existing ? "리뷰 수정" : "리뷰 작성"}</h1>
          <span className="side" />
        </div>
        <div className="page-scroll write">
          <div className="write-product">
            <Thumb src={product.image} alt={product.name} />
            <div>
              <h3>{product.name}</h3>
              <p>{product.brand}</p>
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
          <div className="field-label">리뷰 내용 (선택 · 최대 1,000자)</div>
          <textarea
            value={text}
            maxLength={1000}
            disabled={!enabled}
            placeholder="사용감, 피부 변화 등을 입력"
            onChange={(e) => setText(e.target.value)}
          />
          <div className="char-count">{text.length}/1,000</div>
          <div className="field-label">사진 등록 (선택 · 최대 3장)</div>
          <div className="photos">
            {photos.map((src, i) => (
              <div key={i} className="photo-item thumb" style={{ backgroundImage: `url("${src}")` }}>
                <button type="button" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}>
                  ×
                </button>
              </div>
            ))}
            {photos.length < 3 ? (
              <button className="photo-add" type="button" disabled={!enabled} onClick={() => fileRef.current?.click()}>
                {photos.length}/3
              </button>
            ) : null}
            <input
              ref={fileRef}
              className="hidden-file"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>
          <button className="btn-primary soft" type="button" disabled={!enabled || busy} onClick={submit}>
            등록하기
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}
