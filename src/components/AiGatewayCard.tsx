import { Shield, Clock, Activity } from "lucide-react";
import type { AiGateway } from "#/types/cloudflare";

export function AiGatewayCard({
  gateway,
  selected,
  onSelect,
}: {
  gateway: AiGateway;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`card bg-base-100 shadow cursor-pointer transition-all hover:shadow-md ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      <div className="card-body p-4 gap-2">
        <h3 className="card-title text-sm font-mono">{gateway.id}</h3>
        <div className="flex flex-wrap gap-2">
          {gateway.collect_logs && (
            <span className="badge badge-success badge-xs gap-1">
              <Activity className="size-2.5" />
              logging
            </span>
          )}
          {gateway.authentication && (
            <span className="badge badge-info badge-xs gap-1">
              <Shield className="size-2.5" />
              auth
            </span>
          )}
          {gateway.cache_ttl > 0 && (
            <span className="badge badge-warning badge-xs gap-1">
              <Clock className="size-2.5" />
              cache {gateway.cache_ttl}s
            </span>
          )}
          {gateway.rate_limiting_limit > 0 && (
            <span className="badge badge-ghost badge-xs">
              {gateway.rate_limiting_limit}/{gateway.rate_limiting_interval}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
