import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Shield, Crown, User, Trash2 } from "lucide-react";
import { getActiveContextValue } from "#/lib/active-context";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/dashboard/settings/members")({
  component: MembersPage,
});

const ROLE_ICON: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const ROLE_BADGE: Record<string, string> = {
  owner: "badge-warning",
  admin: "badge-info",
  member: "badge-ghost",
};

function MembersPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const queryClient = useQueryClient();

  const { data: ctx } = useQuery({
    queryKey: ["active-context"],
    queryFn: () => getActiveContextValue(),
    staleTime: 0,
  });

  const orgId = ctx?.mode === "org" ? ctx.orgId : null;

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["org-members", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const res = await authClient.organization.listMembers({
        query: { organizationId: orgId },
      });
      return res.data?.members ?? res.data ?? [];
    },
    enabled: !!orgId,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!orgId) return;
      await authClient.organization.inviteMember({
        organizationId: orgId,
        email: email.trim(),
        role,
      });
    },
    onSuccess: () => {
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["org-members"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!orgId) return;
      await authClient.organization.removeMember({
        organizationId: orgId,
        memberIdOrEmail: memberId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members"] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: string }) => {
      if (!orgId) return;
      await authClient.organization.updateMemberRole({
        organizationId: orgId,
        memberId,
        role: newRole as "admin" | "member",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members"] });
    },
  });

  if (!orgId) {
    return (
      <div className="alert alert-warning alert-soft">
        <span>Switch to an organization to manage members.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">
            <UserPlus className="size-5" />
            Invite Member
          </h2>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="input input-bordered flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="select select-bordered"
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "member")}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className="btn btn-primary"
              disabled={!email.trim() || inviteMutation.isPending}
              onClick={() => inviteMutation.mutate()}
            >
              Invite
            </button>
          </div>
          {inviteMutation.isError && (
            <div className="alert alert-error alert-soft">
              <span className="text-sm">{inviteMutation.error.message}</span>
            </div>
          )}
          {inviteMutation.isSuccess && (
            <div className="alert alert-success alert-soft">
              <span className="text-sm">Invitation sent!</span>
            </div>
          )}
        </div>
      </div>

      {/* Members list */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Members</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton size-8 rounded-full" />
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-4 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {membersData?.map((m) => {
                    const RoleIcon = ROLE_ICON[m.role] ?? User;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content size-8 rounded-full text-xs">
                                {m.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{m.user.name}</div>
                              <div className="text-xs text-base-content/50">{m.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {m.role === "owner" ? (
                            <span className={`badge badge-xs ${ROLE_BADGE[m.role]}`}>
                              <RoleIcon className="size-3 mr-1" />
                              {m.role}
                            </span>
                          ) : (
                            <select
                              className="select select-bordered select-xs"
                              value={m.role}
                              onChange={(e) =>
                                roleMutation.mutate({ memberId: m.id, newRole: e.target.value })
                              }
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                        <td>
                          {m.role !== "owner" && (
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => removeMutation.mutate(m.id)}
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
