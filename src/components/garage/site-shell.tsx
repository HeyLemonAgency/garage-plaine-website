import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Phone,
  MapPin,
  Menu,
  X,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  MessageCircle,
  Facebook,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { garage, googleProfile, team, type Contact } from "@/lib/garage";
import { GoogleMark } from "./reviews";
import { OpenStatus, WhatsAppIcon, whatsappHref } from "./people";
import { useSpotlight } from "@/hooks/use-interactions";
import logo from "@/assets/garage-logo-720.png";

// The menu follows what a visitor comes to do: buy (new or used), the body shop, the workshop,
// the garage itself, contact. Sales and the body shop first, as the garage asked; Accueil leads.
type MenuLink = { to: string; label: string; hint?: string };
type MenuItem = MenuLink & { children?: readonly MenuLink[] };
const menu: readonly MenuItem[] = [
  { to: "/", label: "Accueil" },
  {
    to: "/vehicules",
    label: "Véhicules",
    children: [
      { to: "/suzuki", label: "Suzuki neuves", hint: "La gamme, le S-Cross en 3D, une offre" },
      { to: "/vehicules", label: "Stock neuf et occasion", hint: "Nos voitures disponibles" },
      { to: "/reprise", label: "Vendre ou faire reprendre", hint: "Votre voiture en 2 minutes" },
    ],
  },
  { to: "/carrosserie", label: "Carrosserie" },
  { to: "/atelier", label: "Atelier" },
  {
    to: "/entreprise",
    label: "Le garage",
    children: [
      { to: "/entreprise", label: "L’entreprise", hint: "Plus de 40 ans à Denges, l’équipe" },
      { to: "/station-service", label: "Station-service", hint: "Jubin, 24h/24 et 7j/7" },
      { to: "/wir", label: "Paiement WIR", hint: "Les conditions" },
    ],
  },
  { to: "/contact", label: "Contact" },
];

/** Desktop menu entry with a panel: opens on hover, click or keyboard; Escape or a click outside closes it. */
function NavGroup({ item, pathname }: { item: MenuItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const closeTimer = useRef(0);
  const active = item.children?.some((c) => c.to === pathname) ?? false;
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);
  return (
    <div
      className="nav-group"
      ref={root}
      data-open={open || undefined}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        window.clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        closeTimer.current = window.setTimeout(() => setOpen(false), 160);
      }}
    >
      <button
        type="button"
        className="nav-link nav-group-toggle"
        data-status={active ? "active" : undefined}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        {item.label}
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div className="nav-panel">
          {item.children?.map((c) => (
            <Link key={c.to + c.label} to={c.to} className="nav-panel-link">
              <strong>{c.label}</strong>
              {c.hint && <span>{c.hint}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Pages where a visitor is most likely shopping for a car: the mobile call button
// rings the sales advisor directly there.
const SALES_PAGES = new Set(["/vehicules", "/suzuki", "/reprise", "/offre"]);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useSpotlight();
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
          <Link to="/" className="logo" aria-label="Garage Carrosserie de la Plaine — Accueil">
            <img
              src={logo}
              alt="Garage Carrosserie de la Plaine, Denges — Suzuki"
              width={600}
              height={90}
            />
          </Link>
          <nav className="desktop-nav" aria-label="Navigation principale">
            {menu.map((item) =>
              item.children ? (
                <NavGroup key={item.label} item={item} pathname={pathname} />
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="nav-link"
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <Link to="/rendez-vous" className="header-cta">
            <CalendarDays />
            Rendez-vous
          </Link>
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
            {menu.map((item) =>
              item.children ? (
                <div className="mobile-nav-group" key={item.label}>
                  <span className="mobile-nav-label">{item.label}</span>
                  {item.children.map((c) => (
                    <Link key={c.to + c.label} to={c.to} className="mobile-nav-sub">
                      {c.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={item.to} to={item.to} activeOptions={{ exact: item.to === "/" }}>
                  {item.label}
                </Link>
              ),
            )}
            <Link to="/rendez-vous" className="mobile-nav-cta">
              <CalendarDays />
              Prendre rendez-vous
            </Link>
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
              <a href={whatsappHref(team.vente)} target="_blank" rel="noreferrer">
                <WhatsAppIcon />
                WhatsApp · {team.vente.mobile}
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
              <div className="footer-name">Garage Carrosserie de la Plaine.</div>
              <p>
                Votre garage de confiance à Denges. <br />
                Vente · Carrosserie · Atelier multimarque
              </p>
              <div className="footer-social">
                <a
                  href={googleProfile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-google"
                >
                  <GoogleMark /> Nos avis Google
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
                <a href={garage.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <Facebook aria-hidden="true" />
                </a>
                <a href={garage.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Instagram aria-hidden="true" />
                </a>
              </div>
            </div>
            <div>
              <h3>Plan du site</h3>
              <div className="footer-links">
                {menu
                  .flatMap((item) => item.children ?? [item])
                  .map((c) => (
                    <Link key={c.to + c.label} to={c.to} activeOptions={{ exact: c.to === "/" }}>
                      {c.label}
                    </Link>
                  ))}
                <Link to="/rendez-vous">Rendez-vous</Link>
              </div>
            </div>
            <div>
              <h3>Venez nous rencontrer</h3>
              <p>
                {garage.address} <br />
                {garage.locality}
              </p>
              <a href={garage.phoneHref}>{garage.phone}</a>
              <br />
              <a href={garage.directions} target="_blank" rel="noreferrer">
                Obtenir un itinéraire <ArrowUpRight className="inline size-3" />
              </a>
            </div>
            <div>
              <h3>Nos interlocuteurs</h3>
              <ul className="footer-people">
                {([team.vente, team.atelier, team.carrosserie] as Contact[]).map((c) => (
                  <li key={c.email}>
                    <span>{c.role}</span>
                    <strong>{c.name}</strong>
                    <p>
                      <a href={c.mobileHref ?? garage.phoneHref}>{c.mobile ?? garage.phone}</a>
                      {" · "}
                      <a href={`mailto:${c.email}`}>E-mail</a>
                      {c.whatsapp && (
                        <>
                          {" · "}
                          <a href={whatsappHref(c)} target="_blank" rel="noreferrer">
                            WhatsApp
                          </a>
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Garage Carrosserie de la Plaine · Denges</span>
            <span>Concessionnaire Suzuki · La Côte, Vaud</span>
            <Link to="/confidentialite">Confidentialité</Link>
          </div>
        </div>
      </footer>
      <QuickContact />
      <div className="mobile-call">
        <Button variant="premium" asChild>
          {salesPage ? (
            <a href={team.vente.mobileHref} aria-label="Appeler la vente">
              <Phone aria-hidden="true" />
              <span className="mc-long" aria-hidden="true">
                Appeler la vente
              </span>
              <span className="mc-short" aria-hidden="true">
                Appeler
              </span>
            </a>
          ) : (
            <a href={garage.phoneHref} aria-label="Appeler le garage">
              <Phone aria-hidden="true" />
              <span className="mc-long" aria-hidden="true">
                Appeler le garage
              </span>
              <span className="mc-short" aria-hidden="true">
                Appeler
              </span>
            </a>
          )}
        </Button>
        <Button variant="appointment" asChild>
          {salesPage ? (
            <Link to="/rendez-vous" search={{ besoin: "vente" }} aria-label="Demander un essai">
              <span className="mc-long" aria-hidden="true">
                Demander un essai
              </span>
              <span className="mc-short" aria-hidden="true">
                Essai
              </span>{" "}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ) : (
            <Link to="/rendez-vous" aria-label="Prendre rendez-vous">
              <span className="mc-long" aria-hidden="true">
                Prendre rendez-vous
              </span>
              <span className="mc-short" aria-hidden="true">
                Rendez-vous
              </span>{" "}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          )}
        </Button>
      </div>
    </>
  );
}

/** Desktop floating contact: who to call, whether we're open, and the planner. */
function QuickContact() {
  const [open, setOpen] = useState(false);
  // Shown once the visitor scrolls past the first screen: the hero keeps its own actions and
  // nothing floats over them (the S-Cross detail chips, the hero card).
  const [shown, setShown] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const check = () => setShown(window.scrollY > window.innerHeight * 0.6);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    root.current?.querySelector<HTMLElement>(".quick-panel a")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);
  if (pathname === "/rendez-vous") return null;
  return (
    <div
      className="quick-contact"
      ref={root}
      data-open={open || undefined}
      data-shown={shown || open || undefined}
    >
      {open && (
        <div className="quick-panel" role="dialog" aria-label="Contact rapide">
          <div className="quick-head">
            <strong>On vous répond.</strong>
            <OpenStatus />
          </div>
          <a href={garage.phoneHref} className="quick-row">
            <Phone />
            <span>
              <strong>Réception</strong>
              <span>{garage.phone}</span>
            </span>
          </a>
          <a href={team.vente.mobileHref} className="quick-row">
            <Phone />
            <span>
              <strong>Vente · {team.vente.name}</strong>
              <span>{team.vente.mobile}</span>
            </span>
          </a>
          <a
            href={whatsappHref(team.vente)}
            target="_blank"
            rel="noreferrer"
            className="quick-row quick-row-wa"
          >
            <WhatsAppIcon />
            <span>
              <strong>WhatsApp</strong>
              <span>Écrivez-nous, réponse rapide</span>
            </span>
          </a>
          <Link to="/rendez-vous" className="quick-row quick-row-primary">
            <CalendarDays />
            <span>
              <strong>Prendre rendez-vous</strong>
              <span>En quatre étapes, sans engagement</span>
            </span>
          </Link>
          <a href={garage.directions} target="_blank" rel="noreferrer" className="quick-row">
            <MapPin />
            <span>
              <strong>Itinéraire</strong>
              <span>{garage.address}, Denges</span>
            </span>
          </a>
        </div>
      )}
      <button
        type="button"
        className="quick-toggle"
        aria-expanded={open}
        aria-label={open ? "Fermer le contact rapide" : "Contact rapide"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <MessageCircle />}
        <span className="quick-toggle-label">{open ? "Fermer" : "Contact"}</span>
      </button>
    </div>
  );
}
