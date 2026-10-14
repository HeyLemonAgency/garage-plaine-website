import { createServerFn } from "@tanstack/react-start";
import { garage } from "./garage";
import { parseStock, type StockSnapshot } from "./autolina";

// Warm function instances reuse the last good snapshot; the CDN cache in front of the
// pages (see __root.tsx) keeps Autolina requests to a handful per hour.
const TTL_MS = 10 * 60 * 1000;
let cache: { at: number; data: StockSnapshot } | undefined;

export const getLatestCars = createServerFn({ method: "GET" }).handler(
  async (): Promise<StockSnapshot> => {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
    try {
      const res = await fetch(garage.inventory, {
        headers: { "accept-language": "fr-CH,fr;q=0.9" },
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) throw new Error(`Autolina answered ${res.status}`);
      const data = parseStock(await res.text());
      if (data.cars.length > 0) cache = { at: Date.now(), data };
      return data;
    } catch (error) {
      console.error("Autolina stock preview unavailable:", error);
      return cache?.data ?? { total: null, cars: [] };
    }
  },
);
