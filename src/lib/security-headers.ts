// Security headers of every response. Netlify applies netlify.toml and public/_headers only to
// the files it serves itself, not to pages rendered by the server function, so src/server.ts
// sends these same values on every page. A test keeps the three copies identical.
import { plateforme } from "./site";

/** Content-Security-Policy: the site itself, plus what it really loads from elsewhere. */
export const contentSecurityPolicy = [
  "default-src 'self'",
  // Inline scripts carry the page data; three.js decodes the 3D model with WebAssembly.
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  // Autolina serves the stock photos; the 3D viewer reads its textures from blob: URLs.
  "img-src 'self' data: blob: https://www.autolina.ch",
  "font-src 'self'",
  "media-src 'self'",
  // The Lemon platform receives the contact form.
  `connect-src 'self' blob: ${new URL(plateforme.plateformeUrl).origin}`,
  "worker-src 'self' blob:",
  // The Google map (contact, station) and the Autolina stock (vehicules).
  "frame-src https://www.google.com https://www.autolina.ch",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
].join("; ");

export const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": contentSecurityPolicy,
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

/** The same response with the security headers added (headers it already sets win). */
export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
