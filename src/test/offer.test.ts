import { describe, expect, it } from "vitest";
import { suzukiRange } from "@/lib/garage";
import { asksDrive, asksGearbox, isModelId, offerMessage, type OfferFields } from "@/lib/offer";

const model = (id: string) => suzukiRange.find((m) => m.id === id)!;

const base: OfferFields = {
  model: model("vitara"),
  gearbox: "Automatique",
  drive: "4x4 ALLGRIP",
  colour: "Gris",
  options: ["Pneus hiver", "Attelage"],
  version: "",
  financing: "Leasing",
  timing: "Dans les 3 mois",
  testDrive: true,
  tradeIn: "Opel Corsa, 2016, 98’000 km",
  notes: "",
};

describe("offer request", () => {
  it("accepts only models of the range from the URL", () => {
    expect(isModelId("swift")).toBe(true);
    expect(isModelId("jimny")).toBe(false);
  });

  it("asks only what the model leaves open", () => {
    expect(asksGearbox(model("swift"))).toBe(true);
    expect(asksDrive(model("swift"))).toBe(false);
    expect(asksDrive(model("vitara"))).toBe(true);
    expect(asksGearbox(model("e-vitara"))).toBe(false);
    expect(asksDrive(model("across"))).toBe(false); // 4x4 E-Four as standard
  });

  it("puts the request type and the model on the first line", () => {
    const message = offerMessage(base, "Tiago Bessa");
    expect(message.split("\n")[0]).toBe("Demande d’offre — Suzuki Vitara (pour Tiago Bessa)");
    expect(message).toContain("Transmission : 4x4 ALLGRIP");
    expect(message).toContain("Essai sur route : oui, souhaité");
    expect(message).toContain("Véhicule à reprendre : Opel Corsa, 2016, 98’000 km");
    expect(message).not.toContain("Version");
  });

  it("drops the questions a model never asked", () => {
    const message = offerMessage({ ...base, model: model("across") }, "Tiago Bessa");
    expect(message).not.toContain("Transmission");
    expect(message).not.toContain("Boîte");
  });
});
