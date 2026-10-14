import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import { garage, team, type Contact } from "@/lib/garage";
import { openingStatus, type OpeningStatus } from "@/lib/opening";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

/** Tiago Bessa's direct sales contact, used wherever a visitor looks at cars. */
export function SalesContact({ compact = false }: { compact?: boolean }) {
  const t = team.vente;
  return (
    <div className={compact ? "sales-contact sales-contact-compact" : "sales-contact"}>
      <div className="sales-avatar" aria-hidden="true">
        {initials(t.name)}
      </div>
      <div className="sales-body">
        <span className="sales-role">Votre conseiller vente</span>
        <strong className="sales-name">{t.name}</strong>
        <div className="sales-actions">
          <a className="sales-action sales-action-primary" href={t.mobileHref}>
            <Phone />
            {t.mobile}
          </a>
          <a className="sales-action" href={`mailto:${t.email}`}>
            <Mail />
            {t.email}
          </a>
        </div>
      </div>
    </div>
  );
}

function TeamMember({ contact }: { contact: Contact }) {
  return (
    <div className="staff-item">
      <div className="staff-role">{contact.role}</div>
      <h3>{contact.name}</h3>
      {contact.title && <p>{contact.title}</p>}
      <div className="staff-links">
        {contact.mobile && contact.mobileHref && (
          <a href={contact.mobileHref}>
            <Phone />
            {contact.mobile}
          </a>
        )}
        <a href={garage.phoneHref}>
          <Phone />
          {garage.phone}
        </a>
        <a href={`mailto:${contact.email}`}>
          <Mail />
          {contact.email}
        </a>
      </div>
    </div>
  );
}

export function TeamGrid() {
  return (
    <div className="staff-grid">
      {Object.values(team).map((contact) => (
        <TeamMember contact={contact} key={contact.email + contact.name} />
      ))}
    </div>
  );
}

/** Live open/closed badge. Rendered after hydration only, since it depends on the clock. */
export function OpenStatus({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<OpeningStatus | null>(null);
  useEffect(() => {
    const update = () => setStatus(openingStatus());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!status) return <span className={`open-status ${className}`} aria-hidden="true" />;
  return (
    <span className={`open-status open-status-${status.state} ${className}`}>
      <span className="open-dot" aria-hidden="true" />
      <strong>{status.label}</strong>
      {status.detail && <span className="open-detail">· {status.detail}</span>}
    </span>
  );
}
