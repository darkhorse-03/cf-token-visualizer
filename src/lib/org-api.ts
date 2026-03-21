import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { getDb } from "#/db";
import { requireSession } from "#/lib/auth-session.server";
import { orgCfTokens, orgCachedResources, orgUserPermissions } from "#/db/app-schema";
import { members } from "#/db/auth-schema";
import { verifyToken } from "#/lib/cf-api";
import type {
  ZonesResponse,
  WorkersResponse,
  R2Response,
  KvResponse,
  AiGatewayResponse,
  AccountsResponse,
} from "#/types/cloudflare";

const CF_API = "https://api.cloudflare.com/client/v4";

async function requireAdmin(orgId: string) {
  const session = await requireSession();
  const db = getDb();
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
  if (membership.role !== "owner" && membership.role !== "admin") {
    throw new Error("Admin access required");
  }
  return session;
}

// ─── Org Token ──────────────────────────────────────────────────────────────

export const getOrgToken = createServerFn({ method: "POST" })
  .inputValidator((orgId: string) => orgId)
  .handler(async ({ data: orgId }) => {
    await requireAdmin(orgId);
    const db = getDb();
    const [row] = await db.select().from(orgCfTokens).where(eq(orgCfTokens.orgId, orgId)).limit(1);
    return { hasToken: !!row, updatedAt: row?.updatedAt ?? null };
  });

export const setOrgToken = createServerFn({ method: "POST" })
  .inputValidator((data: { orgId: string; token: string }) => data)
  .handler(async ({ data: { orgId, token } }) => {
    await requireAdmin(orgId);
    // Verify the token works
    await verifyToken({ data: token });

    const db = getDb();
    const [existing] = await db.select().from(orgCfTokens).where(eq(orgCfTokens.orgId, orgId)).limit(1);
    const now = new Date();

    if (existing) {
      await db
        .update(orgCfTokens)
        .set({ token, updatedAt: now })
        .where(eq(orgCfTokens.id, existing.id));
    } else {
      await db.insert(orgCfTokens).values({
        id: crypto.randomUUID(),
        orgId,
        token,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { ok: true };
  });

// ─── Resource Cache ─────────────────────────────────────────────────────────

async function cfFetchWithToken<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${CF_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`CF API error: ${res.status}`);
  const json = await res.json();
  return json as T;
}

export const syncOrgResources = createServerFn({ method: "POST" })
  .inputValidator((orgId: string) => orgId)
  .handler(async ({ data: orgId }) => {
    await requireAdmin(orgId);
    const db = getDb();

    const [orgToken] = await db.select().from(orgCfTokens).where(eq(orgCfTokens.orgId, orgId)).limit(1);
    if (!orgToken) throw new Error("No CF token configured");

    const token = orgToken.token;
    const accounts = await cfFetchWithToken<AccountsResponse>("/accounts?per_page=1", token);
    const accountId = accounts.result[0]?.id;
    if (!accountId) throw new Error("No account found");

    const now = new Date();

    // Fetch all resource types in parallel
    const [zones, workers, r2, kv, aiGateways] = await Promise.allSettled([
      cfFetchWithToken<ZonesResponse>("/zones?per_page=50", token),
      cfFetchWithToken<WorkersResponse>(`/accounts/${accountId}/workers/scripts`, token),
      cfFetchWithToken<R2Response>(`/accounts/${accountId}/r2/buckets`, token),
      cfFetchWithToken<KvResponse>(`/accounts/${accountId}/storage/kv/namespaces`, token),
      cfFetchWithToken<AiGatewayResponse>(`/accounts/${accountId}/ai-gateway/gateways?per_page=100`, token),
    ]);

    type Resource = { type: string; id: string; name: string };
    const resources: Resource[] = [];

    if (zones.status === "fulfilled") {
      for (const z of zones.value.result) {
        resources.push({ type: "zone", id: z.id, name: z.name });
      }
    }
    if (workers.status === "fulfilled") {
      for (const w of workers.value.result) {
        resources.push({ type: "worker", id: w.id, name: w.id });
      }
    }
    if (r2.status === "fulfilled") {
      for (const b of r2.value.result.buckets) {
        resources.push({ type: "r2_bucket", id: b.name, name: b.name });
      }
    }
    if (kv.status === "fulfilled") {
      for (const n of kv.value.result) {
        resources.push({ type: "kv_namespace", id: n.id, name: n.title });
      }
    }
    if (aiGateways.status === "fulfilled") {
      for (const g of aiGateways.value.result) {
        resources.push({ type: "ai_gateway", id: g.id, name: g.id });
      }
    }

    // Clear old cache and insert fresh
    await db.delete(orgCachedResources).where(eq(orgCachedResources.orgId, orgId));

    if (resources.length > 0) {
      // Batch inserts to stay under D1's parameter limit
      const BATCH_SIZE = 10;
      for (let i = 0; i < resources.length; i += BATCH_SIZE) {
        const batch = resources.slice(i, i + BATCH_SIZE);
        await db.insert(orgCachedResources).values(
          batch.map((r) => ({
            id: crypto.randomUUID(),
            orgId,
            resourceType: r.type,
            resourceId: r.id,
            resourceName: r.name,
            lastSynced: now,
          })),
        );
      }
    }

    return { count: resources.length };
  });

export const getCachedResources = createServerFn({ method: "POST" })
  .inputValidator((orgId: string) => orgId)
  .handler(async ({ data: orgId }) => {
    const db = getDb();
    return db.select().from(orgCachedResources).where(eq(orgCachedResources.orgId, orgId));
  });

// ─── Permissions ────────────────────────────────────────────────────────────

export const getOrgPermissions = createServerFn({ method: "POST" })
  .inputValidator((orgId: string) => orgId)
  .handler(async ({ data: orgId }) => {
    await requireAdmin(orgId);
    const db = getDb();
    return db.select().from(orgUserPermissions).where(eq(orgUserPermissions.orgId, orgId));
  });

export const setPermission = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      orgId: string;
      userId: string;
      resourceType: string;
      resourceId: string;
      granted: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.orgId);
    const db = getDb();

    if (data.granted) {
      await db
        .insert(orgUserPermissions)
        .values({
          id: crypto.randomUUID(),
          orgId: data.orgId,
          userId: data.userId,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
        })
        .onConflictDoNothing();
    } else {
      await db
        .delete(orgUserPermissions)
        .where(
          and(
            eq(orgUserPermissions.orgId, data.orgId),
            eq(orgUserPermissions.userId, data.userId),
            eq(orgUserPermissions.resourceType, data.resourceType),
            eq(orgUserPermissions.resourceId, data.resourceId),
          ),
        );
    }
    return { ok: true };
  });

export const bulkSetPermissions = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      orgId: string;
      userId: string;
      grants: Array<{ resourceType: string; resourceId: string; granted: boolean }>;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.orgId);
    const db = getDb();

    for (const grant of data.grants) {
      if (grant.granted) {
        await db
          .insert(orgUserPermissions)
          .values({
            id: crypto.randomUUID(),
            orgId: data.orgId,
            userId: data.userId,
            resourceType: grant.resourceType,
            resourceId: grant.resourceId,
          })
          .onConflictDoNothing();
      } else {
        await db
          .delete(orgUserPermissions)
          .where(
            and(
              eq(orgUserPermissions.orgId, data.orgId),
              eq(orgUserPermissions.userId, data.userId),
              eq(orgUserPermissions.resourceType, grant.resourceType),
              eq(orgUserPermissions.resourceId, grant.resourceId),
            ),
          );
      }
    }
    return { ok: true };
  });
