import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Globe, Cpu, HardDrive, KeyRound, Radio, Check } from "lucide-react";
import { getCachedResources } from "#/lib/org-api";
import { addResourceToProject } from "#/lib/project-api";
import { getActiveContextValue } from "#/lib/active-context";
import {
  listZones,
  listWorkers,
  listAiGateways,
} from "#/lib/cf-api";

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Globe }> = {
  zone: { label: "Zones", icon: Globe },
  worker: { label: "Workers", icon: Cpu },
  r2_bucket: { label: "R2 Buckets", icon: HardDrive },
  kv_namespace: { label: "KV Namespaces", icon: KeyRound },
  ai_gateway: { label: "AI Gateways", icon: Radio },
};

interface ResourcePickerProps {
  projectId: string;
  existingResources: Array<{ resourceType: string; resourceId: string }>;
}

export function ResourcePicker({ projectId, existingResources }: ResourcePickerProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ctx } = useQuery({
    queryKey: ["active-context"],
    queryFn: () => getActiveContextValue(),
    staleTime: 0,
  });

  const orgId = ctx?.mode === "org" ? ctx.orgId : null;

  // For org mode, use cached resources. For personal mode, fetch live.
  const { data: orgResources } = useQuery({
    queryKey: ["cached-resources", orgId],
    queryFn: () => getCachedResources({ data: orgId! }),
    enabled: !!orgId && open,
  });

  const { data: personalWorkers } = useQuery({
    queryKey: ["workers"],
    queryFn: () => listWorkers(),
    enabled: !orgId && open,
  });

  const { data: personalZones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => listZones(),
    enabled: !orgId && open,
  });

  const { data: personalGateways } = useQuery({
    queryKey: ["ai-gateways"],
    queryFn: () => listAiGateways(),
    enabled: !orgId && open,
  });

  const addMutation = useMutation({
    mutationFn: (data: { resourceType: string; resourceId: string }) =>
      addResourceToProject({ data: { projectId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  const existingSet = new Set(
    existingResources.map((r) => `${r.resourceType}:${r.resourceId}`),
  );

  // Build available resources list
  type AvailableResource = { type: string; id: string; name: string };
  const available: AvailableResource[] = [];

  if (orgId && orgResources) {
    for (const r of orgResources) {
      available.push({ type: r.resourceType, id: r.resourceId, name: r.resourceName });
    }
  } else {
    if (personalWorkers) {
      for (const w of personalWorkers) {
        available.push({ type: "worker", id: w.id, name: w.id });
      }
    }
    if (personalZones) {
      for (const z of personalZones) {
        available.push({ type: "zone", id: z.id, name: z.name });
      }
    }
    if (personalGateways) {
      for (const g of personalGateways) {
        available.push({ type: "ai_gateway", id: g.id, name: g.id });
      }
    }
  }

  // Group by type
  const grouped = new Map<string, AvailableResource[]>();
  for (const r of available) {
    const existing = grouped.get(r.type) ?? [];
    existing.push(r);
    grouped.set(r.type, existing);
  }

  if (!open) {
    return (
      <button
        className="btn btn-primary btn-sm gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Add Resources
      </button>
    );
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Add Resources</h3>
          <button className="btn btn-ghost btn-xs" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>

        {available.length === 0 ? (
          <p className="text-sm text-base-content/50">Loading resources...</p>
        ) : (
          <div className="space-y-4 mt-2">
            {Array.from(grouped.entries()).map(([type, items]) => {
              const config = TYPE_CONFIG[type];
              const Icon = config?.icon ?? Globe;
              const label = config?.label ?? type;

              return (
                <div key={type}>
                  <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Icon className="size-3.5" />
                    {label}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((r) => {
                      const alreadyAdded = existingSet.has(`${r.type}:${r.id}`);
                      return (
                        <button
                          key={r.id}
                          className={`badge badge-lg gap-1.5 cursor-pointer transition-colors ${
                            alreadyAdded
                              ? "badge-primary"
                              : "badge-outline hover:badge-primary"
                          }`}
                          disabled={alreadyAdded || addMutation.isPending}
                          onClick={() =>
                            addMutation.mutate({
                              resourceType: r.type,
                              resourceId: r.id,
                            })
                          }
                        >
                          {alreadyAdded ? (
                            <Check className="size-3" />
                          ) : (
                            <Plus className="size-3" />
                          )}
                          <span className="font-mono text-xs">{r.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
