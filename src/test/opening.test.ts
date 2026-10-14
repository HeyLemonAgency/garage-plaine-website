import { describe, expect, it } from "vitest";

import { openingStatus, vaudHolidays } from "@/lib/opening";

// Times are given in UTC; October 2026 is CEST (UTC+2).
const at = (iso: string) => openingStatus(new Date(iso));

describe("opening status", () => {
  it("is open during weekday hours", () => {
    expect(at("2026-10-14T08:00:00Z")).toEqual({
      state: "open",
      label: "Ouvert",
      detail: "jusqu’à 12h00",
    });
  });

  it("shows the reopening time over lunch", () => {
    expect(at("2026-10-14T10:30:00Z")).toMatchObject({ state: "closed", detail: "ouvre à 13h30" });
  });

  it("closes earlier on Friday", () => {
    expect(at("2026-10-16T14:30:00Z")).toMatchObject({ detail: "jusqu’à 17h00" });
    expect(at("2026-10-16T15:30:00Z").state).not.toBe("open");
  });

  it("is by appointment on Saturday and points to Monday on Sunday", () => {
    expect(at("2026-10-17T08:00:00Z")).toMatchObject({ state: "appointment" });
    expect(at("2026-10-18T08:00:00Z")).toMatchObject({ detail: "ouvre demain à 07h30" });
  });

  it("names the next opening day after Friday evening", () => {
    expect(at("2026-10-16T18:00:00Z")).toEqual({
      state: "closed",
      label: "Fermé",
      detail: "ouvre lundi à 07h30",
    });
  });

  it("treats Vaud public holidays as closed", () => {
    const holidays = vaudHolidays(2026);
    for (const day of ["2026-1-2", "2026-4-3", "2026-4-6", "2026-5-14", "2026-5-25", "2026-9-21"])
      expect(holidays.has(day)).toBe(true);
    // Lundi du Jeûne fédéral 2026, mid-morning.
    expect(at("2026-09-21T08:00:00Z")).toEqual({
      state: "closed",
      label: "Fermé (jour férié)",
      detail: "ouvre demain à 07h30",
    });
  });
});
