import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, MapPin, Clock, ArrowUpRight, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { departments, garage, team, type DepartmentId } from "@/lib/garage";
import { OpenStatus } from "./people";

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

export function ContactForm({ defaultTopic = "vente" }: { defaultTopic?: DepartmentId }) {
  const [topic, setTopic] = useState<DepartmentId>(defaultTopic);
  const [prepared, setPrepared] = useState(false);
  useEffect(() => setTopic(defaultTopic), [defaultTopic]);
  const department = departments.find((d) => d.id === topic) ?? departments[0];

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = `Bonjour,\n\n${data.get("message")}\n\nNom : ${data.get("name")}\nE-mail : ${data.get("email")}\nTéléphone : ${data.get("phone")}\nDemande : ${department.label}`;
    window.location.href = `mailto:${department.contact.email}?subject=${encodeURIComponent("Demande de contact — " + department.label)}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }

  return (
    <form className="contact-form" onSubmit={submit}>
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
          maxLength={5000}
        />
      </div>
      <label className="privacy">
        <input type="checkbox" required />{" "}
        <span>
          J’accepte que mes coordonnées soient utilisées pour répondre à ma demande.{" "}
          <Link to="/confidentialite" className="underline">
            Confidentialité
          </Link>
        </span>
      </label>
      <div className="form-footer">
        <p>Votre message sera préparé dans votre application e-mail.</p>
        <Button type="submit" variant="premium">
          Préparer mon message <ArrowRight />
        </Button>
      </div>
      {prepared && (
        <p role="status" className="form-status">
          Votre e-mail est prêt à être envoyé dans votre messagerie. Si elle ne s’ouvre pas,
          contactez-nous au {garage.phone}.
        </p>
      )}
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
            Parlons de votre
            <br />
            prochain projet.
          </h2>
          <p className="contact-intro">
            Une nouvelle voiture, une réparation ou un entretien&nbsp;?
            <br />
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
              {garage.address}
              <br />
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

/** Address panel with a Google map that only loads once the visitor asks for it. */
export function Location() {
  const [showMap, setShowMap] = useState(false);
  return (
    <section className="location-panel" aria-label="Localisation du garage">
      <div className="container location-grid">
        <div className="location-card">
          <MapPin className="location-pin" />
          <h2>Au cœur de Denges.</h2>
          <p>
            {garage.address} · {garage.locality}
            <br />À 5 minutes de Morges et 10 minutes de Lausanne.
          </p>
          <OpenStatus />
          <Button asChild variant="premium">
            <a href={garage.directions} target="_blank" rel="noreferrer">
              Obtenir l’itinéraire <ArrowUpRight />
            </a>
          </Button>
        </div>
        <div className="location-map">
          {showMap ? (
            <iframe
              src={garage.mapEmbed}
              title="Carte : Garage de la Plaine, Route de la Plaine 20, Denges"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="map-consent">
              <MapIcon />
              <Button variant="appointment" type="button" onClick={() => setShowMap(true)}>
                Afficher la carte
              </Button>
              <p>La carte est fournie par Google Maps et ne se charge qu’à votre demande.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
