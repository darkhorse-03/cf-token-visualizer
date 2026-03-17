import { createServerFn } from "@tanstack/react-start";
import type {
  TokenVerifyResult,
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

export const verifyToken = createServerFn({ method: "POST" })
  .inputValidator((token: string) => token)
  .handler(async ({ data: token }) => {
    return cfFetch<TokenVerifyResult>("/user/tokens/verify", token);
  });

export const listZones = createServerFn({ method: "POST" })
  .inputValidator((token: string) => token)
  .handler(async ({ data: token }) => {
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
  });

export const listDnsRecords = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; zoneId: string }) => data)
  .handler(async ({ data: { token, zoneId } }) => {
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

export const getAccountOverview = createServerFn({ method: "POST" })
  .inputValidator((token: string) => token)
  .handler(async ({ data: token }) => {
    const accounts = await cfFetch<AccountsResponse>("/accounts?per_page=1", token);
    const accountId = accounts.result[0]?.id;
    if (!accountId) throw new Error("No account found for this token");

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
  });
