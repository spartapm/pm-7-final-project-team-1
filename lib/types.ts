export const SKIN_TYPES = ["건성", "지성", "중성", "복합성", "수부지"] as const;
export const SKIN_CONCERNS = ["보습", "미백/잡티", "탄력/주름", "민감성", "모공", "피지/블랙헤드", "여드름"] as const;
export const CATEGORIES = ["토너", "크림", "클렌징폼"] as const;
export const AGE_GROUPS = ["10대", "20대", "30대", "40대 이상"] as const;
export const GENDERS = ["여성", "남성"] as const;
export const RANK_MODES = ["overall", "concern", "type", "age"] as const;
export const SORT_KEYS = ["match", "rating", "reviews"] as const;

export type SkinType = (typeof SKIN_TYPES)[number];
export type SkinConcern = (typeof SKIN_CONCERNS)[number];
export type Category = (typeof CATEGORIES)[number];
export type AgeGroup = (typeof AGE_GROUPS)[number];
export type Gender = (typeof GENDERS)[number];
export type RankMode = (typeof RANK_MODES)[number];
export type SortKey = (typeof SORT_KEYS)[number];
export type FitLevel = "적극 추천" | "추천" | "조건부 추천" | "주의";
export type Provider = "kakao" | "google";

export type PriceFilter = {
  min: number;
  max: number | null;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  volume: string;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  ageRank: Partial<Record<AgeGroup, number>>;
  typeFit: Partial<Record<SkinType, FitLevel>>;
  caution: Partial<Record<SkinType, number>>;
  concernFit: Partial<Record<SkinConcern, number>>;
  feelTags: string[];
  featureTags: string[];
  ingredients: string[];
  keyIngredients: string[];
  source: string;
};

export type Review = {
  id: string;
  productId: string;
  nickname: string;
  skinType: SkinType;
  concerns: SkinConcern[];
  rating: number;
  text: string;
  tags: string[];
  photos: string[];
  createdAt: number;
  purchased?: boolean;
  accountId?: string;
  withdrawn?: boolean;
};

export type WishlistItem = {
  productId: string;
  savedAt: number;
};

export type CartItem = {
  productId: string;
  qty: number;
  addedAt: number;
};

export type Account = {
  id: string;
  provider: Provider;
  nickname: string;
  gender: Gender | null;
  birthYear: number | null;
  skinType: SkinType | null;
  concerns: SkinConcern[];
  onboardingDone: boolean;
  termsAgreed: boolean;
  createdAt: number;
};

export type AppState = {
  accounts: Account[];
  currentId: string | null;
  loginAt: number | null;
  nicknameSeq: number;
  wishlist: WishlistItem[];
  cart: CartItem[];
  reviews: Review[];
  viewed: string[];
  pendingProvider: Provider | null;
  termsPending: boolean;
};
