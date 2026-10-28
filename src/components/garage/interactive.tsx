import { useEffect, useRef, useState } from "react";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Counts up to `value` the first time it scrolls into view. Server-rendered at its final value. */
export function CountUp({
  value,
  suffix = "",
  duration = 1400,
  format = String,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !("IntersectionObserver" in window)) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          // The first frame's timestamp can be slightly before `start`.
          const p = Math.min(1, Math.max(0, (now - start) / duration));
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        setShown(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);
  return (
    <span ref={ref} className="count-up">
      {format(shown)}
      {suffix}
    </span>
  );
}
