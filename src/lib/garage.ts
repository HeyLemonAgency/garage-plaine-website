export const garage = {
  name: "Garage de la Plaine",
  address: "Route de la Plaine 20",
  locality: "1026 Denges / VD",
  phone: "021 801 68 42",
  phoneHref: "tel:+41218016842",
  email: "vente@garageplaine.ch",
  inventory:
    "https://www.autolina.ch/fr/iframe/30366?border=000000&buttons=f11c27&buttonsText=ffffff&footer=block&garantieFilter=none&icon=f11c27&links=000000&text=000000",
  directions:
    "https://www.google.com/maps/search/?api=1&query=Garage+de+la+Plaine+Route+de+la+Plaine+20+1026+Denges",
  hours: [
    ["Lundi – jeudi", "07h30 – 12h00 / 13h30 – 18h00"],
    ["Vendredi", "07h30 – 12h00 / 13h30 – 17h00"],
    ["Samedi", "Sur rendez-vous"],
  ],
};
export const services = [
  {
    id: "mecanique",
    title: "Entretien & mécanique",
    short: "Entretien et réparations toutes marques, avec une spécialité Suzuki.",
    icon: "wrench",
    image: "workshop",
    intro: "Un atelier multimarque à votre service.",
    description:
      "Notre atelier mécanique assure l’entretien et la réparation de votre véhicule, quelle que soit sa marque. Jérôme Baatard, titulaire d’un brevet fédéral, est votre interlocuteur pour l’atelier.",
    items: [
      "Entretien et réparations toutes marques",
      "Vente et pose d’attelage",
      "Entretien de remorques de transport",
      "Entretien de la climatisation",
    ],
    email: "jerome.baatard@garageplaine.ch",
    person: "Jérôme Baatard",
  },
  {
    id: "carrosserie",
    title: "Carrosserie",
    short: "Réparation, peinture et restauration. Nous prenons soin de chaque détail.",
    icon: "car",
    image: "bodywork",
    intro: "Retrouver le plaisir d’une voiture impeccable.",
    description:
      "De la réparation à la restauration, notre carrosserie vous accompagne et prend en charge les formalités administratives avec les assurances. Nous utilisons des peintures hydrosolubles respectueuses de l’environnement.",
    items: [
      "Gestion des sinistres avec les assurances",
      "8 véhicules de remplacement à disposition",
      "Restauration de véhicules, expertise et devis personnalisés",
      "Peinture partielle ou complète",
      "Polissage de la carrosserie et des optiques de phares",
      "Traitement Teflon et traitement de corps creux",
      "Suppression de la rouille fine",
    ],
    email: "marco.dasilva@garageplaine.ch",
    person: "Marco Da Silva",
  },
  {
    id: "pneus",
    title: "Pneus & géométrie",
    short: "Vente, montage de pneumatiques et géométrie des trains.",
    icon: "wheel",
    image: "workshop",
    intro: "Une tenue de route soignée.",
    description:
      "L’atelier assure la vente et le montage de vos pneumatiques ainsi que la géométrie des trains avec son banc ATT.",
    items: [
      "Vente de pneumatiques",
      "Montage de pneumatiques",
      "Géométrie des trains sur banc ATT",
    ],
    email: "jerome.baatard@garageplaine.ch",
    person: "Jérôme Baatard",
  },
  {
    id: "diagnostic",
    title: "Diagnostic & électricité",
    short: "Des appareils de pointe pour un diagnostic précis de votre véhicule.",
    icon: "clipboard",
    image: "workshop",
    intro: "Le bon diagnostic, le bon entretien.",
    description:
      "L’atelier dispose d’appareils de diagnostic de pointe et réalise des travaux sur mesure en mécanique et en électricité.",
    items: [
      "Diagnostic avec appareils de pointe",
      "Travaux sur mesure en mécanique et électricité",
      "Installation de feux diurnes",
    ],
    email: "jerome.baatard@garageplaine.ch",
    person: "Jérôme Baatard",
  },
] as const;
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Garage de la Plaine, Denges` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Garage de la Plaine` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
