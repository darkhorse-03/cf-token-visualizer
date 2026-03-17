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
      { title: "CF Token Visualizer" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootLayout,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var root=document.documentElement;var themes=['emerald','forest'];var stored=localStorage.getItem('theme');if(stored&&themes.indexOf(stored)!==-1){root.setAttribute('data-theme',stored);return;}var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;root.setAttribute('data-theme',prefersDark?'forest':'emerald');}catch(e){}})();",
          }}
        />
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
