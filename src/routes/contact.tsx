import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/garage/sections";
import { ContactSection, Location } from "@/components/garage/contact";
import { TeamGrid } from "@/components/garage/people";
import { departments, pageHead, type DepartmentId } from "@/lib/garage";

type ContactSearch = { demande?: DepartmentId };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => {
    const demande = departments.find((d) => d.id === search["demande"])?.id;
    return demande ? { demande } : {};
  },
  head: () =>
    pageHead(
      "Contact et horaires",
      "Contactez le Garage de la Plaine au 021 801 68 42 ou le service vente au 079 108 92 99. Route de la Plaine 20, 1026 Denges. Horaires et itinéraire.",
    ),
  component: Contact,
});

function Contact() {
  const { demande } = Route.useSearch();
  return (
    <>
      <PageIntro
        label="Contact"
        title="Nous sommes à votre écoute."
        description="Pour une voiture, un rendez-vous ou un conseil : contactez directement la bonne personne, ou venez nous rencontrer à Denges."
      />
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Vos interlocuteurs</div>
              <h2>Un contact pour chaque métier.</h2>
            </div>
          </div>
          <TeamGrid />
        </div>
      </section>
      <ContactSection {...(demande ? { defaultTopic: demande } : {})} />
      <Location />
    </>
  );
}
