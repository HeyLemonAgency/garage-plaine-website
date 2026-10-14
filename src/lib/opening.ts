import { schedule } from "./garage";

// Live "open now" status from the published hours, in Swiss time. Vaud public holidays
// count as closed days.

export type OpeningStatus = {
  state: "open" | "closed" | "appointment";
  label: string;
  detail: string;
};

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

type SwissDay = { year: number; month: number; day: number; weekday: number; minutes: number };

function swissParts(date: Date): SwissDay {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdays.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function easterSunday(year: number): Date {
  // Anonymous Gregorian algorithm.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

export const dayKey = (d: Date) => `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
export const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

export function vaudHolidays(year: number): Set<string> {
  const easter = easterSunday(year);
  const septFirst = new Date(Date.UTC(year, 8, 1));
  // Lundi du Jeûne fédéral: the day after the third Sunday of September.
  const firstSunday = addDays(septFirst, (7 - septFirst.getUTCDay()) % 7);
  return new Set(
    [
      new Date(Date.UTC(year, 0, 1)),
      new Date(Date.UTC(year, 0, 2)),
      addDays(easter, -2),
      addDays(easter, 1),
      addDays(easter, 39),
      addDays(easter, 50),
      new Date(Date.UTC(year, 7, 1)),
      addDays(firstSunday, 15),
      new Date(Date.UTC(year, 11, 25)),
    ].map(dayKey),
  );
}

const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}h${String(minutes % 60).padStart(2, "0")}`;

export function isHoliday(d: Date) {
  return vaudHolidays(d.getUTCFullYear()).has(dayKey(d));
}

/** Today's date in Switzerland, as a UTC midnight Date (weekday via getUTCDay). */
export function swissToday(now: Date = new Date()): Date {
  const t = swissParts(now);
  return new Date(Date.UTC(t.year, t.month - 1, t.day));
}

export function openingStatus(now: Date = new Date()): OpeningStatus {
  const t = swissParts(now);
  const today = swissToday(now);
  const holiday = isHoliday(today);
  const periods = holiday ? [] : (schedule[t.weekday] ?? []);

  const current = periods.find(([start, end]) => t.minutes >= start && t.minutes < end);
  if (current) return { state: "open", label: "Ouvert", detail: `jusqu’à ${hhmm(current[1])}` };

  const laterToday = periods.find(([start]) => t.minutes < start);
  if (laterToday)
    return { state: "closed", label: "Fermé", detail: `ouvre à ${hhmm(laterToday[0])}` };

  if (t.weekday === 6 && !holiday)
    return { state: "appointment", label: "Samedi", detail: "sur rendez-vous" };

  for (let offset = 1; offset <= 10; offset++) {
    const day = addDays(today, offset);
    const next = isHoliday(day) ? undefined : schedule[day.getUTCDay()]?.[0];
    if (next) {
      const when = offset === 1 ? "demain" : DAY_NAMES[day.getUTCDay()];
      return {
        state: "closed",
        label: holiday ? "Fermé (jour férié)" : "Fermé",
        detail: `ouvre ${when} à ${hhmm(next[0])}`,
      };
    }
  }
  return { state: "closed", label: "Fermé", detail: "" };
}
