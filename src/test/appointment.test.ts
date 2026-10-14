import { describe, expect, it } from "vitest";

import { appointmentMailto, appointmentSummary, isTopicId, upcomingDays } from "@/lib/appointment";

describe("appointment days", () => {
  it("starts tomorrow and skips Sundays", () => {
    // Wednesday 14 October 2026, evening in Switzerland.
    const days = upcomingDays(new Date("2026-10-14T18:00:00Z"), 5);
    expect(days.map((d) => d.iso)).toEqual([
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-19",
      "2026-10-20",
    ]);
    expect(days[2]?.saturday).toBe(true);
    expect(days[0]?.long).toBe("jeudi 15 octobre");
  });

  it("skips Vaud public holidays", () => {
    // Friday 18 September 2026: the next Monday is the Lundi du Jeûne fédéral.
    const days = upcomingDays(new Date("2026-09-18T08:00:00Z"), 2);
    expect(days.map((d) => d.iso)).toEqual(["2026-09-19", "2026-09-22"]);
  });
});

describe("appointment e-mail", () => {
  const request = {
    topic: "atelier" as const,
    need: "Pneus et géométrie",
    vehicle: "Suzuki Vitara, 2019",
    day: { iso: "2026-10-15", short: "jeu. 15 oct.", long: "jeudi 15 octobre", saturday: false },
    slot: "Matin",
    name: "Claire Dupont",
    phone: "079 000 00 00",
    email: "",
    contactBy: "téléphone" as const,
    message: "",
  };

  it("goes to the workshop contact with the chosen day", () => {
    const href = appointmentMailto(request);
    expect(href.startsWith("mailto:jerome.baatard@garageplaine.ch?subject=")).toBe(true);
    expect(decodeURIComponent(href)).toContain(
      "Demande de rendez-vous — Atelier mécanique, jeu. 15 oct.",
    );
    expect(decodeURIComponent(href)).toContain("Bonjour Jérôme,");
  });

  it("summarises the request without empty lines for skipped fields", () => {
    const summary = appointmentSummary(request);
    expect(summary).toContain(
      "Date souhaitée : jeudi 15 octobre, matin (à confirmer par le garage)",
    );
    expect(summary).not.toContain("E-mail :");
    expect(summary).not.toContain("Message");
  });

  it("only accepts known topics from the URL", () => {
    expect(isTopicId("vente")).toBe(true);
    expect(isTopicId("hack")).toBe(false);
  });
});
