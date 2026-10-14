import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, TrustBar, photos, CheckList } from "@/components/garage/sections";
import { ContactSection } from "@/components/garage/contact";
import { TeamGrid } from "@/components/garage/people";
import { pageHead } from "@/lib/garage";
export const Route = createFileRoute("/entreprise")({
  head: () =>
    pageHead(
      "Une équipe locale, un savoir-faire établi",
      "Découvrez le Garage de la Plaine à Denges, son équipe, son atelier multimarque et sa carrosserie. Plus de 40 ans au service de votre voiture.",
    ),
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
              Des racines locales.
              <br />
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
      <section className="partnership">
        <div className="container editorial-grid">
          <img
            className="editorial-image"
            src={photos.workshop}
            alt="L’atelier mécanique du Garage de la Plaine"
            loading="lazy"
            width={700}
            height={500}
          />
          <div className="editorial-copy">
            <div className="eyebrow">
              <GraduationCap className="size-4" />
              Entreprise formatrice
            </div>
            <h2>
              Transmettre
              <br />
              le savoir-faire.
            </h2>
            <p>
              La formation fait partie de notre engagement. Cristiano Almeida a été distingué comme
              troisième meilleur apprenti peintre en carrosserie en 2013, et Marco Da Silva comme
              meilleur apprenti peintre en carrosserie en 2014.
            </p>
            <p>Un savoir-faire qui se transmet, au service d’un travail soigné.</p>
          </div>
        </div>
      </section>
      <ContactSection />
    </>
  );
}
