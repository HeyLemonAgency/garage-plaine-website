// Animated service icons. Each one acts out its trade when its card is hovered, focused,
// or (on touch screens) scrolled into view: the key turns, the spray can is shaken, the
// wrench tightens its nut. Only the object moves; line style matches the lucide icons.

/** Key: slides into the lock and turns on its own axis. */
export function KeyIcon() {
  return (
    <svg className="ico ico-key" viewBox="0 0 64 48" aria-hidden="true">
      <g className="k-insert">
        <g className="k-turn">
          <circle cx="16" cy="24" r="7.5" />
          <circle cx="16" cy="24" r="2.4" />
          <path d="M23.5 24H50M43 24v5.5M48 24v4M37 24v3.2" />
        </g>
      </g>
    </svg>
  );
}

/** Spray can: a quick shake before use, then the nozzle is pressed. */
export function SprayIcon() {
  return (
    <svg className="ico ico-spray" viewBox="0 0 64 48" aria-hidden="true">
      <g className="s-can">
        <rect x="11" y="17" width="15" height="26" rx="3.5" />
        <path d="M11 25h15M11 35h15" />
        <path d="M14.5 17v-3.5h8V17" />
        <g className="s-cap">
          <rect x="16.5" y="8.5" width="5" height="5" rx="1" />
          <path d="M21.5 10.8h2.2" />
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

/** Ring wrench on a nut: turns it clockwise and snugs it tight. */
export function WrenchIcon() {
  return (
    <svg className="ico ico-wrench" viewBox="0 0 64 48" aria-hidden="true">
      <g className="w-turn">
        <polygon points={hexagon(18, 30, 6.2)} />
        <circle cx="18" cy="30" r="2.1" />
        <circle cx="18" cy="30" r="10" />
        <path d="M23.4 22.1L44.8 5.7a3.2 3.2 0 0 1 3.8 5.1L27.2 27.1" />
      </g>
    </svg>
  );
}

export const serviceIcons = { key: KeyIcon, spray: SprayIcon, wrench: WrenchIcon };
