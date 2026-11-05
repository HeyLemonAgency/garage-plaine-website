import { describe, expect, it, vi } from "vitest";
import { readGoogleRating } from "@/lib/google-rating.functions";

const answer = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const garage = { displayName: { text: "Garage Carrosserie de la Plaine" } };

describe("Google rating", () => {
  it("reads rating and count by place ID, asking for nothing else", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(answer(200, { ...garage, rating: 4.46, userRatingCount: 86 }));
    expect(await readGoogleRating("k", "ChIJabc", fetch)).toEqual({
      rating: 4.5,
      count: 86,
      live: true,
    });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://places.googleapis.com/v1/places/ChIJabc?languageCode=fr");
    expect(init.headers["X-Goog-FieldMask"]).toBe("displayName,rating,userRatingCount");
    expect(init.headers["X-Goog-Api-Key"]).toBe("k");
  });

  it("finds the garage by name and address without a place ID", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        answer(200, { places: [{ ...garage, rating: 4.5, userRatingCount: 85 }] }),
      );
    expect(await readGoogleRating("k", undefined, fetch)).toEqual({
      rating: 4.5,
      count: 85,
      live: true,
    });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://places.googleapis.com/v1/places:searchText");
    expect(JSON.parse(init.body).textQuery).toMatch(/Garage Carrosserie de la Plaine/);
  });

  it("refuses a neighbour, an error or an answer without figures", async () => {
    const other = {
      places: [{ displayName: { text: "Carrosserie Benli" }, rating: 5, userRatingCount: 3 }],
    };
    await expect(
      readGoogleRating("k", undefined, vi.fn().mockResolvedValue(answer(200, other))),
    ).rejects.toThrow(/garage/);
    await expect(
      readGoogleRating("k", "x", vi.fn().mockResolvedValue(answer(403, {}))),
    ).rejects.toThrow(/403/);
    await expect(
      readGoogleRating("k", "x", vi.fn().mockResolvedValue(answer(200, garage))),
    ).rejects.toThrow(/rating/);
  });
});
