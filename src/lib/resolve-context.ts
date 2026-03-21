import { eq, and } from "drizzle-orm";
import { getDb } from "#/db";
import { createAuth } from "#/lib/auth";
import { getActiveToken } from "#/lib/token";
import { readContextCookie } from "#/lib/active-context";
import { orgCfTokens, orgUserPermissions } from "#/db/app-schema";
import { members } from "#/db/auth-schema";
import type { AppContext } from "#/lib/context";

export async function resolveContext(request: Request): Promise<AppContext> {
  const ctx = readContextCookie();

  if (ctx?.mode === "org") {
    const orgId = ctx.orgId;
    const auth = createAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Not authenticated");

    const db = getDb();

    const [orgToken] = await db
      .select()
      .from(orgCfTokens)
      .where(eq(orgCfTokens.orgId, orgId))
      .limit(1);
    if (!orgToken) throw new Error("No CF token configured for this organization");

    const [membership] = await db
      .select()
      .from(members)
      .where(
        and(
          eq(members.organizationId, orgId),
          eq(members.userId, session.user.id),
        ),
      )
      .limit(1);
    if (!membership) throw new Error("Not a member of this organization");

    const isAdmin = membership.role === "owner" || membership.role === "admin";

    if (isAdmin) {
      return {
        mode: "org",
        orgId,
        userId: session.user.id,
        token: orgToken.token,
        filter: () => true,
      };
    }

    const permissions = await db
      .select()
      .from(orgUserPermissions)
      .where(
        and(
          eq(orgUserPermissions.orgId, orgId),
          eq(orgUserPermissions.userId, session.user.id),
        ),
      );

    const permSet = new Set(
      permissions.map((p) => `${p.resourceType}:${p.resourceId}`),
    );

    return {
      mode: "org",
      orgId,
      userId: session.user.id,
      token: orgToken.token,
      filter: (resourceType, resourceId) =>
        permSet.has(`${resourceType}:${resourceId}`),
    };
  }

  // Personal mode
  const token = getActiveToken(request);
  if (!token) throw new Error("Not authenticated");
  return { mode: "personal", token, filter: null };
}
