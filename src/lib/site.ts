// The site's public address, for canonical links, the sitemap and structured data.
// Netlify passes its main URL to the build (the custom domain once one is connected),
// and vite.config.ts bakes it in as __SITE_URL__.
declare const __SITE_URL__: string | undefined;

const FALLBACK = "https://garage-plaine.netlify.app";

export const SITE_URL = (typeof __SITE_URL__ === "string" && __SITE_URL__ ? __SITE_URL__ : FALLBACK)
  .trim()
  .replace(/\/+$/, "");

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
