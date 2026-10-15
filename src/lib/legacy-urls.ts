// Addresses of the garage's previous website (garageplaine.ch, Joomla). Once the domain
// points to this site, search results and bookmarks still use them: each one answers with a
// permanent redirect to its new page, so visitors land in the right place and search engines
// carry the old pages' standing over.
import { sitePages } from "./site-files";

export const legacyRedirects: Record<string, string> = {
  "/entreprise/le-garage": "/entreprise",
  "/entreprise/service-vente": "/services#vente",
  "/entreprise/la-carrosserie": "/services#carrosserie",
  "/entreprise/atelier-mecanique": "/services#mecanique",
  "/entreprise/pompe-a-essence": "/station-service",
  "/vehicules/en-stock": "/vehicules",
  "/vehicules/nouveautes": "/suzuki",
  "/vehicules/gamme-suzuki": "/suzuki",
  "/contact/contacter": "/contact",
  "/contact/horaires": "/contact",
  "/contact/nous-achetons-votre-vehicule": "/reprise",
  "/contact/nous-achetons-votre-vehicule/demandeform": "/reprise",
};

const pages = new Set<string>(sitePages.map((p) => p.path));

/** Where an old or variant address should go, or null to serve it as it is. */
export function legacyRedirect(pathname: string): string | null {
  const clean =
    pathname
      .toLowerCase()
      .replace(/^\/index\.php(?=\/|$)/, "")
      .replace(/\.html?$/, "")
      .replace(/\/+$/, "") || "/";
  const target = legacyRedirects[clean] ?? (pages.has(clean) ? clean : null);
  return target && target !== pathname ? target : null;
}
