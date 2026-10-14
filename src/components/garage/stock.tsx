import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  Heart,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listingPhoto, type StockCar, type StockSnapshot } from "@/lib/autolina";
import { team } from "@/lib/garage";
import { useSelection } from "@/hooks/use-selection";
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

const SORTS: { id: string; label: string; compare?: (a: StockCar, b: StockCar) => number }[] = [
  { id: "recent", label: "Plus récentes" },
  {
    id: "price-asc",
    label: "Prix croissant",
    compare: (a, b) => (a.priceValue ?? Infinity) - (b.priceValue ?? Infinity),
  },
  {
    id: "price-desc",
    label: "Prix décroissant",
    compare: (a, b) => (b.priceValue ?? -Infinity) - (a.priceValue ?? -Infinity),
  },
  { id: "km", label: "Kilométrage", compare: (a, b) => km(a) - km(b) },
];
const km = (car: StockCar) => (car.mileage ? Number(car.mileage.replace(/\D/g, "")) : Infinity);
const MAX_PHOTOS = 6;

/**
 * A listing's photos: the first comes with the stock page; the next ones are fetched the
 * first time the visitor shows interest, and kept only if they load.
 */
function useGallery(image: string | null) {
  const [photos, setPhotos] = useState<string[]>(image ? [image] : []);
  const probed = useRef(false);
  const probe = useCallback(() => {
    if (probed.current || !image) return;
    probed.current = true;
    let n = 2;
    const next = () => {
      if (n > MAX_PHOTOS) return;
      const url = listingPhoto(image, n++);
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.onload = () => {
        setPhotos((prev) => [...prev, url]);
        next();
      };
      img.src = url;
    };
    next();
  }, [image]);
  return { photos, probe };
}

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
  const { photos, probe } = useGallery(car.image);
  const [index, setIndex] = useState(0);
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
        onPointerLeave={() => setIndex(0)}
        onClick={() => {
          // Touch: the photo flips through the gallery; the text below opens the listing.
          if (touch()) {
            probe();
            setIndex((i) => (photos.length > 1 ? (i + 1) % photos.length : 0));
          } else open();
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
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [edges, setEdges] = useState({ start: true, end: false });
  const [progress, setProgress] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const { paths: saved, toggle } = useSelection();

  const savedHere = cars.filter((c) => saved.includes(c.path));
  const filters = [
    ...FILTERS.map((f) => ({ ...f, count: cars.filter(f.test).length })).filter(
      (f) => f.id === "all" || (f.count > 0 && f.count < cars.length),
    ),
    ...(savedHere.length > 0
      ? [{ id: "saved", label: "Ma sélection", test: () => true, count: savedHere.length }]
      : []),
  ];
  const active = filter === "saved" && savedHere.length === 0 ? "all" : filter;
  const filtered =
    active === "saved"
      ? savedHere
      : cars.filter(FILTERS.find((f) => f.id === active)?.test ?? (() => true));
  const compare = SORTS.find((s) => s.id === sort)?.compare;
  const shown = compare ? [...filtered].sort(compare) : filtered;

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
      <div className="stock-controls">
        {showFilters && filters.length > 1 ? (
          <div className="chip-row filter-row" role="group" aria-label="Filtrer les annonces">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-chip ${active === f.id ? "is-active" : ""} ${f.id === "saved" ? "filter-chip-saved" : ""}`}
                aria-pressed={active === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.id === "saved" && <Heart />}
                {f.label}
                <span className="filter-count">{f.count}</span>
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="carousel-tools">
          {cars.length > 2 && (
            <label className="sort-select">
              <span className="sr-only">Trier les annonces</span>
              <ArrowDownUp aria-hidden="true" />
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
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
      {savedHere.length > 0 && (
        <div className="selection-bar" role="status">
          <span>
            <Heart />
            {savedHere.length === 1
              ? "1 véhicule dans votre sélection"
              : `${savedHere.length} véhicules dans votre sélection`}
          </span>
          <Link
            to="/rendez-vous"
            search={{ besoin: "vente", selection: savedHere.map((c) => c.path).join(",") }}
          >
            {savedHere.length === 1 ? "Demander un essai" : "Demander un essai pour ces véhicules"}{" "}
            <ArrowRight />
          </Link>
        </div>
      )}
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
