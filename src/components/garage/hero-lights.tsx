import { useEffect, useRef, useState, type RefObject } from "react";
import { Lightbulb } from "lucide-react";

// Headlight positions in the hero photo (hero-vitara.webp, 1820 × 864 px).
const NAT_W = 1820;
const NAT_H = 864;
// One generous zone over the whole front (both headlamps, the grille, the top of the bumper):
// the pointer finds it without aiming at a lamp. x, y = the CENTRE of the zone (the button is
// centred on it by CSS, translate -50%), in pixels of the photo.
const HOTSPOTS = [{ id: "front", x: 1225, y: 525, w: 430, h: 140 }] as const;
// With a mouse, the lights come on as soon as the pointer comes NEAR the front of the car:
// the whole car and a margin around it (photo pixels), no aiming, no click.
const NEAR = { x0: 900, x1: 1640, y0: 330, y1: 720 } as const;
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
 * Interactive headlights on the hero photo: bring the mouse near the car to switch them on (LED
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

  // the pointer near the front of the car, anywhere over the hero (the text and card included)
  const rectRef = useRef<Rect | null>(null);
  rectRef.current = rect;
  const seenRef = useRef(false);
  useEffect(() => {
    const img = imgRef.current;
    const hero = img?.closest("section");
    if (!img || !hero) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = rectRef.current;
      if (!r) return;
      const box = img.getBoundingClientRect();
      const ix = ((e.clientX - box.left - r.x) / r.w) * NAT_W;
      const iy = ((e.clientY - box.top - r.y) / r.h) * NAT_H;
      const near = ix >= NEAR.x0 && ix <= NEAR.x1 && iy >= NEAR.y0 && iy <= NEAR.y1;
      setHover(near);
      if (near && !seenRef.current) {
        seenRef.current = true;
        discovered();
      }
    };
    const onLeave = () => setHover(false);
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, [imgRef]);

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

            {/* Light thrown on the road in front of the car (coordinates: hero-vitara.webp) */}
            <g className="hl-beams" filter="url(#hl-blur-lg)">
              <ellipse cx="900" cy="790" rx="520" ry="80" fill="url(#hl-pool)" />
              <ellipse cx="1120" cy="725" rx="230" ry="34" fill="url(#hl-pool)" />
            </g>

            <g className="hl-glow">
              {/* Bloom */}
              <circle cx="1325" cy="512" r="118" fill="url(#hl-bloom)" />
              <circle cx="1325" cy="512" r="50" fill="url(#hl-bloom)" />
              <circle cx="1080" cy="515" r="80" fill="url(#hl-bloom)" />
              <circle cx="1080" cy="515" r="34" fill="url(#hl-bloom)" />
              {/* LED projectors and the far headlight */}
              <circle cx="1310" cy="512" r="13" fill="url(#hl-core)" />
              <circle cx="1345" cy="508" r="13" fill="url(#hl-core)" />
              <ellipse cx="1080" cy="515" rx="11" ry="14" fill="url(#hl-core)" />
              {/* Daytime running light strips */}
              <line
                x1="1276"
                y1="534"
                x2="1366"
                y2="513"
                stroke="#dcecff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.55"
                filter="url(#hl-blur-sm)"
              />
              <line
                x1="1276"
                y1="534"
                x2="1366"
                y2="513"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="1360"
                y1="572"
                x2="1360"
                y2="597"
                stroke="#dcecff"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.55"
                filter="url(#hl-blur-sm)"
              />
              <line
                x1="1360"
                y1="572"
                x2="1360"
                y2="597"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Fog lamps */}
              <circle cx="1325" cy="592" r="26" fill="url(#hl-warm)" opacity="0.8" />
              <circle cx="1057" cy="582" r="20" fill="url(#hl-warm)" opacity="0.7" />
            </g>

            {/* Anamorphic flare across the lamps */}
            <g className="hl-flare" filter="url(#hl-blur-sm)">
              <ellipse cx="1325" cy="512" rx="260" ry="3" fill="url(#hl-streak)" />
              <ellipse cx="1325" cy="512" rx="95" ry="6" fill="url(#hl-streak)" opacity="0.6" />
              <ellipse cx="1080" cy="515" rx="150" ry="2.5" fill="url(#hl-streak)" />
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
              onClick={() => {
                setLatched((v) => !v);
                discovered();
              }}
            />
          ))}

          <span
            className="hl-ring"
            style={{ left: `${(1325 / NAT_W) * 100}%`, top: `${(516 / NAT_H) * 100}%` }}
            aria-hidden="true"
          />
          {hint && !on && (
            <span
              className="hl-hint"
              style={{ left: `${(1325 / NAT_W) * 100}%`, top: `${(480 / NAT_H) * 100}%` }}
              aria-hidden="true"
            >
              <Lightbulb />
              <span className="hl-hint-fine">Approchez la voiture</span>
              <span className="hl-hint-touch">Touchez les phares</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
