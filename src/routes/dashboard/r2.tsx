import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/r2")({
  component: R2Page,
});

function R2Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">R2 Buckets</h1>
      <p className="text-base-content/60">Coming soon.</p>
    </div>
  );
}
