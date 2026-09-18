"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconCheck, IconChevron, IconClose, IconGoogle, IconKakao, VionLogo } from "@/components/icons";
import { useStore } from "@/lib/store";
import type { Provider } from "@/lib/types";
import { track } from "@/lib/analytics";
import { peekOAuthProvider } from "@/lib/social-flow";
import { TERMS, type TermId } from "@/lib/terms";

const CHECK_KEY = "vion:terms-checks";

function readChecks(): Record<string, boolean> {
  try {
    return JSON.parse(sessionStorage.getItem(CHECK_KEY) ?? "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writeChecks(next: Record<string, boolean>) {
  sessionStorage.setItem(CHECK_KEY, JSON.stringify(next));
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { hydrated, account, startSocial, completeTermsAndJoin, cancelAuth, showToast } = useStore();
  const [sheet, setSheet] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [providerLabel, setProviderLabel] = useState("카카오");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (params.get("social") === "fail") showToast("소셜 로그인에 실패했어요. 다시 시도해주세요");
    if (account?.onboardingDone) {
      router.replace("/home");
      return;
    }
    if (account) {
      router.replace(account.skinType ? "/home" : "/onboarding/nickname");
      return;
    }
    if (params.get("terms") === "1") {
      const provider = peekOAuthProvider();
      setProviderLabel(provider === "google" ? "구글" : "카카오");
      const saved = readChecks();
      const mark = params.get("checked") as TermId | null;
      if (mark) saved[mark] = true;
      setChecks(saved);
      writeChecks(saved);
      const t = window.setTimeout(() => setSheet(true), 500);
      return () => window.clearTimeout(t);
    }
  }, [hydrated, account, router, params, showToast]);

  const allOn = TERMS.every((t) => checks[t.id]);
  const toggleAll = () => {
    const next = Object.fromEntries(TERMS.map((t) => [t.id, !allOn]));
    setChecks(next);
    writeChecks(next);
  };

  const closeSheet = () => {
    setSheet(false);
    setChecks({});
    writeChecks({});
    cancelAuth();
  };

  const afterAgree = async () => {
    if (!allOn || busy) return;
    setBusy(true);
    const method = providerLabel === "구글" ? "google" : "kakao";
    const ok = await completeTermsAndJoin();
    setBusy(false);
    if (!ok) return;
    track("sign_up", { method });
    writeChecks({});
    showToast("회원가입이 완료되었습니다");
    router.replace("/onboarding/nickname");
  };

  const onSocial = (provider: Provider) => {
    if (busy) return;
    setProviderLabel(provider === "kakao" ? "카카오" : "구글");
    startSocial(provider);
  };

  if (!hydrated) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="login">
          <div className="login-hero">
            <VionLogo className="logo" />
            <p>
              내 피부에 따라 달라지는
              <br />
              나만의 뷰티 랭킹
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
          </div>
        </div>

        {params.get("terms") === "1" && !sheet ? (
          <div className="terms-head">
            <h1>{providerLabel} 인증이 완료됐어요</h1>
            <p>서비스 이용을 위해 약관에 동의해주세요.</p>
          </div>
        ) : null}

        {sheet ? (
          <div className="dim">
            <div className="sheet" style={{ marginTop: "auto" }}>
              <div className="sheet-handle" />
              <div className="sheet-head">
                <h2>
                  VION을 이용하려면
                  <br />
                  약관 동의가 필요해요
                </h2>
                <button type="button" onClick={closeSheet} aria-label="닫기">
                  <IconClose />
                </button>
              </div>
              <button className="agree-all" type="button" onClick={toggleAll}>
                <IconCheck on={allOn} />
                약관 전체 동의
              </button>
              {TERMS.map((t) => (
                <div key={t.id} className="agree-row">
                  <button
                    className="left"
                    type="button"
                    onClick={() => {
                      const next = { ...checks, [t.id]: !checks[t.id] };
                      setChecks(next);
                      writeChecks(next);
                    }}
                  >
                    <IconCheck on={!!checks[t.id]} />
                    <span>
                      {t.label}
                      {"note" in t && t.note ? <small>{t.note}</small> : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="상세"
                    onClick={() => router.push(`/terms/${t.id}`)}
                  >
                    <IconChevron />
                  </button>
                </div>
              ))}
              <button className={`btn-primary${allOn ? "" : " off"}`} type="button" disabled={!allOn || busy} onClick={afterAgree}>
                동의하고 계속하기
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PhoneShell />}>
      <LoginInner />
    </Suspense>
  );
}
