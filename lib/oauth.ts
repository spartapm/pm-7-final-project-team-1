import { NextResponse } from "next/server";
import { supabase } from "./supabase";
import type { Provider } from "./types";

export const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY ?? "";
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET ?? "";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export function authOrigin(req: Request) {
  const forced = process.env.AUTH_BASE_URL?.replace(/\/$/, "");
  if (forced) return forced;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "oneandbeauty.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function oauthSecret() {
  return process.env.AUTH_SECRET || KAKAO_CLIENT_SECRET || GOOGLE_CLIENT_SECRET || "onebeauty-oauth";
}

function b64urlEncode(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(text: string) {
  const pad = text.length % 4 === 0 ? "" : "=".repeat(4 - (text.length % 4));
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function b64urlBytes(bytes: ArrayBuffer) {
  const arr = new Uint8Array(bytes);
  let bin = "";
  arr.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signBody(body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(oauthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${b64urlEncode(body)}.${b64urlBytes(sig)}`;
}

async function readSigned<T>(token: string): Promise<T | null> {
  const cut = token.lastIndexOf(".");
  if (cut < 1) return null;
  const body = token.slice(0, cut);
  const expected = await signBody(b64urlDecode(body));
  if (expected.split(".")[1] !== token.slice(cut + 1)) return null;
  try {
    return JSON.parse(b64urlDecode(body)) as T;
  } catch {
    return null;
  }
}

export async function makeOAuthState(redirectUri: string) {
  return signBody(JSON.stringify({ r: redirectUri, e: Date.now() + 10 * 60 * 1000 }));
}

export async function readOAuthState(state: string) {
  const data = await readSigned<{ r?: string; e?: number }>(state);
  if (!data?.r || !data.e || data.e < Date.now()) return null;
  return { redirectUri: data.r };
}

export async function makeSocialTicket(provider: Provider, subject: string) {
  return signBody(JSON.stringify({ p: provider, s: subject, e: Date.now() + 3 * 60 * 1000 }));
}

export async function readSocialTicket(token: string) {
  const data = await readSigned<{ p?: Provider; s?: string; e?: number }>(token);
  if (!data?.p || !data.s || !data.e || data.e < Date.now()) return null;
  if (data.p !== "kakao" && data.p !== "google") return null;
  return { provider: data.p, subject: data.s };
}

async function socialPassword(provider: Provider, subject: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(oauthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${provider}:${subject}`));
  return `Ob1!${b64urlBytes(sig).slice(0, 24)}`;
}

export async function sessionForSocial(provider: Provider, subject: string) {
  const email = `ob.${provider}.${subject}@gmail.com`;
  const password = await socialPassword(provider, subject);
  const signedIn = await supabase.auth.signInWithPassword({ email, password });
  if (signedIn.data.session) return signedIn.data.session;
  const signedUp = await supabase.auth.signUp({ email, password });
  if (signedUp.data.session) return signedUp.data.session;
  const again = await supabase.auth.signInWithPassword({ email, password });
  return again.data.session;
}

export function failLogin(req: Request, reason: string) {
  const url = new URL("/login", authOrigin(req));
  url.searchParams.set("social", "fail");
  url.searchParams.set("why", reason);
  return NextResponse.redirect(url);
}

export async function finishSocial(req: Request, provider: Provider, subject: string) {
  if (!subject) return failLogin(req, `${provider}-id`);
  const ticket = await makeSocialTicket(provider, subject);
  const url = new URL("/auth/callback", authOrigin(req));
  url.searchParams.set("ticket", ticket);
  return NextResponse.redirect(url);
}

export function tokenFailReason(provider: "kakao" | "google", raw: unknown) {
  const text = JSON.stringify(raw ?? {});
  if (/invalid_client|client_secret|KOE010/i.test(text)) return `${provider}-secret`;
  if (/redirect_uri/i.test(text)) return `${provider}-redirect`;
  return `${provider}-token`;
}
