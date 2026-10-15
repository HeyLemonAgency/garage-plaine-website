import { useCallback, useEffect, useRef, useState } from "react";
import { listingPhoto, type StockCar } from "@/lib/autolina";
import { useSelection } from "@/hooks/use-selection";

export const FILTERS: { id: string; label: string; test: (car: StockCar) => boolean }[] = [
  { id: "all", label: "Toutes", test: () => true },
  { id: "suzuki", label: "Suzuki", test: (c) => c.make === "Suzuki" },
  { id: "new", label: "Neuves", test: (c) => c.isNew },
  { id: "hybrid", label: "Hybrides", test: (c) => /hybride|électri|electri/i.test(c.fuel ?? "") },
  { id: "auto", label: "Automatiques", test: (c) => /automatique/i.test(c.gearbox ?? "") },
  {
    id: "budget",
    label: "Moins de CHF 20’000",
    test: (c) => c.priceValue !== null && c.priceValue < 20000,
  },
];

export const SORTS: {
  id: string;
  label: string;
  compare?: (a: StockCar, b: StockCar) => number;
}[] = [
  { id: "recent", label: "Plus récentes" },
  {
    id: "price-asc",
    label: "Prix croissant",
    compare: (a, b) => (a.priceValue ?? Infinity) - (b.priceValue ?? Infinity),
  },
  {
    id: "price-desc",
    label: "Prix décroissant",
    compare: (a, b) => (b.priceValue ?? -Infinity) - (a.priceValue ?? -Infinity),
  },
  { id: "km", label: "Kilométrage", compare: (a, b) => km(a) - km(b) },
];
const km = (car: StockCar) => (car.mileage ? Number(car.mileage.replace(/\D/g, "")) : Infinity);
const MAX_PHOTOS = 6;

/**
 * A listing's photos: the first comes with the stock page; the next ones are fetched the
 * first time the visitor shows interest, and kept only if they load.
 */
export function useGallery(image: string | null) {
  const [photos, setPhotos] = useState<string[]>(image ? [image] : []);
  const probed = useRef(false);
  const probe = useCallback(() => {
    if (probed.current || !image) return;
    probed.current = true;
    let n = 2;
    const next = () => {
      if (n > MAX_PHOTOS) return;
      const url = listingPhoto(image, n++);
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.onload = () => {
        setPhotos((prev) => [...prev, url]);
        next();
      };
      img.src = url;
    };
    next();
  }, [image]);

  // Which photo is shown, and a tap-to-advance that waits for the second photo on first use.
  const [index, setIndex] = useState(0);
  const pending = useRef(false);
  useEffect(() => {
    if (pending.current && photos.length > 1) {
      pending.current = false;
      setIndex(1);
    }
  }, [photos.length]);
  const advance = useCallback(() => {
    if (photos.length > 1) setIndex((i) => (i + 1) % photos.length);
    else {
      pending.current = true;
      probe();
    }
  }, [photos.length, probe]);

  return { photos, probe, index, setIndex, advance };
}

/** Filters, sort order and the visitor's selection, shared by the stock carousels. */
export function useStockView(cars: StockCar[]) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const { paths: saved, toggle } = useSelection();

  const savedHere = cars.filter((c) => saved.includes(c.path));
  const filters = [
    ...FILTERS.map((f) => ({ ...f, count: cars.filter(f.test).length })).filter(
      (f) => f.id === "all" || (f.count > 0 && f.count < cars.length),
    ),
    ...(savedHere.length > 0
      ? [{ id: "saved", label: "Ma sélection", test: () => true, count: savedHere.length }]
      : []),
  ];
  const active = filter === "saved" && savedHere.length === 0 ? "all" : filter;
  const filtered =
    active === "saved"
      ? savedHere
      : cars.filter(FILTERS.find((f) => f.id === active)?.test ?? (() => true));
  const compare = SORTS.find((s) => s.id === sort)?.compare;
  const shown = compare ? [...filtered].sort(compare) : filtered;

  return { filters, filter: active, setFilter, sort, setSort, shown, saved, toggle, savedHere };
}

export type StockView = ReturnType<typeof useStockView>;
