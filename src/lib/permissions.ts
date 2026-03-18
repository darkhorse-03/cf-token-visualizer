/**
 * Maps CF API path patterns to the required token permission.
 * Used to show helpful error messages when a token lacks access.
 *
 * To add a new resource: add an entry with a path substring
 * and the permission name as shown in the CF dashboard.
 */
export const PERMISSION_MAP: Record<string, string> = {
  "/zones": "Zone:Read",
  "/dns_records": "DNS:Read",
  "/workers/scripts": "Workers Scripts:Read",
  "/pages/projects": "Cloudflare Pages:Read",
  "/r2/buckets": "R2 Storage:Read",
  "/storage/kv/namespaces": "Workers KV Storage:Read",
  "/ai-gateway": "AI Gateway:Read",
  "/accounts": "Account Settings:Read",
  "/d1/database": "D1:Read",
  "/workers/observability": "Workers Observability:Write",
};

export function getRequiredPermission(path: string): string | null {
  for (const [pattern, permission] of Object.entries(PERMISSION_MAP)) {
    if (path.includes(pattern)) return permission;
  }
  return null;
}
