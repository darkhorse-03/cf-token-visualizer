import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Globe,
  Zap,
  FileText,
  Archive,
  Database,
  BrainCircuit,
  LogOut,
  Scan,
} from "lucide-react";
import { clearToken } from "#/lib/token";
import type { LucideIcon } from "lucide-react";

export function DashboardSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col min-h-full bg-base-200">
      <div className="p-4 flex items-center gap-2">
        <Scan className="size-5 text-primary" />
        <span className="font-semibold tracking-tight">CF Visualizer</span>
      </div>
      <ul className="menu menu-sm flex-1 w-full px-2 gap-0.5">
        <li className="menu-title">Dashboard</li>
        {([
          { to: "/dashboard", label: "Overview", icon: BarChart3 },
          { to: "/dashboard/zones", label: "Zones", icon: Globe },
          { to: "/dashboard/workers", label: "Workers", icon: Zap },
          { to: "/dashboard/pages", label: "Pages", icon: FileText },
          { to: "/dashboard/r2", label: "R2 Buckets", icon: Archive },
          { to: "/dashboard/kv", label: "KV Namespaces", icon: Database },
          { to: "/dashboard/ai-gateway", label: "AI Gateway", icon: BrainCircuit },
        ] as { to: string; label: string; icon: LucideIcon }[]).map(
          ({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "menu-active" }}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            </li>
          ),
        )}
      </ul>
      <div className="p-2">
        <button
          className="btn btn-ghost btn-sm w-full justify-start gap-2 text-base-content/40 hover:text-error"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Disconnect
        </button>
      </div>
    </div>
  );
}
