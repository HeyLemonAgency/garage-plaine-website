import { createFileRoute } from "@tanstack/react-router";
import { llmsTxt, textResponse } from "@/lib/site-files";

export const Route = createFileRoute("/llms.txt")({
  server: { handlers: { GET: () => textResponse(llmsTxt(), "text/markdown") } },
});
