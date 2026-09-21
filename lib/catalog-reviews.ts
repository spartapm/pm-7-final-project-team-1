import type { Review, SkinConcern, SkinType } from "./types";
import raw from "./data/reviews.json";
import { localizeReviewPhotos } from "./review-photos";

const CONCERNS: SkinConcern[] = ["보습", "미백/잡티", "탄력/주름", "민감성", "모공", "피지/블랙헤드", "여드름"];
const TYPES: SkinType[] = ["건성", "중성", "지성", "복합성", "수부지"];

function asConcerns(list: string[]): SkinConcern[] {
  return list.filter((c): c is SkinConcern => (CONCERNS as string[]).includes(c));
}

export const CATALOG_REVIEWS: Review[] = (raw as Review[]).map((r) => ({
  ...r,
  skinType: (TYPES as string[]).includes(r.skinType) ? r.skinType : "복합성",
  concerns: asConcerns(r.concerns as unknown as string[]),
  photos: localizeReviewPhotos(r.photos),
}));
