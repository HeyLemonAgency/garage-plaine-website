import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { photos } from "@/components/garage/sections";
import { ContactSection } from "@/components/garage/contact";
import { SalesContact } from "@/components/garage/people";
import { StockCarousel } from "@/components/garage/stock";
import { CountUp } from "@/components/garage/interactive";
import { SuzukiSpin } from "@/components/garage/suzuki-spin";
import { sCross3d } from "@/lib/s-cross-3d";
import { AllgripDial, SuzukiRange } from "@/components/garage/suzuki";
import { sCross, suzukiSource } from "@/lib/garage";
import { getLatestCars } from "@/lib/stock.functions";
import { pageHead } from "@/lib/seo";
import suzuki from "@/assets/suzuki-logo.png";

export const Route = createFileRoute("/suzuki")({
  head: ({ loaderData }) =>
    pageHead({
      path: "/suzuki",
      title: "Concessionnaire Suzuki à Denges, La Côte",
      crumb: "Partenaire Suzuki",
      description:
        "Concessionnaire Suzuki depuis plus de 20 ans à Denges, entre Morges et Lausanne : le S-Cross hybride 4x4 en 3D, toute la gamme Suzuki, essais sur route, financement, leasing et atelier.",
      cars: loaderData?.cars.filter((c) => c.make === "Suzuki"),
    }),
  loader: () => getLatestCars(),
  staleTime: 5 * 60_000,
  component: Suzuki,
});

const perks = [
  ["Essai sur route", "Le modèle qui vous plaît, sur les routes que vous connaissez."],
  ["Financement et leasing", "Une solution adaptée à votre budget, calculée avec vous."],
  ["Reprise de votre véhicule", "Votre voiture actuelle estimée lors de l’achat."],
  [
    "Atelier spécialiste Suzuki",
    "Entretien et réparations sur place : Suzuki est notre marque de référence.",
  ],
] as const;

// Grouped by hand: server and browser locales disagree (1'200, 1 200), which breaks hydration.
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "’");

function Suzuki() {
  const stock = Route.useLoaderData();
  const suzukis = stock.cars.filter((car) => car.make === "Suzuki");
  return (
    <>
      <section className={`sz-hero ${sCross3d.available ? "" : "is-static"}`}>
        <div className="container sz-hero-copy">
          <div className="breadcrumb">
            <Link to="/">Accueil</Link>
            <ChevronRight />
            <span>Partenaire Suzuki</span>
          </div>
          <div className="sz-badge">
            <img src={suzuki} alt="Suzuki" width={150} height={40} />
            <span>Concessionnaire officiel depuis plus de 20 ans</span>
          </div>
          {sCross3d.available ? (
            <>
              <h1>
                Suzuki à Denges.{" "}
                <em>
                  Faites le tour du <span className="nowrap">S-Cross</span>.
                </em>
              </h1>
              <p>
                Le SUV hybride de Suzuki, traction avant ou 4x4 ALLGRIP, à découvrir sous tous les
                angles. Puis en vrai, dans notre showroom.
              </p>
            </>
          ) : (
            <>
              <h1>
                Suzuki à Denges. <em>Votre concessionnaire sur La Côte.</em>
              </h1>
              <p>
                Toute la gamme Suzuki neuve, des essais sur route, le financement, la reprise et
                notre atelier : tout se passe au même endroit.
              </p>
            </>
          )}
          <div className="sz-hero-actions">
            <Button variant="premium" asChild>
              <Link to="/rendez-vous" search={{ besoin: "vente" }}>
                Réserver un essai <ArrowRight />
              </Link>
            </Button>
            <a className="sz-ghost" href={suzukis.length > 0 ? "#stock" : "#gamme"}>
              {suzukis.length > 0 ? "Les Suzuki en stock" : "Toute la gamme"} <ArrowDown />
            </a>
          </div>
        </div>
        {sCross3d.available ? (
          <SuzukiSpin />
        ) : (
          <div className="container sz-hero-photo">
            <img
              src={photos.sales}
              alt="Le showroom Suzuki du Garage de la Plaine à Denges"
              width={700}
              height={540}
            />
          </div>
        )}
      </section>

      <section className="sz-figures" aria-label="Le S-Cross en chiffres">
        <div className="container">
          <ul className="sz-figure-list">
            {sCross.figures.map((f) => (
              <li key={f.label}>
                <strong>
                  <CountUp value={f.value} format={thousands} />
                  <span className="sz-unit">{f.unit}</span>
                </strong>
                {f.label}
              </li>
            ))}
          </ul>
          <p className="sz-source">
            Suzuki S-Cross Hybrid. Source : {suzukiSource}. L’équipement dépend de la version.
          </p>
        </div>
      </section>

      <section className="section sz-allgrip-section">
        <div className="container sz-split">
          <div className="sz-split-copy">
            <div className="eyebrow">Transmission intégrale ALLGRIP SELECT</div>
            <h2>Une molette, quatre façons d’adhérer à la route.</h2>
            <p>
              Sur le S-Cross 4x4, la molette ALLGRIP SELECT adapte la transmission au terrain : la
              route de tous les jours, les cols, la neige ou un chemin boueux. Choisissez un mode
              pour voir ce qu’il change.
            </p>
          </div>
          <AllgripDial />
        </div>
      </section>

      <section className="section sz-range-section" id="gamme">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">La gamme Suzuki</div>
              <h2>Cinq modèles, tous électrifiés.</h2>
            </div>
            <p>
              De la citadine hybride au SUV 100&nbsp;% électrique : chaque modèle Suzuki neuf se
              commande chez nous, avec une offre et un essai.
            </p>
          </div>
          <SuzukiRange />
        </div>
      </section>

      {suzukis.length > 0 && (
        <section className="section stock-section-tight" id="stock">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span className="live-dot" aria-hidden="true" />
                  En stock en ce moment
                </div>
                <h2>Les Suzuki disponibles chez nous.</h2>
              </div>
            </div>
            <StockCarousel
              cars={suzukis}
              total={stock.total}
              showFilters={false}
              label="Suzuki en stock"
            />
            <p className="stock-note">
              Parmi nos dernières annonces Autolina. Toute la gamme Suzuki est aussi disponible sur
              commande : demandez une offre.
            </p>
          </div>
        </section>
      )}

      <section className="section sz-home">
        <div className="container sz-home-grid">
          <figure className="sz-home-photo">
            <img
              src={photos.sales}
              alt="Le showroom Suzuki du Garage de la Plaine à Denges"
              width={700}
              height={540}
              loading="lazy"
            />
            <figcaption>Notre showroom, Route de la Plaine 20 à Denges</figcaption>
          </figure>
          <div className="sz-home-copy">
            <div className="eyebrow">Acheter sa Suzuki chez nous</div>
            <h2>Un concessionnaire, et votre garage pour la suite.</h2>
            <ol className="sz-perks">
              {perks.map(([title, text]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
            <SalesContact />
            <Link className="section-link" to="/services">
              Notre atelier et notre carrosserie, après l’achat <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <ContactSection defaultTopic="vente" />
    </>
  );
}
