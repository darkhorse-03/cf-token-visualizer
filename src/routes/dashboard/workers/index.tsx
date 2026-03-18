import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listWorkers } from "#/lib/cf-api";
import { WorkerCard } from "#/components/WorkerCard";

export const Route = createFileRoute("/dashboard/workers/")({
  component: WorkersListPage,
});

function WorkersListPage() {
  const { data: workers, isLoading, error } = useQuery({
    queryKey: ["workers"],
    queryFn: () => listWorkers(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-28" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow p-4 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-36" />
                <div className="skeleton h-4 w-12 rounded-full" />
              </div>
              <div className="flex justify-between">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-3 w-24" />
              </div>
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

  if (!workers || workers.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Workers</h1>
        <div className="alert alert-info alert-soft">
          <span>No Workers found in this account.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workers</h1>
        <div className="badge badge-neutral">{workers.length} workers</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {workers.map((w) => (
          <WorkerCard key={w.id} worker={w} />
        ))}
      </div>
    </div>
  );
}
