import { getRequest } from "@tanstack/react-start/server";
import { createAuth } from "#/lib/auth";

export async function requireSession() {
  const request = getRequest();
  const auth = createAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new Error("Not authenticated");
  return session;
}
