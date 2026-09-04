export const SKIN_TYPES = ["건성", "중성", "지성", "복합성", "수부지"] as const;
export const SKIN_CONCERNS = ["수분/보습", "트러블/진정"] as const;
export const CATEGORIES = ["크림", "스킨/토너", "클렌징 폼"] as const;

export type SkinType = (typeof SKIN_TYPES)[number];
export type SkinConcern = (typeof SKIN_CONCERNS)[number];
export type Category = (typeof CATEGORIES)[number];
export type SortKey = "match" | "rating" | "reviews";
export type PriceRange = "all" | "under30" | "30to50" | "over50";
export type Provider = "kakao" | "google";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  detailImage?: string;
  skinTypes: SkinType[];
  concerns: SkinConcern[];
  fit: number;
  ingredients: string[];
};

export type Review = {
  id: string;
  productId: string;
  nickname: string;
  skinType: SkinType;
  concerns: SkinConcern[];
  rating: number;
  text: string;
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

export type Account = {
  id: string;
  provider: Provider;
  nickname: string;
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
  reviews: Review[];
  viewed: string[];
  pendingProvider: Provider | null;
  termsPending: boolean;
};
