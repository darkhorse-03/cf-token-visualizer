import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, Globe, HardDrive, KeyRound, Cpu, Radio } from "lucide-react";
import { getActiveContextValue } from "#/lib/active-context";
import { getCachedResources, getOrgPermissions, setPermission } from "#/lib/org-api";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/dashboard/settings/permissions")({
  component: PermissionsPage,
});

const RESOURCE_TYPE_CONFIG: Record<string, { label: string; icon: typeof Globe }> = {
  zone: { label: "Zones", icon: Globe },
  worker: { label: "Workers", icon: Cpu },
  r2_bucket: { label: "R2 Buckets", icon: HardDrive },
  kv_namespace: { label: "KV Namespaces", icon: KeyRound },
  ai_gateway: { label: "AI Gateway", icon: Radio },
};

function PermissionsPage() {
  const queryClient = useQueryClient();

  const { data: ctx } = useQuery({
    queryKey: ["active-context"],
    queryFn: () => getActiveContextValue(),
    staleTime: 0,
  });

  const orgId = ctx?.mode === "org" ? ctx.orgId : null;

  const { data: resources, isLoading: resourcesLoading, error: resourcesError } = useQuery({
    queryKey: ["cached-resources", orgId],
    queryFn: () => getCachedResources({ data: orgId! }),
    enabled: !!orgId,
  });

  const { data: permissions, isLoading: permsLoading } = useQuery({
    queryKey: ["org-permissions", orgId],
    queryFn: () => getOrgPermissions({ data: orgId! }),
    enabled: !!orgId,
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["org-members", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const res = await authClient.organization.listMembers({
        query: { organizationId: orgId },
      });
      return res.data?.members ?? res.data ?? [];
    },
    enabled: !!orgId,
  });

  const toggleMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      resourceType: string;
      resourceId: string;
      granted: boolean;
    }) => {
      if (!orgId) return;
      await setPermission({
        data: { orgId, ...data },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-permissions"] });
    },
  });

  if (!orgId) {
    return (
      <div className="alert alert-warning alert-soft">
        <span>Switch to an organization to manage permissions.</span>
      </div>
    );
  }

  const isLoading = resourcesLoading || permsLoading || membersLoading;

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-3">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-48 w-full" />
        </div>
      </div>
    );
  }

  if (resourcesError) {
    return (
      <div className="alert alert-error alert-soft">
        <span>{resourcesError.message}</span>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="alert alert-info alert-soft">
        <span>
          No cached resources.{" "}
          <Link to="/dashboard/settings" className="link">
            Go to Token settings
          </Link>{" "}
          and sync resources first.
        </span>
      </div>
    );
  }

  // Only show non-admin members (admins have full access)
  const regularMembers = membersData?.filter(
    (m) => m.role !== "owner" && m.role !== "admin",
  ) ?? [];

  if (regularMembers.length === 0) {
    return (
      <div className="alert alert-info alert-soft">
        <span>No regular members to assign permissions to. Admins and owners have full access.</span>
      </div>
    );
  }

  // Group resources by type
  const grouped = new Map<string, typeof resources>();
  for (const r of resources) {
    const existing = grouped.get(r.resourceType) ?? [];
    existing.push(r);
    grouped.set(r.resourceType, existing);
  }

  const permSet = new Set(
    permissions?.map((p) => `${p.userId}:${p.resourceType}:${p.resourceId}`) ?? [],
  );

  const hasPermission = (userId: string, resourceType: string, resourceId: string) =>
    permSet.has(`${userId}:${resourceType}:${resourceId}`);

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([type, items]) => {
        const config = RESOURCE_TYPE_CONFIG[type];
        const Icon = config?.icon ?? Database;
        const label = config?.label ?? type;

        return (
          <div key={type} className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </h3>
              <div className="overflow-x-auto">
                <table className="table table-sm table-auto">
                  <thead>
                    <tr>
                      <th className="w-64">Resource</th>
                      {regularMembers.map((m) => (
                        <th key={m.id} className="text-center w-24">
                          <div className="text-xs truncate" title={m.user.name}>
                            {m.user.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((resource) => (
                      <tr key={resource.resourceId}>
                        <td className="font-mono text-xs w-64">{resource.resourceName}</td>
                        {regularMembers.map((m) => {
                          const granted = hasPermission(
                            m.user.id,
                            resource.resourceType,
                            resource.resourceId,
                          );
                          return (
                            <td key={m.id} className="text-center w-24">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary"
                                checked={granted}
                                onChange={() =>
                                  toggleMutation.mutate({
                                    userId: m.user.id,
                                    resourceType: resource.resourceType,
                                    resourceId: resource.resourceId,
                                    granted: !granted,
                                  })
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
