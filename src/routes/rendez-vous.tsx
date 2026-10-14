import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/garage/sections";
import { AppointmentPlanner } from "@/components/garage/appointment";
import { OpenStatus } from "@/components/garage/people";
import { pageHead } from "@/lib/garage";
import { isTopicId, type TopicId } from "@/lib/appointment";
import { isListingPath } from "@/lib/autolina";

type RendezVousSearch = { besoin?: TopicId; annonce?: string };

export const Route = createFileRoute("/rendez-vous")({
  validateSearch: (search: Record<string, unknown>): RendezVousSearch => {
    const besoin = search["besoin"];
    const annonce = search["annonce"];
    return {
      ...(isTopicId(besoin) ? { besoin } : {}),
      ...(typeof annonce === "string" && isListingPath(annonce) ? { annonce } : {}),
    };
  },
  head: () =>
    pageHead(
      "Demander un rendez-vous",
      "Demandez un rendez-vous à l’atelier, à la carrosserie ou au service vente du Garage de la Plaine à Denges, en quatre étapes.",
    ),
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
  const { besoin, annonce } = Route.useSearch();
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
              : annonce
                ? { initialTopic: "vente" as const }
                : {})}
            {...(annonce ? { initialVehicle: listingLabel(annonce) } : {})}
          />
        </div>
      </section>
    </>
  );
}
