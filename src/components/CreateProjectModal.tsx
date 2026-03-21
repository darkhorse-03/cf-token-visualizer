import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderPlus } from "lucide-react";
import { createProject } from "#/lib/project-api";

export function CreateProjectModal({
  id,
  orgId,
}: {
  id: string;
  orgId?: string | null;
}) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return createProject({ data: { name: name.trim(), orgId: orgId ?? undefined } });
    },
    onSuccess: () => {
      setName("");
      (document.getElementById(id) as HTMLDialogElement)?.close();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FolderPlus className="size-5 text-primary" />
          Create Project
        </h3>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) mutation.mutate();
          }}
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Project Name</legend>
            <input
              type="text"
              placeholder="e.g. API Backend, Marketing Site"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>

          {mutation.isError && (
            <div className="alert alert-error alert-soft">
              <span className="text-sm">{mutation.error.message}</span>
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
              disabled={!name.trim() || mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Create"}
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
