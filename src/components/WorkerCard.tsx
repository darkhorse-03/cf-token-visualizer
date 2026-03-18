import { Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import type { Worker } from "#/types/cloudflare";

const WORKER_HANDLERS = new Set([
  "fetch", "scheduled", "queue", "alarm", "email", "tail", "trace",
]);

export function WorkerCard({ worker }: { worker: Worker }) {
  const modified = new Date(worker.modified_on).toLocaleDateString();
  const handlers = worker.handlers.filter((h) => WORKER_HANDLERS.has(h));

  return (
    <Link
      to="/dashboard/workers/$id"
      params={{ id: worker.id }}
      className="card bg-base-100 shadow animate-fade-up hover:shadow-md transition-shadow cursor-pointer no-underline"
    >
      <div className="card-body p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold font-mono text-sm truncate">{worker.id}</h3>
          <div className="flex gap-1.5 shrink-0">
            {handlers.map((h) => (
              <span key={h} className="badge badge-primary badge-xs">{h}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-base-content/50">
          <span className="flex items-center gap-1">
            <Upload className="size-3" />
            {worker.last_deployed_from ?? "unknown"}
          </span>
          <span>Updated {modified}</span>
        </div>
      </div>
    </Link>
  );
}
