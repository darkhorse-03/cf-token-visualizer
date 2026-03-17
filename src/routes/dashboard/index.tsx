import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe, Zap, FileText, Database, Archive } from "lucide-react";
import { getToken } from "#/lib/token";
import { getAccountOverview } from "#/lib/cf-api";
import { StatCard } from "#/components/StatCard";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const token = getToken();

  const { data, isLoading, error } = useQuery({
    queryKey: ["account-overview"],
    queryFn: () => getAccountOverview({ data: token! }),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-dots loading-lg text-primary" />
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
        <StatCard label="Zones" count={data.zones} icon={Globe} to="/dashboard/zones" />
        <StatCard label="Workers" count={data.workers} icon={Zap} to="/dashboard/workers" />
        <StatCard label="Pages" count={data.pages} icon={FileText} to="/dashboard/pages" />
        <StatCard label="R2 Buckets" count={data.r2Buckets} icon={Archive} to="/dashboard/r2" />
        <StatCard label="KV Namespaces" count={data.kvNamespaces} icon={Database} to="/dashboard/kv" />
      </div>
    </div>
  );
}
