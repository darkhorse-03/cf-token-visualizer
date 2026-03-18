import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, ExternalLink } from "lucide-react";
import { addToken } from "#/lib/token";
import { verifyToken } from "#/lib/cf-api";

export function TokenForm() {
  const [token, setTokenValue] = useState("");
  const [label, setLabel] = useState("");
  const navigate = useNavigate();

  const verify = useMutation({
    mutationFn: async (t: string) => {
      await verifyToken({ data: t });
      await addToken({ data: { label: label.trim() || "Default", token: t } });
    },
    onSuccess: () => {
      navigate({ to: "/dashboard" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    verify.mutate(trimmed);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md animate-fade-up">
        <div className="card-body gap-4">
          <div>
            <h2 className="card-title text-2xl font-bold gap-2">
              <KeyRound className="size-6" style={{ color: "#F6821F" }} />
              Connect
            </h2>
            <p className="text-base-content/50 text-sm mt-1">
              Add a Cloudflare API token to visualize your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setTokenValue(e.target.value)}
                autoFocus
              />
            </fieldset>

            {verify.isError && (
              <div className="alert alert-error alert-soft">
                <span className="text-sm">{verify.error.message}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn w-full text-white border-none"
              style={{ backgroundColor: "#F6821F" }}
              disabled={!token.trim() || verify.isPending}
            >
              {verify.isPending && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {verify.isPending ? "Verifying..." : "Connect"}
            </button>
          </form>

          <div className="divider text-xs text-base-content/30">
            Need a token?
          </div>
          <p className="text-xs text-base-content/40 text-center">
            <a
              href="https://dash.cloudflare.com/profile/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
              style={{ color: "#F6821F" }}
            >
              Cloudflare Dashboard <ExternalLink className="size-3 inline" />
            </a>
            {" → API Tokens → Create with "}
            <kbd className="kbd kbd-xs">Zone:Read</kbd>
            {" and "}
            <kbd className="kbd kbd-xs">DNS:Read</kbd>
          </p>
        </div>
      </div>
    </div>
  );
}
