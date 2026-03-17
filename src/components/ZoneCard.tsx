import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listDnsRecords } from "#/lib/cf-api";
import { DnsTable } from "#/components/DnsTable";
import type { Zone } from "#/types/cloudflare";

export function ZoneCard({ zone }: { zone: Zone }) {
  const [expanded, setExpanded] = useState(false);

  const { data: records, isLoading } = useQuery({
    queryKey: ["dns-records", zone.id],
    queryFn: () => listDnsRecords({ data: zone.id }),
    enabled: expanded,
  });

  return (
    <div className="collapse collapse-arrow bg-base-100 rounded-box shadow animate-fade-up">
      <input
        type="checkbox"
        checked={expanded}
        onChange={() => setExpanded(!expanded)}
      />
      <div className="collapse-title">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">{zone.name}</span>
          <span
            className={`badge badge-sm ${zone.status === "active" ? "badge-success" : "badge-warning"}`}
          >
            {zone.status}
          </span>
          {zone.paused && <span className="badge badge-sm badge-warning">paused</span>}
          <span className="badge badge-sm badge-ghost">{zone.plan.name}</span>
        </div>
      </div>

      <div className="collapse-content">
        {isLoading && (
          <div className="flex justify-center py-6">
            <span className="loading loading-spinner text-primary" />
          </div>
        )}

        {records && <DnsTable records={records} />}

        <div className="divider my-2" />
        <div>
          <p className="text-xs text-base-content/40 mb-2">Nameservers</p>
          <div className="flex flex-wrap gap-2">
            {zone.name_servers.map((ns) => (
              <kbd key={ns} className="kbd kbd-sm font-mono">{ns}</kbd>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
