import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { getToken } from "#/lib/token";
import { DashboardNav } from "#/components/DashboardNav";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const token = getToken();

  if (!token) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <DashboardNav />
      <Outlet />
    </main>
  );
}
