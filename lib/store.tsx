"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SEED_REVIEWS } from "./products";
import { uid } from "./ranking";
import type {
  Account,
  AppState,
  Provider,
  Review,
  SkinConcern,
  SkinType,
} from "./types";

const CART_MAX = 10;

const KEY = "onebeauty:v1";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function empty(): AppState {
  return {
    accounts: [],
    currentId: null,
    loginAt: null,
    nicknameSeq: 1000,
    wishlist: [],
    cart: [],
    reviews: SEED_REVIEWS,
    viewed: [],
    pendingProvider: null,
    termsPending: false,
  };
}

function load(): AppState {
  const fallback = empty();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as AppState;
    const next: AppState = {
      ...fallback,
      ...parsed,
      reviews: parsed.reviews?.length ? parsed.reviews : SEED_REVIEWS,
      cart: parsed.cart ?? [],
    };
    if (next.currentId && next.loginAt && Date.now() - next.loginAt > SESSION_MS) {
      next.currentId = null;
      next.loginAt = null;
    }
    return next;
  } catch {
    return fallback;
  }
}

type Store = AppState & {
  hydrated: boolean;
  account: Account | null;
  toast: string | null;
  showToast: (msg: string) => void;
  startSocial: (provider: Provider) => { kind: "login" | "terms"; isNew?: boolean };
  completeTermsAndJoin: () => void;
  beginSignup: () => void;
  cancelAuth: () => void;
  saveProfile: (skinType: SkinType, concerns: SkinConcern[]) => void;
  logout: () => void;
  withdraw: () => void;
  toggleWish: (productId: string) => boolean;
  isWished: (productId: string) => boolean;
  addToCart: (productId: string) => { ok: boolean; qty: number; existed: boolean };
  setCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  addView: (productId: string) => void;
  upsertReview: (review: Omit<Review, "id" | "createdAt" | "nickname" | "skinType" | "concerns" | "accountId"> & { id?: string }) => Review | null;
  myReviewFor: (productId: string) => Review | undefined;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(empty);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const wishBusy = useRef(false);
  const cartBusy = useRef(false);
  const reviewBusy = useRef(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const account = useMemo(
    () => state.accounts.find((a) => a.id === state.currentId) ?? null,
    [state.accounts, state.currentId]
  );

  const startSocial = useCallback((provider: Provider): { kind: "login" | "terms"; isNew?: boolean } => {
    let kind: "login" | "terms" = "terms";
    let isNew = false;
    setState((s) => {
      const existing = s.accounts.find((a) => a.provider === provider);
      if (existing) {
        kind = "login";
        isNew = false;
        return {
          ...s,
          currentId: existing.id,
          loginAt: Date.now(),
          pendingProvider: null,
          termsPending: false,
        };
      }
      if (s.termsPending) {
        kind = "login";
        isNew = true;
        return createAccount(s, provider);
      }
      kind = "terms";
      return { ...s, pendingProvider: provider };
    });
    return { kind, isNew };
  }, []);

  const completeTermsAndJoin = useCallback(() => {
    setState((s) => createAccount(s, s.pendingProvider ?? "kakao"));
  }, []);

  const beginSignup = useCallback(() => {
    setState((s) => ({ ...s, pendingProvider: null, termsPending: true }));
  }, []);

  const cancelAuth = useCallback(() => {
    setState((s) => ({ ...s, pendingProvider: null, termsPending: false }));
  }, []);

  const saveProfile = useCallback((skinType: SkinType, concerns: SkinConcern[]) => {
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) =>
        a.id === s.currentId ? { ...a, skinType, concerns, onboardingDone: true } : a
      ),
    }));
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentId: null, loginAt: null, pendingProvider: null, termsPending: false }));
  }, []);

  const withdraw = useCallback(() => {
    setState((s) => {
      const id = s.currentId;
      return {
        ...s,
        accounts: s.accounts.filter((a) => a.id !== id),
        currentId: null,
        loginAt: null,
        reviews: s.reviews.map((r) =>
          r.accountId === id
            ? { ...r, nickname: "탈퇴한 회원의 리뷰 입니다", withdrawn: true, accountId: undefined }
            : r
        ),
        wishlist: [],
        cart: [],
        viewed: [],
      };
    });
  }, []);

  const toggleWish = useCallback(
    (productId: string) => {
      if (wishBusy.current) return state.wishlist.some((w) => w.productId === productId);
      wishBusy.current = true;
      window.setTimeout(() => {
        wishBusy.current = false;
      }, 250);
      let on = false;
      setState((s) => {
        const has = s.wishlist.some((w) => w.productId === productId);
        on = !has;
        return {
          ...s,
          wishlist: has
            ? s.wishlist.filter((w) => w.productId !== productId)
            : [{ productId, savedAt: Date.now() }, ...s.wishlist],
        };
      });
      return on;
    },
    [state.wishlist]
  );

  const isWished = useCallback(
    (productId: string) => state.wishlist.some((w) => w.productId === productId),
    [state.wishlist]
  );

  const addToCart = useCallback((productId: string) => {
    if (cartBusy.current) {
      const cur = state.cart.find((c) => c.productId === productId);
      return { ok: false, qty: cur?.qty ?? 0, existed: !!cur };
    }
    cartBusy.current = true;
    window.setTimeout(() => {
      cartBusy.current = false;
    }, 250);
    let result = { ok: true, qty: 1, existed: false };
    setState((s) => {
      const found = s.cart.find((c) => c.productId === productId);
      if (found) {
        if (found.qty >= CART_MAX) {
          result = { ok: false, qty: found.qty, existed: true };
          return s;
        }
        const qty = found.qty + 1;
        result = { ok: true, qty, existed: true };
        return {
          ...s,
          cart: s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
        };
      }
      result = { ok: true, qty: 1, existed: false };
      return { ...s, cart: [{ productId, qty: 1, addedAt: Date.now() }, ...s.cart] };
    });
    return result;
  }, [state.cart]);

  const setCartQty = useCallback((productId: string, qty: number) => {
    setState((s) => {
      if (qty < 1) return { ...s, cart: s.cart.filter((c) => c.productId !== productId) };
      return {
        ...s,
        cart: s.cart.map((c) => (c.productId === productId ? { ...c, qty: Math.min(CART_MAX, qty) } : c)),
      };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((c) => c.productId !== productId) }));
  }, []);

  const isInCart = useCallback(
    (productId: string) => state.cart.some((c) => c.productId === productId),
    [state.cart]
  );

  const addView = useCallback((productId: string) => {
    setState((s) => ({
      ...s,
      viewed: [productId, ...s.viewed.filter((id) => id !== productId)].slice(0, 20),
    }));
  }, []);

  const upsertReview = useCallback(
    (input: Omit<Review, "id" | "createdAt" | "nickname" | "skinType" | "concerns" | "accountId"> & { id?: string }) => {
      if (!account || reviewBusy.current) return null;
      reviewBusy.current = true;
      window.setTimeout(() => {
        reviewBusy.current = false;
      }, 400);
      const now = Date.now();
      let saved: Review | null = null;
      setState((s) => {
        if (input.id) {
          const next = s.reviews.map((r) =>
            r.id === input.id
              ? { ...r, rating: input.rating, text: input.text, photos: input.photos }
              : r
          );
          saved = next.find((r) => r.id === input.id) ?? null;
          return { ...s, reviews: next };
        }
        const review: Review = {
          id: uid("rev"),
          productId: input.productId,
          nickname: account.nickname,
          skinType: account.skinType ?? "복합성",
          concerns: account.concerns,
          rating: input.rating,
          text: input.text,
          photos: input.photos,
          createdAt: now,
          purchased: input.purchased,
          accountId: account.id,
        };
        saved = review;
        return { ...s, reviews: [review, ...s.reviews] };
      });
      return saved;
    },
    [account]
  );

  const myReviewFor = useCallback(
    (productId: string) =>
      state.reviews.find((r) => r.productId === productId && r.accountId === account?.id),
    [state.reviews, account]
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      account,
      toast,
      showToast,
      startSocial,
      completeTermsAndJoin,
      beginSignup,
      cancelAuth,
      saveProfile,
      logout,
      withdraw,
      toggleWish,
      isWished,
      addToCart,
      setCartQty,
      removeFromCart,
      isInCart,
      addView,
      upsertReview,
      myReviewFor,
    }),
    [
      state,
      hydrated,
      account,
      toast,
      showToast,
      startSocial,
      completeTermsAndJoin,
      beginSignup,
      cancelAuth,
      saveProfile,
      logout,
      withdraw,
      toggleWish,
      isWished,
      addToCart,
      setCartQty,
      removeFromCart,
      isInCart,
      addView,
      upsertReview,
      myReviewFor,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function createAccount(state: AppState, provider: Provider): AppState {
  const seq = state.nicknameSeq + 1;
  const account: Account = {
    id: uid("acc"),
    provider,
    nickname: `beautyuser${seq}`,
    skinType: null,
    concerns: [],
    onboardingDone: false,
    termsAgreed: true,
    createdAt: Date.now(),
  };
  return {
    ...state,
    accounts: [...state.accounts, account],
    currentId: account.id,
    loginAt: Date.now(),
    nicknameSeq: seq,
    pendingProvider: null,
    termsPending: false,
  };
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}
