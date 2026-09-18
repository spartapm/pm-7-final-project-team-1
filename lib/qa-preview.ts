import type { Account, CartItem, WishlistItem } from "./types";

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
};

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
    birthYear: done ? 1995 : null,
    skinType: done ? "복합성" : null,
    concerns: done ? ["보습", "여드름"] : [],
    onboardingDone: done,
    termsAgreed: true,
    createdAt: Date.now(),
  };
  const seed = mode === "full";
  return {
    account,
    wishlist: seed ? [{ productId: "1", savedAt: Date.now() }] : [],
    cart: seed ? [{ productId: "1", qty: 1, addedAt: Date.now() }] : [],
    viewed: seed ? ["1"] : [],
  };
}
