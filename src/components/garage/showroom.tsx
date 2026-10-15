import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarDays,
  CarFront,
  Cog,
  Fuel,
  Gauge,
  Heart,
  Pause,
  Phone,
  Play,
  Zap,
} from "lucide-react";
import type { StockCar } from "@/lib/autolina";
import { team } from "@/lib/garage";
import { useGallery, useStockView } from "@/hooks/use-stock";
import { SelectionBar, StockControls } from "./stock-controls";

// The latest listings on a lit stage: the car in focus stands large in the middle with its
// neighbours turned away on either side (drag, swipe, arrow keys, trackpad or the strip of
// thumbnails below), and its details, price and contacts beside it. The stage advances on
// its own until the visitor takes over, and pauses while it is hovered or out of view.

const AUTOPLAY_MS = 6500;
/** Horizontal distance between two neighbouring slides, as a share of a slide's width. */
const SPACING = 0.62;

type Tone = { glow: string; swatch: string };
const TONES: [RegExp, Tone][] = [
  [/blanc|white|weiss|perle|nacr/i, { glow: "oklch(0.93 0.015 240)", swatch: "#f3f4f6" }],
  [/noir|black|schwarz/i, { glow: "oklch(0.6 0.04 255)", swatch: "#17191d" }],
  [/gris|argent|silver|grau|anthra|titan/i, { glow: "oklch(0.8 0.02 250)", swatch: "#9aa1ab" }],
  [/bleu|blue|blau/i, { glow: "oklch(0.62 0.17 255)", swatch: "#2b4f9e" }],
  [/rouge|red|rot|bordeaux/i, { glow: "oklch(0.62 0.2 25)", swatch: "#b3202a" }],
  [/vert|green|grün|kaki/i, { glow: "oklch(0.7 0.14 150)", swatch: "#2f6b45" }],
  [/jaune|yellow|gelb|gold/i, { glow: "oklch(0.86 0.15 90)", swatch: "#e2b43a" }],
  [/orange/i, { glow: "oklch(0.75 0.16 55)", swatch: "#e0752d" }],
  [/brun|marron|beige|bronze|brown|braun/i, { glow: "oklch(0.72 0.08 60)", swatch: "#8a6a4a" }],
];
const DEFAULT_GLOW = "oklch(0.72 0.08 240)";
const toneOf = (color: string | null) =>
  (color && TONES.find(([test]) => test.test(color))?.[1]) || null;

const thousands = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "’");
const pad = (n: number) => String(n).padStart(2, "0");
const thumbnail = (image: string) => image.replace("w=534&h=401", "w=224&h=168");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rolls a number from its previous value to the new one, like an odometer. */
function useTween(target: number | null, ms = 700) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    if (target === null || from === null || from === target || reducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const v = from + (target - from) * (1 - Math.pow(1 - p, 3));
      current.current = v;
      setValue(v);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return value;
}

/** Position of slide `i` relative to the active one; wraps around for longer rows. */
function offsetOf(i: number, active: number, n: number, wrap: boolean) {
  let d = i - active;
  if (wrap) {
    if (d > n / 2) d -= n;
    else if (d < -n / 2) d += n;
  }
  return d;
}

/** 3D placement for a slide `p` places away from the centre (fractional while dragging). */
function placement(p: number): CSSProperties {
  const a = Math.abs(p);
  const x = Math.sign(p) * (a <= 1 ? a * SPACING : SPACING + (a - 1) * 0.32) * 100;
  const turn = -Math.max(-1, Math.min(1, p)) * 40;
  return {
    transform: `translate3d(${x}%, 0, ${-Math.min(a, 3) * 160}px) rotateY(${turn}deg) scale(${1 - Math.min(a, 2) * 0.08})`,
    opacity: a > 2.4 ? 0 : a > 1.4 ? 2.4 - a : 1,
    zIndex: 50 - Math.round(a * 10),
    ["--shade" as string]: (Math.min(a, 1.5) * 0.4).toFixed(3),
  };
}

function Slide({
  car,
  p,
  active,
  label,
  onPick,
}: {
  car: StockCar;
  p: number;
  active: boolean;
  label: string;
  onPick: () => void;
}) {
  const navigate = useNavigate();
  const { photos, probe, index: photo, setIndex: setPhoto, advance } = useGallery(car.image);
  const [failed, setFailed] = useState(!car.image);
  useEffect(() => {
    if (!active) setPhoto(0);
  }, [active, setPhoto]);

  return (
    <div
      className={`sr-slide ${active ? "is-active" : ""}`}
      style={placement(p)}
      {...(active
        ? { role: "group", "aria-roledescription": "diapositive", "aria-label": label }
        : { "aria-hidden": true })}
      onPointerEnter={(e) => active && e.pointerType === "mouse" && probe()}
      onPointerMove={(e) => {
        if (!active || e.pointerType !== "mouse" || photos.length < 2) return;
        const r = e.currentTarget.getBoundingClientRect();
        const i = Math.floor(((e.clientX - r.left) / r.width) * photos.length);
        setPhoto(Math.min(photos.length - 1, Math.max(0, i)));
      }}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPhoto(0)}
      onClick={() => {
        if (!active) return onPick();
        // Touch: the photo flips through the gallery; the buttons beside open the listing.
        if (window.matchMedia("(hover: none)").matches) advance();
        else navigate({ to: "/vehicules", search: { annonce: car.path } });
      }}
    >
      <div className="sr-photo">
        {failed ? (
          <div className="vehicle-photo-missing">
            <CarFront />
            <span>Photo à venir</span>
          </div>
        ) : (
          photos.map((src, i) => (
            <picture key={src} className={i === photo ? "is-active" : ""}>
              {/* The 2x photo only for the car in focus; the dimmed side cars get the 1x one. */}
              {i === 0 && (
                <source
                  type="image/avif"
                  srcSet={`${src.replace(/\.jpg\?/, ".avif?")} 534w${active ? `, ${src.replace(/\.jpg\?/, ".avif?")}&dpr=2 1068w` : ""}`}
                  sizes="(max-width: 600px) 76vw, (max-width: 1000px) 58vw, 440px"
                />
              )}
              <img
                src={src}
                {...(i === 0
                  ? {
                      srcSet: `${src} 534w${active ? `, ${src}&dpr=2 1068w` : ""}`,
                      sizes: "(max-width: 600px) 76vw, (max-width: 1000px) 58vw, 440px",
                    }
                  : {})}
                alt={active && i === photo ? `${car.make} ${car.model}` : ""}
                width={534}
                height={401}
                draggable={false}
                referrerPolicy="no-referrer"
                onError={() => i === 0 && setFailed(true)}
              />
            </picture>
          ))
        )}
        {active && photos.length > 1 && (
          <div className="photo-segments" aria-hidden="true">
            {photos.map((src, i) => (
              <span key={src} className={i === photo ? "is-active" : ""} />
            ))}
          </div>
        )}
        {car.isNew && <span className="vehicle-badge">Neuf</span>}
      </div>
    </div>
  );
}

export function Showroom({ cars, total }: { cars: StockCar[]; total: number | null }) {
  const view = useStockView(cars);
  const { shown, saved, toggle, savedHere, filter, sort } = view;
  const n = shown.length;
  const wrap = n >= 6;
  const [index, setIndex] = useState(0);
  const [shift, setShift] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);
  const [focusHold, setFocusHold] = useState(false);
  const [inView, setInView] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [pop, setPop] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const manual = useRef(false);
  const suppressClick = useRef(false);
  const drag = useRef<{
    x: number;
    y: number;
    last: number;
    t: number;
    v: number;
    width: number;
    moved: boolean;
  } | null>(null);

  const mod = (i: number) => (n ? ((i % n) + n) % n : 0);
  const active = mod(index);
  // While dragging, the details follow the car crossing the centre.
  const focus = mod(index - Math.round(shift));
  const car = shown[focus];
  const price = useTween(car?.priceValue ?? null);
  const powerValue = car?.power ? parseInt(car.power, 10) : null;
  const power = useTween(Number.isFinite(powerValue) ? powerValue : null, 600);
  const tone = toneOf(car?.color ?? null);
  const playing = auto && inView && !hover && !focusHold && shift === 0 && n > 1;

  /** Manual navigation: the visitor is in control from now on. */
  const go = useCallback((to: number | ((i: number) => number)) => {
    manual.current = true;
    setAuto(false);
    setIndex(to);
  }, []);
  const move = useCallback((dir: number) => go((i) => i + dir), [go]);

  useEffect(() => setIndex(0), [filter, sort]);

  useEffect(() => {
    if (!manual.current || !car) return;
    setAnnounce(
      `${car.make} ${car.model}, ${car.price ?? "prix sur demande"}. ${focus + 1} sur ${n}.`,
    );
  }, [car, focus, n]);

  // Keep the active thumbnail in view without scrolling the page.
  useEffect(() => {
    const el = strip.current;
    const thumb = el?.children[focus] as HTMLElement | undefined;
    if (!el || !thumb) return;
    el.scrollTo({
      left: thumb.offsetLeft - (el.clientWidth - thumb.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [focus]);

  useEffect(() => {
    const el = stage.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([e]) => setInView(Boolean(e?.isIntersecting)), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Horizontal trackpad swipes step through the cars (vertical scrolling is left alone).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let sum = 0;
    let lockedUntil = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (e.timeStamp < lockedUntil) return;
      sum += e.deltaX;
      if (Math.abs(sum) > 40) {
        move(sum > 0 ? 1 : -1);
        sum = 0;
        lockedUntil = e.timeStamp + 450;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [move]);

  if (!car) return null;
  const name = `${car.make} ${car.model}`;
  const isSaved = saved.includes(car.path);
  const specs = [
    { icon: Calendar, label: "Année", value: car.isNew ? "Neuf" : car.year },
    { icon: Gauge, label: "Kilométrage", value: car.mileage },
    {
      icon: Zap,
      label: "Puissance",
      value: car.power
        ? power !== null
          ? `${Math.round(power)} ${car.power.replace(/^\d+\s*/, "")}`
          : car.power
        : null,
    },
    { icon: Cog, label: "Boîte", value: car.gearbox },
    { icon: Fuel, label: "Carburant", value: car.fuel },
    { icon: null, label: "Couleur", value: car.color },
  ].filter((s) => s.value);

  return (
    <div className="showroom-block">
      <StockControls view={view} sortable={cars.length > 2} />
      <div
        className="showroom"
        style={{ ["--sr-glow" as string]: tone?.glow ?? DEFAULT_GLOW }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
        // Keyboard focus pauses the stage; a mouse click on a control does not.
        onFocus={(e) => setFocusHold(e.target.matches(":focus-visible"))}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocusHold(false)}
      >
        <div className="sr-stage-wrap">
          <div
            ref={stage}
            className={`sr-stage ${shift !== 0 ? "is-dragging" : ""}`}
            role="region"
            aria-roledescription="carrousel"
            aria-label="Nos dernières annonces"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(1);
              else if (e.key === "ArrowLeft") move(-1);
              else if (e.key === "Home") go(0);
              else if (e.key === "End") go(n - 1);
              else return;
              e.preventDefault();
            }}
            onPointerDown={(e) => {
              if (n < 2 || (e.pointerType === "mouse" && e.button !== 0)) return;
              const slide = stage.current?.querySelector<HTMLElement>(".sr-slide.is-active");
              drag.current = {
                x: e.clientX,
                y: e.clientY,
                last: e.clientX,
                t: e.timeStamp,
                v: 0,
                width: slide?.offsetWidth ?? 400,
                moved: false,
              };
            }}
            onPointerMove={(e) => {
              const el = e.currentTarget;
              if (e.pointerType === "mouse") {
                // A touch of parallax: the stage's vanishing point follows the mouse.
                const r = el.getBoundingClientRect();
                el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
                el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
              }
              const d = drag.current;
              if (!d) return;
              const dx = e.clientX - d.x;
              if (!d.moved) {
                if (Math.abs(dx) < 8) return;
                if (Math.abs(e.clientY - d.y) > Math.abs(dx)) {
                  drag.current = null;
                  return;
                }
                d.moved = true;
                el.setPointerCapture(e.pointerId);
              }
              d.v = (e.clientX - d.last) / Math.max(1, e.timeStamp - d.t);
              d.last = e.clientX;
              d.t = e.timeStamp;
              setShift(dx / (d.width * SPACING));
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              drag.current = null;
              if (!d?.moved) return;
              // A mouse drag ends with a click that must not open anything; a touch swipe
              // has none, so the flag must not outlive this event either.
              suppressClick.current = true;
              window.setTimeout(() => (suppressClick.current = false), 0);
              // The distance dragged decides how far to go; a quick flick goes at least one car.
              const dx = e.clientX - d.x;
              let steps = Math.max(-3, Math.min(3, Math.round(dx / (d.width * SPACING))));
              if (steps === 0 && Math.abs(d.v) > 0.3) steps = Math.sign(dx);
              setShift(0);
              if (steps) move(-steps);
            }}
            onPointerCancel={() => {
              drag.current = null;
              setShift(0);
            }}
            onClickCapture={(e) => {
              if (!suppressClick.current) return;
              suppressClick.current = false;
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="sr-glow" aria-hidden="true" />
            <div className="sr-floor" aria-hidden="true" />
            {shown.map((c, i) => {
              const d = offsetOf(i, active, n, wrap);
              const p = d + shift;
              if (Math.abs(p) > 2.6) return null;
              return (
                <Slide
                  key={c.id}
                  car={c}
                  p={p}
                  active={d === 0}
                  label={`${i + 1} sur ${n} : ${c.make} ${c.model}`}
                  onPick={() => go(i)}
                />
              );
            })}
          </div>
          {n > 1 && (
            <>
              <button
                type="button"
                className="sr-arrow sr-prev"
                aria-label="Véhicule précédent"
                onClick={() => move(-1)}
              >
                <ArrowLeft />
              </button>
              <button
                type="button"
                className="sr-arrow sr-next"
                aria-label="Véhicule suivant"
                onClick={() => move(1)}
              >
                <ArrowRight />
              </button>
            </>
          )}
        </div>

        <div className="sr-info">
          <div className="sr-count">
            <span className="sr-index">
              <strong>{pad(focus + 1)}</strong> / {pad(n)}
            </span>
            {n > 1 && (
              <>
                <span className={`sr-timer ${auto ? "" : "is-off"}`} aria-hidden="true">
                  <span
                    key={`${car.id}-${auto}`}
                    style={{
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: playing ? "running" : "paused",
                    }}
                    onAnimationEnd={() => {
                      manual.current = false;
                      setIndex((i) => i + 1);
                    }}
                  />
                </span>
                <button
                  type="button"
                  className={`sr-play ${auto ? "is-playing" : ""}`}
                  aria-label={auto ? "Arrêter le défilement" : "Reprendre le défilement"}
                  onClick={() => setAuto((a) => !a)}
                >
                  {/* Both icons stay mounted: swapping the node under the cursor loses hover. */}
                  <Pause className="sr-play-pause" />
                  <Play className="sr-play-play" />
                </button>
              </>
            )}
          </div>

          <div className="sr-reveal" key={car.id}>
            <span className="sr-make">
              {car.make}
              {car.isNew && <span className="sr-new">Neuf</span>}
            </span>
            <h3 className="sr-model">{car.model}</h3>
            <dl className="sr-specs">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <dt>
                    {Icon ? (
                      <Icon aria-hidden="true" />
                    ) : (
                      <span
                        className="sr-swatch"
                        style={{ background: tone?.swatch ?? "transparent" }}
                        aria-hidden="true"
                      />
                    )}
                    {label}
                  </dt>
                  <dd title={value ?? undefined}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="sr-price">
            <span>Prix</span>
            <strong>{price !== null ? `CHF ${thousands(price)}` : "Prix sur demande"}</strong>
          </div>
          <div className="sr-actions">
            <Link
              to="/rendez-vous"
              search={{ besoin: "vente", annonce: car.path }}
              className="sr-btn sr-btn-primary"
            >
              <CalendarDays /> Réserver un essai
            </Link>
            <Link to="/vehicules" search={{ annonce: car.path }} className="sr-btn">
              Voir l’annonce <ArrowRight />
            </Link>
            <button
              type="button"
              className={`sr-icon-btn ${isSaved ? "is-saved" : ""} ${pop ? "is-pop" : ""}`}
              aria-pressed={isSaved}
              aria-label={
                isSaved ? `Retirer ${name} de ma sélection` : `Ajouter ${name} à ma sélection`
              }
              onClick={() => {
                toggle(car.path);
                if (!isSaved) {
                  setPop(true);
                  window.setTimeout(() => setPop(false), 600);
                }
              }}
            >
              <Heart />
            </button>
            <a
              href={team.vente.mobileHref}
              className="sr-icon-btn"
              aria-label={`Appeler ${team.vente.name} au ${team.vente.mobile}`}
              title={`${team.vente.name} · ${team.vente.mobile}`}
            >
              <Phone />
            </a>
          </div>
        </div>

        <div className="sr-strip" ref={strip}>
          {shown.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`sr-thumb ${i === focus ? "is-active" : ""}`}
              aria-current={i === focus ? "true" : undefined}
              aria-label={`${c.make} ${c.model}${c.price ? `, ${c.price}` : ""}`}
              onClick={() => go(i)}
            >
              <span className="sr-thumb-img">
                {c.image ? (
                  <img
                    src={thumbnail(c.image)}
                    alt=""
                    width={112}
                    height={84}
                    loading="lazy"
                    draggable={false}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <CarFront />
                )}
                {saved.includes(c.path) && <Heart className="sr-thumb-heart" />}
              </span>
              <span className="sr-thumb-name">
                {c.make} {c.model}
              </span>
            </button>
          ))}
          <Link to="/vehicules" className="sr-thumb sr-thumb-more">
            <span className="sr-thumb-img">
              <strong>{total ?? "Tout"}</strong>
              <span>{total ? "en stock" : "le stock"}</span>
            </span>
            <span className="sr-thumb-name">
              Tout voir <ArrowRight />
            </span>
          </Link>
        </div>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>
      <SelectionBar cars={savedHere} />
    </div>
  );
}
