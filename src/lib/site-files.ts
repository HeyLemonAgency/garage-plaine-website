// Plain-text files for crawlers, generated from the shared facts: sitemap.xml, robots.txt
// and llms.txt (a short Markdown brief for AI assistants, see llmstxt.org).
import {
  bodyworkServices,
  faqs,
  garage,
  mechanicalServices,
  salesServices,
  team,
  wirRates,
} from "./garage";
import { SITE_URL, absoluteUrl } from "./site";

declare const __BUILD_DATE__: string | undefined;
const BUILD_DATE =
  typeof __BUILD_DATE__ === "string" ? __BUILD_DATE__ : new Date().toISOString().slice(0, 10);

/** Indexable pages, most important first. */
export const sitePages = [
  {
    path: "/",
    name: "Accueil",
    priority: 1,
    about: "Le garage, ses services et ses dernières annonces.",
  },
  {
    path: "/vehicules",
    name: "Véhicules en stock",
    priority: 0.9,
    about:
      "Le stock en direct : Suzuki neuves et occasions toutes marques, avec prix et kilométrage.",
  },
  {
    path: "/services",
    name: "Services",
    priority: 0.9,
    about:
      "Vente et reprise, carrosserie (sinistres, peinture, restauration) et atelier mécanique.",
  },
  {
    path: "/suzuki",
    name: "Partenaire Suzuki",
    priority: 0.8,
    about: "Concessionnaire Suzuki depuis plus de 20 ans : gamme, essais, financement, atelier.",
  },
  {
    path: "/rendez-vous",
    name: "Rendez-vous",
    priority: 0.8,
    about: "Demande de rendez-vous en ligne pour l’atelier, la carrosserie ou un essai.",
  },
  {
    path: "/contact",
    name: "Contact et horaires",
    priority: 0.8,
    about: "Adresse, téléphones, horaires, itinéraire et contacts par service.",
  },
  {
    path: "/entreprise",
    name: "Entreprise",
    priority: 0.6,
    about: "Le garage, son équipe et son rôle d’entreprise formatrice.",
  },
  {
    path: "/reprise",
    name: "Nous achetons votre véhicule",
    priority: 0.6,
    about: "Vendre ou faire reprendre sa voiture au service vente.",
  },
  {
    path: "/station-service",
    name: "Station-service Jubin",
    priority: 0.5,
    about: "Station-service Jubin accessible 24h/24 et 7j/7, Jubin Card.",
  },
  { path: "/wir", name: "Partenariat WIR", priority: 0.4, about: "Conditions de paiement en WIR." },
  {
    path: "/confidentialite",
    name: "Confidentialité",
    priority: 0.2,
    about: "Traitement des demandes de contact et contenus externes.",
  },
] as const;

export function sitemapXml(): string {
  const urls = sitePages
    .map(
      (p) =>
        `  <url>\n    <loc>${absoluteUrl(p.path)}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <priority>${p.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(): string {
  return [
    `# ${garage.name}, ${garage.locality}`,
    "# Search engines and AI assistants are welcome: the facts on this site are meant to be found and quoted.",
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

export function llmsTxt(): string {
  const lines = [
    `# ${garage.name}`,
    "",
    `> ${garage.summary}`,
    "",
    "## En bref",
    "",
    `- Nom : ${garage.name} (aussi : ${garage.alternateNames.join(", ")})`,
    `- Adresse : ${garage.address}, ${garage.postalCode} ${garage.city}, canton de Vaud, Suisse`,
    `- Téléphone (réception) : ${garage.phone}`,
    `- Service vente : ${team.vente.name}, ${team.vente.mobile}, ${team.vente.email}`,
    `- Atelier mécanique : ${team.atelier.name} (${team.atelier.title}), ${team.atelier.email}`,
    `- Carrosserie : ${team.carrosserie.name}, ${team.carrosserie.email}`,
    `- Horaires : ${garage.hours.map(([d, t]) => `${d} ${t}`).join(" ; ")}`,
    "- Station-service Jubin : 24h/24, 7j/7",
    "- Marque représentée : Suzuki (concessionnaire depuis plus de 20 ans)",
    `- Paiement WIR : ${wirRates.map(([k, v]) => `${k} ${v}`).join(", ")}`,
    `- Stock de véhicules : publié en direct sur Autolina et visible sur ${absoluteUrl("/vehicules")}`,
    `- Rendez-vous : demande en ligne sur ${absoluteUrl("/rendez-vous")} (le garage confirme) ou au ${garage.phone}`,
    "",
    "## Prestations",
    "",
    `- Vente : ${salesServices.join(" ; ")}`,
    `- Carrosserie : ${bodyworkServices.map((s) => s.text).join(" ; ")}`,
    `- Atelier mécanique : ${mechanicalServices.join(" ; ")}`,
    "",
    "## Pages",
    "",
    ...sitePages.map((p) => `- [${p.name}](${absoluteUrl(p.path)}) : ${p.about}`),
    "",
    "## Questions fréquentes",
    "",
    ...Object.values(faqs).flatMap((set) => set.flatMap((f) => [`### ${f.q}`, "", f.a, ""])),
  ];
  return lines.join("\n");
}

export const textResponse = (body: string, type: string) =>
  new Response(body, {
    headers: {
      "Content-Type": `${type}; charset=utf-8`,
      "Cache-Control": "public, max-age=3600",
    },
  });
