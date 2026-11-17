import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgePercent,
  HandCoins,
  SearchCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { salesOffers, team, type SalesOfferIcon } from "@/lib/garage";

const icons: Record<SalesOfferIcon, LucideIcon> = {
  rachat: HandCoins,
  financement: BadgePercent,
  recherche: SearchCheck,
  livraison: Truck,
};

/**
 * What the sales service does besides its stock (/vehicules, above Tiago's card): buying your
 * car, leasing or credit, finding a car that is not in stock, home delivery.
 */
export function SalesOffers() {
  return (
    <div className="sales-offers">
      <div className="sales-offers-head">
        <div className="eyebrow">Service vente</div>
        <h2 id="sales-offers-title">Plus qu’un stock de voitures.</h2>
        <p>Parlez-en à {team.vente.name}, votre conseiller vente.</p>
      </div>
      <ul className="sales-offers-list" aria-labelledby="sales-offers-title">
        {salesOffers.map((offer) => {
          const Icon = icons[offer.icon];
          const body = (
            <>
              <Icon className="sales-offer-icon" aria-hidden="true" />
              <span className="sales-offer-body">
                <strong>{offer.title}</strong>
                <span>{offer.text}</span>
                {"link" in offer && (
                  <span className="sales-offer-cta">
                    {offer.link.label} <ArrowRight aria-hidden="true" />
                  </span>
                )}
              </span>
            </>
          );
          return (
            <li key={offer.icon}>
              {"link" in offer ? (
                <Link to={offer.link.to} className="sales-offer sales-offer-link">
                  {body}
                </Link>
              ) : (
                <div className="sales-offer">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
