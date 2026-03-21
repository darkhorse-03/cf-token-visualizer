import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { KeyRound, Users, Shield } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization Settings</h1>
      <div className="flex gap-2">
        {[
          { to: "/dashboard/settings", label: "Token", icon: KeyRound, exact: true },
          { to: "/dashboard/settings/members", label: "Members", icon: Users },
          { to: "/dashboard/settings/permissions", label: "Permissions", icon: Shield },
        ].map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            activeProps={{ className: "btn-active" }}
            className="btn btn-sm btn-ghost"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
