import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Camera, Mail } from "lucide-react";
import { PageIntro } from "@/components/garage/sections";
import { Button } from "@/components/ui/button";
import { team } from "@/lib/garage";
import { verifierMessage } from "@/lib/lemon";
import {
  accidentHistory,
  checkReprise,
  drives,
  equipmentOptions,
  fuels,
  gearboxes,
  photoChecklist,
  repriseIntents,
  repriseMessage,
  serviceBooks,
  type RepriseFields,
} from "@/lib/reprise";
import { pageHead } from "@/lib/seo";
import { SalesContact } from "@/components/garage/people";
import {
  Honeypot,
  NoScriptNote,
  SendError,
  SentPanel,
  lemon,
  sendToGarage,
  useInteractive,
  type SendState,
} from "@/components/garage/platform";

export const Route = createFileRoute("/reprise")({
  head: () =>
    pageHead({
      path: "/reprise",
      title: "Nous achetons votre voiture, à Denges",
      crumb: "Reprise",
      description:
        "Vous vendez votre voiture ? Le Garage Carrosserie de la Plaine à Denges achète et reprend les véhicules : décrivez le vôtre en ligne, le service vente vous recontacte.",
    }),
  component: Reprise,
});

const steps = [
  ["Décrivez votre voiture", "Deux minutes, depuis votre téléphone."],
  ["Le service vente vous rappelle", `${team.vente.name} vous recontacte et vous dit la suite.`],
  ["Vous passez à Denges", "Nous regardons la voiture ensemble et vous faisons une offre."],
] as const;

/** Tappable options backed by real radio buttons or checkboxes (keyboard and screen readers). */
function Options({
  name,
  legend,
  options,
  multiple = false,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  multiple?: boolean;
}) {
  return (
    <fieldset className="opt-group">
      <legend>{legend}</legend>
      <div className="opt-set">
        {options.map((o) => (
          <label className="opt" key={o}>
            <input type={multiple ? "checkbox" : "radio"} name={name} value={o} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function Reprise() {
  const [state, setState] = useState<SendState>({ step: "typing" });
  const [sent, setSent] = useState<{ name: string; car: string } | null>(null);
  const interactive = useInteractive();
  const seller = team.vente;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const text = (key: string) => String(d.get(key) ?? "");
    const fields: RepriseFields = {
      intent: text("intent"),
      make: text("make"),
      model: text("model"),
      version: text("version"),
      firstRegistration: text("firstRegistration"),
      mileage: text("mileage"),
      fuel: text("fuel"),
      gearbox: text("gearbox"),
      drive: text("drive"),
      power: text("power"),
      color: text("color"),
      lastInspection: text("lastInspection"),
      accident: text("accident"),
      serviceBook: text("serviceBook"),
      typeApproval: text("typeApproval"),
      equipment: d.getAll("equipment").map(String),
      price: text("price"),
      notes: text("notes"),
    };
    const contact = {
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      ...(d.get("consent") === "on" ? { consent: true as const } : {}),
    };
    const problem =
      checkReprise(fields) ??
      (contact.phone.trim().length < 6 ? "Indiquez un numéro de téléphone." : null) ??
      verifierMessage({ ...contact, message: "véhicule" });
    if (problem) {
      setState({ step: "error", message: problem });
      return;
    }
    setState({ step: "sending" });
    const result = await sendToGarage({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: repriseMessage(fields),
      hp: text("site_web"),
    });
    setState(result);
    if (result.step === "sent") {
      setSent({ name: contact.name.trim(), car: `${fields.make.trim()} ${fields.model.trim()}` });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const photosMail =
    sent &&
    `mailto:${seller.email}?subject=${encodeURIComponent(`Photos — ${sent.car} — ${sent.name}`)}&body=${encodeURIComponent(`Bonjour ${seller.name.split(" ")[0]},\n\nVoici les photos de ma ${sent.car}, en complément de la proposition envoyée depuis le site.\n\n${sent.name}`)}`;

  return (
    <>
      <PageIntro
        label="Reprise de véhicule"
        title="Nous achetons votre voiture."
        description="Vous la vendez, ou vous la reprenez contre une autre ? Décrivez-la ici : le service vente vous recontacte."
      />
      <section className="section">
        <div className="container reprise-layout">
          {state.step === "sent" && sent && photosMail ? (
            <SentPanel title={`Merci, ${seller.name} a bien reçu votre proposition.`}>
              <p>
                Il vous recontacte pour la suite. Pour une estimation plus précise, envoyez-lui
                quelques photos de votre {sent.car}&nbsp;:
              </p>
              <ul className="photo-list">
                {photoChecklist.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="detail-actions">
                <Button asChild variant="premium">
                  <a href={photosMail}>
                    <Camera /> Envoyer mes photos à {seller.name.split(" ")[0]}
                  </a>
                </Button>
                <a className="section-link" href={seller.mobileHref}>
                  Ou appelez-le au {seller.mobile}
                </a>
              </div>
            </SentPanel>
          ) : (
            <form onSubmit={submit} className="contact-form reprise-form" noValidate>
              <NoScriptNote contact={seller} />
              <Options name="intent" legend="Votre projet" options={repriseIntents} />

              <fieldset className="form-section">
                <legend>Votre voiture</legend>
                <div className="form-row">
                  <Field id="rp-make" label="Marque *">
                    <input id="rp-make" name="make" placeholder="Suzuki" maxLength={40} required />
                  </Field>
                  <Field id="rp-model" label="Modèle *">
                    <input
                      id="rp-model"
                      name="model"
                      placeholder="Vitara"
                      maxLength={60}
                      required
                    />
                  </Field>
                </div>
                <div className="form-row">
                  <Field
                    id="rp-first"
                    label="1re mise en circulation *"
                    hint="Mois et année, indiqués sur le permis de circulation."
                  >
                    <input
                      id="rp-first"
                      name="firstRegistration"
                      placeholder="05.2019"
                      inputMode="numeric"
                      maxLength={7}
                      required
                    />
                  </Field>
                  <Field id="rp-km" label="Kilométrage *">
                    <input
                      id="rp-km"
                      name="mileage"
                      placeholder="62 000"
                      inputMode="numeric"
                      maxLength={9}
                      required
                    />
                  </Field>
                </div>
                <Options name="fuel" legend="Carburant" options={fuels} />
                <div className="opt-pair">
                  <Options name="gearbox" legend="Boîte de vitesses" options={gearboxes} />
                  <Options name="drive" legend="Transmission" options={drives} />
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Son état</legend>
                <Options name="accident" legend="Accident" options={accidentHistory} />
                <Options name="serviceBook" legend="Carnet d’entretien" options={serviceBooks} />
                <div className="form-row">
                  <Field
                    id="rp-mfk"
                    label="Dernière expertise"
                    hint="Mois et année, si vous l’avez."
                  >
                    <input
                      id="rp-mfk"
                      name="lastInspection"
                      placeholder="03.2023"
                      inputMode="numeric"
                      maxLength={7}
                    />
                  </Field>
                  <Field id="rp-price" label="Prix souhaité (CHF)">
                    <input
                      id="rp-price"
                      name="price"
                      placeholder="Facultatif"
                      inputMode="numeric"
                      maxLength={9}
                    />
                  </Field>
                </div>
              </fieldset>

              <details className="form-more">
                <summary>Plus de détails, pour une offre plus précise</summary>
                <div className="form-row">
                  <Field
                    id="rp-version"
                    label="Version"
                    hint="Exemple : 1.4 Boosterjet Compact Top"
                  >
                    <input id="rp-version" name="version" maxLength={80} />
                  </Field>
                  <Field id="rp-power" label="Puissance (ch)">
                    <input id="rp-power" name="power" inputMode="numeric" maxLength={4} />
                  </Field>
                </div>
                <div className="form-row">
                  <Field id="rp-color" label="Couleur">
                    <input id="rp-color" name="color" maxLength={40} />
                  </Field>
                  <Field
                    id="rp-type"
                    label="N° de réception par type"
                    hint="Indiqué sur le permis de circulation."
                  >
                    <input id="rp-type" name="typeApproval" maxLength={20} />
                  </Field>
                </div>
                <Options
                  name="equipment"
                  legend="Équipements"
                  options={equipmentOptions}
                  multiple
                />
              </details>

              <Field id="rp-notes" label="Un mot sur la voiture">
                <textarea
                  id="rp-notes"
                  name="notes"
                  placeholder="Entretien récent, pneus, défauts, deuxième jeu de clés…"
                  maxLength={2000}
                />
              </Field>

              <fieldset className="form-section">
                <legend>Vos coordonnées</legend>
                <Field id="rp-name" label="Nom et prénom *">
                  <input id="rp-name" name="name" autoComplete="name" maxLength={100} required />
                </Field>
                <div className="form-row">
                  <Field id="rp-phone" label="Téléphone *">
                    <input
                      id="rp-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={30}
                      required
                    />
                  </Field>
                  <Field id="rp-email" label="E-mail *">
                    <input id="rp-email" name="email" type="email" autoComplete="email" required />
                  </Field>
                </div>
              </fieldset>
              <Honeypot />
              <label className="privacy">
                <input type="checkbox" name="consent" required />
                <span>
                  J’accepte que mes coordonnées soient utilisées pour répondre à ma demande.
                </span>
              </label>
              <div aria-live="polite">
                {state.step === "error" && <SendError message={state.message} contact={seller} />}
              </div>
              <div className="form-footer">
                <p>Les photos, vous pourrez les envoyer juste après.</p>
                <Button
                  variant="premium"
                  type="submit"
                  disabled={!interactive || !lemon.configure || state.step === "sending"}
                >
                  {state.step === "sending" ? "Envoi en cours…" : "Envoyer ma proposition"}{" "}
                  <ArrowRight />
                </Button>
              </div>
            </form>
          )}

          <aside className="reprise-aside">
            <h2>Comment ça se passe.</h2>
            <ol className="reprise-steps">
              {steps.map(([title, text], i) => (
                <li key={title} style={{ ["--i" as string]: i }}>
                  <span className="reprise-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                </li>
              ))}
            </ol>
            <SalesContact />
            {state.step !== "sent" && (
              <p className="small-note">
                <Mail className="inline size-4" /> Une question avant de remplir&nbsp;? Écrivez à{" "}
                <a href={`mailto:${seller.email}`}>{seller.email}</a>.
              </p>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
