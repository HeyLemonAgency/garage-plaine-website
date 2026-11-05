import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/garage/sections";
import { Button } from "@/components/ui/button";
import { suzukiRange, team } from "@/lib/garage";
import { verifierMessage } from "@/lib/lemon";
import {
  asksDrive,
  asksGearbox,
  driveChoices,
  financingChoices,
  gearboxChoices,
  isModelId,
  offerMessage,
  optionChoices,
  timingChoices,
  type ModelId,
} from "@/lib/offer";
import { pageHead } from "@/lib/seo";
import { groupDigits } from "@/lib/reprise";
import { SalesContact } from "@/components/garage/people";
import { Field, Options } from "@/components/garage/form-parts";
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

type OfferSearch = { modele?: ModelId };

export const Route = createFileRoute("/offre")({
  validateSearch: (search: Record<string, unknown>): OfferSearch =>
    isModelId(search["modele"]) ? { modele: search["modele"] } : {},
  head: () =>
    pageHead({
      path: "/offre",
      title: "Demander une offre pour une Suzuki neuve, à Denges",
      crumb: "Offre Suzuki",
      description:
        "Demandez une offre pour une Suzuki neuve au Garage Carrosserie de la Plaine à Denges : modèle, boîte, 4x4, teinte, options, leasing ou financement, et reprise de votre véhicule.",
    }),
  component: Offre,
});

function Offre() {
  const { modele } = Route.useSearch();
  const [modelId, setModelId] = useState<ModelId>(modele ?? "s-cross");
  const [tradeIn, setTradeIn] = useState(false);
  const [state, setState] = useState<SendState>({ step: "typing" });
  const interactive = useInteractive();
  const seller = team.vente;
  const model = suzukiRange.find((m) => m.id === modelId) ?? suzukiRange[0];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const text = (key: string) => String(d.get(key) ?? "");
    const contact = {
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      ...(d.get("consent") === "on" ? { consent: true as const } : {}),
    };
    const problem =
      (contact.phone.trim().length < 6 ? "Indiquez un numéro de téléphone." : null) ??
      verifierMessage({ ...contact, message: "offre" });
    if (problem) {
      setState({ step: "error", message: problem });
      return;
    }
    const trade = tradeIn
      ? [
          text("tradeMake"),
          text("tradeYear"),
          groupDigits(text("tradeKm")) && `${groupDigits(text("tradeKm"))} km`,
        ]
          .map((v) => v.trim())
          .filter(Boolean)
          .join(", ") || "oui"
      : "";
    setState({ step: "sending" });
    const result = await sendToGarage({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      hp: text("site_web"),
      message: offerMessage(
        {
          model,
          gearbox: text("gearbox"),
          drive: text("drive"),
          colour: text("colour"),
          options: d.getAll("options").map(String),
          version: text("version"),
          financing: text("financing"),
          timing: text("timing"),
          testDrive: d.get("testDrive") === "on",
          tradeIn: trade,
          notes: text("notes"),
        },
        seller.name,
      ),
    });
    setState(result);
    if (result.step === "sent") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <PageIntro
        label="Offre Suzuki neuve"
        title={`Votre offre pour une Suzuki ${model.name}.`}
        description="Dites-nous ce qui compte pour vous : Tiago Bessa vous prépare une offre détaillée, avec le financement et la reprise si vous le souhaitez."
      />
      <section className="section">
        <div className="container reprise-layout">
          {state.step === "sent" ? (
            <SentPanel title={`Merci, ${seller.name} prépare votre offre.`}>
              <p>
                Il vous recontacte pour la Suzuki {model.name}, en général dans la journée ouvrable.
                Une question d’ici là&nbsp;? Appelez-le au{" "}
                <a href={seller.mobileHref}>{seller.mobile}</a>.
              </p>
              <div className="detail-actions">
                <Button asChild variant="appointment">
                  <Link to="/suzuki" hash="gamme">
                    Revoir la gamme Suzuki
                  </Link>
                </Button>
              </div>
            </SentPanel>
          ) : (
            <form onSubmit={submit} className="contact-form reprise-form" noValidate>
              <NoScriptNote contact={seller} />
              <fieldset className="opt-group">
                <legend>Le modèle</legend>
                <div className="opt-set">
                  {suzukiRange.map((m) => (
                    <label className="opt" key={m.id}>
                      <input
                        type="radio"
                        name="model"
                        value={m.id}
                        checked={m.id === modelId}
                        onChange={() => setModelId(m.id)}
                      />
                      <span>{m.name}</span>
                    </label>
                  ))}
                </div>
                <p className="field-hint">
                  {model.kind} · {model.text}{" "}
                  <a href={model.url} target="_blank" rel="noreferrer" className="text-link">
                    Sur suzuki.ch <ArrowUpRight className="inline size-3" />
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>
                </p>
              </fieldset>

              <fieldset className="form-section" key={model.id}>
                <legend>Vos préférences</legend>
                {(asksGearbox(model) || asksDrive(model)) && (
                  <div className="opt-pair">
                    {asksGearbox(model) && (
                      <Options name="gearbox" legend="Boîte" options={gearboxChoices} />
                    )}
                    {asksDrive(model) && (
                      <Options name="drive" legend="Transmission" options={driveChoices} />
                    )}
                  </div>
                )}
                <div className="form-row">
                  <Field id="of-version" label="Version ou équipement" hint="Si vous savez déjà.">
                    <input id="of-version" name="version" maxLength={80} />
                  </Field>
                  <Field id="of-colour" label="Teinte souhaitée">
                    <input id="of-colour" name="colour" maxLength={40} />
                  </Field>
                </div>
                <Options name="options" legend="Options" options={optionChoices} multiple />
              </fieldset>

              <fieldset className="form-section">
                <legend>Le financement</legend>
                <Options name="financing" legend="Paiement" options={financingChoices} />
                <Options name="timing" legend="Délai" options={timingChoices} />
                <label className="privacy">
                  <input type="checkbox" name="testDrive" />
                  <span>Je souhaite aussi un essai sur route.</span>
                </label>
                <label className="privacy">
                  <input
                    type="checkbox"
                    checked={tradeIn}
                    onChange={(e) => setTradeIn(e.target.checked)}
                  />
                  <span>J’ai un véhicule à faire reprendre.</span>
                </label>
                {tradeIn && (
                  <div className="form-row form-row-3">
                    <Field id="of-trade" label="Marque et modèle">
                      <input id="of-trade" name="tradeMake" maxLength={60} />
                    </Field>
                    <Field id="of-trade-year" label="Année">
                      <input
                        id="of-trade-year"
                        name="tradeYear"
                        inputMode="numeric"
                        maxLength={4}
                      />
                    </Field>
                    <Field id="of-trade-km" label="Kilométrage">
                      <input id="of-trade-km" name="tradeKm" inputMode="numeric" maxLength={9} />
                    </Field>
                  </div>
                )}
              </fieldset>

              <Field id="of-notes" label="Un mot pour Tiago">
                <textarea
                  id="of-notes"
                  name="notes"
                  placeholder="Budget, usage, nombre de places, kilomètres par an…"
                  maxLength={2000}
                />
              </Field>

              <fieldset className="form-section">
                <legend>Vos coordonnées</legend>
                <Field id="of-name" label="Nom et prénom *">
                  <input id="of-name" name="name" autoComplete="name" maxLength={100} required />
                </Field>
                <div className="form-row">
                  <Field id="of-phone" label="Téléphone *">
                    <input
                      id="of-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={30}
                      required
                    />
                  </Field>
                  <Field id="of-email" label="E-mail *">
                    <input id="of-email" name="email" type="email" autoComplete="email" required />
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
                <p>Sans engagement : c’est une demande d’offre, pas une commande.</p>
                <Button
                  variant="premium"
                  type="submit"
                  disabled={!interactive || !lemon.configure || state.step === "sending"}
                >
                  {state.step === "sending" ? "Envoi en cours…" : "Demander mon offre"}{" "}
                  <ArrowRight />
                </Button>
              </div>
            </form>
          )}

          <aside className="reprise-aside">
            <h2>Une offre faite pour vous.</h2>
            <ol className="reprise-steps">
              {[
                ["Vos préférences", "Le modèle, la boîte, la teinte, les options."],
                ["L’offre de Tiago", "Le prix, le financement ou le leasing, et la reprise."],
                ["L’essai à Denges", "Sur les routes que vous connaissez, avant de décider."],
              ].map(([title, body], i) => (
                <li key={title}>
                  <span className="reprise-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </div>
                </li>
              ))}
            </ol>
            <SalesContact />
          </aside>
        </div>
      </section>
    </>
  );
}
