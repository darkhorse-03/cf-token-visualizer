import { Link, useNavigate } from "@tanstack/react-router";
import { AddTokenModal } from "#/components/AddTokenModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  LogOut,
  Plus,
  X,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";
import { getTokens, switchToken, removeToken, clearTokens } from "#/lib/token";
import type { LucideIcon } from "lucide-react";
import { SimpleIcon, type SimpleIconName } from "#/components/SimpleIcon";
import {
  CloudflareAssetIcon,
  type CloudflareAssetIconName,
} from "#/components/CloudflareAssetIcon";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isForestByDefault =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "forest";

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

  const handleThemeChange = (checked: boolean) => {
    const theme = checked ? "forest" : "emerald";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <div className="flex flex-col h-full bg-base-200">
      <div className="p-4 flex items-center gap-2">
        <SimpleIcon name="cloudflare" className="size-5" />
        <span className="font-semibold tracking-tight">CF Visualizer</span>
      </div>

      <ul className="menu menu-sm w-full px-2 gap-0.5 flex-1">
        <li className="menu-title">Dashboard</li>
        {([
          { to: "/dashboard", label: "Overview", icon: BarChart3 },
          { to: "/dashboard/zones", label: "Zones", simpleIcon: "cloudflare" },
          { to: "/dashboard/workers", label: "Workers & Pages", simpleIcon: "workers" },
          { to: "/dashboard/r2", label: "R2 Buckets", cfIcon: "r2" },
          { to: "/dashboard/kv", label: "KV Namespaces", cfIcon: "kv" },
          { to: "/dashboard/ai-gateway", label: "AI Gateway", cfIcon: "aiGateway" },
        ] as {
          to: string;
          label: string;
          icon?: LucideIcon;
          simpleIcon?: SimpleIconName;
          cfIcon?: CloudflareAssetIconName;
        }[]).map(({ to, label, icon: Icon, simpleIcon, cfIcon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/dashboard" }}
                activeProps={{ className: "menu-active" }}
              >
                {simpleIcon ? (
                  <SimpleIcon name={simpleIcon} className="size-4" />
                ) : cfIcon ? (
                  <CloudflareAssetIcon name={cfIcon} className="size-[18px]" />
                ) : (
                  Icon && <Icon className="size-4" style={{ color: "#F6821F" }} />
                )}
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
                <KeyRound className="size-3.5" style={{ color: "#F6821F" }} />
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

      <div className="border-t border-base-300 px-3 py-2 flex items-center justify-between">
        <button
          className="btn btn-ghost btn-sm gap-2 btn-error"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Disconnect
        </button>

        <label className="swap swap-rotate btn btn-ghost btn-sm btn-square">
          <input
            type="checkbox"
            className="theme-controller"
            value="forest"
            defaultChecked={isForestByDefault}
            autoComplete="off"
            onChange={(e) => handleThemeChange(e.target.checked)}
            aria-label="Toggle theme"
          />
          <Sun className="swap-off size-4" />
          <Moon className="swap-on size-4" />
        </label>
      </div>

      <AddTokenModal id="add-token-modal" />
    </div>
  );
}
