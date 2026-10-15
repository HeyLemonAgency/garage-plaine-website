// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Netlify sets URL to the site's main address (its custom domain once connected); canonical
// links, the sitemap and structured data use it (see src/lib/site.ts).
const siteUrl = process.env["URL"] || "https://garage-plaine.netlify.app";

export default defineConfig({
  vite: {
    define: {
      __SITE_URL__: JSON.stringify(siteUrl),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    },
  },
  // The site is hosted on Netlify: nitro emits the client to dist/ and the SSR
  // handler to .netlify/functions-internal/server (see netlify.toml).
  nitro: { preset: "netlify" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
