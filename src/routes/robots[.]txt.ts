import { createFileRoute } from "@tanstack/react-router";
import { robotsTxt, textResponse } from "@/lib/site-files";
import { requestHost } from "@/lib/site";

// Answers for the address it is asked on: the test version (*.netlify.app) is not indexed.
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: { GET: ({ request }) => textResponse(robotsTxt(requestHost(request)), "text/plain") },
  },
});
