import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, illustrations } from "@/components/garage/sections";
import { ContactBand } from "@/components/garage/contact";
import { wirRates } from "@/lib/garage";
import { pageHead } from "@/lib/seo";
import wirLogo from "@/assets/wir-partner.webp";
export const Route = createFileRoute("/wir")({
  head: () =>
    pageHead({
      path: "/wir",
      title: "Paiement en WIR",
      crumb: "WIR",
      description:
        "Payer en WIR au Garage Carrosserie de la Plaine à Denges : main-d’œuvre, pièces et pneus, selon les taux du garage. Les conditions en détail.",
    }),
  component: Wir,
});
function Wir() {
  const rates = wirRates;
  return (
    <>
      <PageIntro
        label="Partenariat WIR"
        title="Votre garage, partenaire WIR."
        description="Le Garage Carrosserie de la Plaine accepte les paiements WIR selon les conditions ci-dessous."
        image={{
          src: illustrations.suzukiLake,
          alt: "Une Suzuki au bord d’un lac",
          position: "72% 62%",
        }}
        compact
      />
      <section className="section">
        <div className="container detail-layout">
          <div>
            <h2>Les conditions WIR.</h2>
            <p>Les prix WIR sont identiques aux prix en CHF.</p>
            <div className="hours max-w-none">
              {rates.map(([name, rate]) => (
                <div className="hours-row py-3 border-b" key={name}>
                  <span>{name}</span>
                  <strong>{rate}</strong>
                </div>
              ))}
            </div>
          </div>
          <div>
            <img
              className="wir-logo wir-logo-lg"
              src={wirLogo}
              alt="Logo Partenaire WIR"
              width={566}
              height={271}
            />
            <h2>Une question sur le paiement en WIR&nbsp;?</h2>
            <p>Nous vous précisons volontiers les conditions pour vos travaux.</p>
            <Button variant="premium" asChild>
              <Link to="/contact">
                Contacter le garage <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
