/** Pièces jointes : ce qui part de l'appareil, et le corps envoyé à la plateforme Lemon. */
import { describe, expect, it, vi } from "vitest";
import type { MessageContact } from "@/lib/lemon";
import {
  FICHIER_MAX_OCTETS,
  FORMATS_ACCEPTES,
  ajouterFichiers,
  corpsJson,
  creerEnvoiDemande,
  estPdf,
  estPhoto,
  nomJpeg,
  preparerFichier,
  preparerFichiers,
  tailleLisible,
  type ImageOuverte,
  type OutilsImage,
} from "@/lib/pieces-jointes";

const Mo = 1024 * 1024;
/** The site's French typography: a no-break space inside « » and before « : », between a number and its unit. */
const nb = (s: string) =>
  s
    .replace(/« /g, "«\u00a0")
    .replace(/ »/g, "\u00a0»")
    .replace(/ :/g, "\u00a0:")
    .replace(/(\d) (Mo|Ko)/g, "$1\u00a0$2");

/** A file of `taille` bytes (only its size and its name matter here). */
function fichier(nom: string, type: string, taille = 2048, contenu?: string): File {
  const f = new File([contenu ?? "x"], nom, { type, lastModified: 1 });
  if (contenu === undefined) Object.defineProperty(f, "size", { value: taille });
  return f;
}

const photo = (nom = "avant.jpg", taille = 4 * Mo) => fichier(nom, "image/jpeg", taille);
const pdf = (nom = "permis.pdf", taille = 200 * 1024) => fichier(nom, "application/pdf", taille);

/** A stand-in for the browser's canvas: records each drawing, answers with the given JPEGs. */
function outils(reponses: (Blob | null)[], ouvrir?: () => Promise<ImageOuverte>) {
  const fermer = vi.fn();
  const encoder = vi.fn(async () => reponses.shift() ?? null);
  const o: OutilsImage = {
    ouvrir: ouvrir ?? (async () => ({ largeur: 4000, hauteur: 3000, fermer })),
    encoder,
  };
  return { o, encoder, fermer };
}
const jpeg = (taille = 600 * 1024) => {
  const b = new Blob(["jpeg"], { type: "image/jpeg" });
  Object.defineProperty(b, "size", { value: taille });
  return b;
};

describe("les fichiers acceptés", () => {
  it("le champ propose photos JPEG, PNG, WebP et PDF (pas HEIC : iOS livre alors un JPEG)", () => {
    expect(FORMATS_ACCEPTES).toBe("image/jpeg,image/png,image/webp,application/pdf");
    expect(FORMATS_ACCEPTES).not.toMatch(/heic/i);
  });

  it("reconnaît un PDF et une photo, par le type ou par le nom", () => {
    expect(estPdf(pdf())).toBe(true);
    expect(estPdf(fichier("Permis.PDF", ""))).toBe(true);
    expect(estPhoto(photo())).toBe(true);
    expect(estPhoto(fichier("IMG_0042.HEIC", ""))).toBe(true);
    expect(estPhoto(fichier("plan.svg", "image/svg+xml"))).toBe(false);
    expect(estPhoto(pdf())).toBe(false);
    expect(estPhoto(fichier("notes.docx", "application/msword"))).toBe(false);
  });

  it("ajoute photos et PDF, et nomme ce qui ne peut pas partir", () => {
    const { fichiers, refus } = ajouterFichiers(
      [],
      [photo(), pdf(), fichier("notes.docx", "application/msword"), pdf("gros.pdf", 12 * Mo)],
    );
    expect(fichiers.map((f) => f.name)).toEqual(["avant.jpg", "permis.pdf"]);
    expect(refus).toEqual([
      nb("« notes.docx » n’est ni une photo ni un PDF."),
      nb("« gros.pdf » fait 12 Mo : 10 Mo au plus par fichier."),
    ]);
  });

  it("5 fichiers au plus, un fichier choisi deux fois compte une fois", () => {
    const deja = [photo("1.jpg"), photo("2.jpg"), photo("3.jpg"), photo("4.jpg")];
    const { fichiers, refus } = ajouterFichiers(deja, [
      deja[0]!,
      photo("5.jpg"),
      photo("6.jpg"),
      photo("7.jpg"),
    ]);
    expect(fichiers.map((f) => f.name)).toEqual(["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]);
    expect(refus).toEqual([nb("5 fichiers au plus : 2 fichiers n’ont pas été ajoutés.")]);
  });

  it("20 Mo de PDF au plus en tout ; une photo lourde passe (elle sera réduite)", () => {
    const { fichiers, refus } = ajouterFichiers(
      [pdf("a.pdf", 9 * Mo), pdf("b.pdf", 9 * Mo)],
      [pdf("c.pdf", 3 * Mo), photo("lourde.jpg", 18 * Mo)],
    );
    expect(fichiers.map((f) => f.name)).toEqual(["a.pdf", "b.pdf", "lourde.jpg"]);
    expect(refus).toEqual([nb("« c.pdf » n’a pas été ajouté : 20 Mo au plus en tout.")]);
  });

  it("refuse un fichier vide", () => {
    expect(ajouterFichiers([], [fichier("vide.jpg", "image/jpeg", 0)]).refus).toEqual([
      nb("« vide.jpg » est vide."),
    ]);
  });

  it("écrit les tailles comme on les lit", () => {
    expect(tailleLisible(380 * 1024)).toBe(nb("380 Ko"));
    expect(tailleLisible(100)).toBe(nb("1 Ko"));
    expect(tailleLisible(1.44 * Mo)).toBe(nb("1,4 Mo"));
    expect(tailleLisible(12 * Mo)).toBe(nb("12 Mo"));
  });
});

describe("la préparation sur l'appareil", () => {
  it("redessine une photo en JPEG de 2000 px au plus, qualité 0.82, et la renomme en .jpg", async () => {
    const { o, encoder, fermer } = outils([jpeg()]);
    const pret = await preparerFichier(photo("IMG_0042.HEIC"), o);
    expect(encoder).toHaveBeenCalledTimes(1);
    expect(encoder.mock.calls[0]!.slice(1)).toEqual([2000, 0.82]);
    expect(pret.name).toBe("IMG_0042.jpg");
    expect(pret.type).toBe("image/jpeg");
    expect(pret.size).toBeLessThan(FICHIER_MAX_OCTETS);
    expect(fermer).toHaveBeenCalled();
  });

  it("se replie sur 1400 px et 0.75 quand le premier dessin échoue", async () => {
    const { o, encoder } = outils([null, jpeg()]);
    await preparerFichier(photo(), o);
    expect(encoder.mock.calls.map((c) => c.slice(1))).toEqual([
      [2000, 0.82],
      [1400, 0.75],
    ]);
  });

  it("une photo qui ne s'ouvre pas, ou ne se dessine pas, est refusée avec son nom", async () => {
    const illisible = outils([], async () => {
      throw new Error("non");
    });
    await expect(preparerFichier(photo("x.heic"), illisible.o)).rejects.toThrow(
      nb("« x.heic » ne s’ouvre pas : choisissez une photo JPG ou PNG, s’il vous plaît."),
    );
    const { o, fermer } = outils([null, null]);
    await expect(preparerFichier(photo(), o)).rejects.toThrow(/ne s’ouvre pas/);
    expect(fermer).toHaveBeenCalled();
  });

  it("un PDF part tel quel (10 Mo au plus), sans passer par le dessin", async () => {
    const { o, encoder } = outils([]);
    const permis = pdf();
    expect(await preparerFichier(permis, o)).toBe(permis);
    expect(encoder).not.toHaveBeenCalled();
    await expect(preparerFichier(pdf("gros.pdf", 11 * Mo), o)).rejects.toThrow(
      nb("« gros.pdf » fait 11 Mo : 10 Mo au plus par fichier."),
    );
  });

  it("refuse ce qui n'est ni une photo ni un PDF", async () => {
    await expect(
      preparerFichier(fichier("notes.docx", "application/msword"), outils([]).o),
    ).rejects.toThrow(nb("« notes.docx » n’est ni une photo ni un PDF."));
  });

  it("prépare les fichiers un par un, puis vérifie les 20 Mo en tout", async () => {
    const progression = vi.fn();
    const prets = await preparerFichiers([photo("a.jpg"), pdf()], outils([jpeg()]).o, progression);
    expect(prets.map((f) => f.name)).toEqual(["a.jpg", "permis.pdf"]);
    expect(progression.mock.calls).toEqual([
      [1, 2],
      [2, 2],
    ]);
    await expect(
      preparerFichiers([pdf("a.pdf", 9 * Mo), pdf("b.pdf", 9 * Mo), pdf("c.pdf", 9 * Mo)]),
    ).rejects.toThrow(nb("Les fichiers sont trop lourds : 27 Mo en tout, 20 Mo au plus."));
    await expect(preparerFichiers([1, 2, 3, 4, 5, 6].map((i) => pdf(`${i}.pdf`)))).rejects.toThrow(
      /5 fichiers au plus/,
    );
  });

  it("nomme le JPEG d'après la photo", () => {
    expect(nomJpeg("avant.png")).toBe("avant.jpg");
    expect(nomJpeg("compteur")).toBe("compteur.jpg");
    expect(nomJpeg(".heic")).toBe("photo.jpg");
  });
});

const message: MessageContact = {
  name: " Claire Martin ",
  email: "claire@example.com ",
  phone: " 079 000 00 00",
  message: "Proposition de véhicule\n\nMarque : Suzuki",
  consent: true,
  page: "/reprise",
  lang: "fr",
  hp: "",
};

function reponse(statut: number, corps?: unknown) {
  return new Response(corps === undefined ? null : JSON.stringify(corps), {
    status: statut,
    headers: { "Content-Type": "application/json" },
  });
}

const envoi = (fetch: typeof globalThis.fetch) =>
  creerEnvoiDemande({ plateformeUrl: "https://plateforme.exemple.ch", tenant: "garage-x", fetch });

const vraiJpeg = () => new File(["jpeg"], "avant.jpg", { type: "image/jpeg" });
const vraiPdf = () => new File(["%PDF-1.4"], "permis.pdf", { type: "application/pdf" });

describe("le corps envoyé", () => {
  it("sans fichier : le JSON habituel, comme avant", async () => {
    const fetch = vi.fn().mockResolvedValue(reponse(201, { ok: true }));
    expect(await envoi(fetch).envoyer(message)).toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://plateforme.exemple.ch/api/public/v1/garage-x/messages");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(typeof init.body).toBe("string");
    expect(JSON.parse(init.body)).toEqual({
      name: "Claire Martin",
      email: "claire@example.com",
      phone: "079 000 00 00",
      message: "Proposition de véhicule\n\nMarque : Suzuki",
      consent: true,
      page: "/reprise",
      lang: "fr",
      hp: "",
    });
  });

  it("avec fichiers : un FormData, le JSON dans « json », chaque fichier dans « fichiers »", async () => {
    const fetch = vi.fn().mockResolvedValue(reponse(201, { ok: true }));
    const avant = vraiJpeg();
    const permis = vraiPdf();
    expect(await envoi(fetch).envoyer(message, [avant, permis])).toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://plateforme.exemple.ch/api/public/v1/garage-x/messages");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("omit");
    // the browser writes multipart/form-data and its boundary itself
    expect(Object.keys(init.headers).map((h) => h.toLowerCase())).not.toContain("content-type");
    const form = init.body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(JSON.parse(form.get("json") as string)).toEqual(corpsJson(message));
    const parts = form.getAll("fichiers") as File[];
    expect(parts.map((f) => [f.name, f.type])).toEqual([
      ["avant.jpg", "image/jpeg"],
      ["permis.pdf", "application/pdf"],
    ]);
    expect([...form.keys()].sort()).toEqual(["fichiers", "fichiers", "json"]);
  });

  it("la partie « json » est exactement le corps JSON sans fichier", async () => {
    const fetch = vi.fn().mockResolvedValue(reponse(201, { ok: true }));
    await envoi(fetch).envoyer(message);
    await envoi(fetch).envoyer(message, [vraiJpeg()]);
    const sansFichier = JSON.parse(fetch.mock.calls[0]![1].body);
    const avecFichier = JSON.parse(
      (fetch.mock.calls[1]![1].body as FormData).get("json") as string,
    );
    expect(avecFichier).toEqual(sansFichier);
  });

  it("« envoyé » seulement sur 201 { ok: true }", async () => {
    const f = [vraiJpeg()];
    expect(await envoi(vi.fn().mockResolvedValue(reponse(201, {}))).envoyer(message, f)).toEqual({
      ok: false,
      raison: "serveur",
      statut: 201,
    });
    expect(
      await envoi(vi.fn().mockResolvedValue(reponse(200, { ok: true }))).envoyer(message, f),
    ).toEqual({ ok: false, raison: "serveur", statut: 200 });
  });

  it("400 : l'erreur de la plateforme telle quelle (un fichier refusé refuse le message)", async () => {
    const erreur =
      "Ce fichier n'est pas accepté : « x.heic » n'est ni une photo (JPG, PNG ou WebP) ni un PDF.";
    const fetch = vi.fn().mockResolvedValue(reponse(400, { error: erreur }));
    expect(await envoi(fetch).envoyer(message, [vraiJpeg()])).toEqual({
      ok: false,
      raison: "invalide",
      erreur,
    });
  });

  it("429 : trop d'envois ; 503 : fichiers indisponibles, à envoyer sans eux", async () => {
    const f = [vraiJpeg()];
    expect(await envoi(vi.fn().mockResolvedValue(reponse(429))).envoyer(message, f)).toEqual({
      ok: false,
      raison: "trop-de-demandes",
    });
    expect(
      await envoi(
        vi
          .fn()
          .mockResolvedValue(reponse(503, { error: "Les fichiers ne peuvent pas être reçus." })),
      ).envoyer(message, f),
    ).toEqual({
      ok: false,
      raison: "fichiers-indisponibles",
      erreur: "Les fichiers ne peuvent pas être reçus.",
    });
    expect(await envoi(vi.fn().mockResolvedValue(reponse(500))).envoyer(message, f)).toEqual({
      ok: false,
      raison: "serveur",
      statut: 500,
    });
  });

  it("panne réseau : jamais un succès ; plateforme non configurée : rien ne part", async () => {
    expect(
      await envoi(vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))).envoyer(message, [
        vraiJpeg(),
      ]),
    ).toEqual({ ok: false, raison: "reseau" });
    const fetch = vi.fn();
    const vide = creerEnvoiDemande({ plateformeUrl: "", tenant: "garage-x", fetch });
    expect(await vide.envoyer(message, [vraiJpeg()])).toEqual({
      ok: false,
      raison: "non-configure",
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
