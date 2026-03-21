import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Check, KeyRound } from "lucide-react";
import { getActiveContextValue } from "#/lib/active-context";
import { getOrgToken, setOrgToken, syncOrgResources } from "#/lib/org-api";

export const Route = createFileRoute("/dashboard/settings/")({
  component: TokenSettingsPage,
});

function TokenSettingsPage() {
  const [token, setToken] = useState("");
  const queryClient = useQueryClient();

  const { data: ctx } = useQuery({
    queryKey: ["active-context"],
    queryFn: () => getActiveContextValue(),
    staleTime: 0,
  });

  const orgId = ctx?.mode === "org" ? ctx.orgId : null;

  const { data: tokenInfo, isLoading } = useQuery({
    queryKey: ["org-token", orgId],
    queryFn: () => getOrgToken({ data: orgId! }),
    enabled: !!orgId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!orgId) return;
      await setOrgToken({ data: { orgId, token: token.trim() } });
    },
    onSuccess: () => {
      setToken("");
      queryClient.invalidateQueries({ queryKey: ["org-token"] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!orgId) return;
      await syncOrgResources({ data: orgId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cached-resources"] });
    },
  });

  if (!orgId) {
    return (
      <div className="alert alert-warning alert-soft">
        <span>Switch to an organization to manage settings.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">
            <KeyRound className="size-5" />
            Cloudflare API Token
          </h2>
          <p className="text-sm text-base-content/50">
            This token is used for all API calls on behalf of organization members.
          </p>

          {isLoading ? (
            <div className="skeleton h-10 w-full" />
          ) : (
            <>
              {tokenInfo?.hasToken && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-success" />
                  <span className="text-base-content/60">
                    Token configured
                    {tokenInfo.updatedAt && (
                      <> &middot; updated {new Date(tokenInfo.updatedAt).toLocaleDateString()}</>
                    )}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder={tokenInfo?.hasToken ? "Replace token..." : "Paste CF API token"}
                  className="input input-bordered flex-1 font-mono"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  disabled={!token.trim() || saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  {saveMutation.isPending ? "Verifying..." : "Save"}
                </button>
              </div>

              {saveMutation.isError && (
                <div className="alert alert-error alert-soft">
                  <span className="text-sm">{saveMutation.error.message}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {tokenInfo?.hasToken && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg">
              <RefreshCw className="size-5" />
              Resource Sync
            </h2>
            <p className="text-sm text-base-content/50">
              Sync available Cloudflare resources so you can assign permissions to members.
            </p>
            <div>
              <button
                className="btn btn-neutral btn-sm"
                disabled={syncMutation.isPending}
                onClick={() => syncMutation.mutate()}
              >
                {syncMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Syncing...
                  </>
                ) : (
                  "Sync Resources"
                )}
              </button>
              {syncMutation.isSuccess && (
                <span className="text-sm text-success ml-3">
                  Synced {(syncMutation.data as { count: number })?.count} resources
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
