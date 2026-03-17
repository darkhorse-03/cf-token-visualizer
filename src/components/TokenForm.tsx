import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, ExternalLink } from "lucide-react";
import { setToken } from "#/lib/token";
import { verifyToken } from "#/lib/cf-api";

export function TokenForm() {
  const [token, setTokenValue] = useState("");
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();

  const verify = useMutation({
    mutationFn: (t: string) => verifyToken({ data: t }),
    onSuccess: (_data, t) => {
      setToken(t, remember);
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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md animate-fade-up">
        <div className="card-body gap-4">
          <div>
            <h2 className="card-title text-2xl font-bold gap-2">
              <KeyRound className="size-6 text-primary" />
              Connect
            </h2>
            <p className="text-base-content/50 text-sm mt-1">
              Paste your Cloudflare API token to visualize your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <label className="fieldset flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <div>
                <span className="text-sm font-medium">Remember me</span>
                <p className="text-xs text-base-content/40">
                  {remember
                    ? "Persists across sessions"
                    : "Cleared when tab closes"}
                </p>
              </div>
            </label>

            {verify.isError && (
              <div className="alert alert-error alert-soft">
                <span className="text-sm">{verify.error.message}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
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
              className="link link-primary"
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
