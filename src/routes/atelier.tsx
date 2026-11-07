import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, illustrations } from "@/components/garage/sections";
import { MechanicsSection } from "@/components/garage/mechanics";
import { FaqSection } from "@/components/garage/faq";
import { ContactBand } from "@/components/garage/contact";
import { faqs, garage } from "@/lib/garage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/atelier")({
  head: () =>
    pageHead({
      path: "/atelier",
      title: "Atelier Suzuki et toutes marques à Denges",
      crumb: "Atelier",
      description:
        "Atelier toutes marques à Denges : entretien, diagnostic, pneus, géométrie, climatisation et attelages, spécialité Suzuki. Rendez-vous en ligne.",
      faqs: faqs.atelier,
    }),
  component: Atelier,
});

function Atelier() {
  return (
    <>
      <PageIntro
        label="Atelier mécanique"
        title="Votre atelier à Denges, toutes marques."
        description="Entretien, réparations, pneus, climatisation : un atelier équipé d’appareils de diagnostic de pointe, avec Jérôme Baatard, titulaire d’un brevet fédéral."
        image={{
          src: illustrations.workshop,
          alt: "Gros plan d’une clé à cliquet sur le moteur d’une voiture",
          position: "45% 50%",
        }}
        actions={
          <>
            <Button asChild variant="premium">
              <Link to="/rendez-vous" search={{ besoin: "atelier" }}>
                Prendre rendez-vous <ArrowRight />
              </Link>
            </Button>
            <a className="hero-ghost" href={garage.phoneHref}>
              <Phone /> {garage.phone}
            </a>
          </>
        }
      />
      <MechanicsSection />
      <FaqSection
        items={faqs.atelier}
        title="Atelier : vos questions."
        intro="Marques, prestations et attelages."
      />
      <ContactBand trade="atelier" />
    </>
  );
}
