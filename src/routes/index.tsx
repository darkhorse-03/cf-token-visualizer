import { createFileRoute, redirect } from "@tanstack/react-router";
import { getTokens } from "#/lib/token";
import { TokenForm } from "#/components/TokenForm";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { tokens } = await getTokens();
    if (tokens.length > 0) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: TokenPage,
});

function TokenPage() {
  return <TokenForm />;
}
