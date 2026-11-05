// "Demander une offre" for one Suzuki model: what the visitor prefers, for Tiago to quote.
// These are preferences, not a configurator: the questions shown depend only on facts already
// in suzukiRange (a 4x4 tag, the energy), and the garage confirms what each model offers.
import { suzukiRange } from "./garage";

export type ModelId = (typeof suzukiRange)[number]["id"];
export type RangeModel = (typeof suzukiRange)[number];

export const isModelId = (value: unknown): value is ModelId =>
  suzukiRange.some((m) => m.id === value);

const modelTags = (model: RangeModel): readonly string[] => model.tags;

/** Gearbox choice: only for the mild-hybrid petrol models (electric and plug-in drive alone). */
export function asksGearbox(model: RangeModel): boolean {
  return modelTags(model).includes("Hybride");
}

/** Two-wheel or 4x4: only where 4x4 is an option, not where it comes as standard (Across). */
export function asksDrive(model: RangeModel): boolean {
  return modelTags(model).includes("4x4") && model.id !== "across";
}

export const gearboxChoices = ["Manuelle", "Automatique", "Pas de préférence"] as const;
export const driveChoices = ["Traction avant", "4x4 ALLGRIP", "Pas de préférence"] as const;
export const optionChoices = [
  "Peinture métallisée",
  "Pneus hiver",
  "Attelage",
  "Tapis de sol",
  "Navigation",
] as const;
export const financingChoices = ["Achat comptant", "Leasing", "Financement", "À discuter"] as const;
export const timingChoices = ["Dès que possible", "Dans les 3 mois", "Je me renseigne"] as const;

export type OfferFields = {
  model: RangeModel;
  gearbox: string;
  drive: string;
  colour: string;
  options: readonly string[];
  version: string;
  financing: string;
  timing: string;
  testDrive: boolean;
  tradeIn: string;
  notes: string;
};

/** The message the garage receives: the request type and the model first, one line per answer. */
export function offerMessage(f: OfferFields, contactName: string): string {
  const line = (label: string, value: string) => (value.trim() ? `${label} : ${value.trim()}` : "");
  const lines = [
    `Demande d’offre — Suzuki ${f.model.name} (pour ${contactName})`,
    "",
    line("Modèle", `Suzuki ${f.model.name}`),
    asksGearbox(f.model) ? line("Boîte", f.gearbox) : "",
    asksDrive(f.model) ? line("Transmission", f.drive) : "",
    line("Version ou équipement", f.version),
    line("Teinte souhaitée", f.colour),
    line("Options", f.options.join(", ")),
    line("Paiement", f.financing),
    line("Délai", f.timing),
    line("Essai sur route", f.testDrive ? "oui, souhaité" : ""),
    line("Véhicule à reprendre", f.tradeIn),
  ].filter((l, i) => i < 2 || l);
  if (f.notes.trim()) lines.push("", "Remarques :", f.notes.trim());
  return lines.join("\n");
}
