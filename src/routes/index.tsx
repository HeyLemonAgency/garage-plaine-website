import { createFileRoute } from "@tanstack/react-router";
import {
  Hero,
  TrustBar,
  ServicesPreview,
  Partnership,
  CompanyStory,
} from "@/components/garage/sections";
import { ContactSection } from "@/components/garage/contact";
import { StockPreview } from "@/components/garage/stock";
import { pageHead } from "@/lib/garage";
import { getLatestCars } from "@/lib/stock.functions";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Votre garage de confiance à Denges",
      "Garage de la Plaine à Denges : vente Suzuki, occasions toutes marques, carrosserie et atelier mécanique. Découvrez nos dernières annonces et contactez notre équipe.",
    ),
  loader: () => getLatestCars(),
  staleTime: 5 * 60_000,
  component: Index,
});

function Index() {
  const stock = Route.useLoaderData();
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesPreview />
      <StockPreview stock={stock} />
      <Partnership />
      <CompanyStory />
      <ContactSection />
    </>
  );
}
