/** Le client de la plateforme Lemon : n'annonce « envoyé » que si la plateforme l'a confirmé. */
import { describe, expect, it, vi } from "vitest";
import { baseApi, creerClientLemon, type MessageContact, verifierMessage } from "@/lib/lemon";

const message: MessageContact = {
  name: " Claire ",
  email: "claire@example.com",
  phone: "",
  company: "Atelier",
  message: "Bonjour, une cuisine à refaire.",
  consent: true,
  page: "/contact",
  lang: "fr",
  hp: "",
};

function reponse(statut: number, corps?: unknown) {
  return new Response(corps === undefined ? null : JSON.stringify(corps), {
    status: statut,
    headers: { "Content-Type": "application/json" },
  });
}

const client = (fetch: typeof globalThis.fetch) =>
  creerClientLemon({
    plateformeUrl: "https://plateforme.exemple.ch/",
    tenant: "atelier-zeste",
    fetch,
  });

describe("baseApi", () => {
  it("construit l'adresse de l'API publique v1", () => {
    expect(baseApi("https://plateforme.exemple.ch/", "atelier-zeste")).toBe(
      "https://plateforme.exemple.ch/api/public/v1/atelier-zeste",
    );
  });
  it("renvoie null quand la plateforme n'est pas configurée", () => {
    expect(baseApi("", "atelier-zeste")).toBeNull();
  });
  it("refuse une adresse non chiffrée et un tenant invalide", () => {
    expect(() => baseApi("http://plateforme.exemple.ch", "a")).toThrow(/https/);
    expect(() => baseApi("https://plateforme.exemple.ch", "Atelier Zeste")).toThrow(/tenant/);
  });
});

describe("envoyerMessage", () => {
  it("POST le message JSON au bon endroit, sans champs vides", async () => {
    const fetch = vi.fn().mockResolvedValue(reponse(201, { ok: true }));
    const resultat = await client(fetch).envoyerMessage(message);
    expect(resultat).toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://plateforme.exemple.ch/api/public/v1/atelier-zeste/messages");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("omit");
    expect(JSON.parse(init.body)).toEqual({
      name: "Claire",
      email: "claire@example.com",
      company: "Atelier",
      message: "Bonjour, une cuisine à refaire.",
      consent: true,
      page: "/contact",
      lang: "fr",
      hp: "",
    });
  });

  it("transmet le pot de miel tel quel (la plateforme décide)", async () => {
    const fetch = vi.fn().mockResolvedValue(reponse(201, { ok: true }));
    await client(fetch).envoyerMessage({ ...message, hp: "http://spam" });
    expect(JSON.parse(fetch.mock.calls[0]![1].body).hp).toBe("http://spam");
  });

  it("201 sans { ok: true } n'est PAS un succès", async () => {
    const resultat = await client(vi.fn().mockResolvedValue(reponse(201, {}))).envoyerMessage(
      message,
    );
    expect(resultat.ok).toBe(false);
  });

  it("200 n'est pas un succès non plus (le contrat dit 201)", async () => {
    const resultat = await client(
      vi.fn().mockResolvedValue(reponse(200, { ok: true })),
    ).envoyerMessage(message);
    expect(resultat).toEqual({ ok: false, raison: "serveur", statut: 200 });
  });

  it("400 renvoie l'erreur de la plateforme", async () => {
    const resultat = await client(
      vi.fn().mockResolvedValue(reponse(400, { error: "E-mail invalide" })),
    ).envoyerMessage(message);
    expect(resultat).toEqual({ ok: false, raison: "invalide", erreur: "E-mail invalide" });
  });

  it("429 = trop de demandes", async () => {
    const resultat = await client(vi.fn().mockResolvedValue(reponse(429))).envoyerMessage(message);
    expect(resultat).toEqual({ ok: false, raison: "trop-de-demandes" });
  });

  it("500 = erreur serveur", async () => {
    const resultat = await client(vi.fn().mockResolvedValue(reponse(500))).envoyerMessage(message);
    expect(resultat).toEqual({ ok: false, raison: "serveur", statut: 500 });
  });

  it("panne réseau = erreur réseau, jamais un succès", async () => {
    const resultat = await client(
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    ).envoyerMessage(message);
    expect(resultat).toEqual({ ok: false, raison: "reseau" });
  });

  it("plateforme non configurée : rien n'est envoyé", async () => {
    const fetch = vi.fn();
    const c = creerClientLemon({ plateformeUrl: "", tenant: "atelier-zeste", fetch });
    expect(c.configure).toBe(false);
    expect(await c.envoyerMessage(message)).toEqual({ ok: false, raison: "non-configure" });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("lireCollection", () => {
  it("lit un tableau JSON", async () => {
    const fetch = vi.fn().mockResolvedValue(reponse(200, [{ a: 1 }]));
    expect(await client(fetch).lireCollection("realisations")).toEqual([{ a: 1 }]);
    expect(fetch.mock.calls[0]![0]).toBe(
      "https://plateforme.exemple.ch/api/public/v1/atelier-zeste/content/realisations",
    );
  });
  it("refuse ce qui n'est pas un tableau et les erreurs HTTP", async () => {
    await expect(
      client(vi.fn().mockResolvedValue(reponse(200, { a: 1 }))).lireCollection("faq"),
    ).rejects.toThrow(/tableau/);
    await expect(
      client(vi.fn().mockResolvedValue(reponse(404))).lireCollection("faq"),
    ).rejects.toThrow(/404/);
    await expect(client(vi.fn()).lireCollection("../secret")).rejects.toThrow(/invalide/);
  });
});

describe("verifierMessage", () => {
  it("exige nom, e-mail valide, message et accord", () => {
    expect(verifierMessage(message)).toBeNull();
    expect(verifierMessage({ ...message, name: " " })).toMatch(/nom/);
    expect(verifierMessage({ ...message, email: "pas-un-mail" })).toMatch(/e-mail/);
    expect(verifierMessage({ ...message, message: "" })).toMatch(/message/);
    expect(verifierMessage({ ...message, consent: undefined as never })).toMatch(/accord/);
  });
});
