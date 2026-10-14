import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Fuel,
  KeyRound,
  ShieldCheck,
  SprayCan,
  Wrench,
  CarFront,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mechanicalServices, services } from "@/lib/garage";
import hero from "@/assets/suzuki-lake.webp";
import suzuki from "@/assets/suzuki-logo.png";
import garagePhoto from "@/assets/garage.webp";
import sales from "@/assets/sales.webp";
import workshop from "@/assets/workshop.webp";
import bodywork from "@/assets/bodywork.webp";

export const photos = { workshop, bodywork, garage: garagePhoto, sales };
const icons = { key: KeyRound, spray: SprayCan, wrench: Wrench };

export function Hero() {
  return (
    <section className="hero">
      <img
        className="hero-image"
        src={hero}
        alt="Suzuki Vitara dans un paysage au bord du Léman"
        width={1920}
        height={1024}
        fetchPriority="high"
      />
      <div className="container hero-content reveal">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Garage de la Plaine · Denges
        </div>
        <h1>
          Votre garage
          <br />
          de confiance
          <br />à Denges.
        </h1>
        <div className="red-rule" />
        <p>
          Vente, carrosserie et entretien.
          <br />
          Un service de proximité
          <br />
          depuis plus de 40 ans.
        </p>
        <div className="hero-actions">
          <Button variant="premium" asChild>
            <Link to="/vehicules">
              Voir les véhicules <ArrowRight />
            </Link>
          </Button>
          <Button variant="appointment" asChild>
            <Link to="/contact">
              Prendre rendez-vous <ClipboardCheck />
            </Link>
          </Button>
        </div>
        <div className="suzuki-signature">
          <img src={suzuki} alt="Suzuki" width={120} height={28} />
          <span>Partenaire officiel Suzuki</span>
        </div>
      </div>
      <span className="hero-caption">Visuel d’illustration</span>
    </section>
  );
}

export function TrustBar() {
  const items = [
    { icon: ShieldCheck, title: "40+ ans", text: "d’expérience" },
    { icon: KeyRound, title: "Suzuki", text: "concessionnaire depuis 20+ ans" },
    { icon: CarFront, title: "Carrosserie", text: "toutes marques" },
    { icon: Fuel, title: "Station-service", text: "24h/24 · 7j/7" },
  ];
  return (
    <section className="trust-band" aria-label="Les engagements du garage">
      <div className="container trust-grid">
        {items.map(({ icon: Icon, title, text }) => (
          <div className="trust-item" key={title}>
            <Icon />
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  to,
  label,
}: {
  eyebrow: ReactNode;
  title: string;
  to?: "/services" | "/vehicules" | "/entreprise";
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div className="min-w-0">
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      {to && (
        <Link className="section-link" to={to}>
          {label}
          <ArrowRight />
        </Link>
      )}
    </div>
  );
}

/** The workshop's services, folded into a single dropdown as the garage asked. */
export function MechanicalList({ compact = false }: { compact?: boolean }) {
  return (
    <details className={compact ? "mech-details mech-details-compact" : "mech-details"}>
      <summary>
        <span>{compact ? "Nos prestations" : "Toutes nos prestations mécaniques"}</span>
        <span className="mech-count">{mechanicalServices.length}</span>
        <ChevronDown className="mech-chevron" />
      </summary>
      <ul>
        {mechanicalServices.map((item) => (
          <li key={item}>
            <Check />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function ServiceLink({
  id,
  children,
}: {
  id: (typeof services)[number]["id"];
  children: ReactNode;
}) {
  if (id === "vente")
    return (
      <Link to="/vehicules" className="card-link">
        {children}
      </Link>
    );
  if (id === "carrosserie")
    return (
      <Link to="/services" hash="carrosserie" className="card-link">
        {children}
      </Link>
    );
  return (
    <Link to="/contact" search={{ demande: "atelier" }} hash="contact" className="card-link">
      {children}
    </Link>
  );
}

export function ServicesPreview() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Nos services"
          title="Tout pour votre voiture."
          to="/services"
          label="Découvrir nos services"
        />
        <div className="service-grid">
          {services.map((service) => {
            const Icon = icons[service.icon];
            return (
              <article className="service-card reveal-on-scroll" key={service.id}>
                <Icon className="service-icon" />
                <h3>{service.title}</h3>
                <p>{service.short}</p>
                {service.id === "mecanique" && <MechanicalList compact />}
                <ServiceLink id={service.id}>
                  {service.cta}
                  <ArrowRight />
                </ServiceLink>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Partnership() {
  return (
    <section className="partnership">
      <div className="container editorial-grid">
        <img
          className="editorial-image reveal-on-scroll"
          src={sales}
          alt="Le showroom Suzuki du Garage de la Plaine"
          loading="lazy"
          width={700}
          height={540}
        />
        <div className="editorial-copy">
          <img
            className="partnership-logo"
            src={suzuki}
            alt="Suzuki"
            width={150}
            height={40}
            loading="lazy"
          />
          <div className="eyebrow">Partenaire officiel</div>
          <h2>
            L’esprit Suzuki.
            <br />
            La proximité en plus.
          </h2>
          <p>
            Concessionnaire Suzuki depuis plus de 20 ans, le Garage de la Plaine est votre référence
            Suzuki sur La Côte.
          </p>
          <p>
            Découvrez les véhicules neufs dans notre showroom, nos occasions toutes marques et les
            possibilités de financement ou de leasing. Une offre ou un essai sur route ? Il suffit
            de demander.
          </p>
          <Button variant="premium" asChild>
            <Link to="/suzuki">
              Découvrir notre partenariat <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function CompanyStory() {
  return (
    <section className="story">
      <div className="container editorial-grid">
        <div className="editorial-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Votre garage, tout près de chez vous
          </div>
          <h2>
            Une équipe locale.
            <br />
            Une relation de confiance.
          </h2>
          <div className="red-rule" />
          <p>
            Installé à Denges, à 5 minutes de Morges et 10 minutes de Lausanne, le Garage de la
            Plaine réunit la vente, la carrosserie et l’atelier mécanique.
          </p>
          <p>
            Entreprise formatrice, nous mettons le savoir-faire de notre équipe au service de votre
            voiture. Un interlocuteur pour chaque métier, et la même attention à votre demande.
          </p>
          <Button variant="premium" asChild>
            <Link to="/entreprise">
              Rencontrer le garage <ArrowRight />
            </Link>
          </Button>
        </div>
        <img
          className="editorial-image reveal-on-scroll"
          src={garagePhoto}
          alt="La façade et la station-service du Garage de la Plaine à Denges"
          loading="lazy"
          width={700}
          height={500}
        />
      </div>
    </section>
  );
}

export function PageIntro({
  title,
  description,
  label,
  children,
}: {
  title: string;
  description: string;
  label: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Accueil</Link>
          <ChevronRight />
          <span>{label}</span>
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </section>
  );
}

export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="detail-list">
      {items.map((item) => (
        <li key={item}>
          <Check />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
