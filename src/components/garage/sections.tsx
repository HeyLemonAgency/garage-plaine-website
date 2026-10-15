import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Fuel,
  KeyRound,
  Phone,
  ShieldCheck,
  SprayCan,
  Wrench,
  CarFront,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { garage, mechanicalServices, services, team, type Contact } from "@/lib/garage";
import { CountUp } from "./interactive";
import { HeroLights } from "./hero-lights";
import { serviceIcons } from "./service-icons";
import { OpenStatus } from "./people";
import hero from "@/assets/suzuki-lake.webp";
import hero640 from "@/assets/suzuki-lake-640.webp";
import hero960 from "@/assets/suzuki-lake-960.webp";
import hero1440 from "@/assets/suzuki-lake-1440.webp";
import suzuki from "@/assets/suzuki-logo.png";
import garagePhoto from "@/assets/garage.webp";
import garageWide from "@/assets/garage-wide.webp";
import sales from "@/assets/sales.webp";
import workshop from "@/assets/workshop.webp";
import bodywork from "@/assets/bodywork.webp";

export const photos = { workshop, bodywork, garage: garagePhoto, sales };

type Intent = {
  id: "acheter" | "atelier" | "carrosserie";
  tab: string;
  icon: typeof KeyRound;
  title: string;
  text: string;
  contact: Contact;
  phone: string;
  phoneHref: string;
};

const intents: Intent[] = [
  {
    id: "acheter",
    tab: "Acheter",
    icon: KeyRound,
    title: "Trouver votre prochaine voiture",
    text: "Suzuki neuves et occasions toutes marques, avec financement, leasing et reprise de votre véhicule.",
    contact: team.vente,
    phone: team.vente.mobile,
    phoneHref: team.vente.mobileHref,
  },
  {
    id: "atelier",
    tab: "Entretenir",
    icon: Wrench,
    title: "Entretien et réparations",
    text: "Service, pneus, géométrie, climatisation et diagnostic, pour toutes les marques.",
    contact: team.atelier,
    phone: garage.phone,
    phoneHref: garage.phoneHref,
  },
  {
    id: "carrosserie",
    tab: "Carrosserie",
    icon: SprayCan,
    title: "Réparer, repeindre, restaurer",
    text: "Nous gérons les formalités avec votre assurance, et 8 véhicules de remplacement sont à disposition.",
    contact: team.carrosserie,
    phone: garage.phone,
    phoneHref: garage.phoneHref,
  },
];

function IntentActions({ id, stockTotal }: { id: Intent["id"]; stockTotal: number | null }) {
  if (id === "acheter")
    return (
      <>
        <Button variant="premium" asChild>
          <Link to="/vehicules">
            {stockTotal ? `Voir les ${stockTotal} véhicules` : "Voir les véhicules"} <ArrowRight />
          </Link>
        </Button>
        <Button variant="appointment" asChild>
          <Link to="/rendez-vous" search={{ besoin: "vente" }}>
            Demander un essai
          </Link>
        </Button>
      </>
    );
  if (id === "atelier")
    return (
      <>
        <Button variant="premium" asChild>
          <Link to="/rendez-vous" search={{ besoin: "atelier" }}>
            Prendre rendez-vous <ArrowRight />
          </Link>
        </Button>
        <Button variant="appointment" asChild>
          <Link to="/services" hash="mecanique">
            Nos prestations
          </Link>
        </Button>
      </>
    );
  return (
    <>
      <Button variant="premium" asChild>
        <Link to="/rendez-vous" search={{ besoin: "carrosserie" }}>
          Demander un devis <ArrowRight />
        </Link>
      </Button>
      <Button variant="appointment" asChild>
        <Link to="/services" hash="carrosserie">
          La carrosserie
        </Link>
      </Button>
    </>
  );
}

/** "What brings you here?" — one tab per trade, each with its next step and its person. */
function HeroConcierge({ stockTotal }: { stockTotal: number | null }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const intent = intents[active] ?? intents[0]!;
  const initials = intent.contact.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : intents.length - 1)) % intents.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="concierge">
      <div className="concierge-head">Que pouvons-nous faire pour vous&nbsp;?</div>
      <div
        className="concierge-tabs"
        role="tablist"
        aria-label="Votre besoin"
        onKeyDown={onKey}
        style={{ "--tab": active } as CSSProperties}
      >
        <span className="concierge-indicator" aria-hidden="true" />
        {intents.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`intent-tab-${item.id}`}
            aria-selected={i === active}
            aria-controls="intent-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            <item.icon />
            {item.tab}
          </button>
        ))}
      </div>
      <div
        className="concierge-panel"
        role="tabpanel"
        id="intent-panel"
        aria-labelledby={`intent-tab-${intent.id}`}
        key={intent.id}
      >
        <h2>{intent.title}</h2>
        <p>{intent.text}</p>
        <div className="concierge-actions">
          <IntentActions id={intent.id} stockTotal={stockTotal} />
        </div>
        <a className="concierge-person" href={intent.phoneHref}>
          <span className="sales-avatar" aria-hidden="true">
            {initials}
          </span>
          <span>
            <strong>{intent.contact.name}</strong>
            <span>{intent.contact.role}</span>
          </span>
          <span className="concierge-phone">
            <Phone />
            {intent.phone}
          </span>
        </a>
      </div>
    </div>
  );
}

export function Hero({ stockTotal = null }: { stockTotal?: number | null }) {
  const image = useRef<HTMLImageElement>(null);
  return (
    <section className="hero">
      <div className="hero-media">
        <img
          ref={image}
          className="hero-image"
          src={hero}
          // On a phone the photo is cropped to about 470px wide: no need for the 1920px file.
          srcSet={`${hero640} 640w, ${hero960} 960w, ${hero1440} 1440w, ${hero} 1920w`}
          sizes="(max-width: 640px) 470px, (max-width: 1000px) 1350px, 100vw"
          alt="Suzuki Vitara dans un paysage au bord du Léman"
          width={1920}
          height={1024}
          fetchPriority="high"
        />
        <HeroLights imgRef={image} />
      </div>
      <div className="container hero-content">
        <div className="hero-copy reveal">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Garage de la Plaine · Denges
          </div>
          <h1>
            Votre garage <br />
            de confiance <br />à Denges.
          </h1>
          <div className="red-rule" />
          <p>Vente, carrosserie et entretien : un service de proximité depuis plus de 40 ans.</p>
        </div>
        <HeroConcierge stockTotal={stockTotal} />
      </div>
      <span className="hero-caption">Visuel d’illustration</span>
    </section>
  );
}

export function TrustBar({ stockTotal = null }: { stockTotal?: number | null }) {
  const items = [
    { icon: ShieldCheck, value: 40, suffix: "+", unit: "ans", text: "d’expérience" },
    { logo: suzuki, value: 20, suffix: "+", unit: "ans", text: "concessionnaire Suzuki" },
    stockTotal
      ? {
          icon: CarFront,
          value: stockTotal,
          suffix: "",
          unit: "véhicules",
          text: "en stock, en direct",
          live: true,
        }
      : { icon: CarFront, value: 8, suffix: "", unit: "véhicules", text: "de remplacement" },
    { icon: Fuel, value: 24, suffix: "h/24", unit: "", text: "7j/7 · station-service" },
  ];
  return (
    <section className="trust-band" aria-label="Le garage en chiffres">
      <div className="container trust-grid">
        {items.map(({ value, suffix, unit, text, ...rest }) => {
          const Icon = "icon" in rest ? rest.icon : null;
          const body = (
            <>
              {Icon ? (
                <Icon />
              ) : (
                <img className="trust-logo" src={suzuki} alt="Suzuki" width={46} height={36} />
              )}
              <div>
                <strong>
                  <CountUp value={value} suffix={suffix} /> {unit}
                </strong>
                <span>
                  {"live" in rest && <span className="live-dot" aria-hidden="true" />}
                  {text}
                </span>
              </div>
            </>
          );
          return "live" in rest ? (
            <Link to="/vehicules" className="trust-item trust-item-link" key={text}>
              {body}
            </Link>
          ) : (
            <div className="trust-item" key={text}>
              {body}
            </div>
          );
        })}
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
    <Link to="/rendez-vous" search={{ besoin: "atelier" }} className="card-link">
      {children}
    </Link>
  );
}

/** Plays a card's icon animation (data-play) for `ms`, then resets so it can play again. */
function play(card: HTMLElement, ms = 2200) {
  card.setAttribute("data-play", "");
  window.setTimeout(() => card.removeAttribute("data-play"), ms);
}

export function ServicesPreview() {
  const grid = useRef<HTMLDivElement>(null);
  // Touch screens have no hover: act each icon out once as its card scrolls into view.
  useEffect(() => {
    const el = grid.current;
    if (!el || !window.matchMedia("(hover: none)").matches || !("IntersectionObserver" in window))
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          play(entry.target as HTMLElement);
        }
      },
      { threshold: 0.6 },
    );
    el.querySelectorAll(".service-card").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Nos services"
          title="Tout pour votre voiture."
          to="/services"
          label="Découvrir nos services"
        />
        <div className="service-grid" ref={grid}>
          {services.map((service) => {
            const Icon = serviceIcons[service.icon];
            return (
              <article className="service-card spotlight reveal-on-scroll" key={service.id}>
                <span
                  className="service-icon"
                  onClick={(e) => play(e.currentTarget.closest(".service-card") as HTMLElement)}
                >
                  <Icon />
                </span>
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
            L’esprit Suzuki. <br />
            La proximité en plus.
          </h2>
          <p>
            Concessionnaire Suzuki depuis plus de 20 ans, le Garage de la Plaine est votre référence
            Suzuki sur La Côte.
          </p>
          <p>
            Découvrez les véhicules neufs dans notre showroom, nos occasions toutes marques et les
            possibilités de financement ou de leasing. Une offre ou un essai sur route&nbsp;? Il
            suffit de demander.
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

type Spot = {
  id: string;
  x: number;
  y: number;
  align: "start" | "center" | "end";
  dir?: "down";
  title: string;
  text: string;
  to: "/suzuki" | "/vehicules";
  cta: string;
};

// Positions on garage-wide.webp, in % of the photo.
const storySpots: Spot[] = [
  {
    id: "showroom",
    x: 12,
    y: 56,
    align: "start",
    title: "Le showroom Suzuki",
    text: "Les véhicules neufs Suzuki, à découvrir et à essayer sur place.",
    to: "/suzuki",
    cta: "Partenaire Suzuki",
  },
  {
    id: "occasions",
    x: 70,
    y: 74,
    align: "end",
    dir: "down",
    title: "Nos occasions exposées",
    text: "Une partie de notre stock vous attend devant le garage.",
    to: "/vehicules",
    cta: "Voir le stock",
  },
];

function StorySpot({ spot }: { spot: Spot }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="story-spot"
      data-open={open || undefined}
      data-align={spot.align}
      data-dir={spot.dir}
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      onPointerEnter={(e) => e.pointerType !== "touch" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType !== "touch" && setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <button
        type="button"
        className="story-spot-dot"
        aria-expanded={open}
        aria-controls={`spot-${spot.id}`}
        aria-label={spot.title}
        onClick={() => setOpen((v) => !v)}
      />
      <div className="story-tip" id={`spot-${spot.id}`} role="tooltip">
        <strong>{spot.title}</strong>
        <p>{spot.text}</p>
        <Link to={spot.to}>
          {spot.cta} <ArrowRight />
        </Link>
      </div>
    </div>
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
            Une équipe locale. <br />
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
        <figure className="story-visual">
          <span className="story-accent" aria-hidden="true" />
          <div className="story-frame">
            <div className="story-photo">
              <img
                src={garageWide}
                alt="Le showroom Suzuki du Garage de la Plaine à Denges et les véhicules d’occasion exposés devant"
                loading="lazy"
                width={1024}
                height={512}
              />
            </div>
            {storySpots.map((spot) => (
              <StorySpot spot={spot} key={spot.id} />
            ))}
          </div>
          <img
            className="story-inset"
            src={sales}
            alt="L’intérieur du showroom, avec des Suzuki Swift exposées"
            loading="lazy"
            width={1024}
            height={683}
          />
          <figcaption className="story-card">
            <span className="story-card-label">Venez nous voir</span>
            <strong>{garage.address}</strong>
            <span>{garage.locality}</span>
            <OpenStatus />
            <a href={garage.directions} target="_blank" rel="noreferrer">
              Itinéraire <ArrowUpRight />
            </a>
          </figcaption>
        </figure>
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

/** Sticky in-page navigation that highlights the section currently on screen. */
export function SectionTabs({ items }: { items: readonly (readonly [string, string])[] }) {
  const [active, setActive] = useState(items[0]?.[0] ?? "");
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    for (const [id] of items) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);
  return (
    <nav className="section-tabs" aria-label="Sur cette page">
      <div className="container section-tabs-inner">
        {items.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
