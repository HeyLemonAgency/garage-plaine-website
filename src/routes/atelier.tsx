import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, stockPhotos } from "@/components/garage/sections";
import { MechanicsSection } from "@/components/garage/mechanics";
import { FaqSection } from "@/components/garage/faq";
import { ContactBand } from "@/components/garage/contact";
import { faqs, garage } from "@/lib/garage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/atelier")({
  head: () =>
    pageHead({
      path: "/atelier",
      title: "Garage et atelier mécanique à Denges, toutes marques",
      crumb: "Atelier",
      description:
        "L’atelier du Garage Carrosserie de la Plaine à Denges, près de Morges : entretien et réparations toutes marques, spécialité Suzuki, diagnostic, pneus et géométrie, climatisation, attelages. Rendez-vous en ligne.",
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
        description="Entretien, réparations, pneus, climatisation : un atelier équipé des derniers appareils de diagnostic, avec Jérôme Baatard, titulaire d’un brevet fédéral."
        image={{
          src: stockPhotos.mechanic,
          alt: "Un mécanicien au travail sur le moteur d’une voiture",
          position: "70% 45%",
          illustration: true,
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
