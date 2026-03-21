import { Link, useNavigate } from "@tanstack/react-router";
import { AddTokenModal } from "#/components/AddTokenModal";
import { CreateOrgModal } from "#/components/CreateOrgModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  LogOut,
  Plus,
  X,
  KeyRound,
  Building2,
  Settings,
  FolderOpen,
} from "lucide-react";
import { getTokens, switchToken, removeToken, clearTokens } from "#/lib/token";
import { getSession } from "#/lib/auth-session";
import {
  getActiveContextValue,
  setActiveContextValue,
} from "#/lib/active-context";
import { authClient } from "#/lib/auth-client";
import type { LucideIcon } from "lucide-react";
import { SimpleIcon, type SimpleIconName } from "#/components/SimpleIcon";
import {
  CloudflareAssetIcon,
  type CloudflareAssetIconName,
} from "#/components/CloudflareAssetIcon";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["tokens"],
    queryFn: () => getTokens(),
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => getSession().catch(() => null),
  });

  const { data: activeCtx } = useQuery({
    queryKey: ["active-context"],
    queryFn: () => getActiveContextValue(),
  });

  const { data: orgs } = useQuery({
    queryKey: ["user-orgs"],
    queryFn: async () => {
      try {
        const res = await authClient.organization.list();
        return res.data ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!session,
  });

  const { data: activeOrgMember } = useQuery({
    queryKey: ["active-org-member", activeCtx],
    queryFn: async () => {
      if (activeCtx?.mode !== "org") return null;
      const res = await authClient.organization.listMembers({
        query: { organizationId: activeCtx.orgId },
      });
      const members = res.data?.members ?? res.data ?? [];
      if (!Array.isArray(members) || !session) return null;
      return members.find((m: any) => m.user?.id === session.user?.id) ?? null;
    },
    enabled: !!session && activeCtx?.mode === "org",
  });

  const tokens = data?.tokens ?? [];
  const activeIdx = data?.active ?? 0;
  const isOrgMode = activeCtx?.mode === "org";
  const activeOrgId = isOrgMode ? activeCtx.orgId : null;
  const isOrgAdmin = activeOrgMember?.role === "owner" || activeOrgMember?.role === "admin";

  const handleSwitchToken = async (idx: number) => {
    await setActiveContextValue({ data: { mode: "personal", tokenIndex: idx } });
    await switchToken({ data: idx });
    await queryClient.resetQueries();
  };

  const handleSwitchOrg = async (orgId: string) => {
    await setActiveContextValue({ data: { mode: "org", orgId } });
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
    if (session) {
      await authClient.signOut();
    }
    navigate({ to: "/" });
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
                  Icon && <Icon className="size-4 text-primary" />
                )}
                {label}
              </Link>
            </li>
          ),
        )}

        {session && (
          <li>
            <Link
              to="/dashboard/projects"
              activeProps={{ className: "menu-active" }}
            >
              <FolderOpen className="size-4 text-primary" />
              Projects
            </Link>
          </li>
        )}

        {isOrgMode && isOrgAdmin && (
          <>
            <li className="menu-title mt-2">Organization</li>
            <li>
              <Link
                to="/dashboard/settings"
                activeProps={{ className: "menu-active" }}
              >
                <Settings className="size-4 text-primary" />
                Settings
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* Context Switcher */}
      <div className="border-t border-base-300 px-3 py-2">
        <ul className="menu menu-sm w-full gap-0.5 p-0">
          {/* Personal Tokens */}
          <li className="menu-title">Personal Tokens</li>
          {tokens.length > 0 && (
            <>
              {tokens.map((t, i) => (
                <li key={i}>
                  <button
                    className={!isOrgMode && i === activeIdx ? "menu-active" : ""}
                    onClick={() => handleSwitchToken(i)}
                  >
                    <KeyRound className="size-3.5 text-primary" />
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
            </>
          )}
          <li>
            <button
              onClick={() =>
                (document.getElementById("add-token-modal") as HTMLDialogElement)?.showModal()
              }
            >
              <Plus className="size-3.5 text-primary" />
              Add token
            </button>
          </li>

          {/* Organizations */}
          {session && (
            <>
              <li className="menu-title mt-2">Organizations</li>
              {orgs?.map((org) => (
                <li key={org.id}>
                  <button
                    className={activeOrgId === org.id ? "menu-active" : ""}
                    onClick={() => handleSwitchOrg(org.id)}
                  >
                    <Building2 className="size-3.5 text-primary" />
                    <span className="flex-1 truncate">{org.name}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() =>
                    (document.getElementById("create-org-modal") as HTMLDialogElement)?.showModal()
                  }
                >
                  <Plus className="size-3.5 text-primary" />
                  Create org
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* User & Actions */}
      <div className="border-t border-base-300 px-3 py-2 flex items-center justify-between">
        {session ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="avatar placeholder shrink-0">
              <div className="bg-neutral text-neutral-content size-6 rounded-full text-xs">
                {session.user.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
            </div>
            <span className="text-xs truncate">{session.user.name}</span>
          </div>
        ) : (
          <button
            className="btn btn-ghost btn-sm gap-2 btn-error"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Disconnect
          </button>
        )}

      </div>

      <AddTokenModal id="add-token-modal" />
      {session && <CreateOrgModal id="create-org-modal" />}
    </div>
  );
}
