import { useEffect, useState, type RefObject } from "react";
import { Lightbulb } from "lucide-react";

// Headlight positions in the hero photo (suzuki-lake.webp, 1920 × 1024 px).
const NAT_W = 1920;
const NAT_H = 1024;
const HOTSPOTS = [
  { id: "right", x: 1268, y: 607, w: 215, h: 86 },
  { id: "left", x: 928, y: 608, w: 78, h: 90 },
] as const;
const HINT_KEY = "garage-plaine-lights";

type Rect = { x: number; y: number; w: number; h: number };

function parsePosition(value: string): [number, number] {
  const [px = "50%", py = "50%"] = value.split(" ");
  const pct = (v: string) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5);
  return [pct(px), pct(py)];
}

/** Where the photo is actually drawn inside its box with `object-fit: cover`. */
function coverRect(img: HTMLImageElement): Rect {
  const boxW = img.clientWidth;
  const boxH = img.clientHeight;
  const scale = Math.max(boxW / NAT_W, boxH / NAT_H);
  const w = NAT_W * scale;
  const h = NAT_H * scale;
  const [posX, posY] = parsePosition(getComputedStyle(img).objectPosition);
  return { x: (boxW - w) * posX, y: (boxH - h) * posY, w, h };
}

/**
 * Interactive headlights on the hero photo: hover them to switch them on (with an LED
 * start-up flicker, glow, flare and light on the road), click or tap to keep them on.
 */
export function HeroLights({ imgRef }: { imgRef: RefObject<HTMLImageElement | null> }) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [hover, setHover] = useState(false);
  const [latched, setLatched] = useState(false);
  const [hint, setHint] = useState(false);
  const on = hover || latched;

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const update = () => setRect(coverRect(img));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(img);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [imgRef]);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(HINT_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    const timer = window.setTimeout(() => setHint(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  function discovered() {
    setHint(false);
    try {
      sessionStorage.setItem(HINT_KEY, "1");
    } catch {
      // Private mode: the hint simply shows again next time.
    }
  }

  return (
    <div className="hero-lights" data-on={on || undefined}>
      <div className="hl-dusk" aria-hidden="true" />
      {rect && (
        <div
          className="hl-stage"
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        >
          <svg
            className="hl-svg"
            viewBox={`0 0 ${NAT_W} ${NAT_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="hl-core">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.35" stopColor="#eef6ff" stopOpacity="0.95" />
                <stop offset="0.62" stopColor="#b8d6ff" stopOpacity="0.45" />
                <stop offset="1" stopColor="#9cc4ff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hl-bloom">
                <stop offset="0" stopColor="#dcecff" stopOpacity="0.75" />
                <stop offset="0.45" stopColor="#a9cbff" stopOpacity="0.28" />
                <stop offset="1" stopColor="#a9cbff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hl-warm">
                <stop offset="0" stopColor="#fff8e6" />
                <stop offset="0.5" stopColor="#ffe9b8" stopOpacity="0.4" />
                <stop offset="1" stopColor="#ffe0a0" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hl-pool" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#e3efff" stopOpacity="0.7" />
                <stop offset="0.6" stopColor="#c4dbff" stopOpacity="0.16" />
                <stop offset="1" stopColor="#c4dbff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="hl-streak" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#bcd8ff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="1" stopColor="#bcd8ff" stopOpacity="0" />
              </linearGradient>
              <filter id="hl-blur-lg" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
              <filter id="hl-blur-sm" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* Light thrown on the road in front of the car */}
            <g className="hl-beams" filter="url(#hl-blur-lg)">
              <ellipse cx="760" cy="985" rx="600" ry="95" fill="url(#hl-pool)" />
              <ellipse cx="1040" cy="900" rx="260" ry="40" fill="url(#hl-pool)" />
            </g>

            <g className="hl-glow">
              {/* Bloom */}
              <circle cx="1268" cy="602" r="210" fill="url(#hl-bloom)" />
              <circle cx="1268" cy="602" r="90" fill="url(#hl-bloom)" />
              <circle cx="928" cy="607" r="140" fill="url(#hl-bloom)" />
              <circle cx="928" cy="607" r="60" fill="url(#hl-bloom)" />
              {/* LED projectors and the far headlight */}
              <circle cx="1236" cy="604" r="24" fill="url(#hl-core)" />
              <circle cx="1298" cy="597" r="24" fill="url(#hl-core)" />
              <ellipse cx="928" cy="608" rx="17" ry="25" fill="url(#hl-core)" />
              {/* Daytime running light strips */}
              <line
                x1="1208"
                y1="636"
                x2="1342"
                y2="613"
                stroke="#dcecff"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.55"
                filter="url(#hl-blur-sm)"
              />
              <line
                x1="1208"
                y1="636"
                x2="1342"
                y2="613"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <line
                x1="1326"
                y1="708"
                x2="1326"
                y2="765"
                stroke="#dcecff"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.55"
                filter="url(#hl-blur-sm)"
              />
              <line
                x1="1326"
                y1="708"
                x2="1326"
                y2="765"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Fog lamps */}
              <circle cx="1255" cy="737" r="46" fill="url(#hl-warm)" opacity="0.8" />
              <circle cx="894" cy="717" r="36" fill="url(#hl-warm)" opacity="0.7" />
            </g>

            {/* Anamorphic flare across the lamps */}
            <g className="hl-flare" filter="url(#hl-blur-sm)">
              <ellipse cx="1268" cy="601" rx="460" ry="4" fill="url(#hl-streak)" />
              <ellipse cx="1268" cy="601" rx="170" ry="9" fill="url(#hl-streak)" opacity="0.6" />
              <ellipse cx="928" cy="607" rx="280" ry="3" fill="url(#hl-streak)" />
            </g>
          </svg>

          {HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              className="hl-hotspot"
              style={{
                left: `${(spot.x / NAT_W) * 100}%`,
                top: `${(spot.y / NAT_H) * 100}%`,
                width: `${(spot.w / NAT_W) * 100}%`,
                height: `${(spot.h / NAT_H) * 100}%`,
              }}
              aria-pressed={latched}
              aria-label={latched ? "Éteindre les phares" : "Allumer les phares"}
              onPointerEnter={(e) => {
                if (e.pointerType === "touch") return;
                setHover(true);
                discovered();
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "touch") setHover(false);
              }}
              onClick={() => {
                setLatched((v) => !v);
                discovered();
              }}
            />
          ))}

          <span
            className="hl-ring"
            style={{ left: `${(1268 / NAT_W) * 100}%`, top: `${(604 / NAT_H) * 100}%` }}
            aria-hidden="true"
          />
          {hint && !on && (
            <span
              className="hl-hint"
              style={{ left: `${(1268 / NAT_W) * 100}%`, top: `${(560 / NAT_H) * 100}%` }}
              aria-hidden="true"
            >
              <Lightbulb />
              <span className="hl-hint-fine">Survolez les phares</span>
              <span className="hl-hint-touch">Touchez les phares</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
