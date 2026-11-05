import { createServerFn } from "@tanstack/react-start";
import { googleProfile } from "./garage";

// The garage's Google rating and number of reviews, read from the Places API on the server
// (the key never reaches the browser), at most every 12 hours per warm instance; the pages
// that show it are also cached by Netlify's CDN. Only the two figures are asked for: review
// texts would move every call to Google's most expensive tier, and the reviews shown on the
// site are chosen with the garage (googleReviews in garage.ts).
// Netlify environment: GOOGLE_PLACES_API_KEY (required for live figures), GOOGLE_PLACE_ID
// (optional; without it, a text search finds the garage by name and address).

export type GoogleRating = { rating: number; count: number; live: boolean };

export const fallbackRating: GoogleRating = {
  rating: googleProfile.rating,
  count: googleProfile.count,
  live: false,
};

type Fetch = typeof fetch;

/** One reading from Google; throws when the answer is not a plausible rating for the garage. */
export async function readGoogleRating(
  key: string,
  placeId: string | undefined,
  fetchImpl: Fetch = fetch,
): Promise<GoogleRating> {
  const headers = { "X-Goog-Api-Key": key, "Content-Type": "application/json" };
  const signal = AbortSignal.timeout(3000);
  const res = placeId
    ? await fetchImpl(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=fr`,
        {
          headers: { ...headers, "X-Goog-FieldMask": "displayName,rating,userRatingCount" },
          signal,
        },
      )
    : await fetchImpl("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          ...headers,
          "X-Goog-FieldMask": "places.displayName,places.rating,places.userRatingCount",
        },
        body: JSON.stringify({ textQuery: googleProfile.query, languageCode: "fr", pageSize: 1 }),
        signal,
      });
  if (!res.ok) throw new Error(`Google Places answered ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const place = (placeId ? data : (data["places"] as unknown[] | undefined)?.[0]) as
    { displayName?: { text?: string }; rating?: unknown; userRatingCount?: unknown } | undefined;
  // A text search could return a neighbour: only accept the garage itself.
  if (!/plaine/i.test(place?.displayName?.text ?? "")) throw new Error("Not the garage's profile");
  const rating = Number(place?.rating);
  const count = Number(place?.userRatingCount);
  if (!(rating >= 1 && rating <= 5) || !Number.isInteger(count) || count < 1) {
    throw new Error("No rating in Google's answer");
  }
  return { rating: Math.round(rating * 10) / 10, count, live: true };
}

const TTL_MS = 12 * 60 * 60 * 1000;
let cache: { at: number; data: GoogleRating } | undefined;

export const getGoogleRating = createServerFn({ method: "GET" }).handler(
  async (): Promise<GoogleRating> => {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
    const key = process.env["GOOGLE_PLACES_API_KEY"];
    if (!key) return cache?.data ?? fallbackRating;
    try {
      const data = await readGoogleRating(key, process.env["GOOGLE_PLACE_ID"] || undefined);
      cache = { at: Date.now(), data };
      return data;
    } catch (error) {
      console.error("Google rating unavailable:", error);
      return cache?.data ?? fallbackRating;
    }
  },
);
