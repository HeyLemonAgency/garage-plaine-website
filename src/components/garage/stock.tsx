import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StockCar, StockSnapshot } from "@/lib/autolina";
import { SectionHeading } from "./sections";
import { SalesContact } from "./people";

const FILTERS: { id: string; label: string; test: (car: StockCar) => boolean }[] = [
  { id: "all", label: "Toutes", test: () => true },
  { id: "suzuki", label: "Suzuki", test: (c) => c.make === "Suzuki" },
  { id: "new", label: "Neuves", test: (c) => c.isNew },
  { id: "hybrid", label: "Hybrides", test: (c) => /hybride|électri|electri/i.test(c.fuel ?? "") },
  { id: "auto", label: "Automatiques", test: (c) => /automatique/i.test(c.gearbox ?? "") },
  {
    id: "budget",
    label: "Moins de CHF 20’000",
    test: (c) => c.priceValue !== null && c.priceValue < 20000,
  },
];

function CarPhoto({ car }: { car: StockCar }) {
  const [failed, setFailed] = useState(!car.image);
  const ref = useRef<HTMLImageElement>(null);
  // A photo that failed before hydration never fires onError, so check it once mounted.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed || !car.image)
    return (
      <div className="vehicle-photo-missing">
        <CarFront />
        <span>Photo à venir</span>
      </div>
    );
  return (
    <picture>
      <source type="image/avif" srcSet={car.image.replace(/\.jpg\?/, ".avif?")} />
      <img
        ref={ref}
        src={car.image}
        alt={`${car.make} ${car.model}`}
        width={534}
        height={401}
        loading="lazy"
        draggable={false}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

export function VehicleCard({ car }: { car: StockCar }) {
  const meta = [car.isNew ? "Neuf" : car.year, car.mileage, car.fuel].filter(Boolean).join(" · ");
  return (
    <Link
      to="/vehicules"
      search={{ annonce: car.path }}
      className="vehicle-card spotlight"
      draggable={false}
      aria-label={`${car.make} ${car.model}${car.price ? `, ${car.price}` : ""}`}
    >
      <div className="vehicle-image">
        <CarPhoto car={car} />
        {car.isNew && <span className="vehicle-badge">Neuf</span>}
        {car.gearbox && <span className="vehicle-chip">{car.gearbox}</span>}
      </div>
      <div className="vehicle-info">
        <span className="vehicle-make">{car.make}</span>
        <h3>{car.model}</h3>
        <div className="vehicle-meta">{meta}</div>
        <div className="vehicle-bottom">
          <span className="vehicle-price">{car.price ?? "Prix sur demande"}</span>
          <span className="vehicle-open">
            Voir <ArrowRight />
          </span>
        </div>
      </div>
    </Link>
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
  const [filter, setFilter] = useState("all");
  const [edges, setEdges] = useState({ start: true, end: false });
  const [progress, setProgress] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const filters = FILTERS.map((f) => ({ ...f, count: cars.filter(f.test).length })).filter(
    (f) => f.id === "all" || (f.count > 0 && f.count < cars.length),
  );
  const shown = cars.filter(FILTERS.find((f) => f.id === filter)?.test ?? (() => true));

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
  }, [filter]);
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
      <div className="stock-controls">
        {showFilters && filters.length > 1 ? (
          <div className="chip-row filter-row" role="group" aria-label="Filtrer les annonces">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-chip ${filter === f.id ? "is-active" : ""}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="filter-count">{f.count}</span>
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
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
      </div>
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
            key={`${filter}-${car.id}`}
            style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}
          >
            <VehicleCard car={car} />
          </div>
        ))}
        <div className="stock-slide" key={`${filter}-more`}>
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
    </div>
  );
}

export function StockPreview({ stock }: { stock: StockSnapshot }) {
  const { cars, total } = stock;
  let content: ReactNode;
  if (cars.length > 0)
    content = <StockCarousel cars={cars} total={total} label="Nos dernières annonces" />;
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
