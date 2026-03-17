import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Database, Archive } from "lucide-react";
import { getAccountOverview } from "#/lib/cf-api";
import { StatCard } from "#/components/StatCard";
import { SimpleIcon } from "#/components/SimpleIcon";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["account-overview"],
    queryFn: () => getAccountOverview(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-7 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-md p-5 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-5 w-5 rounded" />
              </div>
              <div className="skeleton h-9 w-16" />
              <div className="skeleton h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <span>{error.message}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Account Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Zones"
          count={data.zones}
          icon={(props) => <SimpleIcon name="cloudflare" {...props} />}
          to="/dashboard/zones"
        />
        <StatCard
          label="Workers"
          count={data.workers}
          icon={(props) => <SimpleIcon name="workers" {...props} />}
          to="/dashboard/workers"
        />
        <StatCard
          label="Pages"
          count={data.pages}
          icon={(props) => <SimpleIcon name="pages" {...props} />}
          to="/dashboard/pages"
        />
        <StatCard label="R2 Buckets" count={data.r2Buckets} icon={Archive} to="/dashboard/r2" />
        <StatCard label="KV Namespaces" count={data.kvNamespaces} icon={Database} to="/dashboard/kv" />
      </div>
    </div>
  );
}
