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
import { supabase, supabaseReady } from "./supabase";
import {
  createProfile,
  fetchCart,
  fetchProfile,
  fetchReviews,
  fetchViewed,
  fetchWishlist,
} from "./db";
import type {
  Account,
  AppState,
  CartItem,
  Provider,
  Review,
  SkinConcern,
  SkinType,
  WishlistItem,
} from "./types";

const CART_MAX = 10;
const SOCIAL_KEY = "onebeauty:social";
const SERVER_TOAST = "일시적인 오류입니다. 잠시 후 다시 시도해주세요";

type SocialCreds = { email: string; password: string };
type SocialBook = Partial<Record<Provider, SocialCreds>>;

function empty(): AppState {
  return {
    accounts: [],
    currentId: null,
    loginAt: null,
    nicknameSeq: 1000,
    wishlist: [],
    cart: [],
    reviews: [],
    viewed: [],
    pendingProvider: null,
    termsPending: false,
  };
}

function readBook(): SocialBook {
  try {
    return JSON.parse(localStorage.getItem(SOCIAL_KEY) || "{}") as SocialBook;
  } catch {
    return {};
  }
}

function writeBook(book: SocialBook) {
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(book));
}

function makeCreds(provider: Provider): SocialCreds {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return {
    email: `ob.${provider}.${id}@gmail.com`,
    password: `${crypto.randomUUID()}Aa1!`,
  };
}

type Store = AppState & {
  hydrated: boolean;
  bootError: boolean;
  account: Account | null;
  toast: string | null;
  showToast: (msg: string) => void;
  retryBoot: () => void;
  startSocial: (provider: Provider) => Promise<{ kind: "login" | "terms"; isNew?: boolean }>;
  completeTermsAndJoin: () => Promise<boolean>;
  beginSignup: () => void;
  cancelAuth: () => void;
  saveProfile: (skinType: SkinType, concerns: SkinConcern[]) => Promise<boolean>;
  logout: () => Promise<void>;
  withdraw: () => Promise<boolean>;
  toggleWish: (productId: string) => boolean;
  isWished: (productId: string) => boolean;
  addToCart: (productId: string) => { ok: boolean; qty: number; existed: boolean };
  setCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  addView: (productId: string) => void;
  upsertReview: (
    review: Omit<Review, "id" | "createdAt" | "nickname" | "skinType" | "concerns" | "accountId"> & { id?: string }
  ) => Promise<Review | null>;
  myReviewFor: (productId: string) => Review | undefined;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(empty);
  const [hydrated, setHydrated] = useState(false);
  const [bootError, setBootError] = useState(false);
  const [bootTick, setBootTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const wishBusy = useRef(false);
  const cartBusy = useRef(false);
  const reviewBusy = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const loadUserSlice = useCallback(async (userId: string) => {
    const [profile, wishlist, cart, viewed] = await Promise.all([
      fetchProfile(userId),
      fetchWishlist(userId),
      fetchCart(userId),
      fetchViewed(userId),
    ]);
    return { profile, wishlist, cart, viewed };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabaseReady) {
        setBootError(true);
        setHydrated(true);
        return;
      }
      try {
        const [{ data: sessionData }, reviews] = await Promise.all([
          supabase.auth.getSession(),
          fetchReviews(),
        ]);
        if (cancelled) return;
        const user = sessionData.session?.user;
        let accounts: Account[] = [];
        let currentId: string | null = null;
        let wishlist: WishlistItem[] = [];
        let cart: CartItem[] = [];
        let viewed: string[] = [];
        if (user) {
          const slice = await loadUserSlice(user.id);
          if (slice.profile) {
            accounts = [slice.profile];
            currentId = slice.profile.id;
            wishlist = slice.wishlist;
            cart = slice.cart;
            viewed = slice.viewed;
          }
        }
        setState((s) => ({
          ...s,
          accounts,
          currentId,
          loginAt: currentId ? Date.now() : null,
          reviews,
          wishlist,
          cart,
          viewed,
        }));
        setBootError(false);
      } catch {
        if (!cancelled) setBootError(true);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootTick, loadUserSlice]);

  const retryBoot = useCallback(() => {
    setHydrated(false);
    setBootTick((n) => n + 1);
  }, []);

  const account = useMemo(
    () => state.accounts.find((a) => a.id === state.currentId) ?? null,
    [state.accounts, state.currentId]
  );

  const applyLoggedIn = useCallback((profile: Account, extras?: { wishlist?: WishlistItem[]; cart?: CartItem[]; viewed?: string[] }) => {
    setState((s) => ({
      ...s,
      accounts: [profile],
      currentId: profile.id,
      loginAt: Date.now(),
      pendingProvider: null,
      termsPending: false,
      wishlist: extras?.wishlist ?? s.wishlist,
      cart: extras?.cart ?? s.cart,
      viewed: extras?.viewed ?? s.viewed,
    }));
  }, []);

  const joinWithProvider = useCallback(
    async (provider: Provider) => {
      const creds = makeCreds(provider);
      const { data, error } = await supabase.auth.signUp({
        email: creds.email,
        password: creds.password,
      });
      let user = data.user;
      if ((!user || !data.session) && !error) {
        const again = await supabase.auth.signInWithPassword(creds);
        user = again.data.user;
      }
      if (error || !user) {
        showToast(SERVER_TOAST);
        return false;
      }
      writeBook({ ...readBook(), [provider]: creds });
      try {
        const profile = await createProfile(user.id, provider);
        const reviews = await fetchReviews();
        applyLoggedIn(profile, { wishlist: [], cart: [], viewed: [] });
        setState((s) => ({ ...s, reviews }));
        return true;
      } catch {
        showToast(SERVER_TOAST);
        return false;
      }
    },
    [applyLoggedIn, showToast]
  );

  const startSocial = useCallback(
    async (provider: Provider): Promise<{ kind: "login" | "terms"; isNew?: boolean }> => {
      const book = readBook();
      const saved = book[provider];
      if (saved) {
        const { data, error } = await supabase.auth.signInWithPassword(saved);
        if (error || !data.user) {
          showToast(SERVER_TOAST);
          return { kind: "terms" };
        }
        try {
          const slice = await loadUserSlice(data.user.id);
          if (!slice.profile) {
            const created = await createProfile(data.user.id, provider);
            applyLoggedIn(created, { wishlist: [], cart: [], viewed: [] });
            return { kind: "login", isNew: true };
          }
          applyLoggedIn(slice.profile, slice);
          return { kind: "login", isNew: false };
        } catch {
          showToast(SERVER_TOAST);
          return { kind: "terms" };
        }
      }
      if (state.termsPending) {
        const ok = await joinWithProvider(provider);
        return { kind: ok ? "login" : "terms", isNew: ok };
      }
      setState((s) => ({ ...s, pendingProvider: provider }));
      return { kind: "terms" };
    },
    [applyLoggedIn, joinWithProvider, loadUserSlice, showToast, state.termsPending]
  );

  const completeTermsAndJoin = useCallback(async () => {
    const provider = state.pendingProvider ?? "kakao";
    return joinWithProvider(provider);
  }, [joinWithProvider, state.pendingProvider]);

  const beginSignup = useCallback(() => {
    setState((s) => ({ ...s, pendingProvider: null, termsPending: true }));
  }, []);

  const cancelAuth = useCallback(() => {
    setState((s) => ({ ...s, pendingProvider: null, termsPending: false }));
  }, []);

  const saveProfile = useCallback(
    async (skinType: SkinType, concerns: SkinConcern[]) => {
      if (!state.currentId) return false;
      const { error } = await supabase
        .from("profiles")
        .update({ skin_type: skinType, concerns, onboarding_done: true })
        .eq("id", state.currentId);
      if (error) {
        showToast(SERVER_TOAST);
        return false;
      }
      setState((s) => ({
        ...s,
        accounts: s.accounts.map((a) =>
          a.id === s.currentId ? { ...a, skinType, concerns, onboardingDone: true } : a
        ),
      }));
      return true;
    },
    [showToast, state.currentId]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState((s) => ({
      ...empty(),
      reviews: s.reviews,
    }));
  }, []);

  const withdraw = useCallback(async () => {
    const { error } = await supabase.rpc("withdraw_me");
    if (error) {
      showToast(SERVER_TOAST);
      return false;
    }
    const provider = account?.provider;
    if (provider) {
      const book = readBook();
      delete book[provider];
      writeBook(book);
    }
    await supabase.auth.signOut();
    try {
      const reviews = await fetchReviews();
      setState({ ...empty(), reviews });
    } catch {
      setState(empty());
    }
    return true;
  }, [account?.provider, showToast]);

  const toggleWish = useCallback(
    (productId: string) => {
      if (!state.currentId || wishBusy.current) return state.wishlist.some((w) => w.productId === productId);
      wishBusy.current = true;
      const has = state.wishlist.some((w) => w.productId === productId);
      const nextOn = !has;
      const prev = state.wishlist;
      setState((s) => ({
        ...s,
        wishlist: has
          ? s.wishlist.filter((w) => w.productId !== productId)
          : [{ productId, savedAt: Date.now() }, ...s.wishlist],
      }));
      const req = has
        ? supabase.from("wishlist").delete().eq("user_id", state.currentId).eq("product_id", productId)
        : supabase.from("wishlist").insert({ user_id: state.currentId, product_id: productId });
      void req.then(({ error }) => {
        wishBusy.current = false;
        if (error) {
          setState((s) => ({ ...s, wishlist: prev }));
          showToast(SERVER_TOAST);
        }
      });
      window.setTimeout(() => {
        wishBusy.current = false;
      }, 400);
      return nextOn;
    },
    [showToast, state.currentId, state.wishlist]
  );

  const isWished = useCallback(
    (productId: string) => state.wishlist.some((w) => w.productId === productId),
    [state.wishlist]
  );

  const addToCart = useCallback(
    (productId: string) => {
      if (!state.currentId) return { ok: false, qty: 0, existed: false };
      if (cartBusy.current) {
        const cur = state.cart.find((c) => c.productId === productId);
        return { ok: false, qty: cur?.qty ?? 0, existed: !!cur };
      }
      cartBusy.current = true;
      window.setTimeout(() => {
        cartBusy.current = false;
      }, 350);
      const found = state.cart.find((c) => c.productId === productId);
      if (found) {
        if (found.qty >= CART_MAX) return { ok: false, qty: found.qty, existed: true };
        const qty = found.qty + 1;
        const prev = state.cart;
        setState((s) => ({
          ...s,
          cart: s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
        }));
        void supabase
          .from("cart")
          .update({ qty })
          .eq("user_id", state.currentId)
          .eq("product_id", productId)
          .then(({ error }) => {
            if (error) {
              setState((s) => ({ ...s, cart: prev }));
              showToast(SERVER_TOAST);
            }
          });
        return { ok: true, qty, existed: true };
      }
      const prev = state.cart;
      setState((s) => ({ ...s, cart: [{ productId, qty: 1, addedAt: Date.now() }, ...s.cart] }));
      void supabase
        .from("cart")
        .insert({ user_id: state.currentId, product_id: productId, qty: 1 })
        .then(({ error }) => {
          if (error) {
            setState((s) => ({ ...s, cart: prev }));
            showToast(SERVER_TOAST);
          }
        });
      return { ok: true, qty: 1, existed: false };
    },
    [showToast, state.cart, state.currentId]
  );

  const setCartQty = useCallback(
    (productId: string, qty: number) => {
      if (!state.currentId) return;
      const prev = state.cart;
      if (qty < 1) {
        setState((s) => ({ ...s, cart: s.cart.filter((c) => c.productId !== productId) }));
        void supabase
          .from("cart")
          .delete()
          .eq("user_id", state.currentId)
          .eq("product_id", productId)
          .then(({ error }) => {
            if (error) {
              setState((s) => ({ ...s, cart: prev }));
              showToast(SERVER_TOAST);
            }
          });
        return;
      }
      const next = Math.min(CART_MAX, qty);
      setState((s) => ({
        ...s,
        cart: s.cart.map((c) => (c.productId === productId ? { ...c, qty: next } : c)),
      }));
      void supabase
        .from("cart")
        .update({ qty: next })
        .eq("user_id", state.currentId)
        .eq("product_id", productId)
        .then(({ error }) => {
          if (error) {
            setState((s) => ({ ...s, cart: prev }));
            showToast(SERVER_TOAST);
          }
        });
    },
    [showToast, state.cart, state.currentId]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCartQty(productId, 0);
    },
    [setCartQty]
  );

  const isInCart = useCallback(
    (productId: string) => state.cart.some((c) => c.productId === productId),
    [state.cart]
  );

  const addView = useCallback(
    (productId: string) => {
      if (!state.currentId) return;
      setState((s) => ({
        ...s,
        viewed: [productId, ...s.viewed.filter((id) => id !== productId)].slice(0, 20),
      }));
      void supabase.from("viewed").upsert({
        user_id: state.currentId,
        product_id: productId,
        viewed_at: new Date().toISOString(),
      });
    },
    [state.currentId]
  );

  const upsertReview = useCallback(
    async (
      input: Omit<Review, "id" | "createdAt" | "nickname" | "skinType" | "concerns" | "accountId"> & { id?: string }
    ) => {
      if (!account || reviewBusy.current) return null;
      reviewBusy.current = true;
      window.setTimeout(() => {
        reviewBusy.current = false;
      }, 500);
      try {
        if (input.id) {
          const { data, error } = await supabase
            .from("reviews")
            .update({ rating: input.rating, body: input.text, photos: input.photos })
            .eq("id", input.id)
            .eq("user_id", account.id)
            .select("*")
            .single();
          if (error || !data) {
            showToast(SERVER_TOAST);
            return null;
          }
          const saved = {
            ...state.reviews.find((r) => r.id === input.id)!,
            rating: input.rating,
            text: input.text,
            photos: input.photos,
          };
          setState((s) => ({
            ...s,
            reviews: s.reviews.map((r) => (r.id === input.id ? saved : r)),
          }));
          return saved;
        }
        const { data, error } = await supabase
          .from("reviews")
          .insert({
            product_id: input.productId,
            user_id: account.id,
            nickname: account.nickname,
            skin_type: account.skinType ?? "복합성",
            concerns: account.concerns,
            rating: input.rating,
            body: input.text,
            photos: input.photos,
            purchased: !!input.purchased,
          })
          .select("*")
          .single();
        if (error || !data) {
          showToast(SERVER_TOAST);
          return null;
        }
        const saved: Review = {
          id: data.id,
          productId: input.productId,
          nickname: account.nickname,
          skinType: account.skinType ?? "복합성",
          concerns: account.concerns,
          rating: input.rating,
          text: input.text,
          photos: input.photos,
          createdAt: Date.parse(data.created_at),
          purchased: !!input.purchased,
          accountId: account.id,
        };
        setState((s) => ({ ...s, reviews: [saved, ...s.reviews] }));
        return saved;
      } catch {
        showToast(SERVER_TOAST);
        return null;
      }
    },
    [account, showToast, state.reviews]
  );

  const myReviewFor = useCallback(
    (productId: string) => state.reviews.find((r) => r.productId === productId && r.accountId === account?.id),
    [state.reviews, account]
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      bootError,
      account,
      toast,
      showToast,
      retryBoot,
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
      bootError,
      account,
      toast,
      showToast,
      retryBoot,
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

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}
