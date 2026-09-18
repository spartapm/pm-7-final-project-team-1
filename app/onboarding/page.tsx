"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconClose } from "@/components/icons";
import { useStore } from "@/lib/store";
import { GENDERS, SKIN_CONCERNS, SKIN_TYPES, type Gender, type SkinConcern, type SkinType } from "@/lib/types";
import { BIRTH_YEARS, QUIZ, SKIN_BLURBS, diagnoseSkin } from "@/lib/skin-quiz";
import { track } from "@/lib/analytics";
import { concernShort } from "@/lib/badges";

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
  const { hydrated, account, saveProfile } = useStore();
  const [gender, setGender] = useState<Gender | null>(null);
  const [year, setYear] = useState(1995);
  const [skin, setSkin] = useState<SkinType | "모르겠어요" | null>(null);
  const [concerns, setConcerns] = useState<SkinConcern[]>([]);
  const [answers, setAnswers] = useState<number[]>(Array(8).fill(-1));

  useEffect(() => {
    if (!hydrated) return;
    if (!account) {
      router.replace("/login");
      return;
    }
    if (account.onboardingDone && !edit) router.replace("/home");
    if (account.gender) setGender(account.gender);
    if (account.birthYear) setYear(account.birthYear);
    if (account.skinType) setSkin(account.skinType);
    if (account.concerns.length) setConcerns(account.concerns);
  }, [hydrated, account, edit, router]);

  useEffect(() => {
    if (skin !== "모르겠어요") return;
    if (answers.every((n) => n >= 0)) setSkin(diagnoseSkin(answers));
  }, [answers, skin]);

  const canSubmit = !!gender && !!skin && skin !== "모르겠어요" && concerns.length >= 1 && concerns.length <= 3;

  const submit = async () => {
    if (!gender || skin == null || skin === "모르겠어요") return;
    if (concerns.length < 1 || concerns.length > 3) return;
    const ok = await saveProfile({ skinType: skin, concerns, gender, birthYear: year });
    if (!ok) return;
    if (!edit) track("onboarding_complete", { skin_type: skin, skin_concern_list: concerns });
    router.replace("/home");
  };

  const toggleConcern = (c: SkinConcern) => {
    setConcerns((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      if (prev.length >= 3) return prev;
      return [...prev, c];
    });
  };

  if (!hydrated || !account) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        {edit ? (
          <div className="close-bar">
            <button
              className="close-bar-btn"
              type="button"
              aria-label="닫기"
              onClick={() => router.replace("/profile")}
            >
              <IconClose />
            </button>
          </div>
        ) : null}
        <div className="page-scroll onboard">
          <div className="onboard-hero">
            <h1>
              {account.nickname}님
              <br />
              반가워요!
            </h1>
            <p>
              현재 피부 상태에 맞게 정보를 {edit ? "수정" : "설정"}하면
              <br />더 잘 맞는 제품을 추천받을 수 있어요.
            </p>
          </div>
          <div className="field-label">성별</div>
          <div className="chips">
            {GENDERS.map((g) => (
              <button key={g} className={`chip${gender === g ? " on" : ""}`} type="button" onClick={() => setGender(g)}>
                {g}
              </button>
            ))}
          </div>
          <div className="field-label">나이</div>
          <select className="year-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {BIRTH_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="field-label strong">
            피부 타입
            {skin && skin !== "모르겠어요" ? <span className="field-blurb">{SKIN_BLURBS[skin]}</span> : null}
          </div>
          <div className="chips types">
            {SKIN_TYPES.map((t) => (
              <button key={t} className={`chip${skin === t ? " on" : ""}`} type="button" onClick={() => setSkin(t)}>
                {t}
              </button>
            ))}
            <button className={`chip muted${skin === "모르겠어요" ? " on" : ""}`} type="button" onClick={() => setSkin("모르겠어요")}>
              모르겠어요
            </button>
          </div>
          {skin === "모르겠어요" || answers.some((n) => n >= 0) ? (
            <div className="quiz">
              {QUIZ.map((item, qi) => (
                <div key={item.q}>
                  <p>
                    Q{qi + 1}. {item.q}
                  </p>
                  <div className="chips">
                    {item.a.map((label, ai) => (
                      <button
                        key={label}
                        className={`chip${answers[qi] === ai ? " on" : ""}`}
                        type="button"
                        onClick={() => {
                          setSkin("모르겠어요");
                          setAnswers((prev) => prev.map((n, i) => (i === qi ? ai : n)));
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="field-label strong">피부 고민 <span className="field-hint">(중복 선택 - 최대 3개)</span></div>
          <div className="chips concerns">
            {SKIN_CONCERNS.map((c) => (
              <button key={c} className={`chip${concerns.includes(c) ? " on" : ""}`} type="button" onClick={() => toggleConcern(c)}>
                {concernShort(c)}
              </button>
            ))}
          </div>
        </div>
        <div className="nick-cta">
          <button className="btn-primary" type="button" disabled={!canSubmit} onClick={submit}>
            {edit ? "저장하기" : "시작하기"}
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}
