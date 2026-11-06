// Verified garage facts (source: garageplaine.ch). Every page reads from here so the
// contacts, hours and services stay identical across the site.

// Real portraits, supplied by the garage (none yet for the workshop and the body shop).
import tiagoPhoto from "@/assets/team-tiago-bessa.webp";

export const garage = {
  name: "Garage Carrosserie de la Plaine",
  /** Names the garage also goes by (short form, logo); the name above is the one shown. */
  alternateNames: ["Garage de la Plaine", "Garage-Carrosserie de la Plaine"],
  /** One factual paragraph for search engines and AI assistants (JSON-LD, llms.txt). */
  summary:
    "Le Garage Carrosserie de la Plaine (aussi appelé Garage de la Plaine) est un garage de Denges (VD), sur La Côte, à 5 minutes de Morges et 10 minutes de Lausanne. Concessionnaire Suzuki depuis plus de 20 ans, il vend des Suzuki neuves et des occasions toutes marques, répare et entretient les véhicules de toutes marques dans son atelier mécanique, dispose d’une carrosserie et d’une station-service Jubin ouverte 24h/24. Un service de qualité depuis plus de 40 ans.",
  address: "Route de la Plaine 20",
  postalCode: "1026",
  city: "Denges",
  // No-break spaces: the locality never splits across lines.
  locality: "1026\u00a0Denges\u00a0/\u00a0VD",
  region: "VD",
  /** Swiss federal address register (geo.admin.ch), Route de la Plaine 20, 1026 Denges. */
  geo: { latitude: 46.52489, longitude: 6.53765 },
  facebook: "https://www.facebook.com/GarageCarrosserieDeLaPlaine",
  instagram: "https://www.instagram.com/carrosserie_de_la_plaine/",
  phone: "021 801 68 42",
  phoneHref: "tel:+41218016842",
  /** The garage's WhatsApp: Tiago Bessa's mobile, until the workshop and body shop give theirs. */
  whatsapp: "https://wa.me/41791089299",
  email: "vente@garageplaine.ch",
  inventory:
    "https://www.autolina.ch/fr/iframe/30366?border=000000&buttons=f11c27&buttonsText=ffffff&footer=block&garantieFilter=none&icon=f11c27&links=000000&text=000000",
  directions:
    "https://www.google.com/maps/search/?api=1&query=Garage+Carrosserie+de+la+Plaine+Route+de+la+Plaine+20+1026+Denges",
  mapEmbed:
    "https://www.google.com/maps?q=Garage+Carrosserie+de+la+Plaine,+Route+de+la+Plaine+20,+1026+Denges&hl=fr&output=embed",
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
  /** WhatsApp chat link (wa.me) on the same mobile, for photos of a car to sell. */
  whatsapp?: string;
  /** A real portrait (imported from src/assets); without one, a "photo à venir" frame shows. */
  photo?: string;
};

export const team = {
  vente: {
    role: "Service vente",
    name: "Tiago Bessa",
    email: "vente@garageplaine.ch",
    mobile: "079 108 92 99",
    mobileHref: "tel:+41791089299",
    whatsapp: "https://wa.me/41791089299",
    photo: tiagoPhoto,
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
const mechanicalServicesText = mechanicalServices.join(", ").replace(/^./, (c) => c.toUpperCase());

/** The workshop's services as cards (same wording as mechanicalServices, from garageplaine.ch). */
export const mechanicalCards = [
  { icon: "wrench", title: "Entretien et réparations", text: mechanicalServices[0] },
  { icon: "gauge", title: "Diagnostic", text: mechanicalServices[1] },
  { icon: "tyre", title: "Pneus", text: mechanicalServices[2] },
  { icon: "geometry", title: "Géométrie", text: mechanicalServices[3] },
  { icon: "snow", title: "Climatisation", text: mechanicalServices[4] },
  { icon: "hitch", title: "Attelages", text: mechanicalServices[5] },
  { icon: "trailer", title: "Remorques", text: mechanicalServices[6] },
  { icon: "spark", title: "Mécanique et électricité", text: mechanicalServices[7] },
  { icon: "lights", title: "Feux diurnes", text: mechanicalServices[8] },
] as const;
export type MechanicalIcon = (typeof mechanicalCards)[number]["icon"];

/** What the workshop says about itself (garageplaine.ch, "Atelier mécanique"). */
export const workshopFacts = {
  figures: [
    {
      value: String(mechanicalServices.length),
      label: "prestations, de l’entretien aux feux diurnes",
    },
    { value: "Toutes", label: "marques, des plus anciennes aux plus récentes" },
    { value: "Brevet", label: "fédéral pour votre interlocuteur, Jérôme Baatard" },
  ],
  training:
    "L’équipe se forme en continu pour suivre l’évolution constante des techniques automobiles.",
  advice:
    "Nous vous conseillons sur les travaux et les services vraiment utiles pour votre véhicule.",
} as const;

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
    cta: "Découvrir la vente",
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
    cta: "Découvrir l’atelier",
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
    "Les réparations sont réalisées avec des pièces d’origine, dans le respect des garanties constructeur. Les travaux sont garantis à vie, selon conditions : contactez la carrosserie pour connaître les modalités applicables.",
  windscreen:
    "Pour tout remplacement de pare-brise, une vignette autoroutière ou un bon d’essence est offert.",
  advice: "Des conseils d’entretien gratuits, donnés par un professionnel de la carrosserie.",
  gifts:
    "Une idée cadeau : demandez nos packs d’entretien personnalisés, composés selon votre budget.",
} as const;

export const salesServices = [
  "Un large choix de véhicules neufs et d’occasion en stock",
  "Un showroom pour vous accueillir",
  "Des offres détaillées selon vos besoins",
  "Des financements et des leasings adaptés",
  "La reprise de votre ancien véhicule",
] as const;

/** Share of each kind of work payable in WIR (source: garageplaine.ch, "Partenariat WIR"). */
export const wirRates = [
  ["Main-d’œuvre", "100 % WIR"],
  ["Pièces d’entretien", "50 % WIR"],
  ["Pièces spécifiques", "20 % WIR"],
  ["Pneumatiques", "100 % WIR"],
] as const;

/**
 * The garage's Google profile. rating and count are shown when the live figure cannot be read
 * (src/lib/google-rating.functions.ts): as seen on Google on 5 November 2026.
 */
export const googleProfile = {
  url: "https://share.google/XmcFBNH5CqMYa4nV7",
  rating: 4.5,
  count: 85,
  /** What the live reading searches for when no GOOGLE_PLACE_ID is set. */
  query: "Garage Carrosserie de la Plaine, Route de la Plaine 20, 1026 Denges",
} as const;

/** Reviews from the garage's Google profile, quoted word for word. */
export const googleReviews = [
  {
    name: "Adriano Jalber Rocha Lima",
    topic: "Reprise",
    text: "Ils ont été formidables ! Ils m’ont beaucoup aidé et m’ont offert le meilleur prix du marché pour la reprise de ma voiture. Monsieur Tiago a été exceptionnel ; il a tout fait pour que la transaction se termine bien. Je n’ai que des éloges à faire.",
  },
  {
    name: "Frederic Vonlanthen",
    topic: "Achat",
    text: "Je recommande vivement ce garage ! J’ai récemment acheté une voiture chez eux et l’expérience a été excellente du début à la fin. L’équipe est très professionnelle, à l’écoute et ne met aucune pression pour acheter. Ils ont pris le temps de répondre à toutes mes questions et de m’expliquer les différents modèles en détail. La qualité des véhicules est top, et j’ai particulièrement apprécié la transparence sur l’historique des voitures. Le service après-vente est également impeccable. Un grand merci à toute l’équipe pour leur accueil chaleureux et leur sérieux. Si vous cherchez un garage de confiance, ne cherchez plus, vous êtes au bon endroit !",
  },
  {
    name: "Jérémy Burkli",
    topic: "Carrosserie et atelier",
    text: "Carrosserie très professionnelle ! Ils font bien plus que le travail de demandé. Véhicule de remplacement offert également. Je recommande à 1000%. Secteur mécanique excellent aussi! Je recommande !!!",
  },
] as const;

/** Questions and answers, written from the facts above; each set appears on one page only. */
export type Faq = { q: string; a: string };
const hoursText = garage.hours.map(([d, t]) => `${d} : ${t}`).join(" ; ");

export const faqs = {
  home: [
    {
      q: "Où se trouve le Garage Carrosserie de la Plaine ?",
      a: `Le Garage Carrosserie de la Plaine se trouve ${garage.address}, ${garage.postalCode} ${garage.city} (VD), sur La Côte, à 5 minutes de Morges et 10 minutes de Lausanne.`,
    },
    {
      q: "Quels sont les horaires d’ouverture du garage ?",
      a: `${hoursText}. La station-service Jubin est accessible 24h/24 et 7j/7.`,
    },
    {
      q: "Le Garage Carrosserie de la Plaine est-il concessionnaire Suzuki ?",
      a: "Oui. Le Garage Carrosserie de la Plaine est concessionnaire Suzuki depuis plus de 20 ans : véhicules neufs de la gamme Suzuki, essais sur route, financement et leasing, et un atelier dont Suzuki est la marque de référence.",
    },
    {
      q: "Comment prendre rendez-vous au garage ?",
      a: `Par téléphone au ${garage.phone}, ou en ligne : choisissez le service (atelier, carrosserie ou vente), le jour et le moment qui vous conviennent, et le garage vous confirme le rendez-vous.`,
    },
    {
      q: "Peut-on faire le plein en dehors des heures d’ouverture ?",
      a: "Oui. La station-service Jubin du garage est accessible 24h/24 et 7j/7, et vous pouvez y commander une Jubin Card pour bénéficier d’avantages tout au long de l’année.",
    },
  ],
  carrosserie: [
    {
      q: "Vous occupez-vous des sinistres avec mon assurance ?",
      a: "Oui. La carrosserie gère les sinistres et prend en charge les formalités administratives avec les assurances, que vous soyez lésé ou responsable.",
    },
    {
      q: "Aurai-je une voiture de remplacement pendant les travaux ?",
      a: "La carrosserie dispose de 8 véhicules de remplacement pour vous garder mobile pendant les réparations.",
    },
    {
      q: "Les réparations de carrosserie sont-elles garanties ?",
      a: "Les réparations sont réalisées exclusivement avec des pièces d’origine, dans le respect des garanties constructeur, et les travaux sont garantis à vie selon conditions : la carrosserie vous en précise les modalités.",
    },
    {
      q: "Y a-t-il une offre lors du remplacement d’un pare-brise ?",
      a: "Oui : pour tout remplacement de pare-brise, une vignette autoroutière ou un bon d’essence est offert.",
    },
  ],
  atelier: [
    {
      q: "Entretenez-vous et réparez-vous les voitures de toutes les marques ?",
      a: `Oui. L’atelier mécanique entretient et répare les véhicules de toutes marques, avec des appareils de diagnostic de pointe ; Suzuki est sa marque de référence. ${team.atelier.name}, titulaire d’un brevet fédéral, est votre interlocuteur.`,
    },
    {
      q: "Quelles prestations propose l’atelier mécanique ?",
      a: `${mechanicalServicesText}.`,
    },
    {
      q: "Pouvez-vous poser un attelage sur ma voiture ?",
      a: "Oui. L’atelier vend et pose des attelages, et entretient aussi les remorques de transport.",
    },
  ],
  vehicules: [
    {
      q: "Les véhicules affichés sont-ils vraiment disponibles ?",
      a: "Les annonces viennent directement du stock que le service vente publie sur Autolina et met à jour lui-même. Prix et disponibilités restent sous réserve : appelez-nous pour confirmer avant de vous déplacer.",
    },
    {
      q: "Puis-je essayer un véhicule avant de l’acheter ?",
      a: `Oui. Demandez un essai sur route à ${team.vente.name}, au service vente (${team.vente.mobile}), ou en ligne depuis l’annonce qui vous intéresse.`,
    },
    {
      q: "Proposez-vous un financement ou un leasing ?",
      a: "Oui. Le service vente vous propose des offres détaillées, ainsi que des financements et des leasings adaptés à votre budget.",
    },
    {
      q: "Reprenez-vous mon véhicule actuel ?",
      a: "Oui. Le service vente reprend votre ancien véhicule lors d’un achat, et nous achetons aussi des véhicules : décrivez le vôtre en ligne et nous vous recontactons.",
    },
  ],
  contact: [
    {
      q: "Le garage est-il ouvert le samedi ?",
      a: "Le samedi, le garage vous reçoit sur rendez-vous. Du lundi au vendredi, il est ouvert de 7h30 à 12h00 et dès 13h30 l’après-midi.",
    },
    {
      q: "À qui m’adresser pour la vente, l’atelier ou la carrosserie ?",
      a: `Vente : ${team.vente.name}, ${team.vente.mobile}, ${team.vente.email}. Atelier mécanique : ${team.atelier.name}, ${team.atelier.email}. Carrosserie : ${team.carrosserie.name}, ${team.carrosserie.email}. Réception : ${garage.phone}.`,
    },
    {
      q: "Acceptez-vous les paiements en WIR ?",
      a: `Oui, le garage est partenaire WIR : ${wirRates.map(([k, v]) => `${k.toLowerCase()} ${v}`).join(", ")}. Les tarifs appliqués en WIR sont identiques à ceux en CHF.`,
    },
  ],
} satisfies Record<string, readonly Faq[]>;

/**
 * The Suzuki range sold in Switzerland and the S-Cross shown in 3D on /suzuki. Figures come
 * from Suzuki Schweiz AG: the S-Cross price list and technical data 2026, the S-Cross brochure
 * and the model pages of suzuki.ch (October 2026). No prices: Suzuki publishes and updates them.
 */
export const suzukiSource = "Liste de prix et données techniques Suzuki Suisse 2026";

export const suzukiRange = [
  {
    id: "swift",
    name: "Swift",
    kind: "Citadine hybride",
    text: "La compacte de Suzuki, avec un moteur 1.2 essence hybride.",
    tags: ["Hybride"],
    url: "https://www.suzuki.ch/fr/modeles/swift",
  },
  {
    id: "vitara",
    name: "Vitara",
    kind: "SUV hybride",
    text: "1.4 turbo mild hybrid de 110 ch, boîte manuelle ou automatique, transmission intégrale ALLGRIP.",
    tags: ["Hybride", "4x4"],
    url: "https://www.suzuki.ch/fr/modeles/vitara",
  },
  {
    id: "s-cross",
    name: "S-Cross",
    kind: "SUV hybride",
    text: "Polyvalent et spacieux : 1.4 turbo mild hybrid 48 V, traction avant ou ALLGRIP 4x4.",
    tags: ["Hybride", "4x4"],
    url: "https://www.suzuki.ch/fr/modeles/s-cross",
  },
  {
    id: "e-vitara",
    name: "e Vitara",
    kind: "SUV 100 % électrique",
    text: "Un véritable SUV 4x4 électrique, avec la transmission intégrale électrique ALLGRIP-e ou en traction avant.",
    tags: ["Électrique", "4x4"],
    url: "https://www.suzuki.ch/fr/modeles/e-vitara",
  },
  {
    id: "across",
    name: "Across",
    kind: "SUV hybride rechargeable",
    text: "2.5 essence et deux moteurs électriques : 309 ch, 4x4 E-Four de série et jusqu’à 129 km en électrique.",
    tags: ["Hybride rechargeable", "4x4"],
    url: "https://www.suzuki.ch/fr/modeles/across",
  },
] as const;

export type SuzukiSpotId =
  "phares" | "hybride" | "ecran" | "toit" | "jantes" | "allgrip" | "coffre";
export type AllgripMode = "auto" | "sport" | "snow" | "lock";

export const sCross = {
  name: "Suzuki S-Cross",
  /** The line under the model's name, above the 3D car. */
  tagline: ["Mild hybrid 48 V", "4x4 ALLGRIP SELECT", "110 ch"],
  figures: [
    { value: 110, unit: "ch", label: "1.4 BOOSTERJET mild hybrid 48 V" },
    { value: 4, unit: "modes", label: "Transmission intégrale ALLGRIP SELECT" },
    { value: 430, unit: "L", label: "De coffre, 665 L sièges rabattus" },
    { value: 175, unit: "mm", label: "De garde au sol" },
    { value: 1200, unit: "kg", label: "De charge tractable freinée" },
  ],
  spots: [
    {
      id: "phares",
      title: "Phares LED",
      text: "Feux de croisement et de route à LED, et trois feux de position LED à l’avant comme à l’arrière ; ceux de l’avant servent de feux diurnes.",
    },
    {
      id: "hybride",
      title: "Mild hybrid 48 V",
      text: "Moteur 1.4 BOOSTERJET turbo de 110 ch (81 kW) et 235 Nm, épaulé par un alterno-démarreur et une batterie lithium-ion de 48 V qui l’aident à accélérer.",
    },
    {
      id: "ecran",
      title: "Écran tactile 9 pouces",
      text: "Navigation, DAB+, Bluetooth et connexion smartphone avec Apple CarPlay et Android Auto.",
    },
    {
      id: "toit",
      title: "Toit panoramique",
      text: "Toit ouvrant panoramique électrique en verre sur les versions Top, pour admirer le paysage depuis toutes les places.",
    },
    {
      id: "jantes",
      title: "Jantes 17 pouces",
      text: "Jantes en alliage léger de 17 pouces et pneus 215/55 R17 sur toutes les versions.",
    },
    {
      id: "allgrip",
      title: "ALLGRIP SELECT",
      text: "Transmission intégrale à quatre modes, Auto, Sport, Snow et Lock, avec boîte manuelle ou automatique à 6 rapports.",
    },
    {
      id: "coffre",
      title: "Coffre de 430 L",
      text: "430 à 440 litres, 665 litres avec la banquette 60/40 rabattue et 1230 litres jusqu’au pavillon.",
    },
  ] satisfies { id: SuzukiSpotId; title: string; text: string }[],
  /** The four positions of the ALLGRIP SELECT dial, as Suzuki describes them. */
  modes: [
    {
      id: "auto",
      name: "Auto",
      text: "Privilégie l’efficacité et enclenche la transmission intégrale dès qu’une roue patine.",
    },
    {
      id: "sport",
      name: "Sport",
      text: "Plus de couple sur les roues arrière et un accélérateur plus vif, idéal sur les routes sinueuses.",
    },
    {
      id: "snow",
      name: "Snow",
      text: "Motricité renforcée à l’accélération sur la neige, les routes glissantes ou non goudronnées.",
    },
    {
      id: "lock",
      name: "Lock",
      text: "Envoie un maximum de couple aux roues arrière pour se sortir de la neige, de la boue ou du sable.",
    },
  ] satisfies { id: AllgripMode; name: string; text: string }[],
  /** Official paint names; the swatches are only an indication of each colour. */
  colours: [
    { name: "Sphere Blue Pearl Metallic", hex: "#1d4e9e" },
    { name: "Energetic Red Pearl Metallic", hex: "#a5141c" },
    { name: "Canyon Brown Pearl Metallic", hex: "#6a4835" },
    { name: "Titan Dark Grey Pearl", hex: "#4a4e54" },
    { name: "Cosmic Black Pearl Metallic", hex: "#141619" },
    { name: "Silky Silver Metallic", hex: "#b8bbbf" },
    { name: "Cool White Pearl Metallic", hex: "#e6e7e3" },
    { name: "White", hex: "#f3f3f1" },
  ],
  /** A free 3D model, not a Suzuki file: its author is credited under the licence. */
  model: {
    title: "2025 Suzuki S-Corss X4",
    author: "tonielpro520",
    source:
      "https://sketchfab.com/3d-models/2025-suzuki-s-corss-x4-31e629eb18954ab9904816a75cfcf803",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/deed.fr",
  },
};
