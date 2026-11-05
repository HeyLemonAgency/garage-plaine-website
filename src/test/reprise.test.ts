import { describe, expect, it } from "vitest";
import {
  checkReprise,
  groupDigits,
  monthYear,
  repriseMessage,
  type RepriseFields,
} from "@/lib/reprise";

const car: RepriseFields = {
  intent: "Reprise contre un autre véhicule",
  make: " Suzuki ",
  model: "Vitara",
  version: "1.4 Boosterjet Compact Top",
  firstRegistration: "5/2019",
  mileage: "62 000 km",
  fuel: "Essence",
  gearbox: "Automatique",
  drive: "4x4",
  power: "140",
  color: "",
  lastInspection: "03.2023",
  accident: "Jamais accidenté",
  serviceBook: "Complet",
  typeApproval: "",
  equipment: ["Climatisation", "Attelage"],
  price: "18000",
  notes: "Pneus hiver neufs.",
};

describe("reprise", () => {
  it("groups digits the Swiss way and reads month.year dates", () => {
    expect(groupDigits("62 000 km")).toBe("62’000");
    expect(groupDigits("abc")).toBe("");
    expect(monthYear("5/2019")).toBe("05.2019");
    expect(monthYear("13.2019")).toBeNull();
    expect(monthYear("2019")).toBeNull();
  });

  it("asks for what a buyer needs first", () => {
    expect(checkReprise(car)).toBeNull();
    expect(checkReprise({ ...car, model: " " })).toMatch(/modèle/);
    expect(checkReprise({ ...car, firstRegistration: "2019" })).toMatch(/mise en circulation/);
    expect(checkReprise({ ...car, mileage: "" })).toMatch(/kilométrage/);
    expect(checkReprise({ ...car, lastInspection: "hier" })).toMatch(/expertise/);
  });

  it("writes one line per filled field, in listing order, skipping empty ones", () => {
    expect(repriseMessage(car)).toBe(
      [
        "Proposition de véhicule · Reprise contre un autre véhicule",
        "",
        "Marque : Suzuki",
        "Modèle : Vitara",
        "Version : 1.4 Boosterjet Compact Top",
        "1re mise en circulation : 05.2019",
        "Kilométrage : 62’000 km",
        "Carburant : Essence",
        "Boîte de vitesses : Automatique",
        "Transmission : 4x4",
        "Puissance : 140 ch",
        "Dernière expertise : 03.2023",
        "Accident : Jamais accidenté",
        "Carnet d’entretien : Complet",
        "Équipements : Climatisation, Attelage",
        "Prix souhaité : CHF 18’000",
        "",
        "Remarques :",
        "Pneus hiver neufs.",
        "",
        "Photos : le vendeur peut les envoyer par e-mail au service vente.",
      ].join("\n"),
    );
  });
});
