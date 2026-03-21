import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CF Visualizer — See your Cloudflare account at a glance" },
      {
        name: "description",
        content:
          "Open-source Cloudflare dashboard. Paste your API token to visualize zones, workers, DNS, R2, KV, AI Gateway and more.",
      },
      { name: "theme-color", content: "#F6821F" },
      { property: "og:title", content: "CF Visualizer" },
      {
        property: "og:description",
        content:
          "Open-source Cloudflare dashboard. Paste your API token to visualize your entire account.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cf.zynth.dev" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "CF Visualizer" },
      {
        name: "twitter:description",
        content:
          "Open-source Cloudflare dashboard. Paste your API token to visualize your entire account.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootLayout,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="cfviz">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout() {
  return (
    <div className="min-h-screen bg-base-200">
      <Outlet />
    </div>
  );
}
