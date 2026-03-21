import alchemy from "alchemy";
import { D1Database, TanStackStart } from "alchemy/cloudflare";

const app = await alchemy("cf-viz");

const db = await D1Database("cf-viz-db", {
  migrationsDir: "./drizzle/migrations",
});

export const worker = await TanStackStart("web", {
  url: false,
  domains: [
    "cf.zynth.dev",
  ],
  bindings: {
    DB: db,
    GOOGLE_CLIENT_ID: alchemy.secret(process.env.GOOGLE_CLIENT_ID!),
    GOOGLE_CLIENT_SECRET: alchemy.secret(process.env.GOOGLE_CLIENT_SECRET!),
    BETTER_AUTH_SECRET: alchemy.secret(process.env.BETTER_AUTH_SECRET!),
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  }
});

console.log({
  url: worker.url,
});

await app.finalize();
