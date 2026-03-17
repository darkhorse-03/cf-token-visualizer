import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/kv")({
  component: KvPage,
});

function KvPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">KV Namespaces</h1>
      <p className="text-base-content/60">Coming soon.</p>
    </div>
  );
}
