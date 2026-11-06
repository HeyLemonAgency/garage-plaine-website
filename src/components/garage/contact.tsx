import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CarFront,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { departments, garage, team, type DepartmentId } from "@/lib/garage";
import { OpenStatus, WhatsAppIcon, whatsappHref } from "./people";
import { verifierMessage } from "@/lib/lemon";
import {
  Honeypot,
  NoScriptNote,
  SendError,
  SentPanel,
  lemon,
  sendToGarage,
  useInteractive,
  type SendState,
} from "./platform";

export function Hours() {
  return (
    <div className="hours">
      <div className="hours-head">
        <div className="eyebrow">
          <Clock className="size-3" />
          Horaires d’ouverture
        </div>
        <OpenStatus />
      </div>
      {garage.hours.map(([day, time]) => (
        <div className="hours-row" key={day}>
          <span>{day}</span>
          <span>{time}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Contact form: the message goes to the garage's console on the Lemon platform (the site keeps
 * nothing). It says "sent" only once the platform has answered 201 { ok: true }.
 */
export function ContactForm({ defaultTopic = "vente" }: { defaultTopic?: DepartmentId }) {
  const [topic, setTopic] = useState<DepartmentId>(defaultTopic);
  const [state, setState] = useState<SendState>({ step: "typing" });
  const interactive = useInteractive();
  useEffect(() => setTopic(defaultTopic), [defaultTopic]);
  const department = departments.find((d) => d.id === topic) ?? departments[0];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "");
    const message = {
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      message: text("message"),
      hp: text("site_web"),
      ...(data.get("consent") === "on" ? { consent: true as const } : {}),
    };
    const problem = verifierMessage(message);
    if (problem) {
      setState({ step: "error", message: problem, invalid: true });
      return;
    }
    setState({ step: "sending" });
    // The contract has no field for the trade yet: the first line of the message names it.
    setState(
      await sendToGarage({
        ...message,
        message: `Demande : ${department.label} (pour ${department.contact.name})\n\n${message.message.trim()}`,
      }),
    );
  }

  if (state.step === "sent") {
    return (
      <SentPanel title="Merci, votre message est bien arrivé.">
        <p>
          {department.contact.name} ({department.contact.role.toLowerCase()}) vous répond dès que
          possible.
        </p>
      </SentPanel>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <NoScriptNote contact={department.contact} />
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-name">
            Nom et prénom <span className="req">*</span>
          </label>
          <span className="field-icon">
            <User aria-hidden="true" />
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              placeholder="Votre nom"
              required
              maxLength={100}
            />
          </span>
        </div>
        <div className="form-field">
          <label htmlFor="contact-phone">Téléphone</label>
          <span className="field-icon">
            <Phone aria-hidden="true" />
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Votre numéro"
              maxLength={30}
            />
          </span>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-email">
            E-mail <span className="req">*</span>
          </label>
          <span className="field-icon">
            <Mail aria-hidden="true" />
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Votre adresse e-mail"
              required
            />
          </span>
        </div>
        <div className="form-field">
          <label htmlFor="contact-service">Votre demande</label>
          <span className="field-icon">
            <CarFront aria-hidden="true" />
            <select
              id="contact-service"
              name="service"
              value={topic}
              onChange={(e) => setTopic(e.target.value as DepartmentId)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </span>
          <p className="form-recipient" aria-live="polite">
            Pour <strong>{department.contact.name}</strong> · {department.contact.role}
          </p>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="contact-message">
          Message <span className="req">*</span>
        </label>
        <span className="field-icon field-icon-top">
          <MessageSquare aria-hidden="true" />
          <textarea
            id="contact-message"
            name="message"
            placeholder="Comment pouvons-nous vous aider&nbsp;?"
            required
            minLength={5}
            maxLength={5000}
          />
        </span>
      </div>
      <Honeypot />
      <label className="privacy">
        <input type="checkbox" name="consent" required />{" "}
        <span>
          J’accepte que mes coordonnées soient utilisées pour répondre à ma demande.{" "}
          <Link to="/confidentialite" className="underline">
            Confidentialité
          </Link>
        </span>
      </label>
      <div aria-live="polite">
        {state.step === "error" && (
          <SendError
            message={state.message}
            contact={department.contact}
            invalid={state.invalid ?? false}
          />
        )}
      </div>
      <div className="form-footer">
        <p>Votre message arrive directement au garage.</p>
        <Button
          type="submit"
          variant="premium"
          disabled={!interactive || !lemon.configure || state.step === "sending"}
        >
          {state.step === "sending" ? "Envoi en cours…" : "Envoyer le message"} <ArrowRight />
        </Button>
      </div>
    </form>
  );
}

export function ContactSection({ defaultTopic }: { defaultTopic?: DepartmentId }) {
  const sales = team.vente;
  return (
    <section className="contact-band contact-panel" id="contact">
      <div className="container contact-panel-grid">
        <div className="contact-card">
          <div className="eyebrow eyebrow-rule">À votre écoute</div>
          <h2 className="contact-title">
            Une question&nbsp;? <br />
            Écrivez-nous.
          </h2>
          <p className="contact-intro">
            Une nouvelle voiture, une réparation ou un entretien&nbsp;? <br />
            Notre équipe est à votre disposition.
          </p>
          <div className="contact-lines">
            <a className="contact-line" href={garage.phoneHref}>
              <span className="contact-line-icon" aria-hidden="true">
                <Phone />
              </span>
              <div>
                <span>Réception, atelier et carrosserie</span>
                <strong>{garage.phone}</strong>
              </div>
            </a>
            {/* One number per line: Tiago's mobile is also the WhatsApp, offered beside it. */}
            <div className="contact-line-pair">
              <a className="contact-line" href={sales.mobileHref}>
                <span className="contact-line-icon" aria-hidden="true">
                  <CarFront />
                </span>
                <div>
                  <span>Vente – {sales.name}</span>
                  <strong>{sales.mobile}</strong>
                </div>
              </a>
              <a
                className="contact-wa"
                href={whatsappHref(sales)}
                target="_blank"
                rel="noreferrer"
                aria-label={`WhatsApp, ${sales.name} (nouvel onglet)`}
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>
            <a className="contact-line" href={garage.directions} target="_blank" rel="noreferrer">
              <span className="contact-line-icon" aria-hidden="true">
                <MapPin />
              </span>
              <div>
                {garage.address} <br />
                {garage.locality}
              </div>
            </a>
          </div>
          <Hours />
        </div>
        <ContactForm {...(defaultTopic ? { defaultTopic } : {})} />
      </div>
    </section>
  );
}

type Trade = "vente" | "atelier" | "carrosserie";
const tradeTopic: Record<Trade, DepartmentId> = {
  vente: "vente",
  atelier: "atelier",
  carrosserie: "carrosserie",
};

/**
 * The closing band of every page but /contact: one sentence and the next steps (an
 * appointment, a call, WhatsApp, a message). People are shown where they matter in the page
 * itself, all together on /contact and in the footer, never three times over.
 */
export function ContactBand({
  trade,
  children,
}: {
  /** The trade of the page: the buttons open its planner and form. None (home, /entreprise): no preselection. */
  trade?: Trade;
  /** A page's own extra next step, after the shared ones. */
  children?: ReactNode;
}) {
  return (
    <section className="contact-cta" aria-labelledby="contact-cta-title">
      <div className="container contact-cta-grid">
        <div className="contact-cta-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />À votre écoute
          </div>
          <h2 id="contact-cta-title">
            Une question ? <span className="nowrap">Parlons-en.</span>
          </h2>
          <p>
            Lundi à vendredi : 7h30 – 12h / 13h30 – 18h (vendredi 17h)
            <br />
            Samedi : sur rendez-vous
          </p>
          <OpenStatus className="contact-cta-status" />
        </div>
        <div className="contact-cta-actions">
          <Button asChild variant="premium">
            <Link to="/rendez-vous" search={trade ? { besoin: trade } : {}}>
              Prendre rendez-vous <ArrowRight />
            </Link>
          </Button>
          <div className="contact-cta-quick">
            <a className="contact-cta-chip" href={garage.phoneHref}>
              <Phone aria-hidden="true" />
              {garage.phone}
            </a>
            <a
              className="contact-cta-chip"
              href={
                trade && trade !== "vente"
                  ? whatsappHref(team[trade])
                  : whatsappHref(team.vente, "Bonjour, ")
              }
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
          <div className="contact-cta-links">
            <Link
              to="/contact"
              search={trade ? { demande: tradeTopic[trade] } : {}}
              className="contact-cta-link"
            >
              Écrire un message <ArrowRight />
            </Link>
            <Link to="/contact" className="contact-cta-link">
              Tous nos interlocuteurs <ArrowRight />
            </Link>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Address panel with the Google map, loaded once the panel nears the screen. */
export function Location({ station = false }: { station?: boolean }) {
  return (
    <section className="location-panel" aria-label="Localisation du garage">
      <div className="container location-grid">
        <div className="location-card">
          <MapPin className="location-pin" />
          <h2>À Denges, entre Morges et Lausanne.</h2>
          <p>
            {garage.address} · {garage.locality} <br />À 5 minutes de Morges et 10 minutes de
            Lausanne.
          </p>
          {station ? (
            <span className="open-status open-status-open">
              <span className="open-dot" aria-hidden="true" />
              <strong>Station ouverte 24h/24</strong>
              <span className="open-detail">· 7j/7</span>
            </span>
          ) : (
            <OpenStatus />
          )}
          <Button asChild variant="premium">
            <a href={garage.directions} target="_blank" rel="noreferrer">
              Obtenir l’itinéraire <ArrowUpRight />
            </a>
          </Button>
        </div>
        <div className="location-map">
          <iframe
            src={garage.mapEmbed}
            title="Carte : Garage Carrosserie de la Plaine, Route de la Plaine 20, Denges"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
