import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
  KeyRound,
  Mail,
  Phone,
  SprayCan,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { garage } from "@/lib/garage";
import {
  appointmentMailto,
  appointmentSummary,
  appointmentTopics,
  saturdaySlots,
  topicContact,
  upcomingDays,
  weekdaySlots,
  type AppointmentDay,
  type AppointmentRequest,
  type TopicId,
} from "@/lib/appointment";

const topicIcons = { wrench: Wrench, spray: SprayCan, key: KeyRound };
const steps = ["Besoin", "Véhicule", "Date", "Coordonnées"] as const;

function Choice({
  selected,
  onSelect,
  children,
  className = "",
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`choice ${selected ? "is-selected" : ""} ${className}`}
      onClick={onSelect}
    >
      {children}
      {selected && <Check className="choice-check" aria-hidden="true" />}
    </button>
  );
}

export function AppointmentPlanner({
  initialTopic,
  initialVehicle = "",
}: {
  initialTopic?: TopicId;
  initialVehicle?: string;
}) {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState<TopicId | null>(initialTopic ?? null);
  const [need, setNeed] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [interest, setInterest] = useState(initialVehicle);
  const [day, setDay] = useState<AppointmentDay | null>(null);
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactBy, setContactBy] = useState<"téléphone" | "e-mail">("téléphone");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  // Computed in the browser once the date step opens (it is never server-rendered).
  const [days, setDays] = useState<AppointmentDay[]>([]);
  useEffect(() => {
    if (step === 2 && days.length === 0) setDays(upcomingDays(new Date(), 12));
  }, [step, days.length]);
  const topicInfo = appointmentTopics.find((t) => t.id === topic);
  const contact = topic ? topicContact(topic) : null;
  const isSale = topic === "vente";
  const vehicle = isSale
    ? interest.trim()
    : [make, model].filter(Boolean).join(" ") +
      [year && `, ${year}`, mileage && `, ${mileage} km`].filter(Boolean).join("");
  const slots = day?.saturday ? saturdaySlots : weekdaySlots;

  const request: AppointmentRequest | null =
    topic && need
      ? {
          topic,
          need,
          vehicle,
          day,
          slot,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          contactBy,
          message: message.trim(),
        }
      : null;

  const canContinue = [
    Boolean(topic && need),
    isSale ? true : make.trim().length > 0,
    Boolean(day && slot),
    name.trim().length > 1 && phone.trim().length > 5 && consent,
  ];

  function go(to: number) {
    setStep(to);
    requestAnimationFrame(() => {
      const el = panel.current;
      if (el && el.getBoundingClientRect().top < 80) el.scrollIntoView({ block: "start" });
      el?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
    });
  }

  function submit() {
    if (!request) return;
    window.location.href = appointmentMailto(request);
    setSent(true);
  }

  async function copySummary() {
    if (!request) return;
    try {
      await navigator.clipboard.writeText(appointmentSummary(request));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="planner" ref={panel}>
      <ol className="planner-steps" aria-label="Étapes">
        {steps.map((label, i) => (
          <li
            key={label}
            className={i === step ? "is-current" : i < step ? "is-done" : ""}
            aria-current={i === step ? "step" : undefined}
          >
            <button
              type="button"
              disabled={i > step && !canContinue.slice(0, i).every(Boolean)}
              onClick={() => go(i)}
            >
              <span className="planner-step-index">{i < step ? <Check /> : i + 1}</span>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="planner-progress" aria-hidden="true">
        <span style={{ width: `${((sent ? 4 : step) / 4) * 100}%` }} />
      </div>

      <div className="planner-layout">
        <div className="planner-panel" key={sent ? "sent" : step}>
          {sent ? (
            <div className="planner-done">
              <div className="planner-done-icon">
                <Check />
              </div>
              <h2>Votre demande est prête.</h2>
              <p>
                Elle s’est ouverte dans votre messagerie, adressée à {contact?.name}. Envoyez
                l’e-mail : nous vous confirmons le rendez-vous par {contactBy}.
              </p>
              <p className="small-note">
                Votre messagerie ne s’est pas ouverte&nbsp;? Copiez le récapitulatif et envoyez-le à{" "}
                {contact?.email}, ou appelez-nous au {garage.phone}.
              </p>
              <div className="detail-actions">
                <Button type="button" variant="premium" onClick={copySummary}>
                  <Copy /> {copied ? "Récapitulatif copié" : "Copier le récapitulatif"}
                </Button>
                <Button type="button" variant="appointment" onClick={() => setSent(false)}>
                  Modifier ma demande
                </Button>
              </div>
            </div>
          ) : step === 0 ? (
            <fieldset>
              <legend>De quoi avez-vous besoin&nbsp;?</legend>
              <div className="topic-grid" role="radiogroup" aria-label="Service">
                {appointmentTopics.map((t) => {
                  const Icon = topicIcons[t.icon];
                  return (
                    <Choice
                      key={t.id}
                      selected={topic === t.id}
                      className="choice-topic"
                      onSelect={() => {
                        if (topic !== t.id) setNeed("");
                        setTopic(t.id);
                      }}
                    >
                      <Icon className="choice-icon" />
                      <strong>{t.label}</strong>
                      <span>{t.hint}</span>
                    </Choice>
                  );
                })}
              </div>
              {topicInfo && (
                <div className="need-block">
                  <p className="planner-label">Précisez votre demande</p>
                  <div className="chip-row" role="radiogroup" aria-label="Précision">
                    {topicInfo.needs.map((n) => (
                      <Choice
                        key={n}
                        selected={need === n}
                        className="choice-chip"
                        onSelect={() => setNeed(n)}
                      >
                        {n}
                      </Choice>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>
          ) : step === 1 ? (
            <fieldset>
              <legend>{isSale ? "Quel véhicule vous intéresse ?" : "Votre véhicule"}</legend>
              {isSale ? (
                <div className="form-field">
                  <label htmlFor="pl-interest">Véhicule ou annonce (facultatif)</label>
                  <input
                    id="pl-interest"
                    data-autofocus
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    placeholder="Par exemple Suzuki Vitara Hybrid"
                    maxLength={200}
                  />
                  <p className="form-hint">
                    Pas encore d’idée précise&nbsp;? Laissez vide, {contact?.name.split(" ")[0]}{" "}
                    vous conseille.
                  </p>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="pl-make">Marque *</label>
                      <input
                        id="pl-make"
                        data-autofocus
                        list="pl-makes"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        placeholder="Suzuki, Audi, BMW…"
                        maxLength={60}
                      />
                      <datalist id="pl-makes">
                        {[
                          "Suzuki",
                          "Audi",
                          "BMW",
                          "Citroën",
                          "Honda",
                          "Mercedes-Benz",
                          "Peugeot",
                          "Renault",
                          "Toyota",
                          "Volkswagen",
                        ].map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>
                    <div className="form-field">
                      <label htmlFor="pl-model">Modèle</label>
                      <input
                        id="pl-model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="Vitara, A4…"
                        maxLength={60}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="pl-year">Année</label>
                      <input
                        id="pl-year"
                        inputMode="numeric"
                        value={year}
                        onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="2019"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="pl-km">Kilométrage</label>
                      <input
                        id="pl-km"
                        inputMode="numeric"
                        value={mileage}
                        onChange={(e) =>
                          setMileage(e.target.value.replace(/[^\d’' ]/g, "").slice(0, 9))
                        }
                        placeholder="85’000"
                      />
                    </div>
                  </div>
                </>
              )}
            </fieldset>
          ) : step === 2 ? (
            <fieldset>
              <legend>Quand vous arrangerait-il&nbsp;?</legend>
              <p className="planner-label">
                <CalendarDays className="size-4" /> Choisissez un jour
              </p>
              <div className="day-row" role="radiogroup" aria-label="Jour souhaité">
                {days.map((d) => {
                  const [weekday = "", date = "", month = ""] = d.short.split(" ");
                  return (
                    <Choice
                      key={d.iso}
                      selected={day?.iso === d.iso}
                      className="choice-day"
                      onSelect={() => {
                        setDay(d);
                        setSlot(d.saturday ? (saturdaySlots[0]?.label ?? "") : "");
                      }}
                    >
                      <span className="day-weekday">{weekday.replace(".", "")}</span>
                      <strong className="day-date">{date}</strong>
                      <span className="day-month">{month.replace(".", "")}</span>
                      {d.saturday && <span className="day-tag">sur RDV</span>}
                    </Choice>
                  );
                })}
              </div>
              {day && (
                <div className="need-block">
                  <p className="planner-label">Plutôt le…</p>
                  <div className="chip-row" role="radiogroup" aria-label="Moment de la journée">
                    {slots.map((s) => (
                      <Choice
                        key={s.id}
                        selected={slot === s.label}
                        className="choice-slot"
                        onSelect={() => setSlot(s.label)}
                      >
                        <strong>{s.label}</strong>
                        <span>{s.hint}</span>
                      </Choice>
                    ))}
                  </div>
                </div>
              )}
              <p className="form-hint">
                C’est une demande : nous vous confirmons le rendez-vous, ou vous proposons un autre
                moment.
              </p>
            </fieldset>
          ) : (
            <fieldset>
              <legend>Comment vous joindre&nbsp;?</legend>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="pl-name">Nom et prénom *</label>
                  <input
                    id="pl-name"
                    data-autofocus
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="pl-phone">Téléphone *</label>
                  <input
                    id="pl-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="pl-email">E-mail</label>
                  <input
                    id="pl-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <span className="planner-label-inline">Nous vous répondons par</span>
                  <div className="chip-row" role="radiogroup" aria-label="Préférence de contact">
                    {(["téléphone", "e-mail"] as const).map((c) => (
                      <Choice
                        key={c}
                        selected={contactBy === c}
                        className="choice-chip"
                        onSelect={() => setContactBy(c)}
                      >
                        {c === "téléphone" ? <Phone /> : <Mail />} {c}
                      </Choice>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="pl-message">Un détail à ajouter&nbsp;?</label>
                <textarea
                  id="pl-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bruit au freinage, numéro de sinistre, véhicule de remplacement souhaité…"
                  maxLength={3000}
                />
              </div>
              <label className="privacy">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  J’accepte que mes coordonnées soient utilisées pour répondre à ma demande.
                </span>
              </label>
            </fieldset>
          )}

          {!sent && (
            <div className="planner-nav">
              {step > 0 ? (
                <Button type="button" variant="appointment" onClick={() => go(step - 1)}>
                  <ArrowLeft /> Retour
                </Button>
              ) : (
                <span />
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  variant="premium"
                  disabled={!canContinue[step]}
                  onClick={() => go(step + 1)}
                >
                  Continuer <ArrowRight />
                </Button>
              ) : (
                <Button type="button" variant="premium" disabled={!canContinue[3]} onClick={submit}>
                  Préparer ma demande <ArrowRight />
                </Button>
              )}
            </div>
          )}
        </div>

        <aside className="planner-summary" aria-label="Récapitulatif" aria-live="polite">
          <div className="eyebrow">Votre demande</div>
          <dl>
            <div>
              <dt>Besoin</dt>
              <dd>{topicInfo ? `${topicInfo.label}${need ? ` · ${need}` : ""}` : "—"}</dd>
            </div>
            <div>
              <dt>Véhicule</dt>
              <dd>{vehicle || "—"}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{day ? `${day.long}${slot ? ` · ${slot.toLowerCase()}` : ""}` : "—"}</dd>
            </div>
          </dl>
          {contact ? (
            <div className="summary-contact">
              <div className="sales-avatar" aria-hidden="true">
                {contact.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div>
                <span className="sales-role">Votre interlocuteur</span>
                <strong>{contact.name}</strong>
                <span className="summary-role">{contact.role}</span>
              </div>
            </div>
          ) : (
            <p className="small-note">Choisissez un service : nous vous dirons qui s’en occupe.</p>
          )}
          <a className="summary-call" href={contact?.mobileHref ?? garage.phoneHref}>
            <Phone /> Plus rapide par téléphone : {contact?.mobile ?? garage.phone}
          </a>
        </aside>
      </div>
    </div>
  );
}
