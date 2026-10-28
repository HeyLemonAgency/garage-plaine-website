import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Lock,
  Mountain,
  Snowflake,
  type LucideIcon,
} from "lucide-react";
import { sCross, suzukiRange, type AllgripMode } from "@/lib/garage";

type ModeId = AllgripMode;

const modeIcons: Record<ModeId, LucideIcon> = {
  auto: Leaf,
  sport: Mountain,
  snow: Snowflake,
  lock: Lock,
};
/** Where the pointer of the dial stops for each mode, in degrees. */
const modeAngles: Record<ModeId, number> = { auto: -54, sport: -18, snow: 18, lock: 54 };

/**
 * The ALLGRIP SELECT dial of the S-Cross: turning it to a mode explains what the 4x4 does.
 * It turns by itself through the four modes while in view, until the visitor picks one.
 */
export function AllgripDial() {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState(0);
  const [manual, setManual] = useState(false);
  const modes = sCross.modes;

  useEffect(() => {
    const el = ref.current;
    if (!el || manual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (entry?.isIntersecting)
          timer = window.setInterval(() => setMode((m) => (m + 1) % modes.length), 3600);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [manual, modes.length]);

  const current = modes[mode]!;
  const Icon = modeIcons[current.id];
  const pick = (i: number) => {
    setManual(true);
    setMode(i);
  };

  return (
    <div className="allgrip" ref={ref}>
      <div
        className="allgrip-dial"
        style={{ "--angle": `${modeAngles[current.id]}deg` } as CSSProperties}
      >
        <div className="allgrip-ring" aria-hidden="true">
          {modes.map((m) => (
            <span
              key={m.id}
              className={`allgrip-mark ${m.id === current.id ? "is-on" : ""}`}
              style={{ "--at": `${modeAngles[m.id]}deg` } as CSSProperties}
            >
              {m.name.toUpperCase()}
            </span>
          ))}
        </div>
        <div className="allgrip-knob" aria-hidden="true">
          <span className="allgrip-pointer" />
          <span className="allgrip-brand">ALLGRIP</span>
        </div>
      </div>
      <div className="allgrip-copy">
        <div className="allgrip-modes" role="radiogroup" aria-label="Modes ALLGRIP SELECT">
          {modes.map((m, i) => {
            const ModeIcon = modeIcons[m.id];
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={i === mode}
                className="allgrip-mode"
                onClick={() => pick(i)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const next =
                    (i + (e.key === "ArrowRight" ? 1 : -1) + modes.length) % modes.length;
                  pick(next);
                  (
                    e.currentTarget.parentElement?.children[next] as HTMLElement | undefined
                  )?.focus();
                }}
                tabIndex={i === mode ? 0 : -1}
              >
                <ModeIcon aria-hidden="true" />
                {m.name}
              </button>
            );
          })}
        </div>
        <div className="allgrip-detail" aria-live="polite" key={current.id}>
          <span className="allgrip-detail-icon">
            <Icon aria-hidden="true" />
          </span>
          <div>
            <strong>Mode {current.name}</strong>
            <p>{current.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The current Suzuki range in Switzerland, each with a link to Suzuki and to an offer. */
export function SuzukiRange() {
  return (
    <div className="range-grid">
      {suzukiRange.map((model, i) => (
        <article
          key={model.id}
          className={`range-card reveal-on-scroll ${model.id === "s-cross" ? "is-featured" : ""}`}
          style={{ "--i": i } as CSSProperties}
        >
          <span className="range-kind">{model.kind}</span>
          <h3 className="range-name">
            <span>Suzuki</span> {model.name}
          </h3>
          <p>{model.text}</p>
          <ul className="range-tags" aria-label="Motorisation">
            {model.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="range-links">
            <Link to="/rendez-vous" search={{ besoin: "vente" }} className="range-offer">
              Demander une offre <ArrowRight />
            </Link>
            <a href={model.url} target="_blank" rel="noreferrer" className="range-more">
              Sur suzuki.ch <ArrowUpRight />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
