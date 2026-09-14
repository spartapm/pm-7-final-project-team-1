import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = "https://ghszygaejzakzjyuyqvt.supabase.co";
const key = "sb_publishable_O9Bs3hBi4FxI5pSqtxfk-A_yxhqGnIZ";

export const supabaseReady = Boolean(url && key);

export const supabase: SupabaseClient = createClient(url || "https://invalid.supabase.co", key || "public-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
