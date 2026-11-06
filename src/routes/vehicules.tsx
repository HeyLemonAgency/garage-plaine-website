import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  CarFront,
  Phone,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import garageWide from "@/assets/garage-wide.webp";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/garage/sections";
import { SalesContact } from "@/components/garage/people";
import { ContactBand } from "@/components/garage/contact";
import { faqs, garage, team } from "@/lib/garage";
import { getLatestCars } from "@/lib/stock.functions";
import { FaqSection } from "@/components/garage/faq";
import { StockList } from "@/components/garage/stock-list";
import { pageHead } from "@/lib/seo";
import { isListingPath, listingFrameUrl } from "@/lib/autolina";

type VehiculesSearch = { annonce?: string };

export const Route = createFileRoute("/vehicules")({
  // `annonce` opens one Autolina listing in the frame; anything that is not a listing
  // path is dropped, so the frame can only ever show Autolina.
  validateSearch: (search: Record<string, unknown>): VehiculesSearch => {
    const annonce = search["annonce"];
    return typeof annonce === "string" && isListingPath(annonce) ? { annonce } : {};
  },
  loader: () => getLatestCars(),
  staleTime: 5 * 60_000,
  head: ({ loaderData }) =>
    pageHead({
      path: "/vehicules",
      title: "Occasions et Suzuki neuves à Denges",
      crumb: "Véhicules",
      description:
        "Notre stock en direct : Suzuki neuves et occasions toutes marques à Denges (VD), avec prix et kilométrage. Essai et offre : Tiago Bessa, 079 108 92 99.",
      type: "CollectionPage",
      faqs: faqs.vehicules,
      cars: loaderData?.cars,
    }),
  component: Vehicules,
});

function Vehicules() {
  const { annonce } = Route.useSearch();
  const stock = Route.useLoaderData();
  const src = (annonce && listingFrameUrl(annonce)) || garage.inventory;
  const frame = useRef<HTMLIFrameElement>(null);
  const loads = useRef(0);

  useEffect(() => {
    loads.current = 0;
    if (annonce) frame.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [annonce]);

  // Autolina navigates inside the frame (a car, the next page): bring the frame's top
  // back into view so the visitor never lands at the bottom of the new page.
  function onFrameLoad() {
    loads.current += 1;
    const el = frame.current;
    if (loads.current > 1 && el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      <PageIntro
        label="Véhicules"
        title="Suzuki neuves et occasions toutes marques, à Denges."
        description="Une voiture neuve, une occasion, ou la vente de la vôtre : choisissez, puis parlez directement à notre service vente."
        image={{
          src: garageWide,
          alt: "Le garage à Denges, avec les Suzuki exposées devant le showroom",
          position: "50% 60%",
        }}
        actions={
          <>
            <Button asChild variant="premium">
              <Link to="/rendez-vous" search={{ besoin: "vente" }}>
                Demander un essai <ArrowRight />
              </Link>
            </Button>
            <a className="hero-ghost" href={team.vente.mobileHref}>
              <Phone /> {team.vente.mobile}
            </a>
          </>
        }
      />
      <nav className="container entry-tabs" aria-label="Acheter ou vendre une voiture">
        <Link to="/suzuki" className="entry-tab">
          <Sparkles aria-hidden="true" />
          <span>
            <strong>Suzuki neuves</strong>
            <span>La gamme, une offre, un essai</span>
          </span>
        </Link>
        <a href="#stock" className="entry-tab is-current" aria-current="true">
          <CarFront aria-hidden="true" />
          <span>
            <strong>Stock neuf et occasion</strong>
            <span>Nos voitures disponibles</span>
          </span>
        </a>
        <Link to="/reprise" className="entry-tab">
          <RefreshCw aria-hidden="true" />
          <span>
            <strong>Vendre ma voiture</strong>
            <span>Achat ou reprise</span>
          </span>
        </Link>
      </nav>
      <section className="section inventory-section" id="stock">
        <div className="container">
          <div className="inventory-head">
            <SalesContact />
            <div className="inventory-toolbar">
              {annonce ? (
                <>
                  <Button variant="appointment" asChild>
                    <Link to="/vehicules">
                      <ArrowLeft /> Tout le stock
                    </Link>
                  </Button>
                  <Button variant="premium" asChild>
                    <Link to="/rendez-vous" search={{ besoin: "vente", annonce }}>
                      Demander un essai <ArrowRight />
                    </Link>
                  </Button>
                </>
              ) : (
                <p>Le stock en direct, depuis Autolina.</p>
              )}
              <a className="section-link" href={src} target="_blank" rel="noreferrer">
                Ouvrir sur Autolina <ArrowUpRight />
              </a>
            </div>
          </div>
          <iframe
            ref={frame}
            key={src}
            className="inventory-frame"
            title="Stock actuel du Garage Carrosserie de la Plaine sur Autolina"
            src={src}
            loading="eager"
            allow="fullscreen"
            onLoad={onFrameLoad}
          />
          <p className="small-note">
            Les prix, les équipements et les disponibilités sont ceux de l’annonce Autolina. Si le
            stock ne s’affiche pas, utilisez le lien « Ouvrir sur Autolina ».
          </p>
        </div>
      </section>
      <StockList cars={stock.cars} total={stock.total} />
      <FaqSection
        items={faqs.vehicules}
        title="Acheter chez nous : vos questions."
        intro="Disponibilité, essai, financement et reprise de votre véhicule."
      />
      <ContactBand trade="vente">
        <Link to="/reprise" className="contact-cta-link">
          Faire reprendre mon véhicule <ArrowRight />
        </Link>
      </ContactBand>
    </>
  );
}
