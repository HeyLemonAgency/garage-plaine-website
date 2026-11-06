import { team, type Contact } from "./garage";
import { addDays, isHoliday, swissToday } from "./opening";

// Appointment requests: the visitor picks a need, a day and a slot; the garage confirms
// by phone or e-mail. Nothing is booked automatically.

export const appointmentTopics = [
  {
    id: "atelier",
    label: "Atelier mécanique",
    hint: "Entretien, pneus, diagnostic…",
    icon: "wrench",
    contact: team.atelier,
    needs: [
      "Entretien ou service",
      "Réparation ou diagnostic",
      "Pneus et géométrie",
      "Climatisation",
      "Électricité ou feux diurnes",
      "Attelage ou remorque",
      "Autre travail",
    ],
  },
  {
    id: "carrosserie",
    label: "Carrosserie",
    hint: "Sinistre, peinture, restauration…",
    icon: "spray",
    contact: team.carrosserie,
    needs: [
      "Sinistre ou dégât",
      "Devis peinture ou réparation",
      "Restauration",
      "Remplacement de pare-brise",
      "Polissage ou traitement",
      "Rouille ou corps creux",
      "Autre demande",
    ],
  },
  {
    id: "vente",
    label: "Vente",
    hint: "Essai, offre, reprise…",
    icon: "key",
    contact: team.vente,
    needs: [
      "Essai sur route",
      "Offre pour un véhicule",
      "Financement ou leasing",
      "Reprise de mon véhicule",
      "Autre question",
    ],
  },
] as const;

export type TopicId = (typeof appointmentTopics)[number]["id"];
export const isTopicId = (value: unknown): value is TopicId =>
  appointmentTopics.some((t) => t.id === value);

export type AppointmentDay = { iso: string; short: string; long: string; saturday: boolean };

const shortFormat = new Intl.DateTimeFormat("fr-CH", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const longFormat = new Intl.DateTimeFormat("fr-CH", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** The next `count` days the garage can be asked for, from tomorrow (no Sundays or holidays). */
export function upcomingDays(now: Date = new Date(), count = 12): AppointmentDay[] {
  const today = swissToday(now);
  const days: AppointmentDay[] = [];
  for (let offset = 1; days.length < count && offset <= 40; offset++) {
    const day = addDays(today, offset);
    if (day.getUTCDay() === 0 || isHoliday(day)) continue;
    days.push({
      iso: day.toISOString().slice(0, 10),
      short: shortFormat.format(day),
      long: longFormat.format(day),
      saturday: day.getUTCDay() === 6,
    });
  }
  return days;
}

export const weekdaySlots = [
  { id: "matin", label: "Matin", hint: "dès 07h30" },
  { id: "apres-midi", label: "Après-midi", hint: "dès 13h30" },
  { id: "indifferent", label: "Indifférent", hint: "selon vos disponibilités" },
] as const;
export const saturdaySlots = [
  { id: "a-convenir", label: "À convenir", hint: "le samedi, sur rendez-vous" },
] as const;

export type AppointmentRequest = {
  topic: TopicId;
  need: string;
  vehicle: string;
  day: AppointmentDay | null;
  slot: string;
  name: string;
  phone: string;
  email: string;
  contactBy: "téléphone" | "e-mail";
  message: string;
};

export function topicContact(topic: TopicId): Contact {
  return appointmentTopics.find((t) => t.id === topic)?.contact ?? team.vente;
}

/**
 * Plain-text summary of the request, as the garage reads it. The name, phone and e-mail travel in
 * their own fields: the platform's notice already shows them at the top, so they are not repeated.
 * « Libellé : valeur » lines, one per line: the platform's e-mail turns them into a small table.
 */
export function appointmentSummary(req: AppointmentRequest): string {
  const topic = appointmentTopics.find((t) => t.id === req.topic);
  const when = req.day
    ? `${req.day.long}${req.slot ? `, ${req.slot.toLowerCase()}` : ""}`
    : "à convenir";
  const lines = [`Besoin : ${topic?.label ?? ""} — ${req.need}`];
  if (req.vehicle) lines.push(`Véhicule : ${req.vehicle}`);
  lines.push(`Date souhaitée : ${when} (à confirmer par le garage)`);
  lines.push(`Préférence de contact : ${req.contactBy}`);
  if (req.message) lines.push("", "Message :", req.message);
  return lines.join("\n");
}

/** The message the garage receives in its console: what, for whom, when, then the summary. */
export function appointmentMessage(req: AppointmentRequest): string {
  const contact = topicContact(req.topic);
  const topic = appointmentTopics.find((t) => t.id === req.topic);
  const title = `Demande de rendez-vous — ${topic?.label ?? ""}${req.day ? `, ${req.day.short}` : ""}`;
  return `${title} (pour ${contact.name})\n\n${appointmentSummary(req)}`;
}
