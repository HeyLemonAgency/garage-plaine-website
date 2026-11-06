import { useEffect, useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import { garage, team, type Contact } from "@/lib/garage";
import { openingStatus, type OpeningStatus } from "@/lib/opening";

/**
 * A person's face: their portrait, or until one is supplied a neutral frame with a
 * silhouette (never invented faces). `className` gives the size and shape of each spot.
 */
export function Portrait({ contact, className }: { contact: Contact; className: string }) {
  if (contact.photo)
    return (
      <img
        className={`portrait ${className}`}
        src={contact.photo}
        alt={`${contact.name}, ${contact.role}`}
        loading="lazy"
        decoding="async"
      />
    );
  return (
    <span className={`portrait portrait-empty ${className}`} aria-hidden="true">
      <UserRound />
    </span>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.59-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.22-3.74.99 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.48-8.4Z" />
    </svg>
  );
}

/**
 * A WhatsApp chat with this contact, or with the garage's WhatsApp (named for the right
 * department) when the contact has no number of their own.
 */
export function whatsappHref(contact: Contact, text?: string): string {
  const own = Boolean(contact.whatsapp);
  const opening = own
    ? `Bonjour ${contact.name.split(" ")[0]}, `
    : `Bonjour, une question pour ${contact.forWhom ?? contact.role.toLowerCase()} (${contact.name}) : `;
  return `${contact.whatsapp ?? garage.whatsapp}?text=${encodeURIComponent(text ?? opening)}`;
}

/** The same three ways to reach anyone on the site: call, WhatsApp, e-mail. */
export function ContactActions({
  contact,
  className = "",
  showEmail = false,
}: {
  contact: Contact;
  className?: string;
  showEmail?: boolean;
}) {
  const phone = contact.mobileHref
    ? { href: contact.mobileHref, label: contact.mobile ?? garage.phone }
    : { href: garage.phoneHref, label: garage.phone };
  return (
    <div className={`contact-actions ${className}`}>
      <a className="contact-action contact-action-call" href={phone.href}>
        <Phone aria-hidden="true" />
        <span>{phone.label}</span>
      </a>
      <a
        className="contact-action contact-action-wa"
        href={whatsappHref(contact)}
        target="_blank"
        rel="noreferrer"
        aria-label={
          contact.whatsapp
            ? `WhatsApp, ${contact.name} (nouvel onglet)`
            : `WhatsApp du garage, pour ${contact.forWhom ?? contact.role.toLowerCase()} (nouvel onglet)`
        }
      >
        <WhatsAppIcon />
        <span>WhatsApp</span>
      </a>
      <a
        className="contact-action contact-action-mail"
        href={`mailto:${contact.email}`}
        aria-label={`E-mail à ${contact.name} : ${contact.email}`}
      >
        <Mail aria-hidden="true" />
        <span>
          {showEmail ? (
            // A long address may break after the "@", never in the middle of a word.
            <>
              {contact.email.split("@")[0]}@<wbr />
              {contact.email.split("@")[1]}
            </>
          ) : (
            "E-mail"
          )}
        </span>
      </a>
    </div>
  );
}

/** Tiago Bessa's direct sales contact, used wherever a visitor looks at cars. */
export function SalesContact({ compact = false }: { compact?: boolean }) {
  const t = team.vente;
  return (
    <div className={compact ? "sales-contact sales-contact-compact" : "sales-contact"}>
      <Portrait contact={t} className="sales-avatar" />
      <div className="sales-body">
        <span className="sales-role">Votre conseiller vente</span>
        <strong className="sales-name">{t.name}</strong>
        <ContactActions contact={t} />
      </div>
    </div>
  );
}

/** « Jérôme Baatard » → « JB »: the round mark of a person without a portrait yet. */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

function TeamMember({ contact }: { contact: Contact }) {
  return (
    <div className="staff-item">
      {contact.photo ? (
        <Portrait contact={contact} className="staff-photo" />
      ) : (
        <span className="staff-photo staff-initials" aria-hidden="true">
          {initials(contact.name)}
        </span>
      )}
      <div className="staff-role">
        {contact.role}
        {contact.title ? ` · ${contact.title}` : ""}
      </div>
      <h3>{contact.name}</h3>
      <ContactActions contact={contact} className="contact-actions-stack" showEmail />
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
