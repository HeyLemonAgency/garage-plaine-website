// The files a visitor joins to a message (the reprise form: photos of the car, the registration),
// sent to the Lemon platform with the message. Written next to src/lib/lemon.ts, which stays a
// copy of the Lemon site template; nothing here is specific to the garage, so it can be carried
// to the template as is.
/**
 * Pièces jointes d'un message (plateforme Lemon, 17.11.2026).
 *
 *   Sans fichier : le JSON habituel (src/lib/lemon.ts), rien ne change.
 *   Avec fichiers : le même POST {plateformeUrl}/api/public/v1/{tenant}/messages en
 *   multipart/form-data (un FormData du navigateur, sans Content-Type écrit à la main) :
 *     - partie `json` : le corps JSON habituel, en texte (20 Ko au plus) ;
 *     - une partie `fichiers` par fichier.
 *   Photos JPEG, PNG, WebP et PDF ; 5 fichiers au plus, 10 Mo chacun, 20 Mo en tout. La
 *   plateforme lit le type dans le contenu et refuse une photo HEIC : chaque photo est donc
 *   redessinée sur l'appareil en JPEG (2000 px de côté au plus, qualité 0.82, repli à 1400 px et
 *   0.75), ce qui lui retire aussi ses métadonnées et sa position GPS. Un PDF part tel quel.
 *   → 201 { ok: true } | 400 { error } (un fichier refusé refuse le message) | 429 | 503 (fichiers
 *   indisponibles : proposer d'envoyer sans eux).
 *
 * L'envoi part du navigateur (l'origine et l'adresse du visiteur comptent pour la plateforme).
 */
import {
  baseApi,
  creerClientLemon,
  type MessageContact,
  type OptionsClient,
  type ResultatEnvoi,
} from "@/lib/lemon";

export const FICHIERS_MAX = 5;
export const FICHIER_MAX_OCTETS = 10 * 1024 * 1024;
export const FICHIERS_MAX_OCTETS = 20 * 1024 * 1024;
/** What the file field offers: iOS hands a JPEG instead of a HEIC photo when HEIC is not listed. */
export const FORMATS_ACCEPTES = "image/jpeg,image/png,image/webp,application/pdf";
/** The photo as it leaves the device, then the fallback when the first drawing fails. */
export const PHOTO = { cote: 2000, qualite: 0.82 } as const;
export const PHOTO_REPLI = { cote: 1400, qualite: 0.75 } as const;
/** A multipart upload can take longer than a JSON message on a phone connection. */
export const DELAI_FICHIERS_MS = 120_000;

const NBSP = " ";
const cite = (nom: string) => `«${NBSP}${nom || "sans nom"}${NBSP}»`;

/** "1,4 Mo", "12 Mo", "380 Ko": the size as a visitor reads it. */
export function tailleLisible(octets: number): string {
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))}${NBSP}Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(/\.0$/, "").replace(".", ",")}${NBSP}Mo`;
}

type Nomme = { name: string; type: string };

export function estPdf(f: Nomme): boolean {
  return f.type === "application/pdf" || /\.pdf$/i.test(f.name);
}

/** Any picture the browser may open (an HEIC photo from a Mac included), never a drawing (SVG). */
export function estPhoto(f: Nomme): boolean {
  if (estPdf(f) || f.type === "image/svg+xml" || /\.svg$/i.test(f.name)) return false;
  return f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif|avif|gif|bmp)$/i.test(f.name);
}

const cle = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;

/**
 * The visitor picks more files: the ones that can go are added after those already chosen, the
 * others are named in a sentence (not a photo or a PDF, a PDF over 10 Mo, more than 5 files, more
 * than 20 Mo of PDF). A file picked twice is added once. Photos are counted small here: they leave
 * the device at about 1 Mo each, the PDF as they are.
 */
export function ajouterFichiers(
  actuels: readonly File[],
  nouveaux: readonly File[],
): { fichiers: File[]; refus: string[] } {
  const fichiers = [...actuels];
  const refus: string[] = [];
  const deja = new Set(fichiers.map(cle));
  const poidsPdf = (liste: File[]) => liste.filter(estPdf).reduce((s, f) => s + f.size, 0);
  let enTrop = 0;
  for (const f of nouveaux) {
    if (deja.has(cle(f))) continue;
    if (!estPdf(f) && !estPhoto(f)) {
      refus.push(`${cite(f.name)} n’est ni une photo ni un PDF.`);
      continue;
    }
    if (f.size === 0) {
      refus.push(`${cite(f.name)} est vide.`);
      continue;
    }
    if (estPdf(f) && f.size > FICHIER_MAX_OCTETS) {
      refus.push(
        `${cite(f.name)} fait ${tailleLisible(f.size)}${NBSP}: 10${NBSP}Mo au plus par fichier.`,
      );
      continue;
    }
    if (fichiers.length >= FICHIERS_MAX) {
      enTrop += 1;
      continue;
    }
    if (estPdf(f) && poidsPdf(fichiers) + f.size > FICHIERS_MAX_OCTETS) {
      refus.push(`${cite(f.name)} n’a pas été ajouté${NBSP}: 20${NBSP}Mo au plus en tout.`);
      continue;
    }
    fichiers.push(f);
    deja.add(cle(f));
  }
  if (enTrop === 1)
    refus.push(`${FICHIERS_MAX} fichiers au plus${NBSP}: un fichier n’a pas été ajouté.`);
  if (enTrop > 1)
    refus.push(
      `${FICHIERS_MAX} fichiers au plus${NBSP}: ${enTrop} fichiers n’ont pas été ajoutés.`,
    );
  return { fichiers, refus };
}

/** A picture opened by the browser, ready to be drawn. */
export type ImageOuverte = {
  largeur: number;
  hauteur: number;
  source?: CanvasImageSource;
  fermer(): void;
};

/** How a photo is opened and drawn: the browser's canvas, or a stand-in in the tests. */
export interface OutilsImage {
  ouvrir(fichier: File): Promise<ImageOuverte>;
  /** A JPEG at most `cote` pixels on its longer side, or null when the browser cannot draw it. */
  encoder(image: ImageOuverte, cote: number, qualite: number): Promise<Blob | null>;
}

export const outilsNavigateur: OutilsImage = {
  async ouvrir(fichier) {
    if (typeof createImageBitmap === "function") {
      try {
        const bmp = await createImageBitmap(fichier, { imageOrientation: "from-image" });
        return { largeur: bmp.width, hauteur: bmp.height, source: bmp, fermer: () => bmp.close() };
      } catch {
        // Safari without the options, or a format only <img> opens: try below.
      }
    }
    return new Promise<ImageOuverte>((ok, ko) => {
      const url = URL.createObjectURL(fichier);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (!img.naturalWidth || !img.naturalHeight) ko(new Error("image vide"));
        else
          ok({ largeur: img.naturalWidth, hauteur: img.naturalHeight, source: img, fermer() {} });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        ko(new Error("image illisible"));
      };
      img.src = url;
    });
  },
  encoder(image, cote, qualite) {
    return new Promise<Blob | null>((ok) => {
      const k = Math.min(1, cote / Math.max(image.largeur, image.hauteur));
      const toile = document.createElement("canvas");
      toile.width = Math.max(1, Math.round(image.largeur * k));
      toile.height = Math.max(1, Math.round(image.hauteur * k));
      const ctx = toile.getContext("2d");
      if (!ctx || !image.source) return ok(null);
      // a transparent PNG gets a white background, as on paper
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, toile.width, toile.height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image.source, 0, 0, toile.width, toile.height);
      try {
        toile.toBlob(ok, "image/jpeg", qualite);
      } catch {
        ok(null);
      }
    });
  },
};

/** "IMG_0042.HEIC" -> "IMG_0042.jpg": the name the garage sees, with what the file now is. */
export function nomJpeg(nom: string): string {
  return `${nom.replace(/\.[^.]+$/, "") || "photo"}.jpg`;
}

/**
 * One file as it will leave the device: a PDF as it is (10 Mo at most), a photo redrawn as a JPEG
 * (2000 px, 0.82; else 1400 px, 0.75), which leaves its metadata and GPS position behind.
 * Throws an Error whose message is the sentence for the visitor.
 */
export async function preparerFichier(
  fichier: File,
  outils: OutilsImage = outilsNavigateur,
): Promise<File> {
  if (estPdf(fichier)) {
    if (fichier.size > FICHIER_MAX_OCTETS)
      throw new Error(
        `${cite(fichier.name)} fait ${tailleLisible(fichier.size)}${NBSP}: 10${NBSP}Mo au plus par fichier.`,
      );
    return fichier;
  }
  if (!estPhoto(fichier)) throw new Error(`${cite(fichier.name)} n’est ni une photo ni un PDF.`);
  const illisible = `${cite(fichier.name)} ne s’ouvre pas${NBSP}: choisissez une photo JPG ou PNG, s’il vous plaît.`;
  let image: ImageOuverte;
  try {
    image = await outils.ouvrir(fichier);
  } catch {
    throw new Error(illisible);
  }
  try {
    const dessiner = (r: { cote: number; qualite: number }) =>
      outils.encoder(image, r.cote, r.qualite).catch(() => null);
    let jpeg = await dessiner(PHOTO);
    if (!jpeg || jpeg.size > FICHIER_MAX_OCTETS) jpeg = await dessiner(PHOTO_REPLI);
    if (!jpeg || jpeg.size === 0 || jpeg.size > FICHIER_MAX_OCTETS) throw new Error(illisible);
    return new File([jpeg], nomJpeg(fichier.name), { type: "image/jpeg" });
  } finally {
    image.fermer();
  }
}

/** Every file, one after the other (a phone keeps one photo in memory at a time), then the total. */
export async function preparerFichiers(
  fichiers: readonly File[],
  outils: OutilsImage = outilsNavigateur,
  progression?: (prets: number, total: number) => void,
): Promise<File[]> {
  if (fichiers.length > FICHIERS_MAX)
    throw new Error(
      `${FICHIERS_MAX} fichiers au plus${NBSP}: retirez-en ${fichiers.length - FICHIERS_MAX}.`,
    );
  const prets: File[] = [];
  for (const f of fichiers) {
    prets.push(await preparerFichier(f, outils));
    progression?.(prets.length, fichiers.length);
  }
  const total = prets.reduce((s, f) => s + f.size, 0);
  if (total > FICHIERS_MAX_OCTETS)
    throw new Error(
      `Les fichiers sont trop lourds${NBSP}: ${tailleLisible(total)} en tout, 20${NBSP}Mo au plus. Retirez un PDF.`,
    );
  return prets;
}

/** The JSON body of src/lib/lemon.ts (same fields, same trimming): the part `json` of a multipart message. */
export function corpsJson(message: MessageContact): MessageContact {
  return {
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
}

/** The multipart body: the JSON in `json`, each file in a part `fichiers` under its own name. */
export function corpsMultipart(message: MessageContact, fichiers: readonly File[]): FormData {
  const form = new FormData();
  form.append("json", JSON.stringify(corpsJson(message)));
  for (const f of fichiers) form.append("fichiers", f, f.name);
  return form;
}

export type ResultatDemande =
  | ResultatEnvoi
  /** 503: the platform cannot take files right now; the message can go without them. */
  | { ok: false; raison: "fichiers-indisponibles"; erreur: string };

/**
 * The message, with its files when there are any. Without a file it is exactly the client of
 * src/lib/lemon.ts (JSON). Like it, says { ok: true } only on 201 + { ok: true }.
 */
export function creerEnvoiDemande(options: OptionsClient & { delaiFichiersMs?: number }) {
  const client = creerClientLemon(options);
  const base = baseApi(options.plateformeUrl, options.tenant);
  const faireFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  const delaiMs = options.delaiFichiersMs ?? DELAI_FICHIERS_MS;

  return {
    configure: client.configure,

    async envoyer(
      message: MessageContact,
      fichiers: readonly File[] = [],
    ): Promise<ResultatDemande> {
      if (!fichiers.length) return client.envoyerMessage(message);
      if (!base) return { ok: false, raison: "non-configure" };
      const controle = new AbortController();
      const minuteur = setTimeout(() => controle.abort(), delaiMs);
      let reponse: Response;
      try {
        reponse = await faireFetch(`${base}/messages`, {
          method: "POST",
          // no Content-Type: the browser writes multipart/form-data with its boundary
          headers: { Accept: "application/json" },
          body: corpsMultipart(message, fichiers),
          credentials: "omit",
          mode: "cors",
          signal: controle.signal,
        });
      } catch {
        return { ok: false, raison: "reseau" };
      } finally {
        clearTimeout(minuteur);
      }
      const donnees = (await reponse.json().catch(() => null)) as {
        ok?: unknown;
        error?: unknown;
      } | null;
      const erreur = typeof donnees?.error === "string" ? donnees.error : null;
      if (reponse.status === 201 && donnees?.ok === true) return { ok: true };
      if (reponse.status === 400)
        return { ok: false, raison: "invalide", erreur: erreur ?? "Message refusé." };
      if (reponse.status === 429) return { ok: false, raison: "trop-de-demandes" };
      if (reponse.status === 503)
        return {
          ok: false,
          raison: "fichiers-indisponibles",
          erreur: erreur ?? "Les fichiers ne peuvent pas être reçus pour le moment.",
        };
      return { ok: false, raison: "serveur", statut: reponse.status };
    },
  };
}
