import { supabase } from "./supabase";
import { CATALOG_REVIEWS } from "./catalog-reviews";
import { PRODUCTS } from "./products";
import { SKIN_CONCERNS, SKIN_TYPES, type Account, type CartItem, type Gender, type Provider, type Review, type SkinConcern, type SkinType, type WishlistItem } from "./types";

export type ProfileRow = {
  id: string;
  provider: Provider;
  nickname: string;
  gender: Gender | null;
  birth_year: number | null;
  skin_type: SkinType | null;
  concerns: string[];
  onboarding_done: boolean;
  terms_agreed: boolean;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string | null;
  nickname: string;
  skin_type: string;
  concerns: string[];
  rating: number;
  body: string;
  photos: string[];
  tags?: string[];
  purchased: boolean;
  withdrawn: boolean;
  created_at: string;
};

function mapConcern(raw: string): SkinConcern | null {
  if (raw === "수분/보습") return "보습";
  if (raw === "트러블/진정") return "민감성";
  return SKIN_CONCERNS.includes(raw as SkinConcern) ? (raw as SkinConcern) : null;
}

function mapType(raw: string | null): SkinType | null {
  if (!raw) return null;
  return SKIN_TYPES.includes(raw as SkinType) ? (raw as SkinType) : null;
}

export function profileToAccount(row: ProfileRow): Account {
  return {
    id: row.id,
    provider: row.provider,
    nickname: row.nickname,
    gender: row.gender ?? null,
    birthYear: row.birth_year ?? null,
    skinType: mapType(row.skin_type),
    concerns: (row.concerns ?? []).map(mapConcern).filter((c): c is SkinConcern => !!c),
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
    skinType: mapType(row.skin_type) ?? "복합성",
    concerns: (row.concerns ?? []).map(mapConcern).filter((c): c is SkinConcern => !!c),
    rating: row.rating,
    text: row.body ?? "",
    tags: row.tags ?? [],
    photos: row.photos ?? [],
    createdAt: Date.parse(row.created_at),
    purchased: row.purchased,
    accountId: row.user_id ?? undefined,
    withdrawn: row.withdrawn,
  };
}

const KNOWN = new Set(PRODUCTS.map((p) => p.id));

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const server = (data as ReviewRow[]).map(reviewFromRow).filter((r) => KNOWN.has(r.productId));
  const ids = new Set(server.map((r) => r.id));
  const extra = CATALOG_REVIEWS.filter((r) => !ids.has(r.id) && KNOWN.has(r.productId));
  return [...server, ...extra].sort((a, b) => b.createdAt - a.createdAt);
}

export async function fetchProfile(userId: string): Promise<Account | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data ? profileToAccount(data as ProfileRow) : null;
}

export async function fetchWishlist(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase.from("wishlist").select("product_id, saved_at").eq("user_id", userId).order("saved_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .map((r) => ({ productId: r.product_id as string, savedAt: Date.parse(r.saved_at as string) }))
    .filter((w) => KNOWN.has(w.productId));
}

export async function fetchCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase.from("cart").select("product_id, qty, added_at").eq("user_id", userId).order("added_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .map((r) => ({
      productId: r.product_id as string,
      qty: r.qty as number,
      addedAt: Date.parse(r.added_at as string),
    }))
    .filter((c) => KNOWN.has(c.productId));
}

export async function fetchViewed(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from("viewed").select("product_id, viewed_at").eq("user_id", userId).order("viewed_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []).map((r) => r.product_id as string).filter((id) => KNOWN.has(id));
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

export async function fetchWishCountsByAge(age: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.rpc("wish_counts_by_age", { p_age: age });
  if (error || !data) return {};
  return Object.fromEntries((data as { product_id: string; n: number }[]).map((r) => [r.product_id, r.n]));
}

export async function persistReviewPhotos(userId: string, srcs: string[]) {
  const out: string[] = [];
  for (const src of (srcs ?? []).slice(0, 3)) {
    if (/^https?:\/\//i.test(src)) {
      out.push(src);
      continue;
    }
    if (!src.startsWith("data:image/")) continue;
    const blob = await (await fetch(src)).blob();
    if (!blob.type.startsWith("image/") || blob.size > 5 * 1024 * 1024) continue;
    const ext = blob.type.includes("png")
      ? "png"
      : blob.type.includes("webp")
        ? "webp"
        : blob.type.includes("gif")
          ? "gif"
          : "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("review-photos").upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) throw error;
    out.push(supabase.storage.from("review-photos").getPublicUrl(path).data.publicUrl);
  }
  return out;
}

export async function nicknameTaken(nickname: string, exceptId?: string) {
  const { data, error } = await supabase.from("profiles").select("id").eq("nickname", nickname).maybeSingle();
  if (error) throw error;
  if (!data) return false;
  return data.id !== exceptId;
}
