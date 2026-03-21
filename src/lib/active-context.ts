import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const CONTEXT_COOKIE = "cf-context";

export type ActiveContextValue =
  | { mode: "personal"; tokenIndex: number }
  | { mode: "org"; orgId: string };

export function readContextCookie(): ActiveContextValue | null {
  const raw = getCookie(CONTEXT_COOKIE);
  return parse(raw);
}

export function getOrgIdFromCookie(): string | null {
  const ctx = readContextCookie();
  return ctx?.mode === "org" ? ctx.orgId : null;
}

function parse(raw: string | undefined): ActiveContextValue | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith("org:")) {
    return { mode: "org", orgId: decoded.slice(4) };
  }
  if (decoded.startsWith("personal:")) {
    return { mode: "personal", tokenIndex: parseInt(decoded.slice(9), 10) || 0 };
  }
  return null;
}

function serialize(value: ActiveContextValue): string {
  if (value.mode === "org") return `org:${value.orgId}`;
  return `personal:${value.tokenIndex}`;
}

export const getActiveContextValue = createServerFn({ method: "GET" }).handler(
  async () => {
    const raw = getCookie(CONTEXT_COOKIE);
    return parse(raw);
  },
);

export const setActiveContextValue = createServerFn({ method: "POST" })
  .inputValidator((data: ActiveContextValue) => data)
  .handler(async ({ data }) => {
    setCookie(CONTEXT_COOKIE, serialize(data), {
      path: "/",
      httpOnly: true,
      sameSite: "strict" as const,
      maxAge: 60 * 60 * 24 * 90,
    });
    return { ok: true };
  });
