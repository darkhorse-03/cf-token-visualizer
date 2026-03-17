import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/ai-gateway")({
  component: AiGatewayPage,
});

function AiGatewayPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">AI Gateway</h1>
      <p className="text-base-content/60">Coming soon.</p>
    </div>
  );
}
