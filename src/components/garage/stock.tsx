import { Link } from "@tanstack/react-router";
import { SectionHeading } from "./sections";
import car0 from "@/assets/bmw-stock.jpg";
import car1 from "@/assets/stock-1.jpg";
import car2 from "@/assets/stock-2.jpg";
import car3 from "@/assets/stock-3.jpg";
// Editorial snapshot checked against the dealer's Autolina iframe on 2026-10-05.
// The complete stock page always embeds the live source; these are not a stock database.
const previews = [
  {
    name: "BMW 320Ci",
    version: "Coupé · Automatique",
    meta: "2001 · 135’990 km · Essence",
    price: "CHF 10’990.–",
    image: car0,
  },
  {
    name: "Audi A4 Avant",
    version: "40 TDI Sport quattro",
    meta: "2019 · 108’990 km · Diesel",
    price: "CHF 25’990.–",
    image: car1,
  },
  {
    name: "Honda CR-V",
    version: "2.0i MMD Hybrid Executive 4WD",
    meta: "2023 · 80’990 km · Hybride",
    price: "CHF 25’990.–",
    image: car2,
  },
  {
    name: "Mercedes-Benz C 43 AMG",
    version: "4Matic · Pack AMG",
    meta: "2017 · 102’990 km · Essence",
    price: "CHF 26’990.–",
    image: car3,
  },
];
export function StockPreview() {
  return (
    <section className="section stock-section">
      <div className="container">
        <SectionHeading
          eyebrow="Véhicules en stock"
          title="Votre prochaine voiture est ici."
          to="/vehicules"
          label="Voir tous les véhicules"
        />
        <div className="vehicle-grid">
          {previews.map((car) => (
            <Link to="/vehicules" className="vehicle-card" key={car.name}>
              <div className="vehicle-image">
                <img
                  src={car.image}
                  alt={car.name + " — véhicule proposé par le Garage de la Plaine"}
                  width={800}
                  height={600}
                  loading="lazy"
                />
              </div>
              <div className="vehicle-info">
                <h3>{car.name}</h3>
                <p>{car.version}</p>
                <div className="vehicle-meta">{car.meta}</div>
                <div className="vehicle-price">{car.price}</div>
              </div>
            </Link>
          ))}
        </div>
        <p className="stock-note">
          Sélection Autolina vérifiée le 05.10.2026. Prix et disponibilités à confirmer dans notre
          stock en ligne.
        </p>
      </div>
    </section>
  );
}
