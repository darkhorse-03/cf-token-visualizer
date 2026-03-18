import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Upload, Activity, AlertTriangle, Timer } from "lucide-react";
import { getWorkerSettings, getWorkerAnalytics, listWorkers } from "#/lib/cf-api";
import { WorkerBindings } from "#/components/WorkerBindings";
import { WorkerLogs } from "#/components/WorkerLogs";

export const Route = createFileRoute("/dashboard/workers/$id")({
  component: WorkerDetailPage,
});

function latencyColor(ms: number): string {
  if (ms > 10000) return "text-error";
  if (ms > 1000) return "text-warning";
  return "";
}

function WorkerDetailPage() {
  const { id } = Route.useParams();

  const { data: workers } = useQuery({
    queryKey: ["workers"],
    queryFn: () => listWorkers(),
  });

  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ["worker-settings", id],
    queryFn: () => getWorkerSettings({ data: id }),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["worker-analytics", id],
    queryFn: () => getWorkerAnalytics({ data: id }),
  });

  const worker = workers?.find((w) => w.id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/workers" className="btn btn-ghost btn-sm btn-square">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-mono">{id}</h1>
          {worker && (
            <div className="flex items-center gap-3 mt-1 text-sm text-base-content/50">
              <span className="flex items-center gap-1">
                <Upload className="size-3" />
                {worker.last_deployed_from ?? "unknown"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {new Date(worker.modified_on).toLocaleDateString()}
              </span>
              {worker.handlers.filter((h) =>
                ["fetch", "scheduled", "queue", "alarm", "email", "tail", "trace"].includes(h),
              ).map((h) => (
                <span key={h} className="badge badge-primary badge-xs">{h}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics - last 24h */}
      {analyticsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow p-4 space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-7 w-12" />
            </div>
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                <Activity className="size-3" />
                Requests (24h)
              </div>
              <p className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                <AlertTriangle className="size-3" />
                Errors (24h)
              </div>
              <p className={`text-2xl font-bold ${analytics.totalErrors > 0 ? "text-error" : ""}`}>
                {analytics.totalErrors.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                <Timer className="size-3" />
                p50 latency
              </div>
              <p className={`text-2xl font-bold ${latencyColor(analytics.p50Latency)}`}>
                {analytics.p50Latency > 1000
                  ? `${(analytics.p50Latency / 1000).toFixed(1)}s`
                  : `${Math.round(analytics.p50Latency)}ms`}
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                <Timer className="size-3" />
                p99 latency
              </div>
              <p className={`text-2xl font-bold ${latencyColor(analytics.p99Latency)}`}>
                {analytics.p99Latency > 1000
                  ? `${(analytics.p99Latency / 1000).toFixed(1)}s`
                  : `${Math.round(analytics.p99Latency)}ms`}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Logs - on demand */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Logs</h2>
        <WorkerLogs scriptName={id} />
      </div>

      {/* Bindings */}
      {settingsLoading ? (
        <div>
          <div className="skeleton h-6 w-24 mb-3" />
          <div className="card bg-base-100 shadow overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`border-l-4 border-l-base-content/10 ${i > 0 ? "border-t border-t-base-content/5" : ""}`}>
                <div className="bg-base-content/5 px-4 py-2">
                  <div className="skeleton h-3.5 w-24" />
                </div>
                <div className="px-4 py-2.5 space-y-1.5">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-4 w-56" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : settingsError ? (
        <div className="alert alert-error">
          <span>{settingsError.message}</span>
        </div>
      ) : settings ? (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3">Bindings</h2>
            <WorkerBindings bindings={settings.bindings} />
          </div>

          {settings.placement?.mode && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title text-lg">Placement</h2>
                <span className="badge badge-ghost">{settings.placement.mode}</span>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
