import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BrushCleaning,
  CarFront,
  Droplets,
  Gift,
  Hammer,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  SprayCan,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { bodyworkFacts, bodyworkServices, garage, team, type BodyworkIcon } from "@/lib/garage";
// Illustration, not the garage's own work: public-domain photo (CC0) from rawpixel,
// https://www.rawpixel.com/image/6040328
import polishPhoto from "@/assets/bodywork-polish.webp";

const icons: Record<BodyworkIcon, LucideIcon> = {
  claims: ShieldCheck,
  car: CarFront,
  restore: Hammer,
  paint: SprayCan,
  polish: Sparkles,
  protect: Droplets,
  rust: BrushCleaning,
};

/** Polishing pad radius, as a share of the photo's width. */
const PAD = 0.075;
/** Share of the photo that must shine before the rest is finished automatically. */
const DONE_AT = 0.8;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Engine = {
  img: HTMLImageElement;
  mask: HTMLCanvasElement;
  probe: HTMLCanvasElement;
  last: [number, number] | null;
  frame: number;
  measured: number;
};

/**
 * The photo starts dull and hazy; rubbing it with the mouse or a finger polishes the shine
 * back, one pass at a time, like a rotary polisher. A gauge shows how much of the paint
 * shines; past 80 % the rest is finished for you.
 */
function PolishReveal({ src, alt }: { src: string; alt: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pad = useRef<HTMLSpanElement>(null);
  const engine = useRef<Engine | null>(null);
  const handled = useRef(false);
  const [shine, setShine] = useState(0);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  const render = useCallback(() => {
    const e = engine.current;
    const c = canvas.current;
    if (!e || !c) return;
    e.frame = 0;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(e.img, 0, 0, c.width, c.height);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(e.mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }, []);

  const finish = useCallback(() => {
    const e = engine.current;
    if (!e) return;
    const m = e.mask.getContext("2d");
    if (!m) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      m.fillStyle = `rgba(0,0,0,${0.12 + p * 0.3})`;
      m.fillRect(0, 0, e.mask.width, e.mask.height);
      render();
      if (p < 1) requestAnimationFrame(tick);
      else {
        m.fillStyle = "#000";
        m.fillRect(0, 0, e.mask.width, e.mask.height);
        render();
        setShine(1);
        setDone(true);
      }
    };
    requestAnimationFrame(tick);
  }, [render]);

  const measure = useCallback(() => {
    const e = engine.current;
    if (!e) return;
    const p = e.probe.getContext("2d", { willReadFrequently: true });
    if (!p) return;
    p.clearRect(0, 0, e.probe.width, e.probe.height);
    p.drawImage(e.mask, 0, 0, e.probe.width, e.probe.height);
    const data = p.getImageData(0, 0, e.probe.width, e.probe.height).data;
    let lit = 0;
    for (let i = 3; i < data.length; i += 4) lit += Math.min(1, (data[i] ?? 0) / 215);
    const value = lit / (data.length / 4);
    setShine(value);
    if (value >= DONE_AT) finish();
  }, [finish]);

  /** Polishes along a stroke from the previous point, in the canvas's own pixels. */
  const rub = useCallback(
    (x: number, y: number) => {
      const e = engine.current;
      const m = e?.mask.getContext("2d");
      if (!e || !m) return;
      const r = e.mask.width * PAD;
      const [lx, ly] = e.last ?? [x, y];
      const steps = Math.max(1, Math.ceil(Math.hypot(x - lx, y - ly) / (r * 0.3)));
      for (let i = 1; i <= steps; i++) {
        const px = lx + ((x - lx) * i) / steps;
        const py = ly + ((y - ly) * i) / steps;
        const g = m.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, "rgba(0,0,0,0.5)");
        g.addColorStop(0.55, "rgba(0,0,0,0.28)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        m.fillStyle = g;
        m.beginPath();
        m.arc(px, py, r, 0, Math.PI * 2);
        m.fill();
      }
      e.last = [x, y];
      if (!e.frame) e.frame = requestAnimationFrame(render);
      const now = performance.now();
      if (now - e.measured > 180) {
        e.measured = now;
        measure();
      }
    },
    [render, measure],
  );

  // Load the photo into the canvas once, then show the effect with one automatic pass.
  useEffect(() => {
    const img = new Image();
    let demo = 0;
    let observer: IntersectionObserver | null = null;
    img.onload = () => {
      const c = canvas.current;
      const el = frameRef.current;
      if (!c || !el) return;
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const mask = document.createElement("canvas");
      mask.width = c.width;
      mask.height = c.height;
      const probe = document.createElement("canvas");
      probe.width = 48;
      probe.height = Math.round((48 * c.height) / c.width);
      engine.current = { img, mask, probe, last: null, frame: 0, measured: 0 };
      if (reducedMotion() || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer?.disconnect();
          const start = performance.now();
          const pass = (now: number) => {
            const e = engine.current;
            if (!e || handled.current) return;
            const t = Math.min(1, (now - start) / 1300);
            rub(c.width * (0.14 + 0.72 * t), c.height * (0.5 + 0.16 * Math.sin(t * Math.PI * 3)));
            if (t < 1) demo = requestAnimationFrame(pass);
            else e.last = null;
          };
          demo = requestAnimationFrame(pass);
        },
        { threshold: 0.6 },
      );
      observer.observe(el);
    };
    img.src = src;
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(demo);
    };
  }, [src, rub]);

  function toCanvas(e: PointerEvent<HTMLDivElement>): [number, number] | null {
    const c = canvas.current;
    const r = e.currentTarget.getBoundingClientRect();
    if (!c) return null;
    return [
      ((e.clientX - r.left) / r.width) * c.width,
      ((e.clientY - r.top) / r.height) * c.height,
    ];
  }

  function start() {
    if (!touched) {
      setTouched(true);
      handled.current = true;
    }
  }

  function reset() {
    const e = engine.current;
    if (!e) return;
    e.mask.getContext("2d")?.clearRect(0, 0, e.mask.width, e.mask.height);
    e.last = null;
    render();
    setShine(0);
    setDone(false);
  }

  const percent = Math.round(shine * 100);
  return (
    <figure className="polish">
      <div
        ref={frameRef}
        className={`polish-frame ${done ? "is-done" : ""}`}
        style={{ ["--pad" as string]: `${PAD * 200}%` } as CSSProperties}
        onPointerMove={(e) => {
          if (pad.current) {
            const r = e.currentTarget.getBoundingClientRect();
            pad.current.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
          }
          if (done) return;
          // A mouse polishes on hover; a finger or pen while it rubs the photo.
          if (e.pointerType !== "mouse" && e.buttons === 0) return;
          const point = toCanvas(e);
          if (!point) return;
          start();
          rub(point[0], point[1]);
        }}
        onPointerDown={(e) => {
          if (engine.current) engine.current.last = null;
          if (e.pointerType !== "mouse" && !done) {
            const point = toCanvas(e);
            if (point) {
              start();
              rub(point[0], point[1]);
            }
          }
        }}
        onPointerLeave={() => {
          if (engine.current) engine.current.last = null;
        }}
      >
        <img src={src} alt={alt} className="polish-base" width={1024} height={683} loading="lazy" />
        <span className="polish-haze" aria-hidden="true" />
        <canvas ref={canvas} className="polish-canvas" aria-hidden="true" />
        <span className="polish-sheen" aria-hidden="true" />
        <span ref={pad} className="polish-pad" aria-hidden="true" />
        <span className="polish-tag">Visuel d’illustration</span>
        {!touched && !done && (
          <span className="polish-hint" aria-hidden="true">
            <Sparkles />
            <span className="polish-hint-fine">Passez la souris pour polir</span>
            <span className="polish-hint-touch">Frottez la photo pour polir</span>
          </span>
        )}
        <div className="polish-gauge" aria-live="polite">
          <svg viewBox="0 0 60 34" aria-hidden="true">
            <path className="polish-gauge-track" d="M6 30a24 24 0 0 1 48 0" pathLength={100} />
            <path
              className="polish-gauge-fill"
              d="M6 30a24 24 0 0 1 48 0"
              pathLength={100}
              style={{ strokeDasharray: `${percent} 100` }}
            />
          </svg>
          <span>
            <small>Brillance</small>
            <strong>{done ? "Impeccable" : `${percent} %`}</strong>
          </span>
        </div>
        {done ? (
          <button type="button" className="polish-btn" onClick={reset}>
            <RotateCcw /> Recommencer
          </button>
        ) : (
          <button
            type="button"
            className="polish-btn"
            onClick={() => {
              start();
              finish();
            }}
          >
            <Sparkles /> Tout polir
          </button>
        )}
      </div>
    </figure>
  );
}

/** Carrosserie on the services page: key figures, the polish visual and the services. */
export function BodyworkSection() {
  const grid = useRef<HTMLUListElement>(null);
  const contact = team.carrosserie;

  // Like a dashboard at ignition, every indicator lights up once when the grid comes into view.
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
    <section id="carrosserie" className="service-detail bodywork">
      <div className="container">
        <div className="bodywork-head">
          <div className="bodywork-copy">
            <div className="eyebrow">02 / Carrosserie</div>
            <h2>Retrouver le plaisir d’une voiture impeccable.</h2>
            <p>
              De la réparation à la restauration, notre carrosserie vous accompagne et prend en
              charge les formalités administratives avec les assurances. Nous utilisons des
              peintures hydrosolubles respectueuses de l’environnement.
            </p>
            <dl className="bodywork-figures">
              {bodyworkFacts.figures.map((f) => (
                <div key={f.label}>
                  <dt>{f.value}</dt>
                  <dd>{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <PolishReveal
            src={polishPhoto}
            alt="Phare et carrosserie lustrée d’un coupé gris (visuel d’illustration)"
          />
        </div>

        <ul className="bodywork-grid" ref={grid} aria-label="Prestations de carrosserie">
          {bodyworkServices.map((s, i) => {
            const Icon = icons[s.icon];
            return (
              <li
                key={s.icon}
                className="telltale"
                style={{ ["--i" as string]: i } as CSSProperties}
              >
                <span className="telltale-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="telltale-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </li>
            );
          })}
          <li className="telltale telltale-contact">
            <span className="telltale-avatar" aria-hidden="true">
              {contact.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </span>
            <span className="telltale-role">Votre interlocuteur</span>
            <strong>{contact.name}</strong>
            <a href={`mailto:${contact.email}`}>
              <Mail /> Écrire à {contact.name.split(" ")[0]}
            </a>
          </li>
        </ul>

        <div className="bodywork-foot">
          <div className="bodywork-notes">
            <p>
              <BadgeCheck aria-hidden="true" />
              {bodyworkFacts.warranty}
            </p>
            <p>
              <Gift aria-hidden="true" />
              {bodyworkFacts.windscreen}
            </p>
          </div>
          <div className="detail-actions">
            <Button asChild variant="premium">
              <Link to="/rendez-vous" search={{ besoin: "carrosserie" }}>
                Demander un devis <ArrowRight />
              </Link>
            </Button>
            <a className="section-link" href={garage.phoneHref}>
              <Phone /> {garage.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
