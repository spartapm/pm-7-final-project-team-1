"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconCheck, IconClose, IconGoogle, IconKakao, LogoMark } from "@/components/icons";
import { useStore } from "@/lib/store";
import type { Provider } from "@/lib/types";

const TERMS = [
  { id: "service", label: "(필수) 서비스 이용약관 동의" },
  { id: "privacy", label: "(필수) 개인정보 수집 및 이용 동의" },
  { id: "skin", label: "(필수) 피부 정보 수집·이용 동의" },
  { id: "age", label: "(필수) 만 14세 이상이에요", note: "만 14세 미만은 가입이 제한돼요." },
];

export default function LoginPage() {
  const router = useRouter();
  const { hydrated, account, startSocial, completeTermsAndJoin, beginSignup, cancelAuth, showToast } = useStore();
  const [sheet, setSheet] = useState<"signup" | "after-social" | "pick" | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [providerLabel, setProviderLabel] = useState("카카오");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (account?.onboardingDone) router.replace("/home");
    else if (account) router.replace("/onboarding");
  }, [hydrated, account, router]);

  const allOn = TERMS.every((t) => checks[t.id]);
  const toggleAll = () => {
    const next = !allOn;
    setChecks(Object.fromEntries(TERMS.map((t) => [t.id, next])));
  };

  const closeSheet = () => {
    setSheet(null);
    setChecks({});
    cancelAuth();
  };

  const afterAgree = async () => {
    if (!allOn || busy) return;
    if (sheet === "signup") {
      beginSignup();
      setSheet("pick");
      return;
    }
    setBusy(true);
    const ok = await completeTermsAndJoin();
    setBusy(false);
    if (!ok) return;
    showToast("회원가입이 완료되었습니다");
    router.replace("/onboarding");
  };

  const onSocial = async (provider: Provider) => {
    if (busy) return;
    setProviderLabel(provider === "kakao" ? "카카오" : "구글");
    setBusy(true);
    const result = await startSocial(provider);
    setBusy(false);
    if (result.kind === "login") {
      showToast(result.isNew ? "회원가입이 완료되었습니다" : "로그인되었어요");
      return;
    }
    setChecks({});
    setSheet("after-social");
  };

  if (!hydrated) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="login">
          <div className="login-hero">
            <LogoMark className="logo" color="#E7A3B4" />
            <h1>ONE&BEAUTY</h1>
            <p>
              성분부터 리뷰까지,
              <br />
              나에게 맞는 발견
            </p>
          </div>
          <div className="login-actions">
            <button className="btn-kakao" type="button" disabled={busy} onClick={() => onSocial("kakao")}>
              <IconKakao />
              카카오로 시작하기
            </button>
            <button className="btn-google" type="button" disabled={busy} onClick={() => onSocial("google")}>
              <IconGoogle />
              구글로 시작하기
            </button>
            <button className="link-signup" type="button" onClick={() => { setChecks({}); setSheet("signup"); }}>
              회원가입
            </button>
          </div>
        </div>

        {sheet ? (
          <div className="dim">
            <button className="x-btn light" type="button" onClick={closeSheet} aria-label="닫기">
              <IconClose />
            </button>
            {sheet === "after-social" ? (
              <div className="terms-head">
                <h1>{providerLabel} 인증이 완료됐어요</h1>
                <p>서비스 이용을 위해 약관에 동의해주세요.</p>
              </div>
            ) : null}
            <div className="sheet" style={{ marginTop: "auto" }}>
              <div className="sheet-handle" />
              {sheet === "pick" ? (
                <>
                  <h2>
                    가입할 계정을
                    <br />
                    선택해 주세요
                  </h2>
                  <button className="btn-kakao" type="button" disabled={busy} onClick={() => onSocial("kakao")}>
                    <IconKakao />
                    카카오로 시작하기
                  </button>
                  <div style={{ height: 10 }} />
                  <button className="btn-google" type="button" disabled={busy} onClick={() => onSocial("google")}>
                    <IconGoogle />
                    구글로 시작하기
                  </button>
                </>
              ) : (
                <>
                  <h2>
                    ONE&BEAUTY를 이용하려면
                    <br />
                    약관 동의가 필요해요
                  </h2>
                  <button className="agree-all" type="button" onClick={toggleAll}>
                    <IconCheck on={allOn} />
                    약관 전체 동의
                  </button>
                  {TERMS.map((t) => (
                    <button
                      key={t.id}
                      className="agree-row"
                      type="button"
                      onClick={() => setChecks((c) => ({ ...c, [t.id]: !c[t.id] }))}
                    >
                      <IconCheck on={!!checks[t.id]} />
                      <span>
                        {t.label}
                        {t.note ? <small>{t.note}</small> : null}
                      </span>
                    </button>
                  ))}
                  <button className={`btn-primary${allOn ? "" : " off"}`} type="button" disabled={!allOn || busy} onClick={afterAgree}>
                    동의하고 계속하기
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}
