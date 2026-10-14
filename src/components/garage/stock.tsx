import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StockCar, StockSnapshot } from "@/lib/autolina";
import { SectionHeading } from "./sections";
import { SalesContact } from "./people";

function CarPhoto({ car }: { car: StockCar }) {
  const [failed, setFailed] = useState(!car.image);
  const ref = useRef<HTMLImageElement>(null);
  // A photo that failed before hydration never fires onError, so check it once mounted.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed || !car.image)
    return (
      <div className="vehicle-photo-missing">
        <CarFront />
        <span>Photo à venir</span>
      </div>
    );
  return (
    <picture>
      <source type="image/avif" srcSet={car.image.replace(/\.jpg\?/, ".avif?")} />
      <img
        ref={ref}
        src={car.image}
        alt={`${car.make} ${car.model}`}
        width={534}
        height={401}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

function VehicleCard({ car }: { car: StockCar }) {
  const meta = [car.isNew ? "Neuf" : car.year, car.mileage, car.fuel].filter(Boolean).join(" · ");
  return (
    <Link
      to="/vehicules"
      search={{ annonce: car.path }}
      className="vehicle-card reveal-on-scroll"
      aria-label={`${car.make} ${car.model}${car.price ? `, ${car.price}` : ""}`}
    >
      <div className="vehicle-image">
        <CarPhoto car={car} />
        {car.isNew && <span className="vehicle-badge">Neuf</span>}
      </div>
      <div className="vehicle-info">
        <span className="vehicle-make">{car.make}</span>
        <h3>{car.model}</h3>
        <div className="vehicle-meta">{meta}</div>
        <div className="vehicle-bottom">
          <span className="vehicle-price">{car.price ?? "Prix sur demande"}</span>
          <ArrowRight />
        </div>
      </div>
    </Link>
  );
}

export function StockPreview({ stock }: { stock: StockSnapshot }) {
  const { cars, total } = stock;
  return (
    <section className="section stock-section">
      <div className="container">
        <SectionHeading
          eyebrow={
            <>
              <span className="live-dot" aria-hidden="true" />
              Nos dernières annonces
            </>
          }
          title="Votre prochaine voiture est ici."
          to="/vehicules"
          label={total ? `Voir les ${total} véhicules` : "Voir tous les véhicules"}
        />
        {cars.length > 0 ? (
          <div className="vehicle-grid">
            {cars.map((car) => (
              <VehicleCard car={car} key={car.id} />
            ))}
          </div>
        ) : (
          <div className="stock-placeholder">
            <div>
              <h3>Notre stock complet est en ligne.</h3>
              <p>
                Véhicules neufs Suzuki et occasions toutes marques, mis à jour par notre équipe.
              </p>
            </div>
            <Button variant="premium" asChild>
              <Link to="/vehicules">
                Voir le stock <ArrowRight />
              </Link>
            </Button>
          </div>
        )}
        <div className="stock-footer">
          <p className="stock-note">
            {cars.length > 0
              ? "Annonces en direct depuis notre stock Autolina. Prix et disponibilités sous réserve."
              : "Le stock est publié sur Autolina, la plateforme de notre service vente."}
          </p>
          <SalesContact compact />
        </div>
      </div>
    </section>
  );
}
