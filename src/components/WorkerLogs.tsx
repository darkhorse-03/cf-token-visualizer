import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { getWorkerLogs } from "#/lib/cf-api";

export function WorkerLogs({ scriptName }: { scriptName: string }) {
  const [enabled, setEnabled] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["worker-logs", scriptName],
    queryFn: () => getWorkerLogs({ data: scriptName }),
    enabled,
  });

  if (!enabled) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body items-center py-8">
          <ScrollText className="size-5 text-base-content/30" />
          <p className="text-sm text-base-content/50">Logs are loaded on demand</p>
          <button
            className="btn btn-neutral btn-sm mt-1"
            onClick={() => setEnabled(true)}
          >
            Load recent logs (24h)
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="skeleton h-4 w-4 rounded-full shrink-0" />
              <div className="skeleton h-4 w-14 shrink-0" />
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-4 w-16 shrink-0" />
              <div className="skeleton h-4 w-24 shrink-0" />
            </div>
          ))}
        </div>
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

  if (!logs || logs.length === 0) {
    return (
      <div className="alert alert-info alert-soft">
        <span>No logs found in the last 24 hours.</span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th></th>
            <th>Status</th>
            <th>Method</th>
            <th>Path</th>
            <th>Duration</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const ok = log.outcome === "ok";
            const isExpanded = expandedRow === log.requestId;

            return (
              <>
                <tr
                  key={log.requestId}
                  className="cursor-pointer hover"
                  onClick={() =>
                    setExpandedRow(isExpanded ? null : log.requestId)
                  }
                >
                  <td className="w-6">
                    <ChevronRight
                      className={`size-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </td>
                  <td>
                    {ok ? (
                      <CheckCircle className="size-4 text-success" />
                    ) : (
                      <XCircle className="size-4 text-error" />
                    )}
                  </td>
                  <td>
                    <kbd className="kbd kbd-xs">{log.method}</kbd>
                  </td>
                  <td className="font-mono text-xs max-w-sm truncate">
                    {log.path}
                  </td>
                  <td className="text-xs">
                    {log.wallTimeMs != null ? `${log.wallTimeMs}ms` : "—"}
                  </td>
                  <td className="text-xs text-base-content/50">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
                {isExpanded && log.logs.length > 0 && (
                  <tr key={`${log.requestId}-logs`}>
                    <td colSpan={6} className="bg-base-200 p-0">
                      <pre className="text-xs font-mono p-3 max-h-48 overflow-auto whitespace-pre-wrap">
                        {log.logs.join("\n")}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
