import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/garage/sections";
import { SalesContact } from "@/components/garage/people";
import { garage, pageHead } from "@/lib/garage";
import { isListingPath, listingFrameUrl } from "@/lib/autolina";

type VehiculesSearch = { annonce?: string };

export const Route = createFileRoute("/vehicules")({
  // `annonce` opens one Autolina listing in the frame; anything that is not a listing
  // path is dropped, so the frame can only ever show Autolina.
  validateSearch: (search: Record<string, unknown>): VehiculesSearch => {
    const annonce = search["annonce"];
    return typeof annonce === "string" && isListingPath(annonce) ? { annonce } : {};
  },
  head: () =>
    pageHead(
      "Véhicules en stock",
      "Consultez le stock actuel du Garage de la Plaine : véhicules neufs Suzuki et occasions toutes marques à Denges. Service vente : Tiago Bessa, 079 108 92 99.",
    ),
  component: Vehicules,
});

function Vehicules() {
  const { annonce } = Route.useSearch();
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
        label="Véhicules en stock"
        title="Trouvez votre prochaine voiture."
        description="Véhicules neufs Suzuki et occasions toutes marques. Filtrez le stock, ouvrez une annonce, puis contactez directement notre service vente."
      />
      <section className="section inventory-section">
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
            title="Stock actuel du Garage de la Plaine sur Autolina"
            src={src}
            loading="eager"
            allow="fullscreen"
            onLoad={onFrameLoad}
          />
          <p className="small-note">
            Les prix, les équipements et les disponibilités sont ceux de l’annonce Autolina. Si le
            stock ne s’affiche pas, utilisez le lien « Ouvrir sur Autolina ».
          </p>
        </div>
      </section>
      <section className="contact-band">
        <div className="container cta-band">
          <div>
            <div className="eyebrow">Un projet automobile&nbsp;?</div>
            <h2>Demandez une offre ou un essai sur route.</h2>
          </div>
          <div className="detail-actions">
            <Button variant="premium" asChild>
              <Link to="/rendez-vous" search={{ besoin: "vente" }}>
                Demander une offre <ArrowRight />
              </Link>
            </Button>
            <Button variant="appointment" asChild>
              <Link to="/reprise">
                Faire reprendre mon véhicule <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
