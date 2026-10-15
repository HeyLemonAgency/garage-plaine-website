import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/garage/sections";
import { AppointmentPlanner } from "@/components/garage/appointment";
import { OpenStatus } from "@/components/garage/people";
import { pageHead } from "@/lib/seo";
import { isTopicId, type TopicId } from "@/lib/appointment";
import { isListingPath } from "@/lib/autolina";

type RendezVousSearch = { besoin?: TopicId; annonce?: string; selection?: string };

export const Route = createFileRoute("/rendez-vous")({
  validateSearch: (search: Record<string, unknown>): RendezVousSearch => {
    const besoin = search["besoin"];
    const annonce = search["annonce"];
    // "Ma sélection": several listings, comma-separated; anything else is dropped.
    const selection =
      typeof search["selection"] === "string"
        ? search["selection"].split(",").filter(isListingPath).slice(0, 6).join(",")
        : "";
    return {
      ...(isTopicId(besoin) ? { besoin } : {}),
      ...(typeof annonce === "string" && isListingPath(annonce) ? { annonce } : {}),
      ...(selection ? { selection } : {}),
    };
  },
  head: () =>
    pageHead({
      path: "/rendez-vous",
      title: "Rendez-vous atelier, carrosserie ou essai",
      crumb: "Rendez-vous",
      description:
        "Demandez en ligne un rendez-vous à l’atelier, à la carrosserie ou un essai au service vente du Garage de la Plaine à Denges ; le garage vous confirme.",
    }),
  component: RendezVous,
});

/** "/fr/iframe/auto/audi-a4/5152798" -> "Annonce Autolina n° 5152798 (Audi A4)". */
function listingLabel(path: string): string {
  const [, , , , slug = "", id = ""] = path.split("/");
  const name = slug
    .split("-")
    .filter(Boolean)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0]?.toUpperCase() + w.slice(1)))
    .join(" ");
  return `Annonce Autolina n° ${id}${name ? ` (${name})` : ""}`;
}

function RendezVous() {
  const { besoin, annonce, selection } = Route.useSearch();
  const listings = selection ? selection.split(",") : annonce ? [annonce] : [];
  return (
    <>
      <PageIntro
        label="Rendez-vous"
        title="Votre rendez-vous, en quatre étapes."
        description="Dites-nous ce dont vous avez besoin et quand cela vous arrange. La bonne personne vous confirme le rendez-vous."
      >
        <OpenStatus className="intro-status" />
      </PageIntro>
      <section className="section planner-section">
        <div className="container">
          <AppointmentPlanner
            {...(besoin
              ? { initialTopic: besoin }
              : listings.length
                ? { initialTopic: "vente" as const }
                : {})}
            {...(listings.length ? { initialVehicle: listings.map(listingLabel).join(" ; ") } : {})}
            {...(listings.length && (besoin ?? "vente") === "vente"
              ? { initialNeed: "Essai sur route" }
              : {})}
          />
        </div>
      </section>
    </>
  );
}
