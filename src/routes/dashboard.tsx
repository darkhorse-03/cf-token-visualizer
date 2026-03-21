import { createFileRoute, Outlet, redirect, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { getTokens } from "#/lib/token";
import { getSession } from "#/lib/auth-session";
import { getActiveContextValue } from "#/lib/active-context";
import { DashboardSidebar } from "#/components/DashboardNav";
import { PendingInvitations } from "#/components/PendingInvitations";
import { SetupPrompt } from "#/components/SetupPrompt";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const [{ tokens }, session] = await Promise.all([
      getTokens(),
      getSession().catch(() => null),
    ]);
    if (tokens.length === 0 && !session) {
      throw redirect({ to: "/" });
    }
    return { session };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { data: tokens } = useQuery({
    queryKey: ["tokens"],
    queryFn: () => getTokens(),
  });

  const { data: activeCtx } = useQuery({
    queryKey: ["active-context"],
    queryFn: () => getActiveContextValue(),
  });

  const matchRoute = useMatchRoute();
  const isSettingsPage = matchRoute({ to: "/dashboard/settings", fuzzy: true });

  const hasPersonalToken = (tokens?.tokens.length ?? 0) > 0;
  const isOrgMode = activeCtx?.mode === "org";
  const hasContext = hasPersonalToken || isOrgMode;

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
        <main className="p-6 space-y-4">
          <PendingInvitations />
          {hasContext || isSettingsPage ? <Outlet /> : <SetupPrompt />}
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
