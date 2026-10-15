import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/garage/sections";
import { ContactSection, Location } from "@/components/garage/contact";
import { TeamGrid } from "@/components/garage/people";
import { departments, type DepartmentId, faqs } from "@/lib/garage";
import { pageHead } from "@/lib/seo";
import { FaqSection } from "@/components/garage/faq";

type ContactSearch = { demande?: DepartmentId };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => {
    const demande = departments.find((d) => d.id === search["demande"])?.id;
    return demande ? { demande } : {};
  },
  head: () =>
    pageHead({
      path: "/contact",
      title: "Contact, horaires et accès à Denges",
      crumb: "Contact",
      description:
        "Garage de la Plaine, Route de la Plaine 20, 1026 Denges : 021 801 68 42, vente 079 108 92 99. Horaires d’ouverture, itinéraire et contacts par service.",
      type: "ContactPage",
      faqs: faqs.contact,
    }),
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
      <FaqSection
        items={faqs.contact}
        title="Avant de nous appeler."
        intro="Samedi, interlocuteurs par service et paiement en WIR."
      />
    </>
  );
}
