import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Fuel, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageIntro,
  photos,
  CheckList,
  MechanicalList,
  SectionTabs,
} from "@/components/garage/sections";
import { ContactSection } from "@/components/garage/contact";
import { BodyworkSection } from "@/components/garage/bodywork";
import { WorkshopTour } from "@/components/garage/workshop-tour";
import { FaqSection } from "@/components/garage/faq";
import { SalesContact } from "@/components/garage/people";
import { salesServices, team, faqs } from "@/lib/garage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () =>
    pageHead({
      path: "/services",
      title: "Carrosserie, atelier et vente à Denges",
      crumb: "Services",
      description:
        "Carrosserie (sinistres, 8 véhicules de remplacement), atelier multimarque (diagnostic, pneus, climatisation, géométrie) et vente Suzuki à Denges.",
      faqs: faqs.services,
    }),
  component: Services,
});

const sections = [
  ["vente", "Vente & reprise"],
  ["carrosserie", "Carrosserie"],
  ["mecanique", "Atelier mécanique"],
] as const;

function Services() {
  return (
    <>
      <PageIntro
        label="Services"
        title="Vente, carrosserie et atelier."
        description="Trois métiers sur un même site à Denges, avec un interlocuteur dédié pour chacun."
      />
      <SectionTabs items={sections} />

      <section id="vente" className="service-detail">
        <div className="container detail-layout">
          <div>
            <div className="eyebrow">01 / Vente & reprise</div>
            <h2>Neuf, occasion ou reprise.</h2>
            <p>
              Concessionnaire Suzuki depuis plus de 20 ans, nous vous proposons les véhicules neufs
              de la gamme Suzuki et un parc d’occasions toutes marques. Un modèle vous
              intéresse&nbsp;? Demandez une offre ou un essai sur route.
            </p>
            <CheckList items={salesServices} />
            <SalesContact />
            <div className="detail-actions">
              <Button asChild variant="premium">
                <Link to="/vehicules">
                  Voir les véhicules <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="appointment">
                <Link to="/rendez-vous" search={{ besoin: "vente" }}>
                  Demander un essai <ArrowRight />
                </Link>
              </Button>
              <Link to="/reprise" className="section-link">
                Proposer mon véhicule <ArrowRight />
              </Link>
            </div>
          </div>
          <img
            className="reveal-on-scroll"
            src={photos.sales}
            alt="Le showroom Suzuki du Garage de la Plaine"
            width={700}
            height={467}
            loading="lazy"
          />
        </div>
      </section>

      <BodyworkSection />

      <section id="mecanique" className="service-detail mechanics">
        <div className="container">
          <div className="mechanics-head">
            <div>
              <div className="eyebrow">03 / Atelier mécanique</div>
              <h2>Un atelier multimarque à votre service.</h2>
            </div>
            <p>
              Équipé des derniers appareils de diagnostic, notre atelier entretient et répare les
              véhicules de toutes marques, notre marque de référence étant Suzuki.{" "}
              {team.atelier.name}, titulaire d’un brevet fédéral, est votre interlocuteur.
            </p>
          </div>
          <WorkshopTour />
          <div className="mechanics-foot">
            <MechanicalList />
            <div className="detail-actions">
              <Button asChild variant="premium">
                <Link to="/rendez-vous" search={{ besoin: "atelier" }}>
                  Prendre rendez-vous <ArrowRight />
                </Link>
              </Button>
              <a className="section-link" href={`mailto:${team.atelier.email}`}>
                <Mail /> Écrire à {team.atelier.name}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container detail-layout">
          <div>
            <div className="eyebrow">
              <Fuel className="size-4" />
              Sur place
            </div>
            <h2>Votre plein, à toute heure.</h2>
            <p>
              Notre station-service Jubin est accessible 24h/24 et 7j/7. Vous pouvez également
              commander une Jubin Card.
            </p>
            <Link to="/station-service" className="section-link">
              Découvrir la station-service <ArrowRight />
            </Link>
          </div>
          <div>
            <div className="eyebrow">Paiement</div>
            <h2>Partenaire WIR.</h2>
            <p>Nous acceptons les paiements WIR, selon le type de prestation.</p>
            <Link to="/wir" className="section-link">
              Voir les conditions WIR <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
      <FaqSection
        items={faqs.services}
        title="Carrosserie et atelier : vos questions."
        intro="Assurance, véhicule de remplacement, garanties et prestations de l’atelier."
      />
      <ContactSection />
    </>
  );
}
