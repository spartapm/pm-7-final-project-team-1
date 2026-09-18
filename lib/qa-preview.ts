import type { Account, CartItem, Review, WishlistItem } from "./types";

export const QA_USER_ID = "qa-local";

export function isLocalHost() {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

export function isQaAccount(id: string | null | undefined) {
  return id === QA_USER_ID;
}

type Preview = {
  account: Account;
  wishlist: WishlistItem[];
  cart: CartItem[];
  viewed: string[];
  reviews: Review[];
};

function qaReviews(nickname: string): Review[] {
  const base = {
    nickname,
    skinType: "복합성" as const,
    concerns: ["보습", "여드름"] as Review["concerns"],
    text: "촉촉해서 만족스러워요.",
    tags: ["촉촉함"],
    photos: [] as string[],
    accountId: QA_USER_ID,
  };
  return [
    { ...base, id: "qa-review-31", productId: "31", rating: 4, createdAt: new Date(2026, 3, 12).getTime() },
    { ...base, id: "qa-review-23", productId: "23", rating: 4, createdAt: new Date(2026, 3, 11).getTime() },
    { ...base, id: "qa-review-82", productId: "82", rating: 4, createdAt: new Date(2026, 3, 9).getTime() },
  ];
}

export function readLocalPreview(): Preview | null {
  if (typeof window === "undefined" || !isLocalHost()) return null;
  const params = new URLSearchParams(location.search);
  const q = params.get("qa");
  if (q) sessionStorage.setItem("vion:qa", q);
  const mode = q || sessionStorage.getItem("vion:qa");
  if (!mode || mode === "0") return null;

  const done = mode !== "lock" && mode !== "nick";
  const account: Account = {
    id: QA_USER_ID,
    provider: "kakao",
    nickname: "용감한거북이3764",
    gender: done ? "여성" : null,
    birthYear: done ? 2001 : null,
    skinType: done ? "복합성" : null,
    concerns: done ? ["보습", "여드름"] : [],
    onboardingDone: done,
    termsAgreed: true,
    createdAt: Date.now(),
  };
  const seed = mode === "full";
  return {
    account,
    wishlist: seed
      ? [
          { productId: "31", savedAt: Date.now() },
          { productId: "23", savedAt: Date.now() - 1 },
          { productId: "1", savedAt: Date.now() - 2 },
          { productId: "56", savedAt: Date.now() - 3 },
          { productId: "82", savedAt: Date.now() - 4 },
        ]
      : [],
    cart: seed ? [{ productId: "1", qty: 1, addedAt: Date.now() }] : [],
    viewed: seed ? ["1"] : [],
    reviews: seed ? qaReviews(account.nickname) : [],
  };
}
