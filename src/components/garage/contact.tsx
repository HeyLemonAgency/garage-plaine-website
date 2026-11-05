import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { departments, garage, team, type DepartmentId } from "@/lib/garage";
import { OpenStatus } from "./people";
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
      setState({ step: "error", message: problem });
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
          {department.contact.name} ({department.contact.role.toLowerCase()}) vous répond, en
          général dans la journée ouvrable.
        </p>
      </SentPanel>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <NoScriptNote contact={department.contact} />
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-name">Nom et prénom *</label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Votre nom"
            required
            maxLength={100}
          />
        </div>
        <div className="form-field">
          <label htmlFor="contact-phone">Téléphone</label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Votre numéro"
            maxLength={30}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-email">E-mail *</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Votre adresse e-mail"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="contact-service">Votre demande</label>
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
          <p className="form-recipient" aria-live="polite">
            Pour <strong>{department.contact.name}</strong> · {department.contact.role}
          </p>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="contact-message">Message *</label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Comment pouvons-nous vous aider&nbsp;?"
          required
          minLength={5}
          maxLength={5000}
        />
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
          <SendError message={state.message} contact={department.contact} />
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
    <section className="contact-band" id="contact">
      <div className="container contact-grid">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />À votre écoute
          </div>
          <h2 className="contact-title">
            Parlons de votre <br />
            prochain projet.
          </h2>
          <p className="contact-intro">
            Une nouvelle voiture, une réparation ou un entretien&nbsp;? <br />
            Notre équipe est à votre disposition.
          </p>
          <div className="contact-lines">
            <a className="contact-line" href={garage.phoneHref}>
              <Phone />
              <div>
                <span>Réception</span>
                <strong>{garage.phone}</strong>
              </div>
            </a>
            <a className="contact-line" href={sales.mobileHref}>
              <Phone />
              <div>
                <span>Vente · {sales.name}</span>
                <strong>{sales.mobile}</strong>
              </div>
            </a>
          </div>
          <a className="contact-line" href={garage.directions} target="_blank" rel="noreferrer">
            <MapPin />
            <div>
              {garage.address} <br />
              {garage.locality}
            </div>
          </a>
          <Hours />
        </div>
        <ContactForm {...(defaultTopic ? { defaultTopic } : {})} />
      </div>
    </section>
  );
}

/** Address panel with the Google map, loaded once the panel nears the screen. */
export function Location() {
  return (
    <section className="location-panel" aria-label="Localisation du garage">
      <div className="container location-grid">
        <div className="location-card">
          <MapPin className="location-pin" />
          <h2>Au cœur de Denges.</h2>
          <p>
            {garage.address} · {garage.locality} <br />À 5 minutes de Morges et 10 minutes de
            Lausanne.
          </p>
          <OpenStatus />
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
