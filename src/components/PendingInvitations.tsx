import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, X } from "lucide-react";
import { authClient } from "#/lib/auth-client";

export function PendingInvitations() {
  const queryClient = useQueryClient();

  const { data: invitations } = useQuery({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      const res = await authClient.organization.listUserInvitations();
      const data = res.data ?? [];
      return Array.isArray(data) ? data : [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await authClient.organization.acceptInvitation({ invitationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await authClient.organization.rejectInvitation({ invitationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
  });

  const pending = invitations?.filter((i) => i.status === "pending") ?? [];

  if (pending.length === 0) return null;

  return (
    <div className="space-y-2">
      {pending.map((invite) => (
        <div
          key={invite.id}
          className="alert shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <span className="text-sm">
              You've been invited to join{" "}
              <strong>{invite.organizationName ?? "an organization"}</strong>
              {invite.role && (
                <span className="text-base-content/50"> as {invite.role}</span>
              )}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-success btn-xs"
              disabled={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate(invite.id)}
            >
              <Check className="size-3" />
              Accept
            </button>
            <button
              className="btn btn-ghost btn-xs"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(invite.id)}
            >
              <X className="size-3" />
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
