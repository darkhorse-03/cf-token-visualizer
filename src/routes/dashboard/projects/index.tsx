import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listProjects } from "#/lib/project-api";
import { getActiveContextValue } from "#/lib/active-context";
import { ProjectCard } from "#/components/ProjectCard";
import { CreateProjectModal } from "#/components/CreateProjectModal";

export const Route = createFileRoute("/dashboard/projects/")({
  component: ProjectsListPage,
});

function ProjectsListPage() {
  const { data: ctx } = useQuery({
    queryKey: ["active-context"],
    queryFn: () => getActiveContextValue(),
    staleTime: 0,
  });

  const { data: projectList, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  const orgId = ctx?.mode === "org" ? ctx.orgId : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() =>
            (document.getElementById("create-project-modal") as HTMLDialogElement)?.showModal()
          }
        >
          <Plus className="size-4" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow p-4 space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error.message}</span>
        </div>
      ) : !projectList || projectList.length === 0 ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center py-12">
            <p className="text-base-content/50">No projects yet. Create one to organize your resources.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projectList.map((p) => (
            <ProjectCard key={p.id} id={p.id} name={p.name} shared={p.shared} />
          ))}
        </div>
      )}

      <CreateProjectModal id="create-project-modal" orgId={orgId} />
    </div>
  );
}
