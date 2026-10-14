import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { formatMake, isListingPath, listingFrameUrl, parseStock, shortModel } from "@/lib/autolina";

const html = readFileSync(path.join(__dirname, "fixtures/autolina-list.html"), "utf8");

describe("Autolina stock parser", () => {
  it("reads the total and the newest listings in Autolina's order", () => {
    const { total, cars } = parseStock(html);
    expect(total).toBe(104);
    expect(cars.map((c) => c.id)).toEqual(["5152799", "5152798", "5149088", "5149077"]);
  });

  it("extracts the card fields of a used car", () => {
    const [bmw] = parseStock(html).cars;
    expect(bmw).toMatchObject({
      path: "/fr/iframe/auto/bmw-320/5152799",
      make: "BMW",
      model: "320d",
      price: "CHF 3’990",
      isNew: false,
      year: "2010",
      mileage: "270’990 km",
      fuel: "Diesel",
      gearbox: "Manuelle",
    });
    expect(bmw?.image).toMatch(/^https:\/\/www\.autolina\.ch\/auto-bild\/.+w=534&h=401/);
  });

  it("flags new cars, which have no year", () => {
    const vitara = parseStock(html).cars[2];
    expect(vitara).toMatchObject({ make: "Suzuki", isNew: true, year: null, mileage: "50 km" });
  });

  it("returns no cars instead of throwing when the markup is unknown", () => {
    expect(parseStock("<html><body>Maintenance</body></html>")).toEqual({ total: null, cars: [] });
  });

  it("formats makes and trims dealer equipment lists", () => {
    expect(formatMake("MERCEDES-BENZ")).toBe("Mercedes-Benz");
    expect(formatMake("BMW")).toBe("BMW");
    expect(shortModel("A4 Avant 2.0 TFSI quattro - CH Auto * Toit Ouvrant")).toBe(
      "A4 Avant 2.0 TFSI quattro",
    );
    expect(shortModel("CR-V 2.0i MMD Hybrid")).toBe("CR-V 2.0i MMD Hybrid");
  });

  it("only builds iframe URLs for Autolina listing paths", () => {
    expect(isListingPath("/fr/iframe/auto/audi-a4/5152798")).toBe(true);
    expect(listingFrameUrl("/fr/iframe/auto/audi-a4/5152798")).toMatch(
      /^https:\/\/www\.autolina\.ch\/fr\/iframe\/auto\/audi-a4\/5152798\?/,
    );
    for (const bad of ["//evil.example/x", "/fr/iframe/auto/a/1?x=1", "javascript:alert(1)", ""]) {
      expect(listingFrameUrl(bad)).toBeNull();
    }
  });
});
