import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "./schema";

export { schema };

export function getDb() {
  return drizzle(env.DB, { schema });
}
