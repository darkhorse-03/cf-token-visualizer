import alchemy from "alchemy";
import { TanStackStart } from "alchemy/cloudflare";

const app = await alchemy("cf-viz");

export const worker = await TanStackStart("web", {
  url: false,
  domains: [
    "cf.zynth.dev",
  ]
});

console.log({
  url: worker.url,
});

await app.finalize();
