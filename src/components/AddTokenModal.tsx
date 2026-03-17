import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { addToken } from "#/lib/token";
import { verifyToken } from "#/lib/cf-api";

export function AddTokenModal({ id }: { id: string }) {
  const [token, setToken] = useState("");
  const [label, setLabel] = useState("");
  const queryClient = useQueryClient();

  const verify = useMutation({
    mutationFn: async (t: string) => {
      await verifyToken({ data: t });
      await addToken({ data: { label: label.trim() || "Default", token: t } });
    },
    onSuccess: () => {
      setToken("");
      setLabel("");
      queryClient.invalidateQueries();
      const modal = document.getElementById(id) as HTMLDialogElement;
      modal?.close();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    verify.mutate(trimmed);
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          Add Token
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Label</legend>
            <input
              type="text"
              placeholder="e.g. Production, Staging"
              className="input input-bordered w-full"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">API Token</legend>
            <input
              type="password"
              placeholder="Paste your token here"
              className="input input-bordered w-full font-mono"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </fieldset>

          {verify.isError && (
            <div className="alert alert-error alert-soft">
              <span className="text-sm">{verify.error.message}</span>
            </div>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">Cancel</button>
            </form>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!token.trim() || verify.isPending}
            >
              {verify.isPending && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {verify.isPending ? "Verifying..." : "Add"}
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
