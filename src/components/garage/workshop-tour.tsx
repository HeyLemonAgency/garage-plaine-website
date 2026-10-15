import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Caravan,
  Check,
  Disc3,
  Hand,
  Laptop,
  Lightbulb,
  Minimize2,
  Snowflake,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { workshopTour, type WorkshopIcon } from "@/lib/garage";
// The garage's own workshop photo (from its previous website), upscaled 2× for the tour.
import photo from "@/assets/workshop-tour.webp";

const NAT_W = 2048;
const NAT_H = 996;
const STOPS = workshopTour.length;

const icons: Record<WorkshopIcon, LucideIcon> = {
  diagnostic: Laptop,
  ac: Snowflake,
  lights: Lightbulb,
  tyres: Disc3,
  service: Wrench,
  electrics: Zap,
  towing: Caravan,
};

type Size = { w: number; h: number };
type Point = [number, number];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const pad = (n: number) => String(n).padStart(2, "0");

/** The camera: scale and offset that show `center` (photo pixels) in the middle of the stage. */
function camera(size: Size, center: Point, zoom: number) {
  const s = Math.max(size.w / NAT_W, size.h / NAT_H) * zoom;
  const cx = clamp(center[0], size.w / (2 * s), NAT_W - size.w / (2 * s));
  const cy = clamp(center[1], size.h / (2 * s), NAT_H - size.h / (2 * s));
  return { s, tx: size.w / 2 - cx * s, ty: size.h / 2 - cy * s, cx, cy };
}

/**
 * A walk around the real workshop: the photo is larger than its frame, so the visitor looks
 * around with the mouse or a finger. Glowing points mark the stations; choosing one flies
 * the camera there, dims the rest of the room and shows what is done at that station.
 */
export function WorkshopTour() {
  const stage = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [stop, setStop] = useState<number | null>(null);
  const [look, setLook] = useState<Point>([0, 0]);
  const [dragging, setDragging] = useState(false);
  const [explored, setExplored] = useState(false);
  const [awake, setAwake] = useState(false);
  const drag = useRef<{ x: number; y: number; look: Point; s: number; moved: boolean } | null>(
    null,
  );
  const suppressClick = useRef(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The points light up one after another the first time the workshop comes into view.
  useEffect(() => {
    const el = stage.current;
    if (!el || !("IntersectionObserver" in window)) return setAwake(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setAwake(true);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = stop === null ? null : workshopTour[stop];
  const compact = (size?.w ?? 1000) < 640;
  const focus = current?.point ?? null;
  const zoom = focus ? (compact ? 1.45 : 1.7) : compact ? 1 : 1.1;
  const base: Point = focus ? [focus[0] * NAT_W, focus[1] * NAT_H] : [NAT_W / 2, NAT_H / 2];
  const cam = size ? camera(size, [base[0] + look[0], base[1] + look[1]], zoom) : null;
  const toScreen = (p: readonly [number, number]): Point =>
    cam ? [cam.tx + p[0] * NAT_W * cam.s, cam.ty + p[1] * NAT_H * cam.s] : [0, 0];
  const spot = focus ? toScreen(focus) : null;

  function go(next: number | null) {
    setStop(next);
    setLook([0, 0]);
    setExplored(true);
  }
  const step = (dir: 1 | -1) =>
    go(stop === null ? (dir === 1 ? 0 : STOPS - 1) : (stop + dir + STOPS) % STOPS);

  const Icon = current ? icons[current.icon] : null;

  return (
    <div className={`tour ${current ? "is-focused" : ""}`}>
      <div
        ref={stage}
        className={`tour-stage ${dragging ? "is-dragging" : ""} ${awake ? "is-awake" : ""}`}
        role="region"
        aria-roledescription="visite"
        aria-label="Visite de l’atelier"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          else if (e.key === "ArrowLeft") step(-1);
          else if (e.key === "Escape") go(null);
          else return;
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          if (!cam || (e.pointerType === "mouse" && e.button !== 0)) return;
          // Start from where the camera really is (it may be held against an edge).
          const from: Point = [cam.cx - base[0], cam.cy - base[1]];
          drag.current = { x: e.clientX, y: e.clientY, look: from, s: cam.s, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) {
            const dx = e.clientX - d.x;
            const dy = e.clientY - d.y;
            if (!d.moved) {
              if (Math.hypot(dx, dy) < 6) return;
              // On touch screens a mostly vertical swipe scrolls the page instead.
              if (e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx)) {
                drag.current = null;
                return;
              }
              d.moved = true;
              setDragging(true);
              setExplored(true);
              e.currentTarget.setPointerCapture(e.pointerId);
            }
            setLook([d.look[0] - dx / d.s, d.look[1] - (e.pointerType === "mouse" ? dy / d.s : 0)]);
            return;
          }
          // With a mouse, the room follows the pointer a little in the overview.
          if (e.pointerType !== "mouse" || current || !size || !cam) return;
          const r = e.currentTarget.getBoundingClientRect();
          const slackX = NAT_W / 2 - size.w / (2 * cam.s);
          const slackY = NAT_H / 2 - size.h / (2 * cam.s);
          setLook([
            ((e.clientX - r.left) / r.width - 0.5) * 2 * slackX * 0.6,
            ((e.clientY - r.top) / r.height - 0.5) * 2 * slackY * 0.6,
          ]);
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (!d?.moved) return;
          setDragging(false);
          // Keep the camera where it stopped, even if the drag went past an edge.
          if (cam) setLook([cam.cx - base[0], cam.cy - base[1]]);
          suppressClick.current = true;
          window.setTimeout(() => (suppressClick.current = false), 0);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse" && !drag.current && !current) setLook([0, 0]);
        }}
        onClickCapture={(e) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <img
          className="tour-photo"
          src={photo}
          alt="L’atelier mécanique du Garage de la Plaine : poste de diagnostic, station de climatisation et véhicule en entretien"
          width={NAT_W}
          height={NAT_H}
          loading="lazy"
          draggable={false}
          style={cam ? { transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` } : {}}
        />
        <div
          className="tour-shade"
          aria-hidden="true"
          style={
            {
              "--sx": `${spot?.[0] ?? (size?.w ?? 0) / 2}px`,
              "--sy": `${spot?.[1] ?? (size?.h ?? 0) / 2}px`,
              "--sr": `${compact ? 64 : 110}px`,
            } as CSSProperties
          }
        />
        {cam &&
          workshopTour.map((t, i) => {
            if (!t.point) return null;
            const [x, y] = toScreen(t.point);
            const SpotIcon = icons[t.icon];
            // Near an edge of the frame, the label opens towards the middle so it stays whole.
            const side = size && x > size.w - 120 ? "is-right" : x < 120 ? "is-left" : "";
            return (
              <button
                key={t.id}
                type="button"
                className={`tour-spot ${side} ${stop === i ? "is-active" : ""}`}
                style={
                  { transform: `translate(${x}px, ${y}px)`, ["--d" as string]: i } as CSSProperties
                }
                aria-label={`${t.title} : ${t.place}`}
                aria-pressed={stop === i}
                onClick={() => go(stop === i ? null : i)}
              >
                <span className="tour-spot-dot">
                  <SpotIcon />
                </span>
                <span className="tour-spot-label">{t.title}</span>
              </button>
            );
          })}
        <span className="tour-tag">Notre atelier · photo réelle</span>
        {!explored && (
          <span className="tour-hint" aria-hidden="true">
            <Hand />
            <span className="tour-hint-fine">Bougez la souris, cliquez sur un point</span>
            <span className="tour-hint-touch">Glissez pour explorer, touchez un point</span>
          </span>
        )}
        <div className="tour-dots" aria-hidden="true">
          {workshopTour.map((t, i) => (
            <span key={t.id} className={stop === i ? "is-active" : ""} />
          ))}
        </div>
      </div>

      <div className="tour-card" aria-live="polite">
        {current && Icon ? (
          <div className="tour-card-body" key={current.id}>
            <span className="tour-step">
              {pad((stop ?? 0) + 1)} / {pad(STOPS)} · {current.place}
            </span>
            <h3>
              <span className="tour-card-icon">
                <Icon aria-hidden="true" />
              </span>
              {current.title}
            </h3>
            <ul>
              {current.services.map((s) => (
                <li key={s}>
                  <Check aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="tour-card-body" key="overview">
            <span className="tour-step">Visite de l’atelier</span>
            <h3>{STOPS} étapes, toutes nos prestations.</h3>
            <p>Explorez l’atelier et choisissez un point, ou laissez-vous guider.</p>
          </div>
        )}
        <div className="tour-nav">
          <button
            type="button"
            className="tour-nav-btn"
            aria-label="Étape précédente"
            onClick={() => step(-1)}
          >
            <ArrowLeft />
          </button>
          {current ? (
            <button type="button" className="tour-nav-main" onClick={() => go(null)}>
              <Minimize2 /> Vue d’ensemble
            </button>
          ) : (
            <button type="button" className="tour-nav-main is-primary" onClick={() => go(0)}>
              Commencer la visite <ArrowRight />
            </button>
          )}
          <button
            type="button"
            className="tour-nav-btn"
            aria-label="Étape suivante"
            onClick={() => step(1)}
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
