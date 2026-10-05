import { createFileRoute } from "@tanstack/react-router";
import { Hero, TrustBar, ServicesPreview, Partnership, CompanyStory } from '@/components/garage/sections';
import { ContactSection } from '@/components/garage/contact';
import { StockPreview } from '../components/garage/stock';
import { pageHead } from '@/lib/garage';
export const Route = createFileRoute("/")({
  head: () => pageHead('Votre garage de confiance à Denges', 'Garage de la Plaine à Denges : vente Suzuki, occasions, atelier mécanique multimarque et carrosserie. Découvrez nos véhicules et contactez notre équipe.'),
  component: Index,
});
function Index() {
  return <><Hero/><TrustBar/><ServicesPreview/><StockPreview/><Partnership/><CompanyStory/><ContactSection/></>;
}
