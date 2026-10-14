// Animated service icons. Each one acts out its trade when its card is hovered, focused,
// or (on touch screens) scrolled into view: the key starts the engine, the spray can
// paints, the wrench tightens a nut. Line style matches the lucide icons used elsewhere.

/** Key in the ignition: turns, the rev ring around it spins up, the engine catches. */
export function KeyIcon() {
  return (
    <svg className="ico ico-key" viewBox="0 0 64 48" aria-hidden="true">
      {/* Rev ring: invisible at rest, fills like a tachometer when the key turns */}
      <circle className="k-ring-track" cx="16" cy="24" r="13" pathLength="100" />
      <circle className="k-ring" cx="16" cy="24" r="13" pathLength="100" />
      <g className="k-key">
        <circle cx="16" cy="24" r="7.5" />
        <circle cx="16" cy="24" r="2.4" />
        <path d="M23.5 24H50M43 24v5.5M48 24v4M37 24v3.2" />
      </g>
      <g className="k-sparks">
        <path d="M30 13.5l2.6-3.4" />
        <path d="M34.5 16.5l3.6-1.8" />
        <path d="M25.5 11.5l.6-4" />
      </g>
    </svg>
  );
}

/** Spray can: tilts, presses the nozzle, mists, and paints a red stroke across the card. */
export function SprayIcon() {
  return (
    <svg className="ico ico-spray" viewBox="0 0 64 48" aria-hidden="true">
      <defs>
        <filter id="spray-soft" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <path
        className="s-paint s-paint-soft"
        d="M30 40c8-7 14 1 22-5s14-1 22-7 12 0 20-6 10 1 18-4"
        pathLength="100"
        filter="url(#spray-soft)"
      />
      <path
        className="s-paint"
        d="M30 40c8-7 14 1 22-5s14-1 22-7 12 0 20-6 10 1 18-4"
        pathLength="100"
      />
      <g className="s-can">
        <rect x="11" y="17" width="15" height="26" rx="3.5" />
        <path d="M11 25h15M11 35h15" />
        <path d="M14.5 17v-3.5h8V17" />
        <g className="s-cap">
          <rect x="16.5" y="8.5" width="5" height="5" rx="1" />
          <path d="M21.5 10.8h2.2" />
        </g>
        <g className="s-mist">
          <circle cx="24.5" cy="10.8" r="1.1" />
          <circle cx="24.5" cy="10.8" r="0.9" />
          <circle cx="24.5" cy="10.8" r="1.3" />
          <circle cx="24.5" cy="10.8" r="0.8" />
          <circle cx="24.5" cy="10.8" r="1" />
          <circle cx="24.5" cy="10.8" r="1.2" />
        </g>
      </g>
    </svg>
  );
}

const hexagon = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

/** Ring wrench on a nut: two ratchet strokes tighten it, then the torque ticks flash. */
export function WrenchIcon() {
  return (
    <svg className="ico ico-wrench" viewBox="0 0 64 48" aria-hidden="true">
      <g className="w-nut">
        <polygon points={hexagon(18, 30, 6.2)} />
        <circle cx="18" cy="30" r="2.1" />
      </g>
      <g className="w-wrench">
        <circle cx="18" cy="30" r="10" />
        <path d="M23.4 22.1L44.8 5.7a3.2 3.2 0 0 1 3.8 5.1L27.2 27.1" />
      </g>
      <g className="w-torque">
        <path d="M6 18.5l-3-3" />
        <path d="M4.2 26.5H0" />
        <path d="M11 14.2l-1.4-4" />
      </g>
      <path className="w-check" d="M40 32.5l3.5 3.5 7-7.5" pathLength="1" />
    </svg>
  );
}

export const serviceIcons = { key: KeyIcon, spray: SprayIcon, wrench: WrenchIcon };
