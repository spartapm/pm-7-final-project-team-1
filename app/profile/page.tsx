"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, PhoneShell, TabBar } from "@/components/ui";
import { IconBadgeCheck, IconCart, IconChevron, IconClock, IconHeart, IconMessageMore, IconSquarePen } from "@/components/icons";
import { useStore } from "@/lib/store";
import { concernShort } from "@/lib/badges";

export default function ProfilePage() {
  const router = useRouter();
  const { hydrated, account, logout, withdraw, viewed, cart, wishlist, reviews } = useStore();
  const [out, setOut] = useState(false);
  const [bye, setBye] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  const myReviewCount = reviews.filter((r) => r.accountId === account.id).length;

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="page-scroll profile-scroll">
          <div className="home-head">
            <h1>마이페이지</h1>
          </div>
          <div className="profile-card">
            <Avatar name={account.nickname} />
            <div className="profile-meta">
              <div className="name-row">
                <strong>{account.nickname}</strong>
                <button className="edit-link" type="button" onClick={() => router.push("/profile/edit")}>
                  프로필 수정
                  <IconChevron />
                </button>
              </div>
              <div className="tags">
                {account.skinType ? <span className="tag skin">{account.skinType}</span> : null}
                {account.concerns.map((c) => (
                  <span className="tag skin" key={c}>
                    {concernShort(c)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="section-label">기록</div>
          <div className="menu-card">
            <button className="menu-row" type="button" onClick={() => router.push("/recent")}>
              <span className="menu-left">
                <IconClock size={20} />
                최근 본 제품
              </span>
              <span className="menu-right">
                {viewed.length} <i>›</i>
              </span>
            </button>
            <button className="menu-row" type="button" onClick={() => router.push("/cart")}>
              <span className="menu-left">
                <IconCart size={20} />
                장바구니
              </span>
              <span className="menu-right">
                {cart.length} <i>›</i>
              </span>
            </button>
            <button className="menu-row" type="button" onClick={() => router.push("/wishlist")}>
              <span className="menu-left">
                <IconHeart size={20} />
                찜한 제품
              </span>
              <span className="menu-right">
                {wishlist.length} <i>›</i>
              </span>
            </button>
            <button className="menu-row" type="button" onClick={() => router.push("/reviews")}>
              <span className="menu-left">
                <IconMessageMore size={20} />
                내가 쓴 리뷰
              </span>
              <span className="menu-right">
                {myReviewCount} <i>›</i>
              </span>
            </button>
          </div>
          <div className="section-label">활동</div>
          <div className="menu-card">
            <button className="menu-row" type="button" onClick={() => router.push("/onboarding?edit=1")}>
              <span className="menu-left">
                <IconBadgeCheck />
                피부 진단 수정
              </span>
              <span className="menu-right"><i>›</i></span>
            </button>
            <button className="menu-row" type="button" onClick={() => router.push("/reviews/write")}>
              <span className="menu-left">
                <IconSquarePen size={20} />
                리뷰 작성
              </span>
              <span className="menu-right"><i>›</i></span>
            </button>
          </div>
          <button
            className="logout-pill"
            type="button"
            onClick={() => setBye(true)}
          >
            로그아웃
          </button>
          <button className="withdraw-link" type="button" onClick={() => setOut(true)}>
            회원 탈퇴
          </button>
        </div>
        <TabBar />

        {bye ? (
          <div className="dim center" onClick={() => setBye(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>로그아웃 하시겠어요?</h2>
              <p>다시 로그인을 하려면 소셜 인증이 필요해요</p>
              <div className="modal-btns">
                <button
                  className="sub"
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.replace("/login");
                  }}
                >
                  로그아웃
                </button>
                <button className="main" type="button" onClick={() => setBye(false)}>
                  괜찮아요
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {out ? (
          <div className="dim center" onClick={() => setOut(false)}>
            <div className="withdraw-box" onClick={(e) => e.stopPropagation()}>
              <h2>정말 탈퇴하실 건가요?</h2>
              <div className="del">탈퇴 시 삭제되는 데이터</div>
              <p>연동된 소셜 로그인 정보</p>
              <div className="del">탈퇴 시 유지되는 데이터</div>
              <p>작성한 리뷰(닉네임 익명 처리)</p>
              <p>찜 통계(개인 연결 정보 삭제)</p>
              <button
                className="btn-primary"
                style={{ marginTop: 18 }}
                type="button"
                onClick={async () => {
                  const ok = await withdraw();
                  if (!ok) return;
                  router.replace("/login");
                }}
              >
                모두 동의하고 탈퇴를 희망합니다.
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}
