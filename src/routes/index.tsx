import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getToken } from "#/lib/token";
import { TokenForm } from "#/components/TokenForm";

export const Route = createFileRoute("/")({ component: TokenPage });

function TokenPage() {
  const navigate = useNavigate();
  const existingToken = getToken();

  if (existingToken) {
    navigate({ to: "/dashboard" });
    return null;
  }

  return <TokenForm />;
}
