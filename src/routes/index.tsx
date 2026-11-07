import { createFileRoute } from "@tanstack/react-router";
import {
  Hero,
  TrustBar,
  ServicesPreview,
  Partnership,
  CompanyStory,
} from "@/components/garage/sections";
import { ContactBand } from "@/components/garage/contact";
import { StockPreview } from "@/components/garage/stock";
import { faqs } from "@/lib/garage";
import { FaqSection } from "@/components/garage/faq";
import { pageHead } from "@/lib/seo";
import { getLatestCars } from "@/lib/stock.functions";
import { getGoogleRating } from "@/lib/google-rating.functions";
import { GoogleReviews } from "@/components/garage/reviews";

export const Route = createFileRoute("/")({
  head: ({ loaderData }) =>
    pageHead({
      path: "/",
      title: "Garage Carrosserie de la Plaine – concessionnaire Suzuki à Denges",
      description:
        "Votre concessionnaire officiel Suzuki à Denges, près de Morges : Suzuki neuves et essais, occasions toutes marques, atelier, carrosserie et station 24h/24.",
      faqs: faqs.home,
      cars: loaderData?.cars,
    }),
  // Both are cached and never throw: the page renders even when Autolina or Google is down.
  loader: async () => {
    const [stock, rating] = await Promise.all([getLatestCars(), getGoogleRating()]);
    return { ...stock, rating };
  },
  staleTime: 5 * 60_000,
  component: Index,
});

function Index() {
  const stock = Route.useLoaderData();
  return (
    <>
      <Hero stockTotal={stock.total} />
      <TrustBar stockTotal={stock.total} />
      <Partnership />
      <ServicesPreview />
      <StockPreview stock={stock} />
      <CompanyStory />
      <GoogleReviews rating={stock.rating} />
      <FaqSection
        items={faqs.home}
        title="L’essentiel sur le garage."
        intro="Adresse, horaires, marques et rendez-vous : les réponses aux questions qu’on nous pose le plus souvent."
      />
      <ContactBand />
    </>
  );
}
