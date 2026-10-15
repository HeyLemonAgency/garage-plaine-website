// What search engines and AI assistants read about each page: title, description,
// canonical address, share preview and schema.org structured data. Everything is built
// from the verified facts in garage.ts so it always matches what the pages say.
import type { StockCar } from "./autolina";
import {
  apprenticeAwards,
  bodyworkServices,
  garage,
  mechanicalServices,
  salesServices,
  schedule,
  team,
  type Faq,
} from "./garage";
import { SITE_URL, absoluteUrl } from "./site";

export const OG_IMAGE = {
  path: "/og/garage-de-la-plaine.jpg",
  width: 1200,
  height: 630,
  alt: "Garage de la Plaine à Denges : Suzuki, occasions, carrosserie et atelier",
};
export const LOGO_PATH = "/brand/garage-de-la-plaine-logo.png";

const ids = {
  garage: `${SITE_URL}/#garage`,
  website: `${SITE_URL}/#website`,
  vente: `${SITE_URL}/#vente`,
  atelier: `${SITE_URL}/#atelier`,
  carrosserie: `${SITE_URL}/#carrosserie`,
  station: `${SITE_URL}/#station`,
};

const tel = (href: string) => href.replace(/^tel:/, "");
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** JSON for a <script type="application/ld+json">, safe to inline in HTML. */
const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

/** Opening hours from the shared schedule, weekdays with the same hours grouped. */
export function openingHours() {
  const groups = new Map<string, string[]>();
  for (const [day, periods] of Object.entries(schedule)) {
    const key = JSON.stringify(periods);
    groups.set(key, [...(groups.get(key) ?? []), DAYS[Number(day)] ?? ""]);
  }
  return [...groups].flatMap(([key, days]) =>
    (JSON.parse(key) as [number, number][]).map(([opens, closes]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens: hhmm(opens),
      closes: hhmm(closes),
    })),
  );
}

const address = {
  "@type": "PostalAddress",
  streetAddress: garage.address,
  postalCode: garage.postalCode,
  addressLocality: garage.city,
  addressRegion: garage.region,
  addressCountry: "CH",
};

const people = {
  vente: {
    "@type": "Person",
    "@id": `${SITE_URL}/#tiago-bessa`,
    name: team.vente.name,
    jobTitle: "Conseiller de vente",
    telephone: tel(team.vente.mobileHref),
    email: team.vente.email,
    worksFor: { "@id": ids.garage },
  },
  atelier: {
    "@type": "Person",
    "@id": `${SITE_URL}/#jerome-baatard`,
    name: team.atelier.name,
    jobTitle: "Atelier mécanique",
    hasCredential: { "@type": "EducationalOccupationalCredential", name: team.atelier.title },
    email: team.atelier.email,
    worksFor: { "@id": ids.garage },
  },
  carrosserie: {
    "@type": "Person",
    "@id": `${SITE_URL}/#marco-da-silva`,
    name: team.carrosserie.name,
    jobTitle: "Carrosserie",
    award: apprenticeAwards
      .filter((a) => a.name === team.carrosserie.name)
      .map((a) => `${a.title} (${a.year})`),
    email: team.carrosserie.email,
    worksFor: { "@id": ids.garage },
  },
};

const catalog = (name: string, items: readonly string[]) => ({
  "@type": "OfferCatalog",
  name,
  itemListElement: items.map((item) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: item },
  })),
});

/** The business itself, its departments and people: on every page. */
export function siteGraph() {
  const phone = tel(garage.phoneHref);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["AutoDealer", "AutoRepair", "AutoBodyShop"],
        "@id": ids.garage,
        name: garage.name,
        alternateName: garage.alternateNames,
        description: garage.summary,
        url: absoluteUrl("/"),
        logo: absoluteUrl(LOGO_PATH),
        image: absoluteUrl(OG_IMAGE.path),
        telephone: phone,
        email: garage.email,
        address,
        geo: { "@type": "GeoCoordinates", ...garage.geo },
        hasMap: garage.directions,
        areaServed: ["Denges", "Morges", "Lausanne", "La Côte"].map((name) => ({
          "@type": "Place",
          name,
        })),
        openingHoursSpecification: openingHours(),
        brand: { "@type": "Brand", name: "Suzuki" },
        currenciesAccepted: "CHF",
        sameAs: [garage.facebook],
        department: [
          {
            "@type": "AutoDealer",
            "@id": ids.vente,
            name: `${garage.name} – Service vente`,
            url: absoluteUrl("/vehicules"),
            telephone: tel(team.vente.mobileHref),
            email: team.vente.email,
            address,
            brand: { "@type": "Brand", name: "Suzuki" },
            employee: { "@id": people.vente["@id"] },
          },
          {
            "@type": "AutoRepair",
            "@id": ids.atelier,
            name: `${garage.name} – Atelier mécanique`,
            url: absoluteUrl("/services#mecanique"),
            telephone: phone,
            email: team.atelier.email,
            address,
            employee: { "@id": people.atelier["@id"] },
          },
          {
            "@type": "AutoBodyShop",
            "@id": ids.carrosserie,
            name: `${garage.name} – Carrosserie`,
            url: absoluteUrl("/services#carrosserie"),
            telephone: phone,
            email: team.carrosserie.email,
            address,
            employee: { "@id": people.carrosserie["@id"] },
          },
          {
            "@type": "GasStation",
            "@id": ids.station,
            name: `Station-service Jubin – ${garage.name}`,
            url: absoluteUrl("/station-service"),
            address,
            brand: { "@type": "Brand", name: "Jubin" },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: DAYS,
              opens: "00:00",
              closes: "23:59",
            },
          },
        ],
        employee: Object.values(people),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `Prestations du ${garage.name}`,
          itemListElement: [
            catalog("Vente", salesServices),
            catalog(
              "Carrosserie",
              bodyworkServices.map((s) => s.text),
            ),
            catalog("Atelier mécanique", mechanicalServices),
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": ids.website,
        url: absoluteUrl("/"),
        name: garage.name,
        inLanguage: "fr-CH",
        publisher: { "@id": ids.garage },
      },
    ],
  };
}

/** Live listings as schema.org cars, linked to their page on this site. */
function carList(cars: readonly StockCar[], pageUrl: string) {
  return {
    "@type": "ItemList",
    "@id": `${pageUrl}#annonces`,
    name: `Dernières annonces du ${garage.name}`,
    numberOfItems: cars.length,
    itemListElement: cars.map((car, i) => {
      const url = absoluteUrl(`/vehicules?annonce=${encodeURIComponent(car.path)}`);
      const km = car.mileage ? Number(car.mileage.replace(/\D/g, "")) : NaN;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Car",
          name: `${car.make} ${car.model}`,
          brand: { "@type": "Brand", name: car.make },
          model: car.model,
          url,
          ...(car.image ? { image: car.image } : {}),
          itemCondition: car.isNew
            ? "https://schema.org/NewCondition"
            : "https://schema.org/UsedCondition",
          ...(car.year && !car.isNew ? { vehicleModelDate: car.year } : {}),
          ...(Number.isFinite(km)
            ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: km, unitCode: "KMT" } }
            : {}),
          ...(car.fuel ? { fuelType: car.fuel } : {}),
          ...(car.gearbox ? { vehicleTransmission: car.gearbox } : {}),
          ...(car.color ? { color: car.color } : {}),
          offers: {
            "@type": "Offer",
            url,
            ...(car.priceValue ? { price: car.priceValue, priceCurrency: "CHF" } : {}),
            availability: "https://schema.org/InStock",
            seller: { "@id": ids.garage },
          },
        },
      };
    }),
  };
}

export type PageSeo = {
  path: string;
  /** Title without the brand; " | Garage de la Plaine" is added unless it already names it. */
  title: string;
  description: string;
  /** Name in the breadcrumb (defaults to the title). The home page has none. */
  crumb?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  /** Questions answered on the page, published as an FAQ for search engines. */
  faqs?: readonly Faq[];
  /** Listings shown on the page. */
  cars?: readonly StockCar[] | undefined;
  noindex?: boolean;
};

function pageGraph(seo: PageSeo, url: string, title: string) {
  const page: Record<string, unknown> = {
    "@type": seo.faqs?.length ? [seo.type ?? "WebPage", "FAQPage"] : (seo.type ?? "WebPage"),
    "@id": `${url}#webpage`,
    url,
    name: title,
    description: seo.description,
    inLanguage: "fr-CH",
    isPartOf: { "@id": ids.website },
    about: { "@id": ids.garage },
    primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(OG_IMAGE.path) },
  };
  const graph: Record<string, unknown>[] = [page];
  if (seo.path !== "/") {
    page["breadcrumb"] = { "@id": `${url}#breadcrumb` };
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: seo.crumb ?? seo.title, item: url },
      ],
    });
  }
  if (seo.faqs?.length)
    page["mainEntity"] = seo.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }));
  if (seo.cars?.length) graph.push(carList(seo.cars, url));
  return { "@context": "https://schema.org", "@graph": graph };
}

/** The <head> of a page: title, description, canonical, share preview and JSON-LD. */
export function pageHead(seo: PageSeo) {
  const url = absoluteUrl(seo.path);
  const title = seo.title.includes(garage.name) ? seo.title : `${seo.title} | ${garage.name}`;
  const image = absoluteUrl(OG_IMAGE.path);
  return {
    meta: [
      { title },
      { name: "description", content: seo.description },
      ...(seo.noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
      { property: "og:site_name", content: garage.name },
      { property: "og:title", content: title },
      { property: "og:description", content: seo.description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_CH" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: String(OG_IMAGE.width) },
      { property: "og:image:height", content: String(OG_IMAGE.height) },
      { property: "og:image:alt", content: OG_IMAGE.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: seo.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [{ type: "application/ld+json", children: ldJson(pageGraph(seo, url, title)) }],
  };
}

export function siteJsonLd() {
  return ldJson(siteGraph());
}
