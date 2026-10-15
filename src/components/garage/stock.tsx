import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays, CarFront, Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StockCar, StockSnapshot } from "@/lib/autolina";
import { team } from "@/lib/garage";
import { useGallery, useStockView } from "@/hooks/use-stock";
import { SelectionBar, StockControls } from "./stock-controls";
import { Showroom } from "./showroom";
import { SectionHeading } from "./sections";
import { SalesContact } from "./people";

function Photo({
  src,
  alt,
  active,
  avif,
}: {
  src: string;
  alt: string;
  active: boolean;
  avif: boolean;
}) {
  return (
    <picture className={active ? "is-active" : ""}>
      {/* Gallery photos reuse the JPEG the probe already downloaded. */}
      {avif && <source type="image/avif" srcSet={src.replace(/\.jpg\?/, ".avif?")} />}
      <img
        src={src}
        alt={active ? alt : ""}
        width={534}
        height={401}
        loading="lazy"
        draggable={false}
        referrerPolicy="no-referrer"
      />
    </picture>
  );
}

export function VehicleCard({
  car,
  saved,
  onToggleSaved,
}: {
  car: StockCar;
  saved: boolean;
  onToggleSaved: (path: string) => void;
}) {
  const navigate = useNavigate();
  const { photos, probe, index, setIndex, advance } = useGallery(car.image);
  const [failed, setFailed] = useState(!car.image);
  const [pop, setPop] = useState(false);
  const first = useRef<HTMLDivElement>(null);
  const name = `${car.make} ${car.model}`;
  const meta = [car.isNew ? "Neuf" : car.year, car.mileage].filter(Boolean).join(" · ");
  const specs = [car.power, car.gearbox, car.fuel, car.color].filter(Boolean) as string[];

  // A first photo that failed before hydration never fires onError, so check it on mount.
  useEffect(() => {
    const img = first.current?.querySelector("img");
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const open = () => navigate({ to: "/vehicules", search: { annonce: car.path } });
  const touch = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  return (
    <article
      className="vehicle-card spotlight"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--rx",
          `${((e.clientY - r.top) / r.height - 0.5) * -5}deg`,
        );
        e.currentTarget.style.setProperty(
          "--ry",
          `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`,
        );
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty("--rx", "0deg");
        e.currentTarget.style.setProperty("--ry", "0deg");
      }}
    >
      <div
        ref={first}
        className="vehicle-image"
        onPointerEnter={(e) => e.pointerType === "mouse" && probe()}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || photos.length < 2) return;
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.floor(((e.clientX - r.left) / r.width) * photos.length);
          setIndex(Math.min(photos.length - 1, Math.max(0, i)));
        }}
        onPointerLeave={(e) => e.pointerType === "mouse" && setIndex(0)}
        onClick={() => {
          // Touch: the photo flips through the gallery; the text below opens the listing.
          if (touch()) advance();
          else open();
        }}
      >
        {failed ? (
          <div className="vehicle-photo-missing">
            <CarFront />
            <span>Photo à venir</span>
          </div>
        ) : (
          <div className="vehicle-photos" onError={() => index === 0 && setFailed(true)}>
            {photos.map((src, i) => (
              <Photo key={src} src={src} alt={name} active={i === index} avif={i === 0} />
            ))}
          </div>
        )}
        {photos.length > 1 && (
          <div className="photo-segments" aria-hidden="true">
            {photos.map((src, i) => (
              <span key={src} className={i === index ? "is-active" : ""} />
            ))}
          </div>
        )}
        {car.isNew && <span className="vehicle-badge">Neuf</span>}
        <button
          type="button"
          className={`fav-button ${saved ? "is-saved" : ""} ${pop ? "is-pop" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Retirer ${name} de ma sélection` : `Ajouter ${name} à ma sélection`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSaved(car.path);
            if (!saved) {
              setPop(true);
              window.setTimeout(() => setPop(false), 600);
            }
          }}
        >
          <Heart />
        </button>
      </div>
      <div className="vehicle-info">
        <span className="vehicle-make">{car.make}</span>
        <h3>
          <Link
            to="/vehicules"
            search={{ annonce: car.path }}
            className="vehicle-link"
            draggable={false}
          >
            {car.model}
          </Link>
        </h3>
        <div className="vehicle-meta">{meta}</div>
        {specs.length > 0 && (
          <ul className="vehicle-specs" aria-label="Caractéristiques">
            {specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        )}
        <div className="vehicle-bottom">
          <span className="vehicle-price">{car.price ?? "Prix sur demande"}</span>
          <span className="vehicle-open" aria-hidden="true">
            Voir <ArrowRight />
          </span>
          {/* With a mouse these take the place of "Voir" on hover; on touch they stay visible. */}
          <div className="vehicle-actions">
            <Link
              to="/rendez-vous"
              search={{ besoin: "vente", annonce: car.path }}
              className="vehicle-action vehicle-action-primary"
              aria-label={`Essai : ${name}`}
            >
              <CalendarDays /> Essai
            </Link>
            <a
              href={team.vente.mobileHref}
              className="vehicle-action vehicle-action-icon"
              aria-label={`Appeler ${team.vente.name} au ${team.vente.mobile}`}
              title={`${team.vente.name} · ${team.vente.mobile}`}
            >
              <Phone />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Horizontally scrolling row of listings: swipe, drag with the mouse, or use the arrows. */
export function StockCarousel({
  cars,
  total,
  showFilters = true,
  label = "Annonces",
}: {
  cars: StockCar[];
  total: number | null;
  showFilters?: boolean;
  label?: string;
}) {
  const view = useStockView(cars);
  const { filter: active, sort, shown, saved, toggle, savedHere } = view;
  const [edges, setEdges] = useState({ start: true, end: false });
  const [progress, setProgress] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  function measure() {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft >= max - 8 });
    setProgress(max > 0 ? el.scrollLeft / max : 1);
  }
  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    measure();
  }, [active, sort]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function step(direction: 1 | -1) {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>(".vehicle-card");
    if (!el) return;
    const width = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    const perStep = Math.max(1, Math.floor(el.clientWidth / width));
    el.scrollBy({ left: direction * width * perStep, behavior: "smooth" });
  }

  return (
    <div className="stock-carousel">
      <StockControls view={view} showFilters={showFilters} sortable={cars.length > 2}>
        <div className="carousel-arrows">
          <button
            type="button"
            aria-label="Annonces précédentes"
            disabled={edges.start}
            onClick={() => step(-1)}
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            aria-label="Annonces suivantes"
            disabled={edges.end}
            onClick={() => step(1)}
          >
            <ArrowRight />
          </button>
        </div>
      </StockControls>
      <div
        ref={track}
        className="stock-track"
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={measure}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0 || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = track.current;
          if (!d || !el) return;
          const dx = e.clientX - d.x;
          if (!d.moved && Math.abs(dx) < 6) return;
          d.moved = true;
          el.classList.add("is-dragging");
          el.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          suppressClick.current = Boolean(drag.current?.moved);
          drag.current = null;
          track.current?.classList.remove("is-dragging");
        }}
        onPointerLeave={() => {
          drag.current = null;
          track.current?.classList.remove("is-dragging");
        }}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        {shown.map((car, i) => (
          <div
            className="stock-slide"
            key={`${active}-${sort}-${car.id}`}
            style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}
          >
            <VehicleCard car={car} saved={saved.includes(car.path)} onToggleSaved={toggle} />
          </div>
        ))}
        <div className="stock-slide" key={`${active}-more`}>
          <Link to="/vehicules" className="vehicle-more spotlight">
            <span className="vehicle-more-count">{total ?? "Tout"}</span>
            <span>{total ? "véhicules en stock" : "le stock"}</span>
            <span className="vehicle-open">
              Tout voir <ArrowRight />
            </span>
          </Link>
        </div>
      </div>
      <div className="carousel-progress" aria-hidden="true">
        <span style={{ width: `${Math.max(12, progress * 100)}%` }} />
      </div>
      <SelectionBar cars={savedHere} />
    </div>
  );
}

export function StockPreview({ stock }: { stock: StockSnapshot }) {
  const { cars, total } = stock;
  let content: ReactNode;
  if (cars.length > 0) content = <Showroom cars={cars} total={total} />;
  else
    content = (
      <div className="stock-placeholder">
        <div>
          <h3>Notre stock complet est en ligne.</h3>
          <p>Véhicules neufs Suzuki et occasions toutes marques, mis à jour par notre équipe.</p>
        </div>
        <Button variant="premium" asChild>
          <Link to="/vehicules">
            Voir le stock <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  return (
    <section className="section stock-section">
      <div className="container">
        <SectionHeading
          eyebrow={
            <>
              <span className="live-dot" aria-hidden="true" />
              Nos dernières annonces
            </>
          }
          title="Votre prochaine voiture est ici."
          to="/vehicules"
          label={total ? `Voir les ${total} véhicules` : "Voir tous les véhicules"}
        />
        {content}
        <div className="stock-footer">
          <p className="stock-note">
            {cars.length > 0
              ? `Les ${cars.length} annonces les plus récentes, en direct depuis notre stock Autolina. Prix et disponibilités sous réserve.`
              : "Le stock est publié sur Autolina, la plateforme de notre service vente."}
          </p>
          <SalesContact compact />
        </div>
      </div>
    </section>
  );
}
