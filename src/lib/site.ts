// The site's public address, for canonical links, the sitemap and structured data.
// Netlify passes its main URL to the build (the custom domain once one is connected),
// and vite.config.ts bakes it in as __SITE_URL__.
declare const __SITE_URL__: string | undefined;
// LEMON_RELECTURE=1 at build time (vite.config.ts): the review layer is on (see `relecture`).
declare const __LEMON_RELECTURE__: boolean | undefined;

const FALLBACK = "https://garage-plaine.netlify.app";

export const SITE_URL = (typeof __SITE_URL__ === "string" && __SITE_URL__ ? __SITE_URL__ : FALLBACK)
  .trim()
  .replace(/\/+$/, "");

/**
 * Until garageplaine.ch is connected, the site lives at Netlify's *.netlify.app addresses: the
 * test version the garage reviews, which search engines must not index. This is decided from the
 * address each request comes in on, never from a setting: src/server.ts answers
 * « X-Robots-Tag: noindex » there and robots.txt drops the sitemap, while the garage's own domain
 * is indexable the day it is connected, with nothing to change.
 */
export function isTestHost(host: string | null | undefined): boolean {
  const name = (host ?? "").trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  return name === "netlify.app" || name.endsWith(".netlify.app");
}

/** The address a request came in on: its Host header, or else its URL. */
export function requestHost(request: Request): string {
  return request.headers.get("host") || new URL(request.url).host;
}

/** The robots rule of the test version, sent on every response of a *.netlify.app address. */
export const TEST_ROBOTS_TAG = "noindex";

/** The same response, marked « X-Robots-Tag: noindex » when it answers a test address. */
export function withRobotsTag(response: Response, request: Request): Response {
  if (!isTestHost(requestHost(request))) return response;
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", TEST_ROBOTS_TAG);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Absolute URL for a path on this site, e.g. "/atelier" -> "https://…/atelier". */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The Lemon platform (the garage's console) receives the contact form's messages; see
 * src/lib/lemon.ts. Its origin must be in connect-src (src/lib/security-headers.ts).
 */
export const plateforme = {
  tenant: "garage-plaine",
  plateformeUrl: "https://connexions.heylemon.app",
} as const;

/**
 * Relecture: the garage comments on the test version with the Lemon platform's « Commenter »
 * layer (docs/RETOURS.md of lemon-plateforme); comments land in Lemon's console. Only a build
 * with LEMON_RELECTURE=1 adds the script (src/routes/__root.tsx) and keeps
 * public/relecture/retours.js (scripts/relecture.mjs removes it otherwise). The file is a copy
 * of the platform's public/retours/retours.js: never edit it here, copy it again. Its origin is
 * in connect-src and img-src (src/lib/security-headers.ts).
 */
export const relecture = {
  active: typeof __LEMON_RELECTURE__ === "boolean" && __LEMON_RELECTURE__,
  script: "/relecture/retours.js",
  plateformeUrl: "https://lemon.heylemon.app",
  client: "lemon",
} as const;
