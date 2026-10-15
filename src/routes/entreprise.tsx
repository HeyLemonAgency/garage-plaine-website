import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, TrustBar, photos, CheckList } from "@/components/garage/sections";
import { ContactSection } from "@/components/garage/contact";
import { TeamGrid } from "@/components/garage/people";
import { TrainingStory } from "@/components/garage/training";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/entreprise")({
  head: () =>
    pageHead({
      path: "/entreprise",
      title: "Le garage et son équipe à Denges",
      crumb: "Entreprise",
      description:
        "Depuis plus de 40 ans à Denges : le Garage de la Plaine, son équipe vente, atelier et carrosserie, et son engagement d’entreprise formatrice.",
      type: "AboutPage",
    }),
  component: Entreprise,
});
function Entreprise() {
  return (
    <>
      <PageIntro
        label="Entreprise"
        title="Le garage. Et les gens derrière."
        description="Plus de 40 ans de service de qualité, et une même volonté : prendre soin de votre voiture et de votre confiance."
      />
      <section className="section">
        <div className="container editorial-grid">
          <div className="editorial-copy">
            <div className="eyebrow">Garage de la Plaine · Denges</div>
            <h2>
              Des racines locales. <br />
              Un service complet.
            </h2>
            <p>
              À 5 minutes de Morges et 10 minutes de Lausanne, notre garage réunit la vente de
              véhicules, l’entretien mécanique et la carrosserie sur un même site.
            </p>
            <p>
              Concessionnaire Suzuki depuis plus de 20 ans, nous sommes la référence Suzuki sur La
              Côte. Nous accueillons aussi les véhicules de toutes marques dans notre atelier et
              notre carrosserie.
            </p>
            <CheckList
              items={[
                "Véhicules neufs Suzuki et occasions toutes marques",
                "Atelier mécanique avec appareils de diagnostic de pointe",
                "Carrosserie, réparation et restauration",
                "Station-service Jubin accessible 24h/24 et 7j/7",
              ]}
            />
            <Button variant="premium" asChild>
              <Link to="/services">
                Découvrir nos métiers <ArrowRight />
              </Link>
            </Button>
          </div>
          <img
            className="editorial-image"
            src={photos.garage}
            alt="Garage de la Plaine, Route de la Plaine à Denges"
            width={700}
            height={500}
          />
        </div>
      </section>
      <TrustBar />
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Vos interlocuteurs</div>
              <h2>Une équipe à votre écoute.</h2>
            </div>
          </div>
          <TeamGrid />
        </div>
      </section>
      <TrainingStory />
      <ContactSection />
    </>
  );
}
