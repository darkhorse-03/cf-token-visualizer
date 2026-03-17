import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { getTokens } from "#/lib/token";
import { DashboardSidebar } from "#/components/DashboardNav";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { tokens } = await getTokens();
    if (tokens.length === 0) {
      throw redirect({ to: "/" });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="drawer lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <div className="navbar bg-base-100 border-b border-base-300 lg:hidden">
          <label htmlFor="dashboard-drawer" className="btn btn-ghost btn-square drawer-button">
            <Menu className="size-5" />
          </label>
          <span className="font-semibold">CF Visualizer</span>
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay" />
        <aside className="w-64 h-screen sticky top-0">
          <DashboardSidebar />
        </aside>
      </div>
    </div>
  );
}
