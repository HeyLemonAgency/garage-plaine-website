// Copied unchanged from the Lemon site template (lemon-site-modele, src/lib/lemon.ts): the
// shared client of the Lemon platform. Keep it identical so fixes can be carried both ways.
/**
 * Client de la plateforme Lemon.
 *
 * Le site ne garde aucune donnée personnelle et ne calcule rien : les messages,
 * réservations, commandes… sont reçus et traités par la plateforme Lemon
 * (la console du client). Contrat (version 1) :
 *
 *   POST {plateformeUrl}/api/public/v1/{tenant}/messages
 *     corps JSON : { name, email, phone?, company?, message, consent: true, page, lang, hp }
 *     (hp = pot de miel : champ caché, doit rester vide)
 *     → 201 { ok: true } | 400 { error } | 429 (trop de demandes)
 *
 *   GET  {plateformeUrl}/api/public/v1/{tenant}/content/{collection}
 *     → 200 [ … ] (tableau JSON), lu au moment du build (voir src/lib/contenu.ts)
 *
 *   POST {plateformeUrl}/api/public/v1/{tenant}/visites
 *     la mesure d'audience sans cookie (sendBeacon, text/plain) : voir src/lib/mesure.ts
 *
 * Règle d'or : on n'annonce jamais « message envoyé » si la plateforme ne l'a pas confirmé.
 */

export interface MessageContact {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  consent: true;
  /** Chemin de la page d'où part le message, ex. "/contact". */
  page: string;
  /** Langue de la page, ex. "fr". */
  lang: string;
  /** Pot de miel : toujours "" pour un humain. */
  hp: string;
}

export type ResultatEnvoi =
  | { ok: true }
  | { ok: false; raison: "non-configure" }
  | { ok: false; raison: "invalide"; erreur: string }
  | { ok: false; raison: "trop-de-demandes" }
  | { ok: false; raison: "serveur"; statut: number }
  | { ok: false; raison: "reseau" };

export interface OptionsClient {
  plateformeUrl: string;
  tenant: string;
  /** Pour les tests. */
  fetch?: typeof fetch;
  /** Délai maximum d'une requête, en millisecondes. */
  delaiMs?: number;
}

const TENANT_VALIDE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLLECTION_VALIDE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Adresse de base de l'API publique, ou null si la plateforme n'est pas configurée. */
export function baseApi(plateformeUrl: string, tenant: string): string | null {
  const url = plateformeUrl.trim().replace(/\/+$/, "");
  if (!url) return null;
  if (!/^https:\/\//.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url)) {
    throw new Error(`plateformeUrl doit commencer par https:// (reçu : ${plateformeUrl})`);
  }
  if (!TENANT_VALIDE.test(tenant)) {
    throw new Error(`tenant invalide : « ${tenant} » (minuscules, chiffres et tirets)`);
  }
  return `${url}/api/public/v1/${tenant}`;
}

/** Vérifications côté navigateur, avant l'envoi (la plateforme revérifie tout). */
export function verifierMessage(m: Partial<MessageContact>): string | null {
  if (!m.name?.trim()) return "Indiquez votre nom.";
  if (!m.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim()))
    return "Indiquez une adresse e-mail valide.";
  if (!m.message?.trim() || m.message.trim().length < 5)
    return "Écrivez quelques mots dans le message.";
  if (m.consent !== true) return "Cochez la case d'accord pour que nous puissions vous répondre.";
  return null;
}

export function creerClientLemon(options: OptionsClient) {
  const base = baseApi(options.plateformeUrl, options.tenant);
  const faireFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  const delaiMs = options.delaiMs ?? 15000;

  async function requete(chemin: string, init?: RequestInit): Promise<Response> {
    const controle = new AbortController();
    const minuteur = setTimeout(() => controle.abort(), delaiMs);
    try {
      return await faireFetch(`${base}${chemin}`, { ...init, signal: controle.signal });
    } finally {
      clearTimeout(minuteur);
    }
  }

  return {
    configure: base !== null,

    /** Envoie un message de contact. Ne renvoie { ok: true } que sur 201 + { ok: true }. */
    async envoyerMessage(message: MessageContact): Promise<ResultatEnvoi> {
      if (!base) return { ok: false, raison: "non-configure" };
      const corps: MessageContact = {
        name: message.name.trim(),
        email: message.email.trim(),
        message: message.message.trim(),
        consent: true,
        page: message.page,
        lang: message.lang,
        hp: message.hp,
        ...(message.phone?.trim() ? { phone: message.phone.trim() } : {}),
        ...(message.company?.trim() ? { company: message.company.trim() } : {}),
      };
      let reponse: Response;
      try {
        reponse = await requete("/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(corps),
          credentials: "omit",
          mode: "cors",
        });
      } catch {
        return { ok: false, raison: "reseau" };
      }
      const donnees = (await reponse.json().catch(() => null)) as {
        ok?: unknown;
        error?: unknown;
      } | null;
      if (reponse.status === 201 && donnees?.ok === true) return { ok: true };
      if (reponse.status === 400) {
        const erreur = typeof donnees?.error === "string" ? donnees.error : "Message refusé.";
        return { ok: false, raison: "invalide", erreur };
      }
      if (reponse.status === 429) return { ok: false, raison: "trop-de-demandes" };
      return { ok: false, raison: "serveur", statut: reponse.status };
    },

    /** Lit une collection de contenu (au build). Lève une erreur claire si ça échoue. */
    async lireCollection(collection: string): Promise<unknown[]> {
      if (!base) throw new Error("Plateforme non configurée (plateformeUrl vide).");
      if (!COLLECTION_VALIDE.test(collection))
        throw new Error(`Collection invalide : ${collection}`);
      const reponse = await requete(`/content/${collection}`, {
        headers: { Accept: "application/json" },
      });
      if (!reponse.ok) {
        throw new Error(
          `La plateforme a répondu ${reponse.status} pour la collection « ${collection} ».`,
        );
      }
      const donnees: unknown = await reponse.json();
      if (!Array.isArray(donnees)) {
        throw new Error(`La collection « ${collection} » n'est pas un tableau JSON.`);
      }
      return donnees;
    },
  };
}

export type ClientLemon = ReturnType<typeof creerClientLemon>;
