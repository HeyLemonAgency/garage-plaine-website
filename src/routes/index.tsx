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
import { faqs } from "@/lib/garage";
import { FaqSection } from "@/components/garage/faq";
import { pageHead } from "@/lib/seo";
import { getLatestCars } from "@/lib/stock.functions";

export const Route = createFileRoute("/")({
  head: ({ loaderData }) =>
    pageHead({
      path: "/",
      title: "Garage de la Plaine, Denges – Suzuki, occasions, carrosserie",
      description:
        "Garage à Denges (VD) depuis plus de 40 ans : concessionnaire Suzuki, occasions toutes marques, carrosserie, atelier multimarque et station Jubin 24h/24.",
      faqs: faqs.home,
      cars: loaderData?.cars,
    }),
  loader: () => getLatestCars(),
  staleTime: 5 * 60_000,
  component: Index,
});

function Index() {
  const stock = Route.useLoaderData();
  return (
    <>
      <Hero stockTotal={stock.total} />
      <TrustBar stockTotal={stock.total} />
      <ServicesPreview />
      <StockPreview stock={stock} />
      <Partnership />
      <CompanyStory />
      <FaqSection
        items={faqs.home}
        title="L’essentiel sur le garage."
        intro="Adresse, horaires, marques et rendez-vous : les réponses aux questions qu’on nous pose le plus souvent."
      />
      <ContactSection />
    </>
  );
}
