// Verified garage facts (source: garageplaine.ch). Every page reads from here so the
// contacts, hours and services stay identical across the site.

export const garage = {
  name: "Garage de la Plaine",
  address: "Route de la Plaine 20",
  postalCode: "1026",
  city: "Denges",
  locality: "1026 Denges / VD",
  phone: "021 801 68 42",
  phoneHref: "tel:+41218016842",
  email: "vente@garageplaine.ch",
  inventory:
    "https://www.autolina.ch/fr/iframe/30366?border=000000&buttons=f11c27&buttonsText=ffffff&footer=block&garantieFilter=none&icon=f11c27&links=000000&text=000000",
  directions:
    "https://www.google.com/maps/search/?api=1&query=Garage+de+la+Plaine+Route+de+la+Plaine+20+1026+Denges",
  mapEmbed:
    "https://www.google.com/maps?q=Garage+de+la+Plaine,+Route+de+la+Plaine+20,+1026+Denges&hl=fr&output=embed",
  hours: [
    ["Lundi – jeudi", "07h30 – 12h00 / 13h30 – 18h00"],
    ["Vendredi", "07h30 – 12h00 / 13h30 – 17h00"],
    ["Samedi", "Sur rendez-vous"],
  ],
} as const;

// Opening periods per weekday (0 = Sunday), in minutes since midnight, Swiss time.
// Saturday is by appointment only, Sunday closed.
export const schedule: Record<number, readonly (readonly [number, number])[]> = {
  1: [
    [450, 720],
    [810, 1080],
  ],
  2: [
    [450, 720],
    [810, 1080],
  ],
  3: [
    [450, 720],
    [810, 1080],
  ],
  4: [
    [450, 720],
    [810, 1080],
  ],
  5: [
    [450, 720],
    [810, 1020],
  ],
};

export type Contact = {
  role: string;
  name: string;
  title?: string;
  email: string;
  mobile?: string;
  mobileHref?: string;
};

export const team = {
  vente: {
    role: "Service vente",
    name: "Tiago Bessa",
    email: "vente@garageplaine.ch",
    mobile: "079 108 92 99",
    mobileHref: "tel:+41791089299",
  },
  atelier: {
    role: "Atelier mécanique",
    name: "Jérôme Baatard",
    title: "Brevet fédéral",
    email: "jerome.baatard@garageplaine.ch",
  },
  carrosserie: {
    role: "Carrosserie",
    name: "Marco Da Silva",
    email: "marco.dasilva@garageplaine.ch",
  },
} satisfies Record<string, Contact>;

// Contact form topics and the person each request is addressed to.
export const departments = [
  { id: "vente", label: "Achat d’un véhicule", contact: team.vente },
  { id: "reprise", label: "Reprise de mon véhicule", contact: team.vente },
  { id: "atelier", label: "Rendez-vous à l’atelier", contact: team.atelier },
  { id: "carrosserie", label: "Carrosserie ou devis", contact: team.carrosserie },
  { id: "autre", label: "Autre demande", contact: team.vente },
] as const;
export type DepartmentId = (typeof departments)[number]["id"];

// Source: garageplaine.ch, "La carrosserie": results of the garage's own apprentices.
export const apprenticeAwards = [
  {
    year: "2013",
    rank: "3e",
    title: "3e meilleur apprenti peintre en carrosserie",
    name: "Cristiano Almeida",
  },
  {
    year: "2014",
    rank: "1er",
    title: "Meilleur apprenti peintre en carrosserie",
    name: "Marco Da Silva",
  },
] as const;

export const mechanicalServices = [
  "Entretien et réparations toutes marques, spécialité Suzuki",
  "Diagnostic avec des appareils de pointe",
  "Vente et montage de pneumatiques",
  "Géométrie des trains sur banc ATT",
  "Entretien de la climatisation",
  "Vente et pose d’attelages",
  "Entretien de remorques de transport",
  "Travaux sur mesure en mécanique et électricité",
  "Installation de feux diurnes",
] as const;

/**
 * The workshop tour on the services page: points in the real workshop photo
 * (workshop-tour.webp, positions as shares of its width and height) and the services
 * each one stands for. The last stop has no point: hitches and trailers are not in the shot.
 */
export const workshopTour = [
  {
    id: "diagnostic",
    icon: "diagnostic",
    title: "Diagnostic",
    place: "Le poste de diagnostic",
    services: [mechanicalServices[1]],
    point: [0.112, 0.482],
  },
  {
    id: "climatisation",
    icon: "ac",
    title: "Climatisation",
    place: "La station de climatisation",
    services: [mechanicalServices[4]],
    point: [0.459, 0.341],
  },
  {
    id: "feux",
    icon: "lights",
    title: "Feux diurnes",
    place: "L’avant du véhicule",
    services: [mechanicalServices[8]],
    point: [0.607, 0.426],
  },
  {
    id: "pneus",
    icon: "tyres",
    title: "Pneus & géométrie",
    place: "Les roues",
    services: [mechanicalServices[2], mechanicalServices[3]],
    point: [0.659, 0.653],
  },
  {
    id: "entretien",
    icon: "service",
    title: "Entretien & réparations",
    place: "Sous le capot",
    services: [mechanicalServices[0]],
    point: [0.742, 0.141],
  },
  {
    id: "electricite",
    icon: "electrics",
    title: "Mécanique & électricité",
    place: "À bord",
    services: [mechanicalServices[7]],
    point: [0.862, 0.36],
  },
  {
    id: "attelages",
    icon: "towing",
    title: "Attelages & remorques",
    place: "Et aussi",
    services: [mechanicalServices[5], mechanicalServices[6]],
    point: null,
  },
] as const;

export type WorkshopIcon = (typeof workshopTour)[number]["icon"];

export const services = [
  {
    id: "vente",
    title: "Vente & reprise",
    short: "Suzuki neuves, occasions toutes marques, financement, leasing et reprise.",
    icon: "key",
    cta: "Voir les véhicules",
  },
  {
    id: "carrosserie",
    title: "Carrosserie",
    short: "Réparation, peinture et restauration, avec la gestion des sinistres.",
    icon: "spray",
    cta: "Découvrir la carrosserie",
  },
  {
    id: "mecanique",
    title: "Atelier mécanique",
    short: "Entretien et réparations toutes marques, avec une spécialité Suzuki.",
    icon: "wrench",
    cta: "Prendre rendez-vous",
  },
] as const;

export const bodyworkServices = [
  { icon: "claims", title: "Sinistres", text: "Gestion des sinistres avec les assurances" },
  { icon: "car", title: "Remplacement", text: "8 véhicules de remplacement à disposition" },
  {
    icon: "restore",
    title: "Restauration",
    text: "Restauration de véhicules, expertise et devis personnalisés",
  },
  { icon: "paint", title: "Peinture", text: "Peinture partielle ou complète" },
  {
    icon: "polish",
    title: "Polissage",
    text: "Polissage de la carrosserie et des optiques de phares",
  },
  { icon: "protect", title: "Protection", text: "Traitement Teflon et traitement de corps creux" },
  { icon: "rust", title: "Anti-rouille", text: "Suppression de la rouille fine" },
] as const;

export type BodyworkIcon = (typeof bodyworkServices)[number]["icon"];

/** Key figures and terms of the bodywork shop, as published by the garage. */
export const bodyworkFacts = {
  figures: [
    { value: "8", label: "véhicules de remplacement" },
    { value: "À vie", label: "travaux garantis, selon conditions" },
    { value: "H₂O", label: "peintures hydrosolubles" },
  ],
  warranty:
    "Les réparations sont réalisées avec des pièces d’origine, dans le respect des garanties constructeur. Les travaux sont garantis à vie, selon conditions : contactez la carrosserie pour connaître les modalités applicables.",
  windscreen:
    "Pour tout remplacement de pare-brise, une vignette autoroutière ou un bon d’essence est offert.",
} as const;

export const salesServices = [
  "Un large choix de véhicules neufs et d’occasion en stock",
  "Un showroom pour vous accueillir",
  "Des offres détaillées selon vos besoins",
  "Des financements et des leasings adaptés",
  "La reprise de votre ancien véhicule",
] as const;

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Garage de la Plaine, Denges` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Garage de la Plaine` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_CH" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
