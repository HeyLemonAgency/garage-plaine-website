import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { garage } from "@/lib/garage";
export function Hours() {
  return (
    <div className="hours">
      <div className="eyebrow">
        <Clock className="size-3" />
        Horaires d’ouverture
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
export function ContactForm() {
  const [prepared, setPrepared] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const service = String(data.get("service"));
    const email =
      service === "Atelier mécanique"
        ? "jerome.baatard@garageplaine.ch"
        : service === "Carrosserie"
          ? "marco.dasilva@garageplaine.ch"
          : garage.email;
    const body = `Bonjour,\n\n${data.get("message")}\n\nNom : ${data.get("name")}\nE-mail : ${data.get("email")}\nTéléphone : ${data.get("phone")}\nService : ${service}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent("Demande de contact — " + service)}&body=${encodeURIComponent(body)}`;
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
          <select id="contact-service" name="service">
            <option>Rendez-vous</option>
            <option>Atelier mécanique</option>
            <option>Carrosserie</option>
            <option>Vente de véhicules</option>
            <option>Autre demande</option>
          </select>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="contact-message">Message *</label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Comment pouvons-nous vous aider ?"
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
export function ContactSection() {
  return (
    <section className="contact-band">
      <div className="container contact-grid">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />À votre écoute
          </div>
          <h2 className="contact-title">
            Parlons de votre
            <br />
            prochain rendez-vous.
          </h2>
          <p className="contact-intro">
            Un entretien, une réparation ou une nouvelle voiture ?<br />
            Notre équipe est à votre disposition.
          </p>
          <a className="contact-line" href={garage.phoneHref}>
            <Phone />
            <div>
              <span>Appelez-nous</span>
              <strong>{garage.phone}</strong>
            </div>
          </a>
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
        <ContactForm />
      </div>
    </section>
  );
}
export function Location() {
  return (
    <section className="location-panel" aria-label="Localisation du garage">
      <div className="location-inner">
        <MapPin />
        <h2>Au cœur de Denges.</h2>
        <p>
          {garage.address} · {garage.locality}
          <br />À 5 minutes de Morges et 10 minutes de Lausanne.
        </p>
        <Button asChild variant="premium">
          <a href={garage.directions} target="_blank" rel="noreferrer">
            Voir la carte et l’itinéraire <ArrowUpRight />
          </a>
        </Button>
      </div>
    </section>
  );
}
