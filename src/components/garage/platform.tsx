// What every form of the site shares to reach the garage's console on the Lemon platform:
// the client, the send states, the error texts, the honeypot and the direct-contact fallback.
// Rule: a form says "sent" only once the platform has answered 201 { ok: true }.
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { creerClientLemon, type MessageContact, type ResultatEnvoi } from "@/lib/lemon";
import { plateforme } from "@/lib/site";
import { garage, type Contact } from "@/lib/garage";

export const lemon = creerClientLemon(plateforme);

export type SendState =
  | { step: "typing" }
  | { step: "sending" }
  | { step: "sent" }
  /** `invalid`: a field to correct (no « or call us » tail, the visitor just fixes it). */
  | { step: "error"; message: string; invalid?: boolean };

export function failureText(result: Exclude<ResultatEnvoi, { ok: true }>): string {
  switch (result.raison) {
    case "invalide":
      return `Le message n’a pas été accepté : ${result.erreur}`;
    case "trop-de-demandes":
      return "Trop de messages envoyés depuis cette connexion. Réessayez dans quelques minutes.";
    case "reseau":
      return "Le message n’est pas parti : la connexion a échoué. Vérifiez votre connexion et réessayez.";
    case "serveur":
      return `Le message n’est pas parti (erreur ${result.statut} de notre côté). Réessayez plus tard.`;
    case "non-configure":
      return "Le formulaire n’est pas encore relié à la messagerie du garage.";
  }
}

/** Sends one message from the current page; resolves to the state the form should show. */
export async function sendToGarage(
  message: Omit<MessageContact, "consent" | "page" | "lang">,
): Promise<SendState> {
  const result = await lemon.envoyerMessage({
    ...message,
    consent: true,
    page: window.location.pathname,
    lang: document.documentElement.lang.slice(0, 2) || "fr",
  });
  return result.ok ? { step: "sent" } : { step: "error", message: failureText(result) };
}

const subscribeNothing = () => () => undefined;

/** False while server-rendered, true once the page runs: forms only submit with JavaScript. */
export function useInteractive(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

/** Hidden from people, filled in by robots; sent as-is, the platform decides. */
export function Honeypot({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  const id = useId();
  return (
    <div className="form-honeypot" aria-hidden="true">
      <label htmlFor={id}>Ne pas remplir ce champ</label>
      <input
        id={id}
        name="site_web"
        tabIndex={-1}
        autoComplete="off"
        {...(onChange ? { value: value ?? "", onChange: (e) => onChange(e.target.value) } : {})}
      />
    </div>
  );
}

/** "…or call / write directly": offered with every error and when JavaScript is off. */
export function DirectContact({ contact }: { contact: Contact }) {
  return (
    <>
      appeler le <a href={garage.phoneHref}>{garage.phone}</a> ou écrire à{" "}
      <a href={`mailto:${contact.email}`}>{contact.email}</a>.
    </>
  );
}

export function SendError({
  message,
  contact,
  invalid = false,
}: {
  message: string;
  contact: Contact;
  invalid?: boolean;
}) {
  return (
    <p role="alert" className="form-status form-error">
      {message}
      {!invalid && (
        <>
          {" "}
          Vous pouvez aussi <DirectContact contact={contact} />
        </>
      )}
    </p>
  );
}

/** Brings a confirmation into view (below the sticky header) and gives it the focus. */
export function useRevealOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      el.getBoundingClientRect().top < 90 ||
      el.getBoundingClientRect().bottom > window.innerHeight
    )
      el.scrollIntoView({ block: "start", behavior: "smooth" });
    el.focus({ preventScroll: true });
  }, []);
  return ref;
}

export function NoScriptNote({ contact }: { contact: Contact }) {
  return (
    <noscript>
      <p className="form-status form-error">
        Ce formulaire a besoin de JavaScript. Vous pouvez aussi <DirectContact contact={contact} />
      </p>
    </noscript>
  );
}

/** The confirmation that replaces a form once the platform has confirmed the message. */
export function SentPanel({ title, children }: { title: string; children?: ReactNode }) {
  const ref = useRevealOnMount<HTMLDivElement>();
  return (
    <div className="contact-form form-sent" role="status" ref={ref} tabIndex={-1}>
      <span className="form-sent-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="m7.5 12.5 3 3 6-6.5" />
        </svg>
      </span>
      <strong>{title}</strong>
      {children}
    </div>
  );
}
