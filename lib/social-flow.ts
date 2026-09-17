import type { Provider } from "./types";

const PROVIDER_KEY = "ob:oauth_provider";
const TERMS_KEY = "ob:terms_ok";

export function rememberOAuthProvider(provider: Provider) {
  sessionStorage.setItem(PROVIDER_KEY, provider);
}

export function consumeOAuthProvider(): Provider | null {
  const value = sessionStorage.getItem(PROVIDER_KEY);
  sessionStorage.removeItem(PROVIDER_KEY);
  return value === "kakao" || value === "google" ? value : null;
}

export function peekOAuthProvider(): Provider | null {
  const value = sessionStorage.getItem(PROVIDER_KEY);
  return value === "kakao" || value === "google" ? value : null;
}

export function markTermsOk() {
  sessionStorage.setItem(TERMS_KEY, "1");
}

export function consumeTermsOk() {
  const ok = sessionStorage.getItem(TERMS_KEY) === "1";
  sessionStorage.removeItem(TERMS_KEY);
  return ok;
}

export function clearOAuthFlags() {
  sessionStorage.removeItem(PROVIDER_KEY);
  sessionStorage.removeItem(TERMS_KEY);
}
