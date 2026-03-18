import { createServerFn } from "@tanstack/react-start";
import { getActiveToken } from "#/lib/token";
import { getRequiredPermission } from "#/lib/permissions";
import type {
  Zone,
  ZonesResponse,
  DnsRecord,
  DnsRecordsResponse,
  WorkersResponse,
  WorkerSettingsResponse,
  WorkerAnalytics,
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
    if (res.status === 403) {
      const permission = getRequiredPermission(path);
      throw new Error(
        permission
          ? `Missing permission: "${permission}". Edit your token at dash.cloudflare.com/profile/api-tokens`
          : "Access denied. Your token doesn't have permission for this resource.",
      );
    }
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

    const [zones, workers, r2, kv, aiGateways] = await Promise.allSettled([
      cfFetch<ZonesResponse>("/zones?per_page=1", token),
      cfFetch<WorkersResponse>(`/accounts/${accountId}/workers/scripts`, token),
      cfFetch<R2Response>(`/accounts/${accountId}/r2/buckets`, token),
      cfFetch<KvResponse>(`/accounts/${accountId}/storage/kv/namespaces`, token),
      cfFetch<AiGatewayResponse>(`/accounts/${accountId}/ai-gateway/gateways?per_page=1`, token),
    ]);

    return {
      zones: zones.status === "fulfilled" ? zones.value.result_info?.total_count ?? zones.value.result.length : 0,
      workers: workers.status === "fulfilled" ? workers.value.result.length : 0,
      r2Buckets: r2.status === "fulfilled" ? r2.value.result.buckets.length : 0,
      kvNamespaces: kv.status === "fulfilled" ? kv.value.result.length : 0,
      aiGateways: aiGateways.status === "fulfilled" ? aiGateways.value.result_info?.total_count ?? aiGateways.value.result.length : 0,
    } satisfies AccountOverview;
  },
);

export const listWorkers = createServerFn({ method: "GET" }).handler(
  async ({ request }) => {
    const token = requireToken(request);
    const accountId = await getAccountId(token);
    const res = await cfFetch<WorkersResponse>(
      `/accounts/${accountId}/workers/scripts`,
      token,
    );
    return res.result;
  },
);

export const getWorkerSettings = createServerFn({ method: "POST" })
  .inputValidator((scriptName: string) => scriptName)
  .handler(async ({ request, data: scriptName }) => {
    const token = requireToken(request);
    const accountId = await getAccountId(token);
    const res = await cfFetch<WorkerSettingsResponse>(
      `/accounts/${accountId}/workers/scripts/${encodeURIComponent(scriptName)}/settings`,
      token,
    );
    return res.result;
  });

export const getWorkerAnalytics = createServerFn({ method: "POST" })
  .inputValidator((scriptName: string) => scriptName)
  .handler(async ({ request, data: scriptName }) => {
    const token = requireToken(request);
    const accountId = await getAccountId(token);
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const query = `{
      viewer {
        accounts(filter: { accountTag: "${accountId}" }) {
          workersInvocationsAdaptive(
            limit: 1000
            filter: {
              datetime_geq: "${dayAgo.toISOString()}"
              datetime_leq: "${now.toISOString()}"
              scriptName: "${scriptName}"
            }
          ) {
            sum { requests errors subrequests wallTime responseBodySize }
            quantiles { wallTimeP50 wallTimeP99 }
          }
        }
      }
    }`;

    const res = await fetch(`${CF_API}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json() as {
      data?: {
        viewer: {
          accounts: Array<{
            workersInvocationsAdaptive: Array<{
              sum: { requests: number; errors: number; subrequests: number; wallTime: number };
              quantiles: { wallTimeP50: number; wallTimeP99: number };
            }>;
          }>;
        };
      };
      errors?: Array<{ message: string }>;
    };

    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join(", "));
    }

    const rows = json.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive ?? [];

    const totals = rows.reduce(
      (acc, row) => ({
        totalRequests: acc.totalRequests + row.sum.requests,
        totalErrors: acc.totalErrors + row.sum.errors,
        totalSubrequests: acc.totalSubrequests + row.sum.subrequests,
        p50Latency: Math.max(acc.p50Latency, row.quantiles.wallTimeP50),
        p99Latency: Math.max(acc.p99Latency, row.quantiles.wallTimeP99),
      }),
      { totalRequests: 0, totalErrors: 0, totalSubrequests: 0, p50Latency: 0, p99Latency: 0 },
    );

    return totals satisfies WorkerAnalytics;
  });

export const getWorkerLogs = createServerFn({ method: "POST" })
  .inputValidator((scriptName: string) => scriptName)
  .handler(async ({ request, data: scriptName }) => {
    const token = requireToken(request);
    const accountId = await getAccountId(token);
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const res = await fetch(
      `${CF_API}/accounts/${accountId}/workers/observability/telemetry/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queryId: "worker-logs",
          timeframe: { from: dayAgo, to: now },
          view: "invocations",
          limit: 50,
          parameters: {
            filters: [
              {
                key: "$workers.scriptName",
                operation: "eq",
                type: "string",
                value: scriptName,
              },
            ],
          },
        }),
      },
    );

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error(
          'Missing permission: "Workers Observability Write". Edit your token at dash.cloudflare.com/profile/api-tokens',
        );
      }
      throw new Error(`Logs API error: ${res.status}`);
    }

    const json = await res.json() as {
      result: {
        invocations: Record<string, Array<Record<string, unknown>>>;
      };
    };

    const invocations = json.result?.invocations ?? {};

    // First event has request info, last event (cf-worker-event) has timing
    return Object.entries(invocations).map(([requestId, events]) => {
      const first = events[0] ?? {};
      const last = events[events.length - 1] ?? {};
      const w = first.$workers as Record<string, unknown> | undefined;
      const lastW = last.$workers as Record<string, unknown> | undefined;
      const event = w?.event as Record<string, unknown> | undefined;
      const req = event?.request as Record<string, unknown> | undefined;
      const meta = first.$metadata as Record<string, unknown> | undefined;

      return {
        requestId,
        method: (req?.method as string) ?? "—",
        url: (req?.url as string) ?? "—",
        path: (req?.path as string) ?? (meta?.trigger as string) ?? "—",
        outcome: (w?.outcome as string) ?? "unknown",
        wallTimeMs: (lastW?.wallTimeMs as number) ?? null,
        timestamp: first.timestamp as number,
        eventCount: events.length,
        logs: events
          .map((e) => (e.source as Record<string, unknown>)?.message as string)
          .filter(Boolean),
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  });

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
