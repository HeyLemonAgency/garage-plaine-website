import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, CreditCard, Fuel, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, CheckList, illustrations, photos } from "@/components/garage/sections";
import { ContactBand, Location } from "@/components/garage/contact";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/station-service")({
  head: () =>
    pageHead({
      path: "/station-service",
      title: "Station Jubin 24h/24 à Denges",
      crumb: "Station-service",
      description:
        "Faites le plein à la station-service Jubin du Garage Carrosserie de la Plaine à Denges, accessible 24h/24 et 7j/7. Commandez votre Jubin Card sur place.",
    }),
  component: Station,
});
const stationFacts = [
  { icon: Clock, title: "24h/24 – 7j/7", text: "Station-service" },
  { icon: Fuel, title: "Essence Jubin", text: "Carburants de qualité" },
  { icon: CreditCard, title: "Jubin Card", text: "Sur commande" },
  { icon: MapPin, title: "Denges", text: "Route de la Plaine 20" },
] as const;

function Station() {
  return (
    <>
      <PageIntro
        label="Station-service"
        title="Faites le plein à toute heure, 7 jours sur 7."
        description="Notre station-service Jubin à Denges est accessible 24h/24 et 7j/7."
        image={{
          src: photos.fuelHd,
          alt: "Les pompes de la station-service Jubin du garage à Denges",
          position: "30% 45%",
          ratio: 1916 / 821,
        }}
      />
      <section className="section">
        <div className="container editorial-grid">
          <div className="editorial-copy">
            <div className="eyebrow">
              <Fuel className="size-4" />
              Station-service Jubin
            </div>
            <h2>
              À toute heure, <br />
              tout près de chez vous.
            </h2>
            <p>
              Retrouvez notre station-service à la Route de la Plaine 20 à Denges. Vous pouvez faire
              le plein 24h/24, 7 jours sur 7.
            </p>
            <CheckList
              items={[
                "Essence Jubin",
                "Accès 24h/24 et 7j/7",
                "Jubin Card disponible sur commande",
              ]}
            />
            <p>
              Contactez le garage pour commander votre Jubin Card et connaître ses avantages tout au
              long de l’année. Plus d’informations sur{" "}
              <a
                className="text-link"
                href="https://www.jubin.ch/"
                target="_blank"
                rel="noreferrer"
              >
                jubin.ch
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
              .
            </p>
            <Button variant="premium" asChild>
              <Link to="/contact">
                Nous contacter <ArrowRight />
              </Link>
            </Button>
          </div>
          <img
            className="editorial-image station-image"
            src={illustrations.jubinPump}
            alt="Le plein d’une voiture avec un pistolet Jubin, au soleil couchant"
            width={1122}
            height={1402}
            loading="lazy"
          />
        </div>
      </section>
      <section className="station-facts" aria-label="La station en bref">
        <ul className="container station-facts-grid">
          {stationFacts.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                {text}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <Location station />
      <ContactBand />
    </>
  );
}
