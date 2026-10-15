import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/garage/sections";
import { wirRates } from "@/lib/garage";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/wir")({
  head: () =>
    pageHead({
      path: "/wir",
      title: "Paiement en WIR : les conditions",
      crumb: "WIR",
      description:
        "Le Garage de la Plaine à Denges est partenaire WIR : main-d’œuvre et pneumatiques 100 %, pièces d’entretien 50 %, pièces spécifiques 20 %, aux tarifs CHF.",
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
        description="Le Garage de la Plaine accepte les paiements WIR selon les conditions ci-dessous."
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
            <h2>Une question sur votre règlement&nbsp;?</h2>
            <p>
              Notre équipe est à votre disposition pour préciser les conditions applicables à votre
              intervention.
            </p>
            <Button variant="premium" asChild>
              <Link to="/contact">
                Contacter le garage <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
