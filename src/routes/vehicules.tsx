import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/garage/sections";
import { garage, pageHead } from "@/lib/garage";
export const Route = createFileRoute("/vehicules")({
  head: () =>
    pageHead(
      "Véhicules en stock",
      "Consultez le stock actuel du Garage de la Plaine sur Autolina : véhicules Suzuki et occasions toutes marques à Denges.",
    ),
  component: Vehicules,
});
function Vehicules() {
  return (
    <>
      <PageIntro
        label="Véhicules en stock"
        title="Trouvez votre prochaine voiture."
        description="Suzuki et occasions toutes marques. Découvrez les véhicules actuellement proposés par le Garage de la Plaine."
      />
      <section className="section">
        <div className="container">
          <div className="inventory-toolbar">
            <p>Notre stock actuel, directement depuis Autolina.</p>
            <Button variant="appointment" asChild>
              <a href={garage.inventory} target="_blank" rel="noreferrer">
                Ouvrir sur Autolina <ArrowUpRight />
              </a>
            </Button>
          </div>
          <iframe
            className="inventory-frame"
            title="Stock actuel Garage de la Plaine sur Autolina"
            src={garage.inventory}
            loading="eager"
            allow="fullscreen"
          />
          <p className="small-note">
            Les prix, les équipements et les disponibilités sont ceux de l’annonce Autolina. Si le
            stock ne s’affiche pas, utilisez le lien « Ouvrir sur Autolina ».
          </p>
        </div>
      </section>
      <section className="contact-band">
        <div className="container section-heading">
          <div>
            <div className="eyebrow">Un projet automobile ?</div>
            <h2>Parlons de votre prochaine voiture.</h2>
          </div>
          <Button variant="premium" asChild>
            <Link to="/contact">
              Contacter le service vente <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
