import { createServerFn } from "@tanstack/react-start";
import { getActiveToken } from "#/lib/token";
import type {
  Zone,
  ZonesResponse,
  DnsRecord,
  DnsRecordsResponse,
  WorkersResponse,
  PagesResponse,
  R2Response,
  KvResponse,
  AccountOverview,
  AccountsResponse,
  AiGatewayResponse,
  AiGatewayLogsResponse,
} from "#/types/cloudflare";

const CF_API = "https://api.cloudflare.com/client/v4";

async function cfFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${CF_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`CF API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (!json.success) {
    const msgs = json.errors
      ?.map((e: { message: string }) => e.message)
      .join(", ");
    throw new Error(`CF API: ${msgs}`);
  }
  return json as T;
}

function requireToken(request: Request): string {
  const token = getActiveToken(request);
  if (!token) throw new Error("Not authenticated");
  return token;
}

async function getAccountId(token: string): Promise<string> {
  const accounts = await cfFetch<AccountsResponse>("/accounts?per_page=1", token);
  const accountId = accounts.result[0]?.id;
  if (!accountId) throw new Error("No account found for this token");
  return accountId;
}

export const verifyToken = createServerFn({ method: "POST" })
  .inputValidator((token: string) => token)
  .handler(async ({ data: token }) => {
    // Use /accounts instead of /user/tokens/verify since account-scoped
    // tokens don't have access to user-level endpoints
    const res = await cfFetch<AccountsResponse>("/accounts?per_page=1", token);
    if (res.result.length === 0) {
      throw new Error("Token is valid but has no account access");
    }
    return res;
  });

export const listZones = createServerFn({ method: "GET" }).handler(
  async ({ request }) => {
    const token = requireToken(request);
    const zones: Zone[] = [];
    let page = 1;
    while (true) {
      const res = await cfFetch<ZonesResponse>(
        `/zones?page=${page}&per_page=50`,
        token,
      );
      zones.push(...res.result);
      if (page >= res.result_info.total_pages) break;
      page++;
    }
    return zones;
  },
);

export const listDnsRecords = createServerFn({ method: "POST" })
  .inputValidator((zoneId: string) => zoneId)
  .handler(async ({ request, data: zoneId }) => {
    const token = requireToken(request);
    const records: DnsRecord[] = [];
    let page = 1;
    while (true) {
      const res = await cfFetch<DnsRecordsResponse>(
        `/zones/${encodeURIComponent(zoneId)}/dns_records?page=${page}&per_page=100`,
        token,
      );
      records.push(...res.result);
      if (page >= res.result_info.total_pages) break;
      page++;
    }
    return records;
  });

export const getAccountOverview = createServerFn({ method: "GET" }).handler(
  async ({ request }) => {
    const token = requireToken(request);
    const accountId = await getAccountId(token);

    const [zones, workers, pages, r2, kv] = await Promise.allSettled([
      cfFetch<ZonesResponse>("/zones?per_page=1", token),
      cfFetch<WorkersResponse>(`/accounts/${accountId}/workers/scripts`, token),
      cfFetch<PagesResponse>(`/accounts/${accountId}/pages/projects`, token),
      cfFetch<R2Response>(`/accounts/${accountId}/r2/buckets`, token),
      cfFetch<KvResponse>(`/accounts/${accountId}/storage/kv/namespaces`, token),
    ]);

    return {
      zones: zones.status === "fulfilled" ? zones.value.result_info?.total_count ?? zones.value.result.length : 0,
      workers: workers.status === "fulfilled" ? workers.value.result.length : 0,
      pages: pages.status === "fulfilled" ? pages.value.result.length : 0,
      r2Buckets: r2.status === "fulfilled" ? r2.value.result.buckets.length : 0,
      kvNamespaces: kv.status === "fulfilled" ? kv.value.result.length : 0,
    } satisfies AccountOverview;
  },
);

export const listAiGateways = createServerFn({ method: "GET" }).handler(
  async ({ request }) => {
    const token = requireToken(request);
    const accountId = await getAccountId(token);
    const res = await cfFetch<AiGatewayResponse>(
      `/accounts/${accountId}/ai-gateway/gateways?per_page=100`,
      token,
    );
    return res.result;
  },
);

export const listAiGatewayLogs = createServerFn({ method: "POST" })
  .inputValidator((gatewayId: string) => gatewayId)
  .handler(async ({ request, data: gatewayId }) => {
    const token = requireToken(request);
    const accountId = await getAccountId(token);
    const res = await cfFetch<AiGatewayLogsResponse>(
      `/accounts/${accountId}/ai-gateway/gateways/${encodeURIComponent(gatewayId)}/logs?per_page=50&order_by=created_at&order_by_direction=desc`,
      token,
    );
    return res;
  });
