/** robots.txt, llms.txt and the test version's noindex, decided by the address asked. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { faqs, garage, suzukiYears } from "@/lib/garage";
import { llmsTxt, robotsTxt } from "@/lib/site-files";
import { isTestHost, requestHost, withRobotsTag } from "@/lib/site";

describe("test version (*.netlify.app) and the garage's own domain", () => {
  it("treats every Netlify address as the test version, and nothing else", () => {
    for (const host of [
      "garage-plaine.netlify.app",
      "GARAGE-PLAINE.NETLIFY.APP",
      "garage-plaine.netlify.app:443",
      "deploy-preview-12--garage-plaine.netlify.app",
      "6915a1b2c3d4e5f6--garage-plaine.netlify.app",
    ])
      expect(isTestHost(host), host).toBe(true);
    for (const host of [
      "garageplaine.ch",
      "www.garageplaine.ch",
      "localhost:5173",
      "notnetlify.app",
      "netlify.app.example.ch",
      "",
      null,
      undefined,
    ])
      expect(isTestHost(host), String(host)).toBe(false);
  });

  it("reads the address from the Host header, else from the URL", () => {
    expect(requestHost(new Request("https://garage-plaine.netlify.app/atelier"))).toBe(
      "garage-plaine.netlify.app",
    );
    expect(
      requestHost(
        new Request("https://garage-plaine.netlify.app/", { headers: { host: "garageplaine.ch" } }),
      ),
    ).toBe("garageplaine.ch");
  });

  it("answers noindex on the test version only", async () => {
    const page = () => new Response("<html></html>", { status: 200 });
    const test = withRobotsTag(page(), new Request("https://garage-plaine.netlify.app/vehicules"));
    expect(test.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(test.status).toBe(200);
    expect(await test.text()).toBe("<html></html>");

    for (const url of ["https://garageplaine.ch/", "https://www.garageplaine.ch/atelier"]) {
      expect(withRobotsTag(page(), new Request(url)).headers.has("X-Robots-Tag"), url).toBe(false);
    }
  });

  it("robots.txt: the garage's domain is open and gives its sitemap", () => {
    const text = robotsTxt("garageplaine.ch");
    expect(text).toContain("User-agent: *\nAllow: /");
    expect(text).toMatch(/^Sitemap: https:\/\/.+\/sitemap\.xml$/m);
    expect(text).not.toContain("Disallow");
  });

  it("robots.txt: the test version gives no sitemap and keeps its pages crawlable", () => {
    const text = robotsTxt("garage-plaine.netlify.app");
    expect(text).not.toContain("Sitemap:");
    // Crawlable on purpose: a blocked page could stay in Google, its noindex unseen.
    expect(text).toContain("User-agent: *\nAllow: /");
    expect(text).toContain("User-agent: Googlebot-Image\nDisallow: /");
    expect(text).toContain("noindex");
  });
});

describe("Suzuki partnership: 30 years, said the same everywhere", () => {
  it("is 30 years", () => {
    expect(suzukiYears).toBe(30);
  });

  it("says « 30 ans » in the summary, the FAQ and llms.txt", () => {
    expect(garage.summary).toContain("Concessionnaire Suzuki depuis 30 ans");
    expect(faqs.home.map((f) => f.a).join(" ")).toContain("concessionnaire Suzuki depuis 30 ans");
    expect(llmsTxt()).toContain("concessionnaire depuis 30 ans");
  });

  it("no page still says « plus de 20 ans » or « 20+ »", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const file = path.join(dir, name);
        if (statSync(file).isDirectory()) {
          if (name !== "test") walk(file);
        } else if (/\.(ts|tsx)$/.test(name)) files.push(file);
      }
    };
    walk(path.join(process.cwd(), "src"));
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/plus de 20\sans/);
      expect(text, file).not.toMatch(/value: 20, suffix: "\+"/);
    }
  });
});
