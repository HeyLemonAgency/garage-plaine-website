/** Security headers: netlify.toml, public/_headers and src/lib/security-headers.ts say the same. */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { securityHeaders, withSecurityHeaders } from "@/lib/security-headers";
import { plateforme } from "@/lib/site";

const root = process.cwd();

/** The "/*" block of netlify.toml, as header name -> value. */
function tomlHeaders(): Record<string, string> {
  const text = readFileSync(path.join(root, "netlify.toml"), "utf8");
  const block = text.split("[[headers]]").find((b) => /for\s*=\s*"\/\*"/.test(b)) ?? "";
  const headers: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/^\s*([A-Za-z-]+)\s*=\s*"([^"]*)"\s*$/gm)) {
    if (name !== "for") headers[name!] = value!;
  }
  return headers;
}

/** The "/*" block of public/_headers. */
function fileHeaders(): Record<string, string> {
  const lines = readFileSync(path.join(root, "public/_headers"), "utf8").split("\n");
  const headers: Record<string, string> = {};
  let inBlock = false;
  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      inBlock = line.trim() === "/*";
      continue;
    }
    if (!inBlock) continue;
    const at = line.indexOf(":");
    headers[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return headers;
}

const csp = Object.fromEntries(
  securityHeaders["Content-Security-Policy"]!.split(";").map((d) => {
    const [name, ...values] = d.trim().split(/\s+/);
    return [name!, values];
  }),
) as Record<string, string[]>;

describe("security headers", () => {
  it("netlify.toml, public/_headers and the server send the same headers", () => {
    expect(tomlHeaders()).toEqual(securityHeaders);
    expect(fileHeaders()).toEqual(securityHeaders);
  });

  it("lets the contact form reach the Lemon platform", () => {
    expect(csp["connect-src"]).toContain(new URL(plateforme.plateformeUrl).origin);
  });

  it("stays strict: no eval, no framing, no plugins, no outside scripts or styles", () => {
    expect(csp["default-src"]).toEqual(["'self'"]);
    expect(csp["frame-ancestors"]).toEqual(["'none'"]);
    expect(csp["object-src"]).toEqual(["'none'"]);
    expect(csp["base-uri"]).toEqual(["'self'"]);
    expect(csp["script-src"]).not.toContain("'unsafe-eval'");
    for (const directive of ["script-src", "style-src", "font-src"]) {
      expect(csp[directive]!.filter((s) => /^https?:|^\*$/.test(s))).toEqual([]);
    }
    expect(Number(securityHeaders["Strict-Transport-Security"]!.match(/max-age=(\d+)/)?.[1])).toBe(
      31536000,
    );
  });

  it("adds them to a response without overriding headers it already sets", async () => {
    const response = withSecurityHeaders(
      new Response("ok", { status: 201, headers: { "X-Frame-Options": "SAMEORIGIN" } }),
    );
    expect(response.status).toBe(201);
    expect(await response.text()).toBe("ok");
    expect(response.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(response.headers.get("Content-Security-Policy")).toBe(
      securityHeaders["Content-Security-Policy"],
    );
  });
});
