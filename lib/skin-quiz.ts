import type { AgeGroup, SkinType } from "./types";

export const SKIN_BLURBS: Record<SkinType, string> = {
  건성: "수분과 유분 모두 부족한 피부",
  지성: "유분 분비가 많아 번들거리는 피부",
  중성: "유·수분 밸런스가 건강한 피부",
  복합성: "T존과 U존의 피부 타입이 다른 피부",
  수부지: "겉은 번들거리지만 속은 당기는 피부",
};

export const QUIZ = [
  {
    q: "세안 후 피부는 보통 어떤 느낌인가요?",
    a: ["많이 당기거나 건조하다", "편안하다", "금방 유분이 느껴진다"],
  },
  {
    q: "오후가 되면 얼굴의 유분은 어떤가요?",
    a: ["거의 없다", "이마·코 위주로 번들거린다", "얼굴 전체가 번들거린다"],
  },
  {
    q: "볼 부위는 평소 어떤 편인가요?",
    a: ["건조하거나 거칠다", "특별히 건조하거나 번들거리지 않는다", "유분이 많은 편이다"],
  },
  {
    q: "이마와 코(T존)는 어떤 편인가요?",
    a: ["건조한 편이다", "적당하다", "유분이 많은 편이다"],
  },
  {
    q: "피부가 번들거리는데도 속이 당기는 느낌이 있나요?",
    a: ["자주 있다", "가끔 있다", "거의 없다"],
  },
  {
    q: "피부에 각질이나 거친 느낌이 자주 생기나요?",
    a: ["자주 있다", "가끔 있다", "거의 없다"],
  },
  {
    q: "보습 제품을 바른 뒤에도 피부가 당기거나 금방 번들거리나요?",
    a: ["그래도 당긴다", "비교적 편안하다", "금방 번들거린다"],
  },
  {
    q: "이마·코와 볼의 피부 상태 차이가 큰가요?",
    a: ["차이가 크다", "약간 다르다", "거의 비슷하다"],
  },
] as const;

const SCORE: Array<Array<{ D?: number; O?: number; R?: number; H?: number }>> = [
  [{ D: 2 }, {}, { O: 2 }],
  [{}, { O: 1, R: 2 }, { O: 2 }],
  [{ D: 2 }, {}, { O: 2 }],
  [{ D: 1 }, {}, { O: 2 }],
  [{ O: 1, D: 1, H: 2 }, { H: 1 }, {}],
  [{ D: 2 }, { D: 1 }, {}],
  [{ D: 2 }, {}, { O: 2 }],
  [{ R: 2 }, { R: 1 }, {}],
];

export function diagnoseSkin(answers: number[]): SkinType {
  let D = 0;
  let O = 0;
  let R = 0;
  let H = 0;
  answers.forEach((choice, i) => {
    const add = SCORE[i][choice] ?? {};
    D += add.D ?? 0;
    O += add.O ?? 0;
    R += add.R ?? 0;
    H += add.H ?? 0;
  });
  if (R >= 3) return "복합성";
  if (R < 3 && H >= 2 && D >= 4 && O >= 4) return "수부지";
  if (R < 3 && D >= 4 && D - O >= 2) return "건성";
  if (R < 3 && O >= 4 && O - D >= 2) return "지성";
  return "중성";
}

export function ageGroupFromYear(year: number, now = new Date()): AgeGroup {
  const age = now.getFullYear() - year;
  if (age >= 40) return "40대 이상";
  if (age >= 30) return "30대";
  if (age >= 20) return "20대";
  return "10대";
}

export const BIRTH_YEARS = Array.from({ length: 2012 - 1950 + 1 }, (_, i) => 2012 - i);
