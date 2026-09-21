import type { Category, RankMode } from "./types";

export const BANNERS = [
  {
    src: "/vion/banners/banner-1.png",
    href: "/ranking?mode=age",
    alt: "20대가 가장 많이 찾는 제품. 토너 크림 클렌징폼 내 피부에 맞는 것만 골라 드려요.",
  },
  {
    src: "/vion/banners/banner-2.png",
    href: "/ranking",
    alt: "보습이 필요할 때. 피부 보습에 도움을 주는 제품을 모았어요.",
  },
  {
    src: "/vion/banners/banner-3.png",
    href: "/ranking?mode=concern",
    alt: "복합성 피부가 많이 찾는 제품. 유분과 건조함을 함께 고려해 추천해요.",
  },
];

export const FEEL_TAGS = [
  "가벼움",
  "수분감",
  "꾸덕함",
  "빠른 흡수",
  "산뜻함",
  "촉촉함",
  "보송함",
  "윤광",
  "끈적임 적음",
  "무향",
  "향료 무자극",
  "쿨링감",
  "열감 없음",
  "흡수",
  "매끈한 피부결",
  "광채",
  "발림성",
  "겉돌지 않음",
  "저자극",
  "적은 유분감",
  "쫀쫀함",
  "순한 사용감",
];

export const CATEGORY_IMAGE: Record<Category, string> = {
  토너: "/vion/cats/toner.png",
  크림: "/vion/cats/cream.png",
  클렌징폼: "/vion/cats/foam.png",
};

export const RANK_LABEL: Record<RankMode, string> = {
  overall: "종합 맞춤 랭킹",
  concern: "나의 피부 고민 맞춤 랭킹",
  type: "피부 타입 추천 랭킹",
  age: "나이대 추천 랭킹",
};

export function rankModeCopy(mode: RankMode, skin: string, age: string) {
  if (mode === "overall") {
    return { title: "종합 맞춤 랭킹", desc: "내 피부 타입과 고민을 모두 반영한 랭킹" };
  }
  if (mode === "type") {
    return { title: `${skin} 피부 추천 랭킹`, desc: `내 피부 타입(${skin})에 잘 맞는 제품` };
  }
  if (mode === "concern") {
    return { title: "나의 피부 고민 맞춤 랭킹", desc: "내 피부 고민에 잘 맞는 제품" };
  }
  return { title: `${age} 추천 랭킹`, desc: `내 나이대(${age})에 추천하는 제품` };
}

export const RANK_HELP = [
  { title: "내 피부 조건을 확인해요", desc: "피부 타입과 피부 고민을 기준으로 필요한 기능을 정합니다." },
  { title: "제품의 전성분을 분석해요", desc: "제품에 포함된 성분을 수분, 장벽, 진정 등 기능별로 분류합니다." },
  { title: "같은 기준으로 제품을 비교해요", desc: "동일 제품군의 모든 제품을 같은 기준으로 비교합니다." },
  { title: "나에게 더 적합한 제품부터 보여줘요", desc: "비교 결과를 바탕으로 토너, 크림, 클렌징폼 각각의 나의 맞춤 랭킹을 제공합니다." },
];

const TYPE_FEEL: Record<string, string[]> = {
  건성: ["촉촉함", "수분감", "쫀쫀함"],
  지성: ["산뜻함", "보송함", "끈적임 적음"],
  복합성: ["수분감", "산뜻함", "끈적임 적음"],
  수부지: ["수분감", "가벼움", "빠른 흡수", "끈적임 적음"],
  중성: ["순한 사용감", "촉촉함", "산뜻함"],
};

export function preferredFeel(skin: string) {
  return TYPE_FEEL[skin] ?? [];
}

export function rankingUpdatedLabel() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay();
  const hour = kst.getUTCHours();
  const daysBack = day === 3 && hour >= 5 ? 0 : (day + 4) % 7 || 7;
  const wed = new Date(kst);
  wed.setUTCDate(kst.getUTCDate() - daysBack);
  if (day === 3 && hour < 5) wed.setUTCDate(kst.getUTCDate() - 7);
  const y = wed.getUTCFullYear();
  const m = String(wed.getUTCMonth() + 1).padStart(2, "0");
  const d = String(wed.getUTCDate()).padStart(2, "0");
  return `업데이트 ${y}.${m}.${d}`;
}
