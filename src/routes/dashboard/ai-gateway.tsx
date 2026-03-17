import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAiGateways } from "#/lib/cf-api";
import { AiGatewayCard } from "#/components/AiGatewayCard";
import { AiGatewayLogs } from "#/components/AiGatewayLogs";

export const Route = createFileRoute("/dashboard/ai-gateway")({
  component: AiGatewayPage,
});

function AiGatewayPage() {
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const { data: gateways, isLoading, error } = useQuery({
    queryKey: ["ai-gateways"],
    queryFn: () => listAiGateways(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-32" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow p-4 space-y-2">
              <div className="skeleton h-4 w-32 font-mono" />
              <div className="flex gap-2">
                <div className="skeleton h-4 w-16 rounded-full" />
                <div className="skeleton h-4 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="space-y-2">
          <div className="skeleton h-6 w-40 rounded-full" />
          <div className="skeleton h-64 w-full rounded-box" />
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

  if (!gateways || gateways.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">AI Gateway</h1>
        <div className="alert alert-info alert-soft">
          <span>No AI Gateways found in this account.</span>
        </div>
      </div>
    );
  }

  const active = selectedGateway ?? gateways[0].id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Gateway</h1>
        <div className="badge badge-neutral">{gateways.length} gateways</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {gateways.map((gw) => (
          <AiGatewayCard
            key={gw.id}
            gateway={gw}
            selected={gw.id === active}
            onSelect={() => setSelectedGateway(gw.id)}
          />
        ))}
      </div>

      <div className="divider" />

      <AiGatewayLogs gatewayId={active} />
    </div>
  );
}
