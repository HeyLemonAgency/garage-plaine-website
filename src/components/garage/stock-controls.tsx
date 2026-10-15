import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownUp, ArrowRight, Heart } from "lucide-react";
import type { StockCar } from "@/lib/autolina";
import { SORTS, type StockView } from "@/hooks/use-stock";

/** Filter chips, sort order and any extra tools (arrows) above a row of listings. */
export function StockControls({
  view,
  showFilters = true,
  sortable = true,
  children,
}: {
  view: StockView;
  showFilters?: boolean;
  sortable?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="stock-controls">
      {showFilters && view.filters.length > 1 ? (
        <div className="chip-row filter-row" role="group" aria-label="Filtrer les annonces">
          {view.filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-chip ${view.filter === f.id ? "is-active" : ""} ${f.id === "saved" ? "filter-chip-saved" : ""}`}
              aria-pressed={view.filter === f.id}
              onClick={() => view.setFilter(f.id)}
            >
              {f.id === "saved" && <Heart />}
              {f.label}
              <span className="filter-count">{f.count}</span>
            </button>
          ))}
        </div>
      ) : (
        <span />
      )}
      <div className="carousel-tools">
        {sortable && (
          <label className="sort-select">
            <span className="sr-only">Trier les annonces</span>
            <ArrowDownUp aria-hidden="true" />
            <select value={view.sort} onChange={(e) => view.setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {children}
      </div>
    </div>
  );
}

/** "2 véhicules dans votre sélection" with a link to request a test drive for them. */
export function SelectionBar({ cars }: { cars: StockCar[] }) {
  if (cars.length === 0) return null;
  return (
    <div className="selection-bar" role="status">
      <span>
        <Heart />
        {cars.length === 1
          ? "1 véhicule dans votre sélection"
          : `${cars.length} véhicules dans votre sélection`}
      </span>
      <Link
        to="/rendez-vous"
        search={{ besoin: "vente", selection: cars.map((c) => c.path).join(",") }}
      >
        {cars.length === 1 ? "Demander un essai" : "Demander un essai pour ces véhicules"}{" "}
        <ArrowRight />
      </Link>
    </div>
  );
}
