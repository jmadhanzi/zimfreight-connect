import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppShell } from "@/components/layout/AppShell";

function NotFoundComponent() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-8xl font-black text-primary">404</h1>
          <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">Route not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">This load doesn't exist on our board.</p>
          <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Back to home
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ZimFreight — Zimbabwe's Premier Truck Load Board" },
      { name: "description", content: "Find and post freight loads across Zimbabwe and SADC. Real-time load board for carriers, brokers and shippers." },
      { property: "og:title", content: "ZimFreight — Truck Load Board for Zimbabwe" },
      { property: "og:description", content: "Connecting carriers, brokers and shippers across Zimbabwe and SADC. Real-time loads, transparent rates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body><div id="root">{children}</div><Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return <AppShell><Outlet /></AppShell>;
}
