import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, Globe, Zap, FileText, LogOut } from "lucide-react";
import { clearToken } from "#/lib/token";
import type { LucideIcon } from "lucide-react";

export function DashboardNav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate({ to: "/" });
  };

  return (
    <div className="flex items-center mb-6">
      <div role="tablist" className="tabs tabs-bordered flex-1">
        {([
          { to: "/dashboard", label: "Overview", icon: BarChart3 },
          { to: "/dashboard/zones", label: "Zones", icon: Globe },
          { to: "/dashboard/workers", label: "Workers", icon: Zap },
          { to: "/dashboard/pages", label: "Pages", icon: FileText },
        ] as { to: string; label: string; icon: LucideIcon }[]).map(
          ({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="tab"
              className="tab gap-1.5"
              activeOptions={{ exact: true }}
              activeProps={{ className: "tab tab-active gap-1.5" }}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ),
        )}
      </div>
      <button
        className="btn btn-ghost btn-sm gap-1.5 text-base-content/40 hover:text-error ml-4"
        onClick={handleLogout}
      >
        <LogOut className="size-3.5" />
        Disconnect
      </button>
    </div>
  );
}
