import { createFileRoute } from "@tanstack/react-router";
import { sitemapXml, textResponse } from "@/lib/site-files";

export const Route = createFileRoute("/sitemap.xml")({
  server: { handlers: { GET: () => textResponse(sitemapXml(), "application/xml") } },
});
