import { team } from "@/lib/garage";
// "Nous achetons votre véhicule": the fields a seller fills in, in the order of an AutoScout24
// listing, and the plain-text message the garage receives in its console (one "label : value"
// line per field, ready to copy into a listing).

export const repriseIntents = ["Vendre ma voiture", "Reprise contre un autre véhicule"] as const;
export const fuels = [
  "Essence",
  "Diesel",
  "Hybride",
  "Hybride rechargeable",
  "Électrique",
  "Gaz",
] as const;
export const gearboxes = ["Manuelle", "Automatique"] as const;
export const drives = ["Traction", "4x4"] as const;
export const accidentHistory = ["Jamais accidenté", "Accidenté, réparé", "Je ne sais pas"] as const;
export const serviceBooks = ["Complet", "Partiel", "Aucun"] as const;
export const equipmentOptions = [
  "Climatisation",
  "Navigation GPS",
  "Caméra de recul",
  "Régulateur adaptatif",
  "Sièges chauffants",
  "Intérieur cuir",
  "Toit ouvrant ou panoramique",
  "Jantes alu",
  "Attelage",
  "Pneus hiver",
] as const;

/** The photos that make a listing: shown to the seller once the request has arrived. */
export const photoChecklist = [
  "Avant et arrière, de trois quarts",
  "Les deux côtés",
  "Intérieur, sièges avant et arrière",
  "Compteur, moteur allumé (kilométrage)",
  "Les éventuels défauts, de près",
] as const;

export type RepriseFields = {
  intent: string;
  make: string;
  model: string;
  version: string;
  firstRegistration: string;
  mileage: string;
  fuel: string;
  gearbox: string;
  drive: string;
  power: string;
  color: string;
  lastInspection: string;
  accident: string;
  serviceBook: string;
  typeApproval: string;
  equipment: readonly string[];
  price: string;
  notes: string;
};

/** "62000" or "62 000 km" -> "62’000" (Swiss grouping); empty when there is no digit. */
export function groupDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, "’") : "";
}

/** "5.2019", "05/2019" or "05-2019" -> "05.2019"; null when it is not a month and a year. */
export function monthYear(value: string): string | null {
  const m = value.trim().match(/^(\d{1,2})\s*[./-]\s*(\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return null;
  return `${String(month).padStart(2, "0")}.${m[2]}`;
}

/** What is missing before the request can go, or null when it is complete. */
export function checkReprise(f: RepriseFields): string | null {
  if (!f.make.trim() || !f.model.trim()) return "Indiquez la marque et le modèle.";
  if (!monthYear(f.firstRegistration))
    return "Indiquez la première mise en circulation, par exemple 05.2019.";
  if (!groupDigits(f.mileage)) return "Indiquez le kilométrage.";
  if (f.lastInspection.trim() && !monthYear(f.lastInspection))
    return "Indiquez la dernière expertise au format mois.année, par exemple 03.2023.";
  return null;
}

export function repriseMessage(f: RepriseFields): string {
  const line = (label: string, value: string) => (value.trim() ? `${label} : ${value.trim()}` : "");
  const km = groupDigits(f.mileage);
  const power = groupDigits(f.power);
  const price = groupDigits(f.price);
  const lines = [
    `Proposition de véhicule${f.intent ? ` · ${f.intent}` : ""} (pour ${team.vente.name})`,
    "",
    line("Marque", f.make),
    line("Modèle", f.model),
    line("Version", f.version),
    line("1re mise en circulation", monthYear(f.firstRegistration) ?? f.firstRegistration),
    line("Kilométrage", km && `${km} km`),
    line("Carburant", f.fuel),
    line("Boîte de vitesses", f.gearbox),
    line("Transmission", f.drive),
    line("Puissance", power && `${power} ch`),
    line("Couleur", f.color),
    line("Dernière expertise", monthYear(f.lastInspection) ?? f.lastInspection),
    line("Accident", f.accident),
    line("Carnet d’entretien", f.serviceBook),
    line("N° de réception par type", f.typeApproval),
    line("Équipements", f.equipment.join(", ")),
    line("Prix souhaité", price && `CHF ${price}`),
  ].filter((l, i) => i < 2 || l);
  if (f.notes.trim()) lines.push("", "Remarques :", f.notes.trim());
  lines.push("", "Photos : le vendeur les envoie par e-mail ou WhatsApp au service vente.");
  return lines.join("\n");
}
