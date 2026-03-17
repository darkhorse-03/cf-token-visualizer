import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Zap, Database } from "lucide-react";
import { listAiGatewayLogs } from "#/lib/cf-api";

export function AiGatewayLogs({ gatewayId }: { gatewayId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-gateway-logs", gatewayId],
    queryFn: () => listAiGatewayLogs({ data: gatewayId }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-6 w-40 rounded-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="skeleton h-4 w-4 rounded-full" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-14" />
            <div className="skeleton h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error.message}</span>
      </div>
    );
  }

  if (!data || data.result.length === 0) {
    return (
      <div className="alert alert-info alert-soft">
        <span>No logs found for this gateway.</span>
      </div>
    );
  }

  const stats = data.result_info;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="badge badge-lg gap-1.5">
          <Database className="size-3.5" />
          {stats.total_count} total requests
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm table-zebra">
          <thead>
            <tr>
              <th>Status</th>
              <th>Provider</th>
              <th>Model</th>
              <th>Tokens</th>
              <th>Cost</th>
              <th>Duration</th>
              <th>Cached</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {data.result.map((log) => (
              <tr key={log.id}>
                <td>
                  {log.success ? (
                    <CheckCircle className="size-4 text-success" />
                  ) : (
                    <XCircle className="size-4 text-error" />
                  )}
                </td>
                <td>
                  <span className="badge badge-ghost badge-xs">{log.provider}</span>
                </td>
                <td className="font-mono text-xs">{log.model || "—"}</td>
                <td className="text-xs">
                  <span className="text-base-content/50">in:</span> {log.tokens_in}{" "}
                  <span className="text-base-content/50">out:</span> {log.tokens_out}
                </td>
                <td className="font-mono text-xs">
                  {log.cost > 0 ? `$${log.cost.toFixed(4)}` : "—"}
                </td>
                <td className="text-xs">{log.duration}ms</td>
                <td>
                  {log.cached ? (
                    <Zap className="size-3.5 text-warning" />
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>
                <td className="text-xs text-base-content/50">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
