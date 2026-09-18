"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconBack } from "@/components/icons";
import { useStore } from "@/lib/store";
import { nicknameError } from "@/lib/nicknames";
import { nicknameTaken } from "@/lib/db";

export default function NicknamePage() {
  const router = useRouter();
  const { hydrated, account, updateNickname } = useStore();
  const [value, setValue] = useState("");
  const [hint, setHint] = useState<"ok" | "taken" | "bad" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (account.onboardingDone) router.replace("/home");
    else setValue(account.nickname);
  }, [hydrated, account, router]);

  useEffect(() => {
    if (!account) return;
    const v = value.trim();
    if (!v || v === account.nickname) {
      setHint(v && !nicknameError(v) ? "ok" : v ? "bad" : null);
      return;
    }
    const err = nicknameError(v);
    if (err) {
      setHint("bad");
      return;
    }
    const t = window.setTimeout(() => {
      void nicknameTaken(v, account.id).then((taken) => setHint(taken ? "taken" : "ok"));
    }, 250);
    return () => window.clearTimeout(t);
  }, [value, account]);

  const goSkin = () => router.replace("/onboarding");

  const submit = async () => {
    if (!account || busy) return;
    const v = value.trim() || account.nickname;
    if (nicknameError(v)) {
      setHint("bad");
      return;
    }
    if (v === account.nickname) {
      goSkin();
      return;
    }
    setBusy(true);
    const res = await updateNickname(v);
    setBusy(false);
    if (res === "taken") {
      setHint("taken");
      return;
    }
    if (res === "ok") goSkin();
  };

  if (!hydrated || !account) return <PhoneShell />;

  const disabled = hint === "bad" || hint === "taken";

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar">
          <button className="side" type="button" onClick={goSkin} aria-label="뒤로">
            <IconBack />
          </button>
          <span />
          <span />
        </div>
        <div className="nick-field">
          <h1 className="nick-title">
            VION에서 사용할
            <br />
            닉네임을 정해주세요.
          </h1>
          <div className="nick-wrap">
            <input
              className={hint === "ok" ? "ok" : hint === "bad" || hint === "taken" ? "bad" : ""}
              value={value}
              placeholder={account.nickname}
              onChange={(e) => setValue(e.target.value)}
            />
            {hint === "ok" ? <span className="nick-check">✓</span> : null}
          </div>
          {hint === "ok" ? <p className="msg ok">지금 설정하신 닉네임은 가능해요</p> : null}
          {hint === "taken" ? <p className="msg bad">이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해주세요</p> : null}
          {hint === "bad" ? (
            <p className="msg bad">닉네임은 한글, 영문, 숫자를 포함한 2~10자로 입력해주세요.(특수문자 및 공백 불가)</p>
          ) : null}
          <p className="nick-rule">희망하는 닉네임이 없으면 위의 닉네임으로 자동설정 됩니다.</p>
          <p className="nick-rule">한글, 영문, 숫자포함 2~10자 (특수문자 및 공백 불가)</p>
        </div>
        <div className="page-scroll" style={{ paddingTop: 12 }}>
          <button className="btn-primary" type="button" disabled={disabled || busy} onClick={submit}>
            확인
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}
