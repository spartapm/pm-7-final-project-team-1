export const NICK_ANIMALS = [
  "거북이",
  "사자",
  "고양이",
  "강아지",
  "토끼",
  "여우",
  "판다",
  "호랑이",
  "코알라",
  "다람쥐",
  "부엉이",
  "고슴도치",
  "수달",
  "펭귄",
  "알파카",
  "오리",
  "병아리",
  "고래",
  "문어",
  "나비",
  "벌새",
  "곰돌이",
  "라쿤",
  "하마",
  "기린",
  "얼룩말",
  "두더지",
  "앵무새",
  "해달",
  "물개",
] as const;

export const NICK_ADJECTIVES = [
  "용감한",
  "활발한",
  "조용한",
  "엉뚱한",
  "소심한",
  "차분한",
  "상냥한",
  "씩씩한",
  "포근한",
  "밝은",
  "느긋한",
  "재빠른",
  "다정한",
  "즐거운",
  "신비한",
  "따뜻한",
  "총명한",
  "부드러운",
  "당찬",
  "귀여운",
];

export const NICK_RULE = /^[가-힣a-zA-Z0-9]{2,10}$/;

export function suggestNickname() {
  const adj = NICK_ADJECTIVES[Math.floor(Math.random() * NICK_ADJECTIVES.length)];
  const animal = NICK_ANIMALS[Math.floor(Math.random() * NICK_ANIMALS.length)];
  const n = String(Math.floor(1000 + Math.random() * 9000));
  return `${adj}${animal}${n}`;
}

export function nicknameError(value: string) {
  if (!value) return null;
  if (!NICK_RULE.test(value)) {
    return "닉네임은 한글, 영문, 숫자를 포함한 2~10자로 입력해주세요.(특수문자 및 공백 불가)";
  }
  return null;
}

export function animalFromNickname(nick: string) {
  return NICK_ANIMALS.find((a) => nick.includes(a)) ?? "거북이";
}

export function avatarSrc(nick?: string) {
  return `/vion/avatars/${animalFromNickname(nick ?? "")}.png`;
}
