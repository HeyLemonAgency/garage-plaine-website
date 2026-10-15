import { describe, expect, it } from "vitest";
import { legacyRedirect } from "@/lib/legacy-urls";

describe("legacyRedirect", () => {
  it("sends the old website's pages to their new home", () => {
    expect(legacyRedirect("/entreprise/atelier-mecanique")).toBe("/services#mecanique");
    expect(legacyRedirect("/entreprise/pompe-a-essence")).toBe("/station-service");
    expect(legacyRedirect("/contact/nous-achetons-votre-vehicule")).toBe("/reprise");
    expect(legacyRedirect("/vehicules/gamme-suzuki")).toBe("/suzuki");
  });

  it("strips Joomla prefixes, extensions and trailing slashes", () => {
    expect(legacyRedirect("/index.php/contact/horaires")).toBe("/contact");
    expect(legacyRedirect("/index.php")).toBe("/");
    expect(legacyRedirect("/wir/")).toBe("/wir");
    expect(legacyRedirect("/Contact")).toBe("/contact");
  });

  it("leaves current pages and unknown addresses alone", () => {
    expect(legacyRedirect("/")).toBeNull();
    expect(legacyRedirect("/services")).toBeNull();
    expect(legacyRedirect("/sitemap.xml")).toBeNull();
    expect(legacyRedirect("/assets/app.js")).toBeNull();
    expect(legacyRedirect("/nimporte-quoi")).toBeNull();
  });
});
