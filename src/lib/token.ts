import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";

const TOKENS_COOKIE = "cf-tokens";
const ACTIVE_COOKIE = "cf-active";

export interface StoredToken {
  label: string;
  token: string;
}

const COOKIE_OPTS = {
  path: "/",
  httpOnly: true,
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24 * 90, // 90 days
};

function readTokens(): StoredToken[] {
  const raw = getCookie(TOKENS_COOKIE);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function readActiveIndex(): number {
  return parseInt(getCookie(ACTIVE_COOKIE) ?? "0", 10) || 0;
}

// Get the active token value (for server functions that need to call CF API)
export function getActiveToken(request: Request): string | null {
  // This is called from other server functions that pass request
  // We can't use getCookie here since it relies on async local storage context
  // Parse manually from request
  const header = request.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    header.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key, rest.join("=")];
    }),
  );
  const raw = cookies[TOKENS_COOKIE];
  if (!raw) return null;
  try {
    const tokens: StoredToken[] = JSON.parse(decodeURIComponent(raw));
    const idx = parseInt(cookies[ACTIVE_COOKIE] ?? "0", 10) || 0;
    return tokens[idx]?.token ?? null;
  } catch {
    return null;
  }
}

// Get all stored tokens with labels + which is active (for UI)
export const getTokens = createServerFn({ method: "GET" }).handler(
  async () => {
    const tokens = readTokens();
    const active = readActiveIndex();
    return { tokens: tokens.map(({ label }) => ({ label })), active };
  },
);

// Add a new token
export const addToken = createServerFn({ method: "POST" })
  .inputValidator((data: { label: string; token: string }) => data)
  .handler(async ({ data: { label, token } }) => {
    const tokens = readTokens();
    tokens.push({ label, token });
    const idx = tokens.length - 1;

    setCookie(TOKENS_COOKIE, JSON.stringify(tokens), COOKIE_OPTS);
    setCookie(ACTIVE_COOKIE, String(idx), COOKIE_OPTS);

    return { ok: true, active: idx };
  });

// Switch active token
export const switchToken = createServerFn({ method: "POST" })
  .inputValidator((idx: number) => idx)
  .handler(async ({ data: idx }) => {
    const tokens = readTokens();
    if (idx < 0 || idx >= tokens.length) throw new Error("Invalid token index");

    setCookie(ACTIVE_COOKIE, String(idx), COOKIE_OPTS);

    return { ok: true };
  });

// Remove a token
export const removeToken = createServerFn({ method: "POST" })
  .inputValidator((idx: number) => idx)
  .handler(async ({ data: idx }) => {
    const tokens = readTokens();
    if (idx < 0 || idx >= tokens.length) throw new Error("Invalid token index");
    tokens.splice(idx, 1);

    if (tokens.length === 0) {
      deleteCookie(TOKENS_COOKIE, { path: "/" });
      deleteCookie(ACTIVE_COOKIE, { path: "/" });
    } else {
      const active = Math.min(readActiveIndex(), tokens.length - 1);
      setCookie(TOKENS_COOKIE, JSON.stringify(tokens), COOKIE_OPTS);
      setCookie(ACTIVE_COOKIE, String(active), COOKIE_OPTS);
    }

    return { ok: true };
  });

// Clear all tokens (logout)
export const clearTokens = createServerFn({ method: "POST" }).handler(
  async () => {
    deleteCookie(TOKENS_COOKIE, { path: "/" });
    deleteCookie(ACTIVE_COOKIE, { path: "/" });
    return { ok: true };
  },
);
