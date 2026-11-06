import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, photos } from "@/components/garage/sections";
import { BodyworkSection } from "@/components/garage/bodywork";
import { FaqSection } from "@/components/garage/faq";
import { ContactBand } from "@/components/garage/contact";
import { faqs, garage } from "@/lib/garage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/carrosserie")({
  head: () =>
    pageHead({
      path: "/carrosserie",
      title: "Carrosserie à Denges",
      crumb: "Carrosserie",
      description:
        "Carrosserie à Denges : sinistres réglés avec votre assurance, 8 véhicules de remplacement, peinture et restauration. Travaux garantis, selon conditions.",
      faqs: faqs.carrosserie,
    }),
  component: Carrosserie,
});

function Carrosserie() {
  return (
    <>
      <PageIntro
        label="Carrosserie"
        title="Votre carrosserie à Denges."
        description="Sinistre, peinture, restauration : nous réparons votre voiture et réglons les formalités avec votre assurance. Huit véhicules de remplacement vous gardent mobile."
        image={{
          src: photos.bodyworkHd,
          alt: "L’avant d’une Ford Mustang ancienne, calandre et chromes",
          position: "55% 50%",
        }}
        actions={
          <>
            <Button asChild variant="premium">
              <Link to="/rendez-vous" search={{ besoin: "carrosserie" }}>
                Demander un devis <ArrowRight />
              </Link>
            </Button>
            <a className="hero-ghost" href={garage.phoneHref}>
              <Phone /> {garage.phone}
            </a>
          </>
        }
      />
      <BodyworkSection />
      <FaqSection
        items={faqs.carrosserie}
        title="Carrosserie : vos questions."
        intro="Assurance, véhicule de remplacement, garanties et pare-brise."
      />
      <ContactBand trade="carrosserie" />
    </>
  );
}
