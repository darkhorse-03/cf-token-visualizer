import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Share2,
  Trash2,
  Globe,
  Cpu,
  HardDrive,
  KeyRound,
  Radio,
  X,
} from "lucide-react";
import {
  getProject,
  updateProject,
  deleteProject,
  removeResourceFromProject,
} from "#/lib/project-api";
import { useNavigate } from "@tanstack/react-router";
import { ResourcePicker } from "#/components/ResourcePicker";

export const Route = createFileRoute("/dashboard/projects/$id")({
  component: ProjectDetailPage,
});

const RESOURCE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof Globe; linkTo?: (id: string) => string }
> = {
  zone: { label: "Zone", icon: Globe, linkTo: () => "/dashboard/zones" },
  worker: { label: "Worker", icon: Cpu, linkTo: (id) => `/dashboard/workers/${id}` },
  r2_bucket: { label: "R2 Bucket", icon: HardDrive, linkTo: () => "/dashboard/r2" },
  kv_namespace: { label: "KV Namespace", icon: KeyRound, linkTo: () => "/dashboard/kv" },
  ai_gateway: { label: "AI Gateway", icon: Radio, linkTo: () => "/dashboard/ai-gateway" },
};

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject({ data: id }),
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      if (!project) return;
      await updateProject({ data: { id, shared: !project.shared } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject({ data: id }),
    onSuccess: () => {
      navigate({ to: "/dashboard/projects" });
    },
  });

  const removeResourceMutation = useMutation({
    mutationFn: (data: { resourceType: string; resourceId: string }) =>
      removeResourceFromProject({
        data: { projectId: id, ...data },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-32 w-full" />
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

  if (!project) return null;

  // Group resources by type
  const grouped = new Map<
    string,
    Array<{ resourceType: string; resourceId: string }>
  >();
  for (const r of project.resources) {
    const existing = grouped.get(r.resourceType) ?? [];
    existing.push(r);
    grouped.set(r.resourceType, existing);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/projects"
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.shared && (
              <span className="text-xs text-base-content/50 flex items-center gap-1 mt-1">
                <Share2 className="size-3" />
                Shared with organization
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {project.orgId && (
            <button
              className={`btn btn-sm btn-ghost gap-1 ${project.shared ? "btn-active" : ""}`}
              onClick={() => shareMutation.mutate()}
            >
              <Share2 className="size-3.5" />
              {project.shared ? "Unshare" : "Share"}
            </button>
          )}
          <button
            className="btn btn-sm btn-ghost text-error"
            onClick={() => {
              if (confirm("Delete this project?")) deleteMutation.mutate();
            }}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <ResourcePicker projectId={id} existingResources={project.resources} />

      {project.resources.length === 0 ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center py-8">
            <p className="text-base-content/50 text-sm">
              No resources added yet. Click "Add Resources" above to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([type, items]) => {
            const config = RESOURCE_TYPE_CONFIG[type];
            const Icon = config?.icon ?? Globe;
            const label = config?.label ?? type;

            return (
              <div key={type} className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <Icon className="size-4" />
                    {label}s
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((r) => {
                      const linkTo = config?.linkTo?.(r.resourceId);
                      return (
                        <div
                          key={r.resourceId}
                          className="badge badge-lg gap-2 font-mono text-xs"
                        >
                          {linkTo ? (
                            <Link to={linkTo} className="hover:text-primary transition-colors">
                              {r.resourceId}
                            </Link>
                          ) : (
                            r.resourceId
                          )}
                          <button
                            className="hover:text-error"
                            onClick={(e) => {
                              e.preventDefault();
                              removeResourceMutation.mutate({
                                resourceType: r.resourceType,
                                resourceId: r.resourceId,
                              });
                            }}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
