"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconClose, Rabbit } from "@/components/icons";
import { useStore } from "@/lib/store";
import { SKIN_CONCERNS, SKIN_TYPES, type SkinConcern, type SkinType } from "@/lib/types";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<PhoneShell />}>
      <OnboardingInner />
    </Suspense>
  );
}

function OnboardingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const edit = params.get("edit") === "1";
  const { hydrated, account, saveProfile, logout } = useStore();
  const [skin, setSkin] = useState<SkinType | null>(null);
  const [concerns, setConcerns] = useState<SkinConcern[]>([]);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) {
      router.replace("/login");
      return;
    }
    if (account.onboardingDone && !edit) router.replace("/home");
    if (account.skinType) setSkin(account.skinType);
    if (account.concerns.length) setConcerns(account.concerns);
  }, [hydrated, account, edit, router]);

  const canSubmit = !!skin && concerns.length > 0;
  const submit = async () => {
    if (!skin || !canSubmit) return;
    const ok = await saveProfile(skin, concerns);
    if (!ok) return;
    router.replace("/home");
  };

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <button className="x-btn" type="button" aria-label="닫기" onClick={() => (edit ? router.back() : setExit(true))}>
          <IconClose />
        </button>
        <div className="page-scroll onboard">
          <div className="onboard-hero">
            <Rabbit />
            <h1>피부 타입을 알려주세요</h1>
            <p>선택한 정보로 맞춤 랭킹과 리뷰를 보여드려요.</p>
          </div>
          <div className="field-label">피부 타입 (택 1)</div>
          <div className="chips types">
            {SKIN_TYPES.map((t) => (
              <button key={t} className={`chip${skin === t ? " on" : ""}`} type="button" onClick={() => setSkin(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="field-label">피부 고민 (중복 선택)</div>
          <div className="chips concerns">
            {SKIN_CONCERNS.map((t) => {
              const on = concerns.includes(t);
              return (
                <button
                  key={t}
                  className={`chip${on ? " on" : ""}`}
                  type="button"
                  onClick={() => setConcerns((c) => (on ? c.filter((x) => x !== t) : [...c, t]))}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <button className="btn-primary" type="button" disabled={!canSubmit} onClick={submit}>
            {edit ? "저장하기" : "선택하고 가입완료"}
          </button>
        </div>

        {exit ? (
          <div className="dim center">
            <div className="modal">
              <h2>
                잠깐만요! 정보를 입력해야
                <br />
                서비스를 이용할 수 있어요
              </h2>
              <div className="modal-btns">
                <button
                  className="sub"
                  type="button"
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                >
                  앱 종료
                </button>
                <button className="main" type="button" onClick={() => setExit(false)}>
                  계속 입력할게요
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}
