import { supabase } from "./supabase";
import type { Account, CartItem, Provider, Review, SkinConcern, SkinType, WishlistItem } from "./types";

export type ProfileRow = {
  id: string;
  provider: Provider;
  nickname: string;
  skin_type: SkinType | null;
  concerns: SkinConcern[];
  onboarding_done: boolean;
  terms_agreed: boolean;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string | null;
  nickname: string;
  skin_type: SkinType;
  concerns: SkinConcern[];
  rating: number;
  body: string;
  photos: string[];
  purchased: boolean;
  withdrawn: boolean;
  created_at: string;
};

export function profileToAccount(row: ProfileRow): Account {
  return {
    id: row.id,
    provider: row.provider,
    nickname: row.nickname,
    skinType: row.skin_type,
    concerns: row.concerns ?? [],
    onboardingDone: row.onboarding_done,
    termsAgreed: row.terms_agreed,
    createdAt: Date.parse(row.created_at),
  };
}

export function reviewFromRow(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    nickname: row.nickname,
    skinType: row.skin_type,
    concerns: row.concerns ?? [],
    rating: row.rating,
    text: row.body ?? "",
    photos: row.photos ?? [],
    createdAt: Date.parse(row.created_at),
    purchased: row.purchased,
    accountId: row.user_id ?? undefined,
    withdrawn: row.withdrawn,
  };
}

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(reviewFromRow);
}

export async function fetchProfile(userId: string): Promise<Account | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data ? profileToAccount(data as ProfileRow) : null;
}

export async function fetchWishlist(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase.from("wishlist").select("product_id, saved_at").eq("user_id", userId).order("saved_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ productId: r.product_id as string, savedAt: Date.parse(r.saved_at as string) }));
}

export async function fetchCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase.from("cart").select("product_id, qty, added_at").eq("user_id", userId).order("added_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    productId: r.product_id as string,
    qty: r.qty as number,
    addedAt: Date.parse(r.added_at as string),
  }));
}

export async function fetchViewed(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from("viewed").select("product_id, viewed_at").eq("user_id", userId).order("viewed_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []).map((r) => r.product_id as string);
}

export async function createProfile(userId: string, provider: Provider): Promise<Account> {
  const { data: nick, error: nickErr } = await supabase.rpc("next_nickname");
  if (nickErr) throw nickErr;
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      provider,
      nickname: nick as string,
      concerns: [],
      onboarding_done: false,
      terms_agreed: true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return profileToAccount(data as ProfileRow);
}
