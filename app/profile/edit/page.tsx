"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconBack } from "@/components/icons";
import { useStore } from "@/lib/store";
import { nicknameError } from "@/lib/nicknames";
import { nicknameTaken } from "@/lib/db";

export default function ProfileEditPage() {
  const router = useRouter();
  const { hydrated, account, updateNickname } = useStore();
  const [value, setValue] = useState("");
  const [hint, setHint] = useState<"ok" | "taken" | "bad" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
    else setValue(account.nickname);
  }, [hydrated, account, router]);

  useEffect(() => {
    if (!account) return;
    const v = value.trim();
    if (!v) {
      setHint("bad");
      return;
    }
    if (nicknameError(v)) {
      setHint("bad");
      return;
    }
    if (v === account.nickname) {
      setHint("ok");
      return;
    }
    const t = window.setTimeout(() => {
      void nicknameTaken(v, account.id).then((taken) => setHint(taken ? "taken" : "ok"));
    }, 250);
    return () => window.clearTimeout(t);
  }, [value, account]);

  if (!hydrated || !account) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>프로필 수정</h1>
          <span />
        </div>
        <div className="page-scroll">
          <div className="field-label">아이디</div>
            <input className="year-select" value={account.provider === "google" ? "구글 계정" : "카카오 계정"} disabled />
          <div className="nick-field" style={{ margin: "16px 0" }}>
            <div className="field-label">닉네임</div>
            <input className={hint === "ok" ? "ok" : hint === "bad" || hint === "taken" ? "bad" : ""} value={value} onChange={(e) => setValue(e.target.value)} />
            <p className="nick-rule">한글, 영문, 숫자포함 2~10자(특수문자 및 공백 불가)</p>
          </div>
          <button
            className="btn-primary"
            type="button"
            disabled={hint !== "ok" || busy}
            onClick={async () => {
              setBusy(true);
              const res = await updateNickname(value.trim());
              setBusy(false);
              if (res === "ok") router.back();
              if (res === "taken") setHint("taken");
            }}
          >
            저장
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}
