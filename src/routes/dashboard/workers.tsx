import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/workers")({
  component: WorkersPage,
});

function WorkersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Workers</h1>
      <p className="text-base-content/60">Coming soon.</p>
    </div>
  );
}
