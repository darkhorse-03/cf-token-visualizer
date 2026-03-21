import { createFileRoute, redirect } from "@tanstack/react-router";
import { getTokens } from "#/lib/token";
import { getSession } from "#/lib/auth-session";
import { TokenForm } from "#/components/TokenForm";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const [{ tokens }, session] = await Promise.all([
      getTokens(),
      getSession().catch(() => null),
    ]);
    if (tokens.length > 0 || session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: TokenPage,
});

function TokenPage() {
  return <TokenForm />;
}
