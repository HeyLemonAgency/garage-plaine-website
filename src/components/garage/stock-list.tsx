import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { StockCar } from "@/lib/autolina";

/** The latest listings as a plain, linkable list: quick to scan and readable by crawlers. */
export function StockList({ cars, total }: { cars: readonly StockCar[]; total: number | null }) {
  if (cars.length === 0) return null;
  return (
    <section className="section stock-list-section" aria-labelledby="stock-list-title">
      <div className="container">
        <div className="eyebrow">
          <span className="live-dot" aria-hidden="true" />
          En direct d’Autolina
        </div>
        <h2 id="stock-list-title">Nos {cars.length} dernières annonces.</h2>
        <p className="stock-list-intro">
          {total ? `Sur ${total} véhicules en stock, ` : ""}les plus récents, avec leur prix et leur
          kilométrage. Choisissez-en un pour ouvrir son annonce complète.
        </p>
        <ul className="stock-list">
          {cars.map((car) => {
            const facts = [
              car.isNew ? "Neuf" : car.year,
              car.mileage,
              car.fuel,
              car.gearbox,
              car.power,
            ].filter(Boolean);
            return (
              <li key={car.id}>
                <Link to="/vehicules" search={{ annonce: car.path }}>
                  <span className="stock-list-name">
                    <strong>
                      {car.make} {car.model}
                    </strong>
                    <span>{facts.join(" · ")}</span>
                  </span>
                  <span className="stock-list-price">{car.price ?? "Prix sur demande"}</span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
