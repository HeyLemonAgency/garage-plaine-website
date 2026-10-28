import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Disc3,
  Gauge,
  Hand,
  Lightbulb,
  Minimize2,
  MonitorSmartphone,
  Pause,
  Play,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { sCross, type SuzukiSpotId } from "@/lib/garage";
import type { Spin } from "@/lib/spin-scene";
import { sCross3d } from "@/lib/s-cross-3d";

const icons: Record<SuzukiSpotId, LucideIcon> = {
  phares: Lightbulb,
  hybride: Zap,
  ecran: MonitorSmartphone,
  toit: Sun,
  jantes: Disc3,
  allgrip: Gauge,
  coffre: Box,
};

const spots = sCross.spots;
const pad = (n: number) => String(n).padStart(2, "0");

type State = "idle" | "loading" | "ready" | "error";

/** True when the browser would draw 3D without a graphics chip (old PCs, virtual machines,
 *  blocked drivers): the scene would crawl, so it then waits to be asked for. */
function softwareRendering() {
  try {
    const c = document.createElement("canvas");
    const opts = { failIfMajorPerformanceCaveat: true };
    const gl = (c.getContext("webgl2", opts) ?? c.getContext("webgl", opts)) as
      WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl) return true;
    // Chrome names the real renderer only through this extension; Firefox in RENDERER.
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software/i.test(renderer);
  } catch {
    return true;
  }
}

/** The S-Cross on a turntable: it turns slowly on its own, the visitor can spin it by hand,
 *  pick a paint and open the points that explain the car. */
export function SuzukiSpin() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const spin = useRef<Spin | null>(null);
  const els = useRef(new Map<string, HTMLButtonElement>());
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<SuzukiSpotId | null>(null);
  const [paint, setPaint] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [touched, setTouched] = useState(false);

  const startRef = useRef<() => void>(() => {});
  startRef.current = function start() {
    const el = stage.current;
    const cv = canvas.current;
    if (!el || !cv || spin.current) return;
    setState("loading");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setPlaying(false);
    import("@/lib/spin-scene")
      .then(({ createSpin }) => {
        spin.current = createSpin({
          stage: el,
          canvas: cv,
          model: sCross3d,
          spots: spots.map((s) => ({ id: s.id, ...sCross3d.points[s.id] })),
          paint: sCross.colours[0]!.hex,
          autoRotate: !reduced,
          reducedMotion: reduced,
          startYaw: -0.62,
          onProgress: setProgress,
          onReady: () => setState("ready"),
          onError: (error) => {
            console.error(error);
            setState("error");
          },
          onDrag: () => {
            setTouched(true);
            setActive(null);
          },
          onFrame(points, yaw) {
            const width = el.clientWidth;
            for (const p of points) {
              const b = els.current.get(p.id);
              if (!b) continue;
              const show = Math.min(1, Math.max(0, (p.facing + 0.05) / 0.3));
              b.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
              b.style.opacity = show.toFixed(2);
              b.style.zIndex = String(10 + Math.round(show * 10));
              b.dataset["side"] = p.x > width - 190 ? "left" : "right";
              b.toggleAttribute("data-behind", show < 0.35);
            }
            el.style.setProperty("--sway", Math.sin(yaw).toFixed(3));
          },
        });
      })
      .catch((error) => {
        console.error(error);
        setState("error");
      });
  };

  useEffect(() => {
    // Phones on a data-saving plan, and devices without a graphics chip, load it when asked.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    let idle = 0;
    let timer = 0;
    if (!saveData && !softwareRendering()) {
      // Start once the page has settled, so the 3D never delays the first interactions.
      const go = () => startRef.current();
      // Safari has no requestIdleCallback.
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(go, { timeout: 1500 });
      else timer = window.setTimeout(go, 300);
    }
    return () => {
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      spin.current?.dispose();
      spin.current = null;
    };
  }, []);

  useEffect(() => {
    spin.current?.focus(active);
  }, [active, state]);
  // While a detail is open, the hero hides its title on wide screens (see .sz-hero[data-detail]).
  useEffect(() => {
    stage.current?.closest(".sz-hero")?.toggleAttribute("data-detail", !!active);
  }, [active]);
  // On phones the card opens under the car: bring both into view.
  useEffect(() => {
    const el = stage.current;
    const box = card.current;
    if (!active || !el || !box || window.innerWidth > 980) return;
    const frame = requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top;
      const bottom = box.getBoundingClientRect().bottom;
      const room = window.innerHeight - 96;
      if (top >= 64 && bottom <= room) return;
      // Show the card's bottom, but never push the top of the car under the header.
      const by = bottom > room ? Math.min(bottom - room, top - 64) : top - 64;
      window.scrollBy({ top: by, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);
  useEffect(() => {
    spin.current?.setPaint(sCross.colours[paint]!.hex);
  }, [paint, state]);
  useEffect(() => {
    spin.current?.setAutoRotate(playing && !active);
  }, [playing, active, state]);

  const index = active ? spots.findIndex((s) => s.id === active) : -1;
  const current = index >= 0 ? spots[index] : null;
  const Icon = current ? icons[current.id] : null;
  const step = (dir: 1 | -1) => {
    setTouched(true);
    setActive(spots[(Math.max(index, dir === 1 ? -1 : 0) + dir + spots.length) % spots.length]!.id);
  };
  const colour = sCross.colours[paint]!;

  return (
    <div className="spin" data-state={state} data-active={active ?? undefined}>
      <div
        ref={stage}
        className="spin-stage"
        role="region"
        aria-roledescription="vue 3D"
        aria-label="Suzuki S-Cross en 3D : faites-le pivoter et ouvrez ses points forts"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          else if (e.key === "ArrowLeft") step(-1);
          else if (e.key === "Escape") setActive(null);
          else return;
          e.preventDefault();
        }}
      >
        <span className="spin-word" aria-hidden="true">
          S-CROSS
        </span>
        <span className="spin-floor" aria-hidden="true" />
        {sCross3d.poster && (
          <picture>
            <source media="(max-width: 980px)" srcSet={sCross3d.poster.phone} />
            <img
              className="spin-poster"
              src={sCross3d.poster.wide}
              alt="Le Suzuki S-Cross en 3D"
              fetchPriority="high"
            />
          </picture>
        )}
        <canvas ref={canvas} className="spin-canvas" aria-hidden="true" />

        {spots.map((s, i) => {
          const SpotIcon = icons[s.id];
          return (
            <button
              key={s.id}
              ref={(b) => {
                if (b) els.current.set(s.id, b);
                else els.current.delete(s.id);
              }}
              type="button"
              className={`spin-spot ${active === s.id ? "is-active" : ""}`}
              style={{ "--d": i } as CSSProperties}
              aria-pressed={active === s.id}
              aria-label={s.title}
              onClick={() => {
                setTouched(true);
                setActive(active === s.id ? null : s.id);
              }}
            >
              <span className="spin-spot-dot">
                <SpotIcon />
              </span>
              <span className="spin-spot-label">{s.title}</span>
            </button>
          );
        })}

        {state === "loading" && (
          <div className="spin-loading" role="status">
            <span className="spin-loading-bar" style={{ "--p": progress } as CSSProperties} />
            Préparation du S-Cross… {Math.round(progress * 100)}&nbsp;%
          </div>
        )}
        {state === "idle" && (
          <button type="button" className="spin-load" onClick={() => startRef.current()}>
            <Play /> Afficher le S-Cross en 3D
          </button>
        )}
        {state === "error" && (
          <p className="spin-error">
            La vue 3D n’est pas disponible sur cet appareil : ses points forts sont listés
            ci-dessous.
          </p>
        )}
        {state === "ready" && !touched && (
          <span className="spin-hint" aria-hidden="true">
            <Hand />
            <span className="spin-hint-fine">Faites-le pivoter, cliquez sur un point</span>
            <span className="spin-hint-touch">Glissez pour le faire pivoter, touchez un point</span>
          </span>
        )}
      </div>

      <div className="spin-tools">
        <button
          type="button"
          className="spin-tool"
          aria-label={playing ? "Arrêter la rotation" : "Reprendre la rotation"}
          onClick={() => setPlaying((p) => !p)}
        >
          <Pause className="spin-tool-pause" aria-hidden="true" data-on={playing || undefined} />
          <Play className="spin-tool-play" aria-hidden="true" data-on={!playing || undefined} />
        </button>
        <div className="spin-colours" role="radiogroup" aria-label="Teinte de la carrosserie">
          {sCross.colours.map((c, i) => (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={paint === i}
              aria-label={c.name}
              title={c.name}
              className="spin-swatch"
              style={{ "--swatch": c.hex } as CSSProperties}
              tabIndex={paint === i ? 0 : -1}
              onClick={() => setPaint(i)}
              onKeyDown={(e) => {
                const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
                if (!dir) return;
                e.preventDefault();
                const next = (i + dir + sCross.colours.length) % sCross.colours.length;
                setPaint(next);
                (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
              }}
            />
          ))}
        </div>
        <span className="spin-colour-name">{colour.name}</span>
      </div>

      <div className="spin-card" ref={card} aria-live="polite">
        {current && Icon && (
          <div className="spin-card-body" key={current.id}>
            <span className="spin-card-step">
              {pad(index + 1)} / {pad(spots.length)}
            </span>
            <h3>
              <span className="spin-card-icon">
                <Icon aria-hidden="true" />
              </span>
              {current.title}
            </h3>
            <p>{current.text}</p>
            <div className="spin-card-nav">
              <button type="button" aria-label="Point précédent" onClick={() => step(-1)}>
                <ArrowLeft />
              </button>
              <button type="button" className="spin-card-close" onClick={() => setActive(null)}>
                <Minimize2 /> Vue d’ensemble
              </button>
              <button type="button" aria-label="Point suivant" onClick={() => step(1)}>
                <ArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="spin-chips" aria-label="Points forts du S-Cross">
        {spots.map((s) => {
          const ChipIcon = icons[s.id];
          return (
            <button
              key={s.id}
              type="button"
              className="spin-chip"
              aria-pressed={active === s.id}
              onClick={() => {
                setTouched(true);
                setActive(active === s.id ? null : s.id);
                if (window.innerWidth > 980)
                  stage.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
              }}
            >
              <ChipIcon aria-hidden="true" />
              {s.title}
            </button>
          );
        })}
      </div>

      <p className="spin-credit">
        Illustration 3D d’après «&nbsp;
        <a href={sCross.model.source} target="_blank" rel="noreferrer">
          {sCross.model.title}
        </a>
        &nbsp;» de {sCross.model.author} (
        <a href={sCross.model.licenseUrl} target="_blank" rel="noreferrer">
          {sCross.model.license}
        </a>
        ), matières et teintes adaptées. Teintes indicatives ; l’équipement dépend de la version.
      </p>
    </div>
  );
}
