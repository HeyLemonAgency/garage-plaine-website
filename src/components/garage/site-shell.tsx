import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, MapPin, Menu, X, ArrowUpRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { garage, team } from "@/lib/garage";
import { OpenStatus } from "./people";
import logo from "@/assets/garage-logo.png";

const nav = [
  ["/", "Accueil"],
  ["/entreprise", "Entreprise"],
  ["/services", "Services"],
  ["/vehicules", "Véhicules"],
  ["/suzuki", "Partenaire Suzuki"],
  ["/contact", "Contact"],
] as const;

// Pages where a visitor is most likely shopping for a car: the mobile call button
// rings the sales advisor directly there.
const SALES_PAGES = new Set(["/vehicules", "/suzuki", "/reprise"]);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <div className="info-bar">
        <div className="container info-inner">
          <a href={garage.directions} target="_blank" rel="noreferrer">
            <MapPin />
            {garage.address}, 1026 Denges
          </a>
          <div className="info-right">
            <OpenStatus className="info-status" />
            <a className="info-phone" href={garage.phoneHref}>
              <Phone />
              {garage.phone}
            </a>
          </div>
        </div>
      </div>
      <header className="site-header" data-scrolled={scrolled || undefined}>
        <div className="container nav-row">
          <Link to="/" className="logo" aria-label="Garage de la Plaine — Accueil">
            <img
              src={logo}
              alt="Garage-Carrosserie de la Plaine, Denges — Suzuki"
              width={600}
              height={90}
            />
          </Link>
          <nav className="desktop-nav" aria-label="Navigation principale">
            {nav.map(([to, label]) => (
              <Link key={to} to={to} className="nav-link" activeOptions={{ exact: to === "/" }}>
                {label}
              </Link>
            ))}
          </nav>
          <Button
            className="mobile-toggle"
            variant="ghost"
            size="icon"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        {open && (
          <nav className="mobile-nav" id="mobile-nav" aria-label="Navigation mobile">
            {nav.map(([to, label]) => (
              <Link key={to} to={to} activeOptions={{ exact: to === "/" }}>
                {label}
              </Link>
            ))}
            <div className="mobile-nav-contacts">
              <OpenStatus />
              <a href={garage.phoneHref}>
                <Phone />
                Réception · {garage.phone}
              </a>
              <a href={team.vente.mobileHref}>
                <Phone />
                Vente · {team.vente.name} · {team.vente.mobile}
              </a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const salesPage = SALES_PAGES.has(pathname);
  return (
    <>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <div className="footer-name">Garage de la Plaine.</div>
              <p>
                Votre garage de confiance à Denges.
                <br />
                Vente · Carrosserie · Atelier multimarque
              </p>
            </div>
            <div>
              <h3>Le garage</h3>
              <div className="footer-links">
                {nav.map(([to, label]) => (
                  <Link key={to} to={to}>
                    {label}
                  </Link>
                ))}
                <Link to="/reprise">Reprise de véhicule</Link>
                <Link to="/station-service">Station-service</Link>
                <Link to="/wir">Paiement WIR</Link>
              </div>
            </div>
            <div>
              <h3>Venez nous rencontrer</h3>
              <p>
                {garage.address}
                <br />
                {garage.locality}
              </p>
              <a href={garage.phoneHref}>{garage.phone}</a>
              <br />
              <a href={garage.directions} target="_blank" rel="noreferrer">
                Obtenir un itinéraire <ArrowUpRight className="inline size-3" />
              </a>
            </div>
            <div>
              <h3>Service vente</h3>
              <p>{team.vente.name}</p>
              <a href={team.vente.mobileHref}>{team.vente.mobile}</a>
              <br />
              <a href={`mailto:${team.vente.email}`}>
                <Mail className="inline size-3" /> {team.vente.email}
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Garage de la Plaine · Denges</span>
            <span>Agent officiel Suzuki · La Côte, Vaud</span>
            <Link to="/confidentialite">Confidentialité</Link>
          </div>
        </div>
      </footer>
      <div className="mobile-call">
        <Button variant="premium" asChild>
          {salesPage ? (
            <a href={team.vente.mobileHref}>
              <Phone />
              Appeler la vente
            </a>
          ) : (
            <a href={garage.phoneHref}>
              <Phone />
              Appeler le garage
            </a>
          )}
        </Button>
        <Button variant="appointment" asChild>
          {salesPage ? (
            <Link to="/contact" search={{ demande: "vente" }} hash="contact">
              Demander une offre <ArrowUpRight />
            </Link>
          ) : (
            <Link to="/contact">
              Prendre rendez-vous <ArrowUpRight />
            </Link>
          )}
        </Button>
      </div>
    </>
  );
}
