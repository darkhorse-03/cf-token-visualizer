import { Link, useNavigate } from "@tanstack/react-router";
import { AddTokenModal } from "#/components/AddTokenModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Plus,
  X,
  KeyRound,
} from "lucide-react";
import { getTokens, switchToken, removeToken, clearTokens } from "#/lib/token";
import type { LucideIcon } from "lucide-react";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["tokens"],
    queryFn: () => getTokens(),
  });

  const tokens = data?.tokens ?? [];
  const activeIdx = data?.active ?? 0;

  const handleSwitch = async (idx: number) => {
    await switchToken({ data: idx });
    await queryClient.resetQueries();
  };

  const handleRemove = async (idx: number) => {
    await removeToken({ data: idx });
    const updated = await getTokens();
    if (updated.tokens.length === 0) {
      navigate({ to: "/" });
    } else {
      await queryClient.resetQueries();
    }
  };

  const handleLogout = async () => {
    await clearTokens();
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col h-full bg-base-200">
      <div className="p-4 flex items-center gap-2">
        <Scan className="size-5 text-primary" />
        <span className="font-semibold tracking-tight">CF Visualizer</span>
      </div>

      <ul className="menu menu-sm w-full px-2 gap-0.5 flex-1">
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

      <div className="border-t border-base-300 px-3 py-2">
        <ul className="menu menu-sm w-full gap-0.5 p-0">
          <li className="menu-title">Tokens</li>
          {tokens.map((t, i) => (
            <li key={i}>
              <button
                className={i === activeIdx ? "menu-active" : ""}
                onClick={() => handleSwitch(i)}
              >
                <KeyRound className="size-3.5" />
                <span className="flex-1 truncate">{t.label}</span>
                {tokens.length > 1 && (
                  <span
                    className="opacity-0 group-hover:opacity-100 hover:text-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(i);
                    }}
                  >
                    <X className="size-3" />
                  </span>
                )}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() =>
                (document.getElementById("add-token-modal") as HTMLDialogElement)?.showModal()
              }
            >
              <Plus className="size-3.5" />
              Add token
            </button>
          </li>
        </ul>
      </div>

      <div className="border-t border-base-300 px-3 py-2">
        <button
          className="btn btn-ghost btn-sm w-full justify-start gap-2 text-base-content/40 hover:text-error"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Disconnect all
        </button>
      </div>

      <AddTokenModal id="add-token-modal" />
    </div>
  );
}
