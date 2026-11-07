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
import { garage, services, suzukiRange, team, type Contact } from "@/lib/garage";
import { CountUp } from "./interactive";
import { HeroLights } from "./hero-lights";
import { serviceIcons } from "./service-icons";
import { OpenStatus, Portrait, WhatsAppIcon, whatsappHref } from "./people";
import suzukiLake from "@/assets/suzuki-lake.webp";
import heroVitara from "@/assets/hero-vitara.webp";
import hero640 from "@/assets/hero-vitara-640.webp";
import hero960 from "@/assets/hero-vitara-960.webp";
import hero1440 from "@/assets/hero-vitara-1440.webp";
import suzuki from "@/assets/suzuki-logo.png";
import garagePhoto from "@/assets/garage.webp";
import garageStory from "@/assets/garage-story.webp";
import showroomEntree from "@/assets/showroom-entree.webp";
import showroomSwift from "@/assets/showroom-swift.webp";
import showroomAccueil from "@/assets/showroom-accueil.webp";
import suzukiRoad from "@/assets/suzuki-road.webp";
import suzukiAlps from "@/assets/suzuki-alps.webp";
import jubinPump from "@/assets/jubin-pump.webp";
import workshop from "@/assets/workshop.webp";
import bodywork from "@/assets/bodywork.webp";
import fuel from "@/assets/fuel.webp";
import workshopTour from "@/assets/workshop-tour.webp";
import fuelHd from "@/assets/fuel-hd.webp";
import garageHd from "@/assets/garage-hd.webp";
import bodyworkHd from "@/assets/bodywork-hd.webp";
import suzukiFront from "@/assets/suzuki-front-lake.webp";
import suzukiRear from "@/assets/suzuki-rear-lake.webp";
import workshopIllustration from "@/assets/workshop-illustration.webp";

/** The garage's own photos. */
export const photos = {
  workshop,
  workshopTour,
  bodywork,
  garage: garagePhoto,
  /** The showroom, three views: one per place it is shown (never twice on the site). */
  showroom: { entree: showroomEntree, swift: showroomSwift, accueil: showroomAccueil },
  fuel,
  /** Wide, high-definition versions (light and sky retouched, nothing added). */
  fuelHd,
  bodyworkHd,
  garageHd,
};

/**
 * Mood images that do not show the garage (generated images), only where it has no photo of
 * its own and never to present a car for sale.
 * Sources in src/assets/CREDITS.md.
 */
export const illustrations = {
  workshop: workshopIllustration,
  suzukiLake,
  suzukiRoad,
  suzukiAlps,
  jubinPump,
  suzukiFront,
  suzukiRear,
};

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
          <Link to="/rendez-vous" search={{ besoin: "vente", precision: "Essai sur route" }}>
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
          <Link to="/atelier">Nos prestations</Link>
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
        <Link to="/carrosserie">La carrosserie</Link>
      </Button>
    </>
  );
}

/** "What brings you here?" — one tab per trade, each with its next step and its person. */
function HeroConcierge({ stockTotal }: { stockTotal: number | null }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const intent = intents[active] ?? intents[0]!;

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
        <div className="concierge-person">
          <Portrait contact={intent.contact} className="sales-avatar" />
          <span>
            <strong>{intent.contact.name}</strong>
            <span>{intent.contact.role}</span>
          </span>
          <span className="concierge-reach">
            <a className="concierge-phone" href={intent.phoneHref}>
              <Phone />
              {intent.phone}
            </a>
            <a
              className="concierge-wa"
              href={whatsappHref(intent.contact)}
              target="_blank"
              rel="noreferrer"
              aria-label={
                intent.contact.whatsapp
                  ? `WhatsApp, ${intent.contact.name} (nouvel onglet)`
                  : `WhatsApp du garage, pour ${intent.contact.forWhom ?? intent.contact.role.toLowerCase()} (nouvel onglet)`
              }
            >
              <WhatsAppIcon />
            </a>
          </span>
        </div>
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
          src={heroVitara}
          // On a phone the photo is cropped to about 470px wide: no need for the full-size file.
          srcSet={`${hero640} 640w, ${hero960} 960w, ${hero1440} 1440w, ${heroVitara} 1820w`}
          sizes="(max-width: 640px) 470px, (max-width: 1000px) 1350px, 100vw"
          alt="Une Suzuki Vitara sur une route au bord d’un lac, au pied des Alpes enneigées"
          width={1820}
          height={864}
          fetchPriority="high"
        />
        <HeroLights imgRef={image} />
      </div>
      <div className="container hero-content">
        <div className="hero-copy reveal">
          <div className="eyebrow hero-brand">
            <img className="hero-suzuki" src={suzuki} alt="Suzuki" width={34} height={26} />
            Concessionnaire officiel Suzuki · Denges
          </div>
          <h1>
            Votre concessionnaire <br />
            Suzuki à Denges.
          </h1>
          <div className="red-rule" />
          <p>
            Suzuki neuves, occasions toutes marques, atelier et carrosserie : un service de
            proximité depuis plus de 40 ans.
          </p>
        </div>
        <HeroConcierge stockTotal={stockTotal} />
      </div>
    </section>
  );
}

export function TrustBar({ stockTotal = null }: { stockTotal?: number | null }) {
  const items = [
    { logo: suzuki, value: 20, suffix: "+", unit: "ans", text: "concessionnaire Suzuki" },
    { icon: ShieldCheck, value: 40, suffix: "+", unit: "ans", text: "d’expérience" },
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
                  {/* Each "·" part stays whole: "station-service" never breaks at its hyphen. */}
                  {text.split(" · ").map((part, i) => (
                    <span className="nowrap" key={part}>
                      {i > 0 && " · "}
                      {part}
                    </span>
                  ))}
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
  to?: "/vehicules" | "/entreprise" | "/carrosserie" | "/atelier";
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

/** Each card opens its trade's own page. */
const servicePages = {
  vente: "/vehicules",
  carrosserie: "/carrosserie",
  mecanique: "/atelier",
} as const;
function ServiceLink({
  id,
  children,
}: {
  id: (typeof services)[number]["id"];
  children: ReactNode;
}) {
  return (
    <Link to={servicePages[id]} className="card-link">
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
        <SectionHeading eyebrow="Nos services" title="Tout pour votre voiture." />
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
          src={showroomAccueil}
          alt="Le showroom Suzuki du garage : l’accueil sous la mezzanine et deux Suzuki Swift exposées"
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
          <div className="eyebrow">Concessionnaire officiel Suzuki</div>
          <h2>
            Votre concessionnaire Suzuki <br />
            depuis plus de 20 ans.
          </h2>
          <p>
            Entre Morges et Lausanne, le Garage Carrosserie de la Plaine vous présente toute la
            gamme Suzuki neuve dans son showroom de Denges : essais sur route, offre détaillée,
            financement, leasing et reprise de votre voiture.
          </p>
          <p>
            Et après l’achat, notre atelier spécialiste Suzuki s’occupe de l’entretien et des
            réparations.
          </p>
          <Button variant="premium" asChild>
            <Link to="/suzuki">
              Découvrir la gamme Suzuki <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
      <div className="container">
        <ul className="sz-strip" aria-label="La gamme Suzuki">
          {suzukiRange.map((m) => (
            <li key={m.id}>
              <Link to="/offre" search={{ modele: m.id }} className="sz-strip-card">
                <span className="sz-strip-kind">{m.kind}</span>
                <strong>Suzuki {m.name}</strong>
                <span className="sz-strip-cta">
                  Demander une offre <ArrowRight aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
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

// Positions on garage-story.webp, in % of the photo.
const storySpots: Spot[] = [
  {
    id: "showroom",
    x: 22,
    y: 55,
    align: "start",
    title: "Le showroom Suzuki",
    text: "Les véhicules neufs Suzuki, à découvrir et à essayer sur place.",
    to: "/suzuki",
    cta: "Partenaire Suzuki",
  },
  {
    id: "occasions",
    x: 57,
    y: 78,
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
  const hovered = useRef(false);
  return (
    <div
      className="story-spot"
      data-open={open || undefined}
      data-align={spot.align}
      data-dir={spot.dir}
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      onPointerEnter={(e) => {
        if (e.pointerType === "touch") return;
        hovered.current = true;
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "touch") return;
        hovered.current = false;
        setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <button
        type="button"
        className="story-spot-dot"
        aria-expanded={open}
        aria-controls={`spot-${spot.id}`}
        aria-label={spot.title}
        onClick={() => setOpen((v) => (hovered.current ? true : !v))}
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
            Une équipe à 5 minutes <br />
            de Morges.
          </h2>
          <div className="red-rule" />
          <p>
            Installé à Denges, entre Morges et Lausanne, le Garage Carrosserie de la Plaine réunit
            la vente, la carrosserie et l’atelier mécanique.
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
                src={garageStory}
                alt="Le showroom Suzuki du Garage Carrosserie de la Plaine à Denges et les véhicules d’occasion exposés devant"
                loading="lazy"
                width={1334}
                height={667}
              />
            </div>
            {storySpots.map((spot) => (
              <StorySpot spot={spot} key={spot.id} />
            ))}
          </div>
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

/** A page's header photo: one of the garage's own photos, or a mood image (`illustrations`). */
export type IntroImage = {
  src: string;
  alt: string;
  /** CSS object-position, to keep the subject clear of the text. */
  position?: string;
  /** Width / height of the photo: from tablets up, the header takes this shape and shows it whole. */
  ratio?: number;
};

export function PageIntro({
  title,
  description,
  label,
  image,
  actions,
  compact = false,
  children,
}: {
  title: string;
  description: string;
  label: string;
  image?: IntroImage;
  /** Buttons under the text (image headers only). */
  actions?: ReactNode;
  /** A lower image header, for the form pages: the form stays close to the top. */
  compact?: boolean;
  children?: ReactNode;
}) {
  const crumbs = (
    <div className="breadcrumb">
      <Link to="/">Accueil</Link>
      <ChevronRight />
      <span>{label}</span>
    </div>
  );
  if (!image)
    return (
      <section className="page-intro">
        <div className="container">
          {crumbs}
          <h1>{title}</h1>
          <p>{description}</p>
          {children}
        </div>
      </section>
    );
  return (
    <section
      className={`page-hero${compact ? " page-hero--compact" : ""}${image.ratio ? " page-hero--fit" : ""}`}
      style={image.ratio ? ({ "--hero-ratio": image.ratio } as CSSProperties) : undefined}
    >
      <img
        className="page-hero-img"
        src={image.src}
        alt={image.alt}
        style={image.position ? { objectPosition: image.position } : undefined}
        fetchPriority="high"
        decoding="async"
      />
      <div className="container page-hero-inner">
        {crumbs}
        <h1>{title}</h1>
        <div className="red-rule" aria-hidden="true" />
        <p>{description}</p>
        {actions && <div className="page-hero-actions">{actions}</div>}
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
