import { createFileRoute } from "@tanstack/react-router";
import { robotsTxt, textResponse } from "@/lib/site-files";

export const Route = createFileRoute("/robots.txt")({
  server: { handlers: { GET: () => textResponse(robotsTxt(), "text/plain") } },
});
