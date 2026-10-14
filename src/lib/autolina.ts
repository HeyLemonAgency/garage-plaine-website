// Reads the dealer's public Autolina listing page (the same page the stock iframe shows)
// into a few preview cards. Autolina stays the only source of stock data: nothing is
// stored, and if the markup changes the parser returns no cars and the site falls back
// to a plain link to the full stock.

export const AUTOLINA_ORIGIN = "https://www.autolina.ch";
const IFRAME_QUERY =
  "border=000000&buttons=f11c27&buttonsText=ffffff&footer=block&garantieFilter=none&icon=f11c27&links=000000&text=000000";

export type StockCar = {
  id: string;
  /** Listing path inside Autolina's iframe app, e.g. /fr/iframe/auto/audi-a4/5152798 */
  path: string;
  make: string;
  model: string;
  title: string;
  price: string | null;
  /** Price in CHF, for filtering; null when the listing shows no price. */
  priceValue: number | null;
  isNew: boolean;
  year: string | null;
  mileage: string | null;
  fuel: string | null;
  gearbox: string | null;
  image: string | null;
};

export type StockSnapshot = { total: number | null; cars: StockCar[] };

const LISTING_PATH = /^\/fr\/iframe\/auto\/[a-z0-9.-]+\/\d+$/;

export function isListingPath(path: string): boolean {
  return LISTING_PATH.test(path);
}

/** Autolina iframe URL for one listing, or null if the path is not a listing path. */
export function listingFrameUrl(path: string): string | null {
  return isListingPath(path) ? `${AUTOLINA_ORIGIN}${path}?${IFRAME_QUERY}` : null;
}

const entities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decode(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n =
        code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return entities[code.toLowerCase()] ?? match;
  });
}

function textOf(html: string): string {
  return decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function spans(html: string): string[] {
  return [...html.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/g)].map((m) => textOf(m[1] ?? ""));
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? decode(m[1] ?? "") : null;
}

/** "MERCEDES-BENZ" -> "Mercedes-Benz"; short acronyms such as BMW stay as they are. */
export function formatMake(make: string): string {
  if (make.length <= 3) return make.toUpperCase();
  return make.toLowerCase().replace(/(^|[\s-])\p{L}/gu, (c) => c.toUpperCase());
}

/** Dealer titles often append equipment after " * " or " - "; keep the model part. */
export function shortModel(title: string): string {
  const cut = title.split(/\s+[*–-]\s+|\s\*/)[0] ?? title;
  return cut.replace(/\s*\*+\s*$/, "").trim() || title.trim();
}

function parseRow(row: string): StockCar | null {
  const href = row.match(/href="(\/fr\/iframe\/auto\/[^"?]+)/)?.[1];
  if (!href || !isListingPath(href)) return null;
  const id = href.split("/").pop() ?? "";

  const makeModel = row.match(/class="make-model[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  const [rawMake = "", rawTitle = ""] = makeModel ? spans(makeModel) : [];
  if (!rawMake) return null;

  // `class="price ..."`, not the wrapping `price-container`.
  const priceHtml = row.match(/class="price[\s"][^>]*>([\s\S]*?)<\/div>/)?.[1];
  const priceText = priceHtml ? textOf(priceHtml) : "";
  const price = /\d/.test(priceText) ? priceText.replace(/'/g, "’") : null;
  const priceValue = price ? Number(price.replace(/\D/g, "")) || null : null;

  const dataHtml =
    row.match(
      /class="vehicle-data[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<div[^>]*class="bottom-row/,
    )?.[1] ?? "";
  const data = dataHtml
    .split(/<div\b[^>]*>/)
    .map(textOf)
    .filter(Boolean);
  const isNew = data.some((d) => /voiture nouvelle|neuf/i.test(d));
  const year = data.find((d) => /^\d{4}$/.test(d)) ?? null;
  const mileage = data.find((d) => /km$/i.test(d)) ?? null;
  const gearbox = data.find((d) => /manuelle|automatique/i.test(d)) ?? null;
  const fuel =
    data.find((d) => /essence|diesel|électri|electri|hybride|gaz|hydrog/i.test(d)) ?? null;

  const imgTag = row.match(/<img\b[^>]*class="[^"]*first-img[^"]*"[^>]*>/)?.[0];
  let image = imgTag ? attr(imgTag, "src") : null;
  if (image && !image.startsWith(`${AUTOLINA_ORIGIN}/`)) image = null;
  // Ask Autolina's image service for the larger size it already offers in its srcset.
  if (image) image = image.replace("w=300&h=225", "w=534&h=401").concat("&q=80");

  return {
    id,
    path: href,
    make: formatMake(rawMake),
    model: shortModel(rawTitle),
    title: rawTitle,
    price,
    priceValue,
    isNew,
    year,
    mileage: mileage?.replace(/'/g, "’").replace(/\s*km$/i, " km") ?? null,
    fuel,
    gearbox,
    image,
  };
}

export function parseStock(html: string, limit = 4): StockSnapshot {
  const totalMatch = html.match(/de\s*<b[^>]*>\s*(\d+)\s*Voitures?/i);
  const total = totalMatch ? Number(totalMatch[1]) : null;
  const cars: StockCar[] = [];
  for (const row of html.split(/<app-car-row\b/).slice(1)) {
    const car = parseRow(row);
    if (car && !cars.some((c) => c.id === car.id)) cars.push(car);
    if (cars.length >= limit) break;
  }
  return { total, cars };
}
