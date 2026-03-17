import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listZones } from "#/lib/cf-api";
import { ZoneCard } from "#/components/ZoneCard";

export const Route = createFileRoute("/dashboard/zones")({
  component: ZonesPage,
});

function ZonesPage() {
  const { data: zones, isLoading, error } = useQuery({
    queryKey: ["zones"],
    queryFn: () => listZones(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="skeleton h-5 w-40" />
                <div className="skeleton h-5 w-14 rounded-full" />
                <div className="skeleton h-5 w-12 rounded-full" />
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zones</h1>
        {zones && (
          <div className="badge badge-neutral">{zones.length} zones</div>
        )}
      </div>
      <div className="space-y-3">
        {zones?.map((zone) => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
}
