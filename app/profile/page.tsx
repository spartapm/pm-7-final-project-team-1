"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, Stars, TabBar, Thumb } from "@/components/ui";
import { IconHeart } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";
import { formatPrice } from "@/lib/ranking";

export default function ProfilePage() {
  const router = useRouter();
  const { hydrated, account, wishlist, cart, reviews, viewed, logout, withdraw } = useStore();
  const [out, setOut] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/onboarding");
  }, [hydrated, account, router]);

  const wished = useMemo(
    () => wishlist.map((w) => productById(w.productId)).filter((p): p is NonNullable<typeof p> => !!p),
    [wishlist]
  );
  const mine = useMemo(
    () => reviews.filter((r) => r.accountId === account?.id),
    [reviews, account]
  );
  const recent = viewed.map(productById).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 5);

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="page-scroll">
          <div className="home-head">
            <h1>마이페이지</h1>
          </div>
          <div className="profile-card">
            <div className="avatar" />
            <div>
              <strong>{account.nickname}</strong>
              <div className="tags" style={{ padding: "6px 0 0" }}>
                {account.skinType ? <span className="tag">{account.skinType}</span> : null}
                {account.concerns.map((c) => (
                  <span className="tag" key={c}>
                    {c}
                  </span>
                ))}
              </div>
              <button className="skin-link" type="button" onClick={() => router.push("/onboarding?edit=1")}>
                피부 프로필 ›
              </button>
            </div>
          </div>

          <button className="menu-row" type="button" onClick={() => router.push("/cart")}>
            <span>장바구니</span>
            <span>{cart.reduce((n, c) => n + c.qty, 0)}개 ›</span>
          </button>

          <div className="section-label">최근 본 제품 · {recent.length}</div>
          <div className="viewed">
            {recent.map((p) => (
              <button key={p.id} type="button" onClick={() => router.push(`/products/${p.id}`)}>
                <Thumb src={p.image} alt={p.name} />
              </button>
            ))}
          </div>

          <div className="section-label">찜한 제품 · {wished.length}</div>
          <div className="wish-h">
            {wished.slice(0, 5).map((p) => (
              <button key={p.id} className="wish-card" type="button" onClick={() => router.push(`/products/${p.id}`)}>
                <div className="thumb" style={{ width: "100%", height: 100, borderRadius: 0, backgroundImage: `url("${p.image}")` }}>
                  <span className="heart"><IconHeart filled size={18} /></span>
                </div>
                <div className="body">
                  <h3>{p.name}</h3>
                  <p>{p.brand} · ★ {p.rating.toFixed(1)}</p>
                  <strong>{formatPrice(p.price)}</strong>
                </div>
              </button>
            ))}
          </div>

          <div className="section-label" style={{ marginTop: 18 }}>
            내가 쓴 리뷰 · {mine.length}
          </div>
          {mine.map((r) => {
            const p = productById(r.productId);
            return (
              <article key={r.id} className="my-review">
                <div className="row">
                  <h3>{p?.name}</h3>
                  <Stars value={r.rating} />
                </div>
                <p className="review-text">{r.text || "별점만 등록된 리뷰"}</p>
                <div className="row">
                  <span />
                  <button className="edit-link" type="button" onClick={() => router.push(`/products/${r.productId}/reviews/write?edit=${r.id}`)}>
                    수정
                  </button>
                </div>
              </article>
            );
          })}

          <button
            className="btn-ghost logout"
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            로그아웃
          </button>
          <button className="withdraw-link" type="button" onClick={() => setOut(true)}>
            회원 탈퇴
          </button>
        </div>
        <TabBar />

        {out ? (
          <div className="dim center" onClick={() => setOut(false)}>
            <div className="withdraw-box" onClick={(e) => e.stopPropagation()}>
              <h2>정말 탈퇴하실 건가요?</h2>
              <div className="del">탈퇴 시 삭제되는 데이터</div>
              <p>연동된 소셜 계정 정보</p>
              <div className="del">탈퇴 시 유지되는 데이터</div>
              <p>작성한 리뷰(닉네임 익명 처리),</p>
              <p>찜 통계(개인 연결 정보 삭제)</p>
              <button
                className="btn-primary"
                style={{ marginTop: 18 }}
                type="button"
                onClick={() => {
                  withdraw();
                  router.replace("/login");
                }}
              >
                모두 동의하고 탈퇴 희망합니다
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}
