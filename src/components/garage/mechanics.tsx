import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Crosshair,
  Disc3,
  GraduationCap,
  Lightbulb,
  Link2,
  Snowflake,
  Sun,
  Truck,
  Wrench,
  Zap,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mechanicalCards, team, workshopFacts, type MechanicalIcon } from "@/lib/garage";
import { WorkshopTour } from "./workshop-tour";
import { ContactActions, Portrait } from "./people";

const icons: Record<MechanicalIcon, LucideIcon> = {
  wrench: Wrench,
  gauge: Gauge,
  tyre: Disc3,
  geometry: Crosshair,
  snow: Snowflake,
  hitch: Link2,
  trailer: Truck,
  spark: Zap,
  lights: Sun,
};

/**
 * Atelier mécanique on the services page, built like the body shop section on a light band:
 * key figures, the workshop tour over the real photo, one card per service and the contact.
 */
export function MechanicsSection() {
  const grid = useRef<HTMLUListElement>(null);
  const contact = team.atelier;

  // As in the body shop: every indicator lights up once when the grid comes into view.
  useEffect(() => {
    const el = grid.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        el.classList.add("is-checking");
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="mecanique" className="service-detail mechanics">
      <div className="container">
        <div className="mechanics-top">
          <div className="mechanics-copy">
            <div className="eyebrow">03 / Atelier mécanique</div>
            <h2>Un atelier multimarque à votre service.</h2>
            <p>
              Équipé des derniers appareils de diagnostic, notre atelier entretient et répare les
              véhicules de toutes marques, notre marque de référence étant Suzuki.
            </p>
          </div>
          <dl className="bodywork-figures mechanics-figures">
            {workshopFacts.figures.map((f) => (
              <div key={f.label}>
                <dt>{f.value}</dt>
                <dd>{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <WorkshopTour />

        <ul className="mech-grid" ref={grid} aria-label="Prestations de l’atelier">
          {mechanicalCards.map((card, i) => {
            const Icon = icons[card.icon];
            return (
              <li key={card.icon} className="mech-card" style={{ "--i": i } as CSSProperties}>
                <span className="mech-card-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="mech-card-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <strong>{card.title}</strong>
                <span>{card.text}</span>
              </li>
            );
          })}
          <li className="mech-card mech-card-contact">
            <Portrait contact={contact} className="telltale-avatar" />
            <span className="telltale-role">Votre interlocuteur</span>
            <strong>{contact.name}</strong>
            <span className="mech-card-title">Brevet fédéral</span>
            <ContactActions contact={contact} />
          </li>
        </ul>

        <div className="bodywork-foot mechanics-foot">
          <div className="bodywork-notes mechanics-notes">
            <p>
              <GraduationCap aria-hidden="true" />
              {workshopFacts.training}
            </p>
            <p>
              <Lightbulb aria-hidden="true" />
              {workshopFacts.advice}
            </p>
          </div>
          <div className="detail-actions">
            <Button asChild variant="premium">
              <Link to="/rendez-vous" search={{ besoin: "atelier" }}>
                Prendre rendez-vous <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
