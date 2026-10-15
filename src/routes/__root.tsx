import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader, SiteFooter } from "@/components/garage/site-shell";
import { garage } from "@/lib/garage";
import { siteJsonLd } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <section className="status-page">
      <div className="container">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Erreur 404
        </div>
        <h1>Cette page n’existe pas, ou plus.</h1>
        <p>
          L’adresse a peut-être changé avec notre nouveau site. Ces liens devraient vous aider :
        </p>
        <div className="detail-actions">
          <Link to="/" className="garage-button garage-button-primary inline-flex items-center">
            Retour à l’accueil
          </Link>
          <Link
            to="/vehicules"
            className="garage-button garage-button-outline inline-flex items-center"
          >
            Voir les véhicules
          </Link>
          <a href={garage.phoneHref} className="section-link">
            Appeler le {garage.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <section className="status-page">
      <div className="container">
        <h1>Cette page n’a pas pu s’afficher.</h1>
        <p>Un problème est survenu de notre côté. Réessayez, ou appelez-nous au {garage.phone}.</p>
        <div className="detail-actions">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="garage-button garage-button-primary inline-flex items-center"
          >
            Réessayer
          </button>
          <a href="/" className="garage-button garage-button-outline inline-flex items-center">
            Retour à l’accueil
          </a>
        </div>
      </div>
    </section>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0b2233" },
      { name: "format-detection", content: "telephone=yes" },
    ],
    // The business, its departments and people, for search engines and AI assistants.
    scripts: [{ type: "application/ld+json", children: siteJsonLd() }],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      // The two fonts every page uses first, so text renders in them without a second wait.
      ...["/fonts/inter-latin.woff2", "/fonts/manrope-latin.woff2"].map((href) => ({
        rel: "preload",
        href,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous" as const,
      })),
    ],
  }),
  // Pages are the same for every visitor, so Netlify's CDN may keep them for 10 minutes
  // (a deploy clears it). This also bounds how often the homepage asks Autolina for stock.
  headers: () => ({
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Netlify-CDN-Cache-Control": "public, durable, s-maxage=600, stale-while-revalidate=86400",
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr-CH">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteHeader />
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </QueryClientProvider>
  );
}
