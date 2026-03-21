import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, ExternalLink } from "lucide-react";
import { addToken } from "#/lib/token";
import { verifyToken } from "#/lib/cf-api";
import { authClient } from "#/lib/auth-client";

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
              <KeyRound className="size-6 text-primary" />
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
              className="btn btn-primary w-full"
              disabled={!token.trim() || verify.isPending}
            >
              {verify.isPending && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {verify.isPending ? "Verifying..." : "Connect"}
            </button>
          </form>

          <div className="divider text-xs text-base-content/30">or</div>

          <button
            type="button"
            className="btn btn-outline w-full gap-2"
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
              })
            }
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="divider text-xs text-base-content/30">
            Need a token?
          </div>
          <p className="text-xs text-base-content/40 text-center">
            <a
              href="https://dash.cloudflare.com/profile/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="link text-primary"
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
