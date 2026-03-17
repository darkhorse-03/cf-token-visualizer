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
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
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
