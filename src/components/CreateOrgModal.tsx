import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { setActiveContextValue } from "#/lib/active-context";

export function CreateOrgModal({ id }: { id: string }) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const slug = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const res = await authClient.organization.create({
        name: name.trim(),
        slug,
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: async (org) => {
      setName("");
      (document.getElementById(id) as HTMLDialogElement)?.close();
      await queryClient.invalidateQueries({ queryKey: ["user-orgs"] });
      if (org) {
        await setActiveContextValue({ data: { mode: "org", orgId: org.id } });
        await queryClient.resetQueries();
      }
    },
  });

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          Create Organization
        </h3>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) createMutation.mutate();
          }}
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Organization Name</legend>
            <input
              type="text"
              placeholder="e.g. My Team"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>

          {createMutation.isError && (
            <div className="alert alert-error alert-soft">
              <span className="text-sm">{createMutation.error.message}</span>
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                (document.getElementById(id) as HTMLDialogElement)?.close()
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
