import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageIntro,
  TrustBar,
  illustrations,
  photos,
  CheckList,
} from "@/components/garage/sections";
import { ContactBand } from "@/components/garage/contact";
import { TeamGrid } from "@/components/garage/people";
import { TrainingStory } from "@/components/garage/training";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/entreprise")({
  head: () =>
    pageHead({
      path: "/entreprise",
      title: "Notre équipe à Denges",
      crumb: "Entreprise",
      description:
        "Depuis plus de 40 ans à Denges : le Garage Carrosserie de la Plaine, son équipe vente, atelier et carrosserie, et son engagement d’entreprise formatrice.",
      type: "AboutPage",
    }),
  component: Entreprise,
});
function Entreprise() {
  return (
    <>
      <PageIntro
        label="Entreprise"
        title="Plus de 40 ans au service de vos voitures, à Denges."
        description="La vente, la carrosserie et l’atelier réunis, et une même volonté : prendre soin de votre voiture et de votre confiance."
        image={{
          src: photos.garageHd,
          alt: "Le Garage Carrosserie de la Plaine à Denges : le showroom Suzuki et les voitures exposées",
          position: "32% 45%",
          ratio: 2000 / 667,
        }}
      />
      <section className="section">
        <div className="container editorial-grid">
          <div className="editorial-copy">
            <div className="eyebrow">Garage Carrosserie de la Plaine · Denges</div>
            <h2>Vente, carrosserie et atelier, réunis à Denges.</h2>
            <p>
              À 5 minutes de Morges et 10 minutes de Lausanne, notre garage rassemble la vente de
              véhicules, l’entretien mécanique et la carrosserie sur un même site.
            </p>
            <p>
              Concessionnaire Suzuki depuis plus de 20 ans, nous sommes votre concessionnaire Suzuki
              sur La Côte. Nous accueillons aussi les véhicules de toutes marques dans notre atelier
              et notre carrosserie.
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
              <Link to="/carrosserie">
                Découvrir la carrosserie <ArrowRight />
              </Link>
            </Button>
          </div>
          <img
            className="editorial-image"
            src={photos.sales}
            alt="Le showroom du garage à Denges, avec des Suzuki Swift exposées"
            width={700}
            height={500}
          />
        </div>
      </section>
      <TrustBar />
      <TrainingStory />
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
      <ContactBand />
    </>
  );
}
