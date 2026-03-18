import { Database, KeyRound, HardDrive, Link2, Lock, FileText, Layers, Gauge, Brain } from "lucide-react";
import type { WorkerBinding } from "#/types/cloudflare";

const BINDING_CONFIG: Record<string, {
  label: string;
  icon: typeof Database;
  accent: string;
  headerBg: string;
  getDetail: (b: WorkerBinding) => string | null;
}> = {
  ai: {
    label: "AI",
    icon: Brain,
    accent: "border-l-secondary",
    headerBg: "bg-secondary/10",
    getDetail: () => null,
  },
  d1: {
    label: "D1 Database",
    icon: Database,
    accent: "border-l-info",
    headerBg: "bg-info/10",
    getDetail: (b) => b.database_id ?? null,
  },
  kv_namespace: {
    label: "KV Namespace",
    icon: KeyRound,
    accent: "border-l-info",
    headerBg: "bg-info/10",
    getDetail: (b) => b.namespace_id ?? null,
  },
  r2_bucket: {
    label: "R2 Bucket",
    icon: HardDrive,
    accent: "border-l-success",
    headerBg: "bg-success/10",
    getDetail: (b) => b.bucket_name ?? null,
  },
  service: {
    label: "Service",
    icon: Link2,
    accent: "border-l-accent",
    headerBg: "bg-accent/10",
    getDetail: (b) => b.service ?? null,
  },
  secret_text: {
    label: "Secret",
    icon: Lock,
    accent: "border-l-error",
    headerBg: "bg-error/10",
    getDetail: () => null,
  },
  plain_text: {
    label: "Env Var",
    icon: FileText,
    accent: "border-l-warning",
    headerBg: "bg-warning/10",
    getDetail: (b) => b.text ?? null,
  },
  queue: {
    label: "Queue",
    icon: Layers,
    accent: "border-l-accent",
    headerBg: "bg-accent/10",
    getDetail: (b) => b.queue_name ?? null,
  },
  ratelimit: {
    label: "Rate Limiter",
    icon: Gauge,
    accent: "border-l-warning",
    headerBg: "bg-warning/10",
    getDetail: () => null,
  },
  durable_object_namespace: {
    label: "Durable Object",
    icon: Layers,
    accent: "border-l-secondary",
    headerBg: "bg-secondary/10",
    getDetail: () => null,
  },
};

export function WorkerBindings({ bindings }: { bindings: WorkerBinding[] }) {
  if (bindings.length === 0) {
    return (
      <div className="alert alert-info alert-soft">
        <span>No bindings configured.</span>
      </div>
    );
  }

  const grouped = new Map<string, WorkerBinding[]>();
  for (const b of bindings) {
    const existing = grouped.get(b.type) ?? [];
    existing.push(b);
    grouped.set(b.type, existing);
  }

  return (
    <div className="card bg-base-100 shadow overflow-hidden">
      {Array.from(grouped.entries()).map(([type, items], index) => {
        const config = BINDING_CONFIG[type];
        const Icon = config?.icon ?? Layers;
        const label = config?.label ?? type;
        const accent = config?.accent ?? "border-l-base-content/20";
        const headerBg = config?.headerBg ?? "bg-base-content/5";
        const hasDetails = items.some((b) => config?.getDetail(b));

        return (
          <div
            key={type}
            className={`border-l-4 ${accent} ${index > 0 ? "border-t border-t-base-content/5" : ""}`}
          >
            <div className={`flex items-center gap-2 px-4 py-2 ${headerBg}`}>
              <Icon className="size-3.5 text-base-content/60" />
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                {label}
              </span>
              <span className="text-xs text-base-content/30">{items.length}</span>
            </div>

            <div className="px-4 py-2.5">
              {hasDetails ? (
                <div className="space-y-1">
                  {items.map((b) => {
                    const detail = config?.getDetail(b);
                    return (
                      <div key={b.name} className="flex items-baseline gap-3 min-w-0">
                        <span className="font-mono text-sm font-semibold text-base-content/80 shrink-0">
                          {b.name}
                        </span>
                        {detail && (
                          <>
                            <span className="text-base-content/20 shrink-0 text-xs">&rarr;</span>
                            <span className="font-mono text-xs text-base-content/40 truncate min-w-0">
                              {detail}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {items.map((b) => (
                    <span
                      key={b.name}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-base-200/80 text-base-content/70"
                    >
                      {b.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
