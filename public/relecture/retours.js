/*!
 * Retours Lemon — le calque de commentaires d'un site de test (version 2, 12.11.2026).
 * Source : lemon-plateforme, public/retours/retours.js (docs/RETOURS.md). Les sites en gardent une
 * copie chez eux (CSP « script-src 'self' ») ; ne pas la modifier dans un site : la refaire depuis ici.
 *
 * <script src="/relecture/retours.js" data-plateforme="https://lemon.heylemon.app" data-client="lemon" defer></script>
 *
 * Rien ne s'affiche sans lien de relecture : le client ouvre https://site-de-test/?relecture=<jeton>,
 * le calque garde le jeton sur cet appareil (localStorage), le retire de l'adresse et montre
 * « Commenter ». Aucun cookie, aucune adresse IP gardée, aucun script ni style en ligne, aucun
 * innerHTML : tout est construit élément par élément, dans un Shadow DOM (le site n'est jamais touché).
 *
 * Aller droit à une épingle : https://site-de-test/<page>#lemon-retour-<n> (le lien « Voir sur le site »
 * de la console) amène l'épingle n° n à l'écran et ouvre son fil, puis retire « #lemon-retour-<n> » de
 * l'adresse (recharger la page ne rouvre pas un fil fermé). Sur un appareil sans lien de relecture : rien.
 *
 * Modifier ou supprimer : le calque tire une clé d'auteur au hasard (gardée avec le jeton) et l'envoie avec
 * chaque commentaire ; la plateforme n'en garde que l'empreinte. Depuis cet appareil, la personne modifie ou
 * supprime ses propres messages tant que Lemon n'a pas marqué le retour « fait » (son premier message
 * supprime l'épingle) ; « Annuler » reste quelques secondes.
 */
(function () {
  "use strict";
  if (window.__lemonRetours) return;
  window.__lemonRetours = true;

  var script = document.currentScript;
  var PLATEFORME = ((script && script.getAttribute("data-plateforme")) || "").replace(/\/+$/, "");
  var CLIENT = (script && script.getAttribute("data-client")) || "";
  if (!/^https?:\/\/[^\s/]+$/.test(PLATEFORME) || !/^[a-z0-9][a-z0-9-]{1,39}$/.test(CLIENT)) return;
  var API = PLATEFORME + "/api/public/v1/" + CLIENT + "/retours";
  var TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
  var KEY = { jeton: "lemon-relecture", prenom: "lemon-relecture-prenom", astuces: "lemon-relecture-astuces", auteur: "lemon-relecture-auteur" };

  // ── Mémoire de l'appareil (jamais indispensable : une navigation privée la refuse) ──
  var memoire = {};
  function lire(k) { try { var v = window.localStorage.getItem(k); return v === null ? memoire[k] || null : v; } catch (e) { return memoire[k] || null; } }
  function ecrire(k, v) { memoire[k] = v; try { if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch (e) { /* mémoire seulement */ } }

  // ── Le jeton : pris dans l'adresse, gardé, puis retiré de l'adresse (il ne se partage pas par erreur) ──
  var token = null;
  try {
    var url = new URL(window.location.href);
    var demande = url.searchParams.get("relecture");
    if (demande === "fin") { ecrire(KEY.jeton, null); }
    else if (demande && TOKEN_RE.test(demande)) { ecrire(KEY.jeton, demande); }
    if (demande !== null) {
      url.searchParams.delete("relecture");
      window.history.replaceState(window.history.state, "", url.pathname + (url.search || "") + url.hash);
    }
    token = lire(KEY.jeton);
    if (token && !TOKEN_RE.test(token)) token = null;
    if (!token && demande && TOKEN_RE.test(demande)) token = demande;
  } catch (e) { return; }
  if (!token) return;

  // ── La clé d'auteur de cet appareil (au hasard, gardée avec le jeton) : ses messages, et lui seul, se modifient ──
  function cleAuteur() {
    var k = lire(KEY.auteur);
    if (k && TOKEN_RE.test(k)) return k;
    try {
      var octets = new Uint8Array(32);
      window.crypto.getRandomValues(octets);
      var bin = "";
      for (var i = 0; i < octets.length; i++) bin += String.fromCharCode(octets[i]);
      k = window.btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) { return ""; }
    ecrire(KEY.auteur, k);
    return k;
  }

  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tactile = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  var MOTS = {
    "a-faire": "Reçu, à faire",
    "en-cours": "En cours",
    question: "Question pour vous",
    fait: "Fait"
  };

  // ── Les styles, dans le Shadow DOM seulement ──
  var CSS = [
    ":host{all:initial}",
    "*{box-sizing:border-box}",
    ".racine{position:fixed;inset:0;pointer-events:none;z-index:2147483000;font:15px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#14213d;-webkit-font-smoothing:antialiased}",
    "button,input,textarea{font:inherit;color:inherit}",
    "button{cursor:pointer}",
    ":focus-visible{outline:3px solid #2f6fe4;outline-offset:2px}",
    ".barre{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));display:flex;gap:8px;pointer-events:auto;align-items:center}",
    ".bouton{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;min-width:44px;padding:0 18px;border-radius:999px;border:2px solid #14213d;background:#ffd84d;color:#14213d;font-weight:700;box-shadow:0 3px 0 #14213d;white-space:nowrap}",
    ".bouton:hover{background:#ffe27a}",
    ".bouton.sombre{background:#14213d;color:#fff}",
    ".bouton.sombre:hover{background:#22325a}",
    ".bouton.clair{background:#fff;color:#14213d;box-shadow:none}",
    ".bouton.petit{min-height:44px;padding:0 14px;font-size:14px}",
    ".bouton[disabled]{opacity:.55;cursor:default}",
    ".compte{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#14213d;color:#fff;font-size:12px}",
    ".bouton.sombre .compte{background:#ffd84d;color:#14213d}",
    ".bandeau{position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);max-width:calc(100vw - 24px);display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;padding:8px 8px 8px 16px;border-radius:999px;background:#14213d;color:#fff;font-weight:600;box-shadow:0 6px 24px rgba(20,33,61,.25);pointer-events:auto}",
    ".bandeau .bouton{min-height:36px;box-shadow:none;border-color:#fff}",
    ".cadre{position:fixed;border:2px dashed #14213d;background:rgba(255,216,77,.18);border-radius:6px;pointer-events:none;display:none}",
    ".epingle{position:fixed;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:50% 50% 50% 4px;border:2px solid #14213d;display:grid;place-items:center;font-weight:800;font-size:13px;pointer-events:auto;box-shadow:0 2px 6px rgba(20,33,61,.35);padding:0}",
    ".epingle::after{content:'';position:absolute;inset:-7px;border-radius:50%}",
    ".epingle.ouvert{background:#ffd84d;color:#14213d}",
    ".epingle.fait{background:#2fae74;color:#fff;border-color:#1d6b48}",
    ".epingle.question{background:#2f6fe4;color:#fff;border-color:#1b4597}",
    ".epingle.nouvelle{background:#fff;color:#14213d;border-style:dashed}",
    ".epingle.actif{transform:scale(1.15)}",
    ".carte{position:fixed;width:340px;max-width:calc(100vw - 24px);max-height:min(560px,calc(100vh - 24px));overflow:auto;background:#fff;border:2px solid #14213d;border-radius:16px;box-shadow:0 10px 32px rgba(20,33,61,.28);pointer-events:auto;padding:14px}",
    "@media (max-width:639px){.carte{left:0!important;right:0!important;top:auto!important;bottom:0!important;width:auto;max-width:none;max-height:78vh;border-radius:18px 18px 0 0;border-width:2px 0 0;padding:16px 16px max(16px,env(safe-area-inset-bottom))}}",
    ".carte h2{margin:0;font-size:17px;line-height:1.25;font-weight:800}",
    ".tete{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px}",
    ".fermer{border:0;background:transparent;width:44px;height:44px;margin:-10px -10px 0 0;border-radius:50%;font-size:24px;line-height:1;color:#14213d}",
    ".fermer:hover{background:#f2f4f8}",
    ".etat{display:inline-block;margin-top:4px;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid}",
    ".etat.ouvert{background:#fff4c2;border-color:#d9b52a}",
    ".etat.fait{background:#dff5ea;border-color:#2fae74;color:#145236}",
    ".etat.question{background:#e3ecfd;border-color:#2f6fe4;color:#173a80}",
    "label{display:block;font-weight:700;font-size:14px;margin:10px 0 4px}",
    "input[type=text],textarea{width:100%;border:2px solid #c9d0dd;border-radius:12px;padding:10px 12px;background:#fff;font-size:16px}",
    "textarea{min-height:96px;resize:vertical}",
    "input[type=text]:focus,textarea:focus{border-color:#14213d;outline:none}",
    ".fichier{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}",
    ".joindre{display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:10px;padding:0 14px;border-radius:999px;border:2px dashed #8a95ab;background:#fff;font-weight:600;font-size:14px}",
    ".apercu{display:flex;align-items:center;gap:10px;margin-top:10px}",
    ".apercu img{width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid #c9d0dd}",
    ".lien{border:0;background:none;padding:6px 0;min-height:44px;color:#14213d;text-decoration:underline;font-weight:600}",
    ".actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:14px}",
    ".message{margin:10px 0 0;padding:10px 12px;border-radius:12px;background:#f5f6fa;border:1px solid #e2e6ee}",
    ".message.lemon{background:#fff8d6;border-color:#ecd477}",
    ".message.fait{background:#e8f7ef;border-color:#9fd8bb}",
    ".message .qui{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#50607a;margin-bottom:2px}",
    ".message .qui b{color:#14213d}",
    ".message p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}",
    ".message img{display:block;margin-top:8px;max-width:100%;max-height:200px;border-radius:10px;border:1px solid #c9d0dd}",
    ".trace{margin:8px 0 0;font-size:12px;color:#50607a}",
    ".outils{display:flex;justify-content:flex-end;gap:16px;margin-top:2px}",
    ".outils .lien{min-height:36px;padding:4px 0;font-size:13px}",
    ".lien.danger{color:#b42318}",
    ".edition textarea{min-height:80px;margin-top:8px}",
    ".copie input{margin-top:8px;font-size:13px}",
    ".statut{min-height:20px;margin:8px 0 0;font-size:14px;font-weight:600}",
    ".statut.erreur{color:#b42318}",
    ".panneau{position:fixed;top:0;right:0;bottom:0;width:360px;max-width:100vw;background:#fff;border-left:2px solid #14213d;box-shadow:-10px 0 32px rgba(20,33,61,.2);pointer-events:auto;overflow:auto;padding:16px 16px max(16px,env(safe-area-inset-bottom))}",
    ".panneau h2{margin:0;font-size:18px;font-weight:800}",
    ".panneau h3{margin:18px 0 6px;font-size:14px;font-weight:800;text-transform:none}",
    ".panneau ul{list-style:none;margin:0;padding:0}",
    ".ligne{display:flex;width:100%;gap:10px;align-items:flex-start;text-align:left;border:1px solid #e2e6ee;border-radius:12px;background:#fff;padding:10px;margin-top:8px;min-height:44px}",
    ".ligne:hover{background:#f5f6fa}",
    "a.ligne{color:#14213d;text-decoration:none}",
    ".ligne .num{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:800;border:2px solid #14213d}",
    ".ligne .num.ouvert{background:#ffd84d}",
    ".ligne .num.fait{background:#2fae74;color:#fff;border-color:#1d6b48}",
    ".ligne .num.question{background:#2f6fe4;color:#fff;border-color:#1b4597}",
    ".ligne .txt{min-width:0}",
    ".ligne .txt b{display:block;font-size:12px;color:#50607a;font-weight:700}",
    ".ligne .txt span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".aide{font-size:13px;color:#50607a;margin:4px 0 0}",
    ".astuce{position:fixed;max-width:260px;padding:10px 12px;border-radius:12px;background:#14213d;color:#fff;font-size:14px;box-shadow:0 6px 20px rgba(20,33,61,.3);pointer-events:auto}",
    ".astuce p{margin:0 0 8px}",
    ".astuce .bouton{min-height:36px;padding:0 14px;box-shadow:none;border-color:#fff}",
    ".toast{position:fixed;left:50%;bottom:max(84px,calc(env(safe-area-inset-bottom) + 84px));transform:translateX(-50%);max-width:calc(100vw - 24px);display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:12px;background:#14213d;color:#fff;font-weight:600;pointer-events:auto;box-shadow:0 6px 20px rgba(20,33,61,.3)}",
    ".toast .bouton{min-height:36px;padding:0 14px;box-shadow:none;border-color:#fff}",
    ".toast{z-index:3}",
    "@media (prefers-reduced-motion:no-preference){.epingle{transition:transform .15s ease}.carte,.panneau,.toast,.astuce{animation:entree .18s ease-out}@keyframes entree{from{opacity:0;transform:translateY(6px)}to{opacity:1}}.toast{animation:none}}",
    "[hidden]{display:none!important}"
  ].join("\n");

  // ── Construire un élément (jamais de HTML écrit à la main : le texte reste du texte) ──
  function h(tag, attrs, enfants) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue;
        if (k === "class") el.className = attrs[k];
        else if (k === "text") el.textContent = attrs[k];
        else if (k.indexOf("on") === 0) el.addEventListener(k.slice(2), attrs[k]);
        else el.setAttribute(k, attrs[k] === true ? "" : String(attrs[k]));
      }
    }
    (enfants || []).forEach(function (c) { if (c) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function vider(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function classe(statut) { return statut === "fait" ? "fait" : statut === "question" ? "question" : "ouvert"; }
  function quand(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Zurich" }) + " " + d.toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
    } catch (e) { return ""; }
  }

  // ── L'hôte, posé une fois sur la page ──
  var hote, ombre, racine, barre, boutonCommenter, boutonListe, cadre, couchePins;
  var etat = { retours: [], pages: [], charge: false, panne: false, mode: false, ouverte: null, panneau: false, nouvelle: null };

  function monter() {
    hote = document.createElement("lemon-retours");
    var s = hote.style;
    s.setProperty("all", "initial", "important");
    s.setProperty("position", "fixed", "important");
    s.setProperty("inset", "0", "important");
    s.setProperty("pointer-events", "none", "important");
    s.setProperty("z-index", "2147483000", "important");
    ombre = hote.attachShadow({ mode: "open" });
    var feuille = null;
    try {
      if ("adoptedStyleSheets" in ombre && typeof CSSStyleSheet === "function") {
        feuille = new CSSStyleSheet();
        feuille.replaceSync(CSS);
        ombre.adoptedStyleSheets = [feuille];
      }
    } catch (e) { feuille = null; }
    if (!feuille) ombre.appendChild(h("style", { text: CSS }));
    racine = h("div", { class: "racine" });
    ombre.appendChild(racine);
    couchePins = h("div");
    cadre = h("div", { class: "cadre", "aria-hidden": "true" });
    boutonListe = h("button", { type: "button", class: "bouton clair petit", "aria-label": "Tous les retours de cette page", onclick: function () { basculerPanneau(); } }, ["Retours ", h("span", { class: "compte", text: "0" })]);
    boutonCommenter = h("button", { type: "button", class: "bouton", onclick: function () { if (etat.mode) quitterMode(); else entrerMode(); } }, ["Commenter"]);
    barre = h("div", { class: "barre", role: "region", "aria-label": "Commentaires sur le site de test" }, [boutonListe, boutonCommenter]);
    racine.appendChild(couchePins);
    racine.appendChild(cadre);
    racine.appendChild(barre);
    document.body.appendChild(hote);
  }

  // ── L'endroit : un sélecteur solide, un extrait du texte, la position dans la boîte ──
  function idSur(el) {
    var id = el.id;
    if (!id || !/^[A-Za-z][\w-]{0,60}$/.test(id) || /\d{4,}/.test(id)) return null;
    try { return document.querySelectorAll("#" + CSS_ESC(id)).length === 1 ? "#" + CSS_ESC(id) : null; } catch (e) { return null; }
  }
  function CSS_ESC(v) { return window.CSS && window.CSS.escape ? window.CSS.escape(v) : String(v).replace(/[^\w-]/g, "\\$&"); }
  function selecteur(el) {
    var parts = [];
    var n = el;
    var profondeur = 0;
    while (n && n.nodeType === 1 && n !== document.body && n !== document.documentElement && profondeur < 14) {
      var id = idSur(n);
      if (id) { parts.unshift(id); return parts.join(" > "); }
      var tag = n.tagName.toLowerCase();
      var parent = n.parentElement;
      if (parent) {
        var memes = 0, rang = 0;
        for (var i = 0; i < parent.children.length; i++) {
          if (parent.children[i].tagName === n.tagName) { memes++; if (parent.children[i] === n) rang = memes; }
        }
        if (memes > 1) tag += ":nth-of-type(" + rang + ")";
      }
      parts.unshift(tag);
      n = parent;
      profondeur++;
    }
    parts.unshift("body");
    return parts.join(" > ").slice(0, 1000);
  }
  function extrait(el) {
    // le texte tel qu'il est écrit (textContent : ni la mise en page ni les majuscules du style ne le changent)
    var t = (el.getAttribute && (el.getAttribute("alt") || el.getAttribute("aria-label") || el.getAttribute("title"))) || el.textContent || "";
    return t.replace(/\s+/g, " ").trim().slice(0, 120);
  }
  function appareil() { var w = window.innerWidth; return w < 640 ? "telephone" : w < 1024 ? "tablette" : "ordinateur"; }
  function retrouver(r) {
    var el = null;
    try { el = document.querySelector(r.selecteur); } catch (e) { el = null; }
    var debut = (r.extrait || "").slice(0, 40);
    if (el && (!debut || extrait(el).indexOf(debut) === 0)) return el;
    if (!debut) return el;
    // la page a bougé : le même texte, sur un élément du même genre
    var tag = (r.selecteur.split(" > ").pop() || "").replace(/[:#.].*$/, "") || "*";
    var candidats;
    try { candidats = document.querySelectorAll(/^[a-z][a-z0-9-]*$/.test(tag) ? tag : "*"); } catch (e) { return null; }
    var trouve = null;
    for (var i = 0; i < candidats.length && i < 3000; i++) {
      if (extrait(candidats[i]) === r.extrait) { if (trouve) return null; trouve = candidats[i]; }
    }
    return trouve;
  }

  // ── Les épingles : posées sur leur élément, replacées quand la page bouge ──
  var places = {}; // id → { el, pin, r }
  function dessinerPins() {
    vider(couchePins);
    places = {};
    etat.retours.forEach(function (r) {
      var pin = h("button", {
        type: "button",
        class: "epingle " + classe(r.statut) + (etat.ouverte === r.id ? " actif" : ""),
        "aria-label": "Retour n° " + r.numero + ", " + MOTS[r.statut] + " : " + premierTexte(r),
        text: String(r.numero),
        onclick: function (e) { e.stopPropagation(); ouvrirFil(r.id); }
      });
      places[r.id] = { el: null, pin: pin, r: r };
      couchePins.appendChild(pin);
    });
    if (etat.nouvelle) {
      etat.nouvelle.pin = h("div", { class: "epingle nouvelle", "aria-hidden": "true", text: "+" });
      couchePins.appendChild(etat.nouvelle.pin);
    }
    resoudre();
    majCompte();
  }
  /** Chaque épingle retrouve son élément (après un changement de la page) ; sans élément, elle va dans la liste. */
  function resoudre() {
    for (var id in places) places[id].el = retrouver(places[id].r);
    placer();
  }
  function poser(pin, el, x, y) {
    var b = el.getBoundingClientRect();
    if (!b.width && !b.height) { pin.hidden = true; return false; }
    var left = b.left + b.width * x / 10000;
    var top = b.top + b.height * y / 10000;
    var dehors = top < -20 || top > window.innerHeight + 20 || left < -20 || left > window.innerWidth + 20;
    pin.hidden = dehors;
    pin.style.left = Math.round(left) + "px";
    pin.style.top = Math.round(top) + "px";
    return true;
  }
  function placer() {
    for (var id in places) {
      var p = places[id];
      if (p.el && p.el.isConnected) poser(p.pin, p.el, p.r.x, p.r.y);
      else p.pin.hidden = true;
    }
    if (etat.nouvelle && etat.nouvelle.pin) poser(etat.nouvelle.pin, etat.nouvelle.el, etat.nouvelle.x, etat.nouvelle.y);
  }
  var demande = 0;
  function placerBientot() { if (!demande) demande = window.requestAnimationFrame(function () { demande = 0; placer(); }); }
  function premierTexte(r) { var m = (r.fil || [])[0]; return m && m.texte ? m.texte.slice(0, 80) : ""; }
  function majCompte() {
    var ouverts = etat.retours.filter(function (r) { return r.statut !== "fait"; }).length;
    boutonListe.lastChild.textContent = String(ouverts);
    boutonListe.setAttribute("aria-label", "Tous les retours de cette page : " + etat.retours.length + " (" + ouverts + " ouverts)");
  }

  // ── Parler à la plateforme ──
  function page() { return window.location.pathname || "/"; }
  function charger() {
    var cle = cleAuteur();
    return fetch(API + "?j=" + encodeURIComponent(token) + "&page=" + encodeURIComponent(page()) + (cle ? "&cle=" + encodeURIComponent(cle) : ""), { mode: "cors", credentials: "omit", cache: "no-store" })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (res.ok) {
            etat.retours = Array.isArray(body.retours) ? body.retours : [];
            etat.pages = Array.isArray(body.pages) ? body.pages : [];
            etat.panne = false;
          } else if (res.status === 404 && body && body.error) {
            // le lien a été changé ou retiré : on le dit une fois et on oublie ce jeton
            ecrire(KEY.jeton, null);
            toast(body.error, 8000);
            demonter();
            return;
          } else { etat.panne = true; }
          etat.charge = true;
          dessinerPins();
          if (etat.panneau) remplirPanneau();
          if (etat.ouverte) ouvrirFil(etat.ouverte, true);
        });
      })
      .catch(function () { etat.panne = true; etat.charge = true; if (etat.panneau) remplirPanneau(); });
  }
  function envoyer(champs, image) {
    var f = new FormData();
    f.append("j", token);
    var cle = cleAuteur();
    if (cle) f.append("cle", cle);
    for (var k in champs) if (Object.prototype.hasOwnProperty.call(champs, k) && champs[k] !== null && champs[k] !== undefined) f.append(k, String(champs[k]));
    if (image) f.append("image", image, "image." + (image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg"));
    return fetch(API, { method: "POST", body: f, mode: "cors", credentials: "omit", cache: "no-store" })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok) throw new Error((body && body.error) || "Commentaires indisponibles pour le moment.");
          return body;
        });
      }, function () { throw new Error("Commentaires indisponibles pour le moment."); });
  }

  // ── L'image : JPG, PNG ou WebP de 10 Mo au plus, réduite ici (2000 px, sans les métadonnées ni la position GPS) ──
  var TYPES = ["image/jpeg", "image/png", "image/webp"];
  function preparerImage(file) {
    if (!file) return Promise.resolve(null);
    var type = file.type || "";
    if (TYPES.indexOf(type) < 0 && !/\.(jpe?g|png|webp)$/i.test(file.name || "")) return Promise.reject(new Error("Une image JPG, PNG ou WebP, s'il vous plaît."));
    if (file.size > 10 * 1024 * 1024) return Promise.reject(new Error("Image trop lourde : 10 Mo au plus."));
    var ouvrir = window.createImageBitmap ? window.createImageBitmap(file) : new Promise(function (ok, ko) {
      var img = new Image();
      var u = URL.createObjectURL(file);
      img.onload = function () { URL.revokeObjectURL(u); ok(img); };
      img.onerror = function () { URL.revokeObjectURL(u); ko(new Error("x")); };
      img.src = u;
    });
    return ouvrir.then(function (bmp) {
      function rendre(cote, format, qualite) {
        var w = bmp.width, hh = bmp.height, k = Math.min(1, cote / Math.max(w, hh));
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(w * k));
        c.height = Math.max(1, Math.round(hh * k));
        var ctx = c.getContext("2d");
        if (format === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(bmp, 0, 0, c.width, c.height);
        return new Promise(function (ok) { c.toBlob(function (b) { ok(b); }, format, qualite); });
      }
      var format = type === "image/png" ? "image/png" : type === "image/webp" ? "image/webp" : "image/jpeg";
      return rendre(2000, format, 0.86).then(function (b) {
        if (b && TYPES.indexOf(b.type) >= 0 && b.size <= 1900000) return b;
        return rendre(2000, "image/jpeg", 0.82).then(function (b2) {
          if (b2 && b2.size <= 1900000) return b2;
          return rendre(1400, "image/jpeg", 0.75);
        });
      });
    }, function () { throw new Error("Cette image ne s'ouvre pas : essayez une photo JPG ou PNG."); })
      .then(function (b) {
        if (!b || b.size > 2000000) throw new Error("Image trop lourde : essayez une autre image.");
        return b;
      });
  }

  // ── La carte (nouveau commentaire, fil d'une épingle), à côté de l'épingle ou en bas sur un téléphone ──
  var carte = null;
  function fermerCarte() {
    fermerAstuce();
    if (carte && carte.parentNode) carte.parentNode.removeChild(carte);
    carte = null;
    etat.ouverte = null;
    if (etat.nouvelle) { etat.nouvelle = null; dessinerPins(); }
    Object.keys(places).forEach(function (id) { places[id].pin.classList.remove("actif"); });
  }
  function placerCarte(x, y) {
    if (!carte || window.innerWidth < 640) return;
    var w = Math.min(340, window.innerWidth - 24);
    var left = x + 24 + w > window.innerWidth - 12 ? x - 24 - w : x + 24;
    left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
    var top = Math.max(12, Math.min(y - 40, window.innerHeight - Math.min(560, window.innerHeight - 24) - 12));
    carte.style.left = Math.round(left) + "px";
    carte.style.top = Math.round(top) + "px";
  }
  function champImage(surChoix) {
    var choisie = null;
    var apercu = h("div", { class: "apercu", hidden: true });
    var input = h("input", { type: "file", class: "fichier", accept: "image/jpeg,image/png,image/webp", "aria-label": "Joindre une image" });
    var bouton = h("button", { type: "button", class: "joindre", onclick: function () { input.click(); } }, ["📎 Joindre une image"]);
    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      input.value = "";
      if (!f) return;
      surChoix(null);
      preparerImage(f).then(function (b) {
        choisie = b;
        vider(apercu);
        var u = URL.createObjectURL(b);
        apercu.appendChild(h("img", { src: u, alt: "Image jointe" }));
        apercu.appendChild(h("button", { type: "button", class: "lien", onclick: function () { choisie = null; apercu.hidden = true; vider(apercu); bouton.hidden = false; URL.revokeObjectURL(u); } }, ["Retirer l'image"]));
        apercu.hidden = false;
        bouton.hidden = true;
      }, function (e) { surChoix(e.message); });
    });
    return { noeuds: [input, bouton, apercu], valeur: function () { return choisie; } };
  }
  function champPrenom() {
    var connu = lire(KEY.prenom);
    var input = h("input", { type: "text", id: "lr-prenom", maxlength: "60", autocomplete: "given-name", required: true });
    if (connu) input.value = connu;
    var bloc = h("div", { hidden: !!connu }, [h("label", { for: "lr-prenom", text: "Votre prénom" }), input]);
    var change = connu ? h("p", { class: "aide" }, ["Signé " + connu + " · ", h("button", { type: "button", class: "lien", onclick: function () { bloc.hidden = false; change.hidden = true; input.focus(); } }, ["changer"])]) : null;
    return { noeuds: [bloc, change], valeur: function () { return input.value.trim(); }, input: input };
  }

  function ouvrirComposer(el, x, y, cx, cy) {
    fermerCarte();
    fermerPanneau();
    etat.nouvelle = { el: el, x: x, y: y };
    dessinerPins();
    var statut = h("p", { class: "statut", role: "status", "aria-live": "polite" });
    var erreur = function (m) { statut.textContent = m || ""; statut.className = m ? "statut erreur" : "statut"; };
    var prenom = champPrenom();
    var texte = h("textarea", { id: "lr-texte", maxlength: "5000", required: true, placeholder: "Ex. : remplacer cette photo par celle-ci, corriger ce texte…" });
    var image = champImage(erreur);
    var bEnvoyer = h("button", { type: "submit", class: "bouton sombre petit" }, ["Envoyer"]);
    var form = h("form", { novalidate: true }, [
      h("div", { class: "tete" }, [h("h2", { id: "lr-titre", text: "Nouveau commentaire" }), h("button", { type: "button", class: "fermer", "aria-label": "Annuler", onclick: function () { fermerCarte(); boutonCommenter.focus(); }, text: "×" })]),
      prenom.noeuds[0], prenom.noeuds[1],
      h("label", { for: "lr-texte", text: "Votre commentaire" }), texte,
      image.noeuds[0], image.noeuds[1], image.noeuds[2],
      statut,
      h("div", { class: "actions" }, [h("button", { type: "button", class: "bouton clair petit", onclick: function () { fermerCarte(); boutonCommenter.focus(); } }, ["Annuler"]), bEnvoyer])
    ]);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = prenom.valeur(), t = texte.value.trim();
      if (!p) { prenom.noeuds[0].hidden = false; erreur("Indiquez votre prénom."); prenom.input.focus(); return; }
      if (!t) { erreur("Écrivez votre commentaire."); texte.focus(); return; }
      bEnvoyer.disabled = true;
      erreur("");
      statut.textContent = "Envoi…";
      ecrire(KEY.prenom, p);
      envoyer({
        action: "nouveau", page: page(), selecteur: selecteur(el), extrait: extrait(el), x: x, y: y,
        appareil: appareil(), largeur: window.innerWidth, prenom: p, texte: t
      }, image.valeur()).then(function () {
        etat.nouvelle = null;
        fermerCarte();
        toast("Merci ! Votre commentaire est arrivé chez Lemon.");
        charger();
        boutonCommenter.focus();
      }, function (err) { bEnvoyer.disabled = false; erreur(err.message); });
    });
    carte = h("div", { class: "carte", role: "dialog", "aria-labelledby": "lr-titre" }, [form]);
    racine.appendChild(carte);
    placerCarte(cx, cy);
    astuce(2, carte);
    (prenom.valeur() ? texte : prenom.input).focus();
  }

  // ── Modifier ou supprimer son propre message (la plateforme revérifie : lien, site, clé d'auteur, pas « fait ») ──
  function outilsMessage(r, m, bloc, corps) {
    var outils = h("div", { class: "outils" });
    outils.appendChild(h("button", { type: "button", class: "lien", "aria-label": "Modifier votre commentaire", onclick: function () { modifierMessage(m, bloc, corps, outils); } }, ["Modifier"]));
    outils.appendChild(h("button", { type: "button", class: "lien danger", "aria-label": "Supprimer votre commentaire", onclick: function () { supprimerMessage(m); } }, ["Supprimer"]));
    return outils;
  }
  function modifierMessage(m, bloc, corps, outils) {
    var champ = h("textarea", { maxlength: "5000", required: true, "aria-label": "Votre commentaire" });
    champ.value = m.texte || "";
    var statut = h("p", { class: "statut", role: "status", "aria-live": "polite" });
    var bOk = h("button", { type: "submit", class: "bouton sombre petit" }, ["Enregistrer"]);
    var form;
    var fermer = function () { if (form.parentNode) form.parentNode.removeChild(form); if (corps) corps.hidden = false; outils.hidden = false; };
    form = h("form", { class: "edition", novalidate: true }, [champ, statut, h("div", { class: "actions" }, [
      h("button", { type: "button", class: "bouton clair petit", onclick: function () { fermer(); outils.firstChild.focus(); } }, ["Annuler"]), bOk])]);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = champ.value.trim();
      if (!t) { statut.textContent = "Écrivez votre commentaire."; statut.className = "statut erreur"; champ.focus(); return; }
      if (t === (m.texte || "")) { fermer(); return; }
      bOk.disabled = true;
      statut.className = "statut";
      statut.textContent = "Envoi…";
      envoyer({ action: "modifier", message: m.id, texte: t }).then(function () {
        fermer();
        toast("Commentaire modifié.");
        charger();
      }, function (err) { bOk.disabled = false; statut.textContent = err.message; statut.className = "statut erreur"; });
    });
    if (corps) corps.hidden = true;
    outils.hidden = true;
    bloc.appendChild(form);
    champ.focus();
  }
  function supprimerMessage(m) {
    envoyer({ action: "supprimer", message: m.id }).then(function (rep) {
      // son premier message : l'épingle part avec lui
      var epingle = !!(rep && rep.retour);
      if (epingle) fermerCarte();
      toast(epingle ? "Commentaire supprimé." : "Message supprimé.", 8000, {
        texte: "Annuler",
        agir: function () {
          envoyer({ action: "retablir", message: m.id }).then(function () {
            toast("Annulé : le commentaire est revenu.");
            charger();
          }, function (err) { toast(err.message, 6000); });
        }
      });
      charger();
    }, function (err) { toast(err.message, 6000); });
  }

  function ouvrirFil(id, rafraichir) {
    var r = etat.retours.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    var garde = rafraichir && carte && carte.querySelector("textarea") ? carte.querySelector("textarea").value : null;
    if (rafraichir && garde) return; // le client écrit : on ne touche à rien
    if (carte) { if (carte.parentNode) carte.parentNode.removeChild(carte); carte = null; }
    if (!rafraichir) fermerPanneau();
    etat.ouverte = id;
    Object.keys(places).forEach(function (k) { places[k].pin.classList.toggle("actif", k === id); });
    var fil = h("div");
    (r.fil || []).forEach(function (m) {
      if (m.type === "statut") {
        fil.appendChild(h("p", { class: "trace", text: (m.auteur === "client" ? (m.prenom || "Vous") : "Lemon") + " · " + (MOTS[m.statut] || "") + (m.texte ? " · « " + m.texte + " »" : "") + " · " + quand(m.le) }));
        return;
      }
      var corps = m.texte ? h("p", { text: m.texte }) : null;
      var bloc = h("div", { class: "message" + (m.type === "fait" ? " fait" : m.auteur === "lemon" ? " lemon" : "") }, [
        h("div", { class: "qui" }, [h("b", { text: m.type === "fait" ? "Lemon · c'est fait" : m.auteur === "lemon" ? "Lemon" : (m.prenom || "Vous") }), h("span", { text: quand(m.le) + (m.modifie ? " · modifié " + quand(m.modifie) : "") })]),
        corps
      ]);
      if (m.image) {
        bloc.appendChild(h("img", { src: API + "/image/" + encodeURIComponent(m.image) + "?j=" + encodeURIComponent(token), alt: "Image jointe", loading: "lazy", referrerpolicy: "no-referrer" }));
      }
      // ses propres messages (cet appareil), tant que Lemon n'a pas marqué le retour « fait »
      if (m.mien === true && m.id && m.type === "message" && r.statut !== "fait") bloc.appendChild(outilsMessage(r, m, bloc, corps));
      fil.appendChild(bloc);
    });
    var statut = h("p", { class: "statut", role: "status", "aria-live": "polite" });
    var erreur = function (m) { statut.textContent = m || ""; statut.className = m ? "statut erreur" : "statut"; };
    var prenom = champPrenom();
    var texte = h("textarea", { id: "lr-reponse", maxlength: "5000", required: true });
    var image = champImage(erreur);
    var bEnvoyer = h("button", { type: "submit", class: "bouton sombre petit" }, ["Envoyer la réponse"]);
    var form = h("form", { novalidate: true }, [
      prenom.noeuds[0], prenom.noeuds[1],
      h("label", { for: "lr-reponse", text: r.statut === "fait" ? "Pas tout à fait ? Répondez ici" : "Répondre" }), texte,
      image.noeuds[0], image.noeuds[1], image.noeuds[2],
      statut,
      h("div", { class: "actions" }, [bEnvoyer])
    ]);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = prenom.valeur(), t = texte.value.trim();
      if (!p) { prenom.noeuds[0].hidden = false; erreur("Indiquez votre prénom."); prenom.input.focus(); return; }
      if (!t) { erreur("Écrivez votre réponse."); texte.focus(); return; }
      bEnvoyer.disabled = true;
      statut.textContent = "Envoi…";
      ecrire(KEY.prenom, p);
      envoyer({ action: "reponse", retour: r.id, prenom: p, texte: t }, image.valeur()).then(function () {
        texte.value = "";
        toast("Réponse envoyée à Lemon.");
        charger();
      }, function (err) { bEnvoyer.disabled = false; erreur(err.message); });
    });
    carte = h("div", { class: "carte", role: "dialog", "aria-labelledby": "lr-titre" }, [
      h("div", { class: "tete" }, [
        h("div", null, [h("h2", { id: "lr-titre", text: "Retour n° " + r.numero }), h("span", { class: "etat " + classe(r.statut), text: MOTS[r.statut] || r.statut })]),
        h("button", { type: "button", class: "fermer", "aria-label": "Fermer", onclick: function () { fermerCarte(); }, text: "×" })
      ]),
      fil, form
    ]);
    racine.appendChild(carte);
    var p = places[r.id];
    if (p && p.el) { var b = p.pin.getBoundingClientRect(); placerCarte(b.left + 16, b.top + 16); } else placerCarte(window.innerWidth / 2, 80);
    if (!rafraichir) carte.querySelector(".fermer").focus();
  }

  // ── Le mode « Commenter » : survoler montre l'élément, un clic (ou Entrée) y pose l'épingle ──
  var bandeau = null;
  var SAISIES = ["click", "mousedown", "mouseup", "pointerdown", "pointerup", "auxclick", "dblclick", "submit", "contextmenu"];
  function chezNous(e) { return e.composedPath && e.composedPath().indexOf(hote) >= 0; }
  function bloquer(e) {
    if (!etat.mode || chezNous(e)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.type === "click") choisir(e.target, e.clientX, e.clientY);
  }
  function survol(e) {
    if (!etat.mode || chezNous(e) || !(e.target instanceof Element)) return;
    var b = e.target.getBoundingClientRect();
    cadre.style.display = "block";
    cadre.style.left = b.left - 2 + "px";
    cadre.style.top = b.top - 2 + "px";
    cadre.style.width = b.width + 4 + "px";
    cadre.style.height = b.height + 4 + "px";
  }
  function choisir(cible, cx, cy) {
    var el = cible instanceof Element ? cible : document.body;
    if (el === document.documentElement) el = document.body;
    var b = el.getBoundingClientRect();
    var x = b.width ? Math.max(0, Math.min(10000, Math.round((cx - b.left) / b.width * 10000))) : 5000;
    var y = b.height ? Math.max(0, Math.min(10000, Math.round((cy - b.top) / b.height * 10000))) : 5000;
    quitterMode();
    ouvrirComposer(el, x, y, cx, cy);
  }
  function entrerMode() {
    fermerCarte();
    fermerPanneau();
    fermerAstuce();
    etat.mode = true;
    boutonCommenter.textContent = "Terminer";
    boutonCommenter.className = "bouton sombre";
    bandeau = h("div", { class: "bandeau", role: "status" }, [
      h("span", { text: tactile ? "Touchez l'endroit à commenter" : "Cliquez sur l'endroit à commenter" }),
      h("button", { type: "button", class: "bouton sombre petit", onclick: function () { quitterMode(); } }, ["Annuler"])
    ]);
    racine.appendChild(bandeau);
    SAISIES.forEach(function (t) { window.addEventListener(t, bloquer, { capture: true, passive: false }); });
    window.addEventListener("mousemove", survol, true);
    astuce(1, bandeau);
  }
  function quitterMode() {
    if (!etat.mode) return;
    etat.mode = false;
    boutonCommenter.textContent = "Commenter";
    boutonCommenter.className = "bouton";
    if (bandeau && bandeau.parentNode) bandeau.parentNode.removeChild(bandeau);
    bandeau = null;
    cadre.style.display = "none";
    SAISIES.forEach(function (t) { window.removeEventListener(t, bloquer, { capture: true }); });
    window.removeEventListener("mousemove", survol, true);
    fermerAstuce();
  }

  // ── « Tous les retours de cette page » ──
  var panneau = null;
  function fermerPanneau() { if (panneau && panneau.parentNode) panneau.parentNode.removeChild(panneau); panneau = null; etat.panneau = false; }
  function basculerPanneau() { if (panneau) { fermerPanneau(); boutonListe.focus(); } else { quitterMode(); fermerCarte(); etat.panneau = true; remplirPanneau(); } }
  /** Amener l'épingle à l'écran, puis ouvrir son fil (une ligne de la liste, ou l'adresse …#lemon-retour-<n>). */
  function montrer(r, invisible) {
    var p = places[r.id];
    fermerPanneau();
    if (p && p.el && !invisible) {
      if (window.innerWidth < 640) {
        // téléphone : la carte s'ouvre en bas de l'écran ; l'épingle monte dans le haut, au-dessus d'elle
        var b = p.el.getBoundingClientRect();
        window.scrollBy({ top: Math.round(b.top + b.height * p.r.y / 10000 - window.innerHeight * 0.16), behavior: reduit ? "auto" : "smooth" });
      } else p.el.scrollIntoView({ block: "center", behavior: reduit ? "auto" : "smooth" });
      quandImmobile(function () { placer(); ouvrirFil(r.id); });
    } else ouvrirFil(r.id);
  }
  /** Quand la page ne défile plus (cinq images de suite, 1,5 seconde au plus) : la carte se pose à côté de l'épingle. */
  function quandImmobile(fn) {
    var avant = null, calme = 0, debut = Date.now();
    (function tour() {
      var ici = window.scrollX + "," + window.scrollY;
      calme = ici === avant ? calme + 1 : 0;
      avant = ici;
      var depuis = Date.now() - debut;
      if ((calme >= 5 && depuis > 150) || depuis > 1500) fn();
      else window.requestAnimationFrame(tour);
    })();
  }
  function ligne(r, invisible) {
    return h("li", null, [h("button", {
      type: "button", class: "ligne", onclick: function () { montrer(r, invisible); }
    }, [h("span", { class: "num " + classe(r.statut), text: String(r.numero) }), h("span", { class: "txt" }, [h("b", { text: MOTS[r.statut] + " · " + (r.prenom || "") }), h("span", { text: premierTexte(r) })])])]);
  }
  function remplirPanneau() {
    if (!panneau) {
      panneau = h("aside", { class: "panneau", role: "dialog", "aria-labelledby": "lr-liste" });
      racine.appendChild(panneau);
    }
    vider(panneau);
    panneau.appendChild(h("div", { class: "tete" }, [h("h2", { id: "lr-liste", text: "Tous les retours de cette page" }), h("button", { type: "button", class: "fermer", "aria-label": "Fermer", onclick: function () { fermerPanneau(); boutonListe.focus(); }, text: "×" })]));
    if (etat.panne) panneau.appendChild(h("p", { class: "statut erreur", text: "Commentaires indisponibles pour le moment." }));
    else if (!etat.charge) panneau.appendChild(h("p", { class: "aide", text: "Chargement…" }));
    else if (!etat.retours.length) panneau.appendChild(h("p", { class: "aide", text: "Aucun commentaire sur cette page pour l'instant. « Commenter », puis cliquez sur l'endroit." }));
    var ici = [], cache = [], perdus = [];
    etat.retours.forEach(function (r) {
      var p = places[r.id];
      if (!p || !p.el) perdus.push(r);
      else { var b = p.el.getBoundingClientRect(); (b.width || b.height ? ici : cache).push(r); }
    });
    if (ici.length) panneau.appendChild(h("ul", null, ici.map(function (r) { return ligne(r, false); })));
    if (cache.length) {
      panneau.appendChild(h("h3", { text: "Pas visible sur cet écran" }));
      panneau.appendChild(h("p", { class: "aide", text: "Posés sur un autre écran (téléphone ou ordinateur) : l'endroit n'apparaît pas à cette largeur." }));
      panneau.appendChild(h("ul", null, cache.map(function (r) { return ligne(r, true); })));
    }
    if (perdus.length) {
      panneau.appendChild(h("h3", { text: "Endroit modifié" }));
      panneau.appendChild(h("p", { class: "aide", text: "La page a changé depuis : l'endroit exact n'existe plus. Le commentaire reste lisible." }));
      panneau.appendChild(h("ul", null, perdus.map(function (r) { return ligne(r, true); })));
    }
    var autres = etat.pages.filter(function (p) { return p.page !== page(); });
    if (autres.length) {
      panneau.appendChild(h("h3", { text: "Autres pages commentées" }));
      panneau.appendChild(h("ul", null, autres.map(function (p) {
        return h("li", null, [h("a", { class: "ligne", href: p.page }, [h("span", { class: "txt" }, [h("b", { text: p.ouverts + " ouvert" + (p.ouverts > 1 ? "s" : "") + " sur " + p.total }), h("span", { text: p.page })])])]);
      })));
    }
    panneau.appendChild(h("h3", { text: "Les couleurs" }));
    panneau.appendChild(h("p", { class: "aide", text: "Vos commentaires vont chez Lemon. Une épingle jaune est reçue, bleue attend votre réponse, verte est faite." }));
    panneau.appendChild(h("h3", { text: "Le lien de relecture" }));
    panneau.appendChild(h("p", { class: "aide", text: "Le même lien pour tout le monde : pour ouvrir la relecture sur un autre appareil, ou la transmettre à un collègue." }));
    var copie = h("div", { class: "copie" });
    panneau.appendChild(h("button", { type: "button", class: "bouton clair petit", onclick: function () { copierLien(copie); } }, ["Copier le lien de relecture"]));
    panneau.appendChild(copie);
    panneau.appendChild(h("button", { type: "button", class: "lien", onclick: function () { ecrire(KEY.jeton, null); demonter(); toast("Relecture terminée sur cet appareil."); } }, ["Quitter la relecture sur cet appareil"]));
    var f = panneau.querySelector(".fermer");
    if (f && ombre.activeElement !== f && !ombre.activeElement) f.focus();
  }

  // ── « Copier le lien de relecture » : celui de cet appareil (le presse-papiers, sinon le lien sélectionné) ──
  function copierLien(ou) {
    var lien = window.location.origin + "/?relecture=" + token;
    var montrer = function () {
      vider(ou);
      var champ = h("input", { type: "text", readonly: true, "aria-label": "Lien de relecture", value: lien });
      ou.appendChild(champ);
      ou.appendChild(h("p", { class: "aide", text: "Copiez le lien sélectionné (Ctrl + C, ou ⌘ + C sur un Mac)." }));
      champ.focus();
      champ.select();
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lien).then(function () { vider(ou); toast("Lien de relecture copié."); }, montrer);
      } else montrer();
    } catch (e) { montrer(); }
  }

  // ── Aller droit à une épingle : https://site-de-test/<page>#lemon-retour-<n> (« Voir sur le site » dans la console) ──
  var ANCRE = /^#lemon-retour-([1-9][0-9]{0,8})$/;
  function ancre() { var m = ANCRE.exec(window.location.hash || ""); return m ? Number(m[1]) : 0; }
  function quandPret(fn) {
    // après les images : l'endroit ne bouge plus quand on y va (3 secondes au plus)
    if (document.readyState === "complete") { fn(); return; }
    var fait = false;
    var une = function () { if (!fait) { fait = true; fn(); } };
    window.addEventListener("load", une);
    window.setTimeout(une, 3000);
  }
  function allerAuRetour() {
    var n = ancre();
    if (!n || !etat.charge || !barre || !barre.parentNode) return false;
    quitterMode();
    fermerCarte();
    // la plateforme ne répond pas : la liste le dit, et recharger la page réessaie
    if (etat.panne) { etat.panneau = true; remplirPanneau(); return true; }
    // lu une fois, puis retiré de l'adresse : recharger la page ne rouvre pas un fil que la personne a fermé
    try { window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search); } catch (e) { /* rien */ }
    var r = etat.retours.filter(function (x) { return Number(x.numero) === n; })[0];
    // pas sur cette page : la liste, avec les autres pages commentées
    if (!r) { etat.panneau = true; remplirPanneau(); return true; }
    quandPret(function () {
      if (etat.mode || etat.nouvelle || !barre.parentNode) return; // la personne commente déjà autre chose
      var p = places[r.id];
      if (p && !(p.el && p.el.isConnected)) p.el = retrouver(r);
      var b = p && p.el ? p.el.getBoundingClientRect() : null;
      // l'endroit a disparu (« Endroit modifié ») ou n'est pas à cette largeur : le fil s'ouvre quand même
      montrer(r, !(b && (b.width || b.height)));
    });
    return true;
  }

  // ── Trois petites astuces, la première fois seulement ──
  var bulle = null;
  function fermerAstuce() { if (bulle && bulle.parentNode) bulle.parentNode.removeChild(bulle); bulle = null; }
  var ASTUCES = tactile ? [
    "Touchez « Commenter » pour laisser un commentaire sur le site.",
    "Touchez l'endroit de la page que vous voulez commenter.",
    "Écrivez votre commentaire, joignez une image si besoin, puis « Envoyer »."
  ] : [
    "Cliquez sur « Commenter » pour laisser un commentaire sur le site.",
    "Cliquez sur l'endroit de la page que vous voulez commenter.",
    "Écrivez votre commentaire, joignez une image si besoin, puis « Envoyer »."
  ];
  function astuce(n, pres) {
    var vu = Number(lire(KEY.astuces) || "0");
    if (vu > n || !pres) return;
    fermerAstuce();
    var ok = h("button", { type: "button", class: "bouton petit", onclick: function () { ecrire(KEY.astuces, String(n + 1)); fermerAstuce(); } }, [n === 2 ? "Compris" : "OK"]);
    bulle = h("div", { class: "astuce", role: "note" }, [h("p", { text: ASTUCES[n] }), ok, " ", h("button", { type: "button", class: "lien", onclick: function () { ecrire(KEY.astuces, "3"); fermerAstuce(); } }, ["Ne plus afficher"])]);
    bulle.querySelector(".lien").style.color = "#fff";
    racine.appendChild(bulle);
    var b = pres.getBoundingClientRect();
    var w = Math.min(260, window.innerWidth - 24);
    if (n === 2 && window.innerWidth < 640) { bulle.style.left = "12px"; bulle.style.top = "12px"; }
    else if (n === 1) { bulle.style.left = Math.max(12, Math.min(b.left + b.width / 2 - w / 2, window.innerWidth - w - 12)) + "px"; bulle.style.top = b.bottom + 10 + "px"; }
    else if (n === 2) { bulle.style.left = Math.max(12, b.left) + "px"; bulle.style.top = Math.max(12, b.top - 96) + "px"; }
    else { bulle.style.left = Math.max(12, b.right - w) + "px"; bulle.style.top = Math.max(12, b.top - 120) + "px"; }
    ecrire(KEY.astuces, String(Math.max(vu, n)));
  }

  // ── Un petit message ──
  var minuteur = 0, message = null;
  function toast(texte, duree, action) {
    if (!racine) { monterSiBesoin(); }
    if (message && message.parentNode) message.parentNode.removeChild(message);
    var fin = function () { window.clearTimeout(minuteur); if (message && message.parentNode) message.parentNode.removeChild(message); };
    // une action (« Annuler ») reste quelques secondes à côté du message
    message = h("div", { class: "toast", role: "status", "aria-live": "polite" }, [h("span", { text: texte }),
      action ? h("button", { type: "button", class: "bouton petit", onclick: function () { fin(); action.agir(); } }, [action.texte]) : null]);
    racine.appendChild(message);
    window.clearTimeout(minuteur);
    minuteur = window.setTimeout(function () { if (message && message.parentNode) message.parentNode.removeChild(message); }, duree || 4000);
  }

  // ── Démarrer, s'arrêter ──
  var intervalle = 0;
  function demonter() {
    quitterMode();
    fermerCarte();
    fermerPanneau();
    window.clearInterval(intervalle);
    vider(couchePins);
    places = {};
    if (barre && barre.parentNode) barre.parentNode.removeChild(barre);
    window.setTimeout(function () { if (hote && hote.parentNode) hote.parentNode.removeChild(hote); }, 9000);
  }
  function monterSiBesoin() { if (!hote) monter(); }

  function demarrer() {
    try {
      monter();
      window.addEventListener("scroll", placerBientot, { passive: true, capture: true });
      window.addEventListener("resize", function () { placerBientot(); if (carte && window.innerWidth >= 640 && etat.ouverte) ouvrirFil(etat.ouverte, true); });
      window.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          if (etat.mode) { quitterMode(); boutonCommenter.focus(); }
          else if (carte) { fermerCarte(); boutonCommenter.focus(); }
          else if (panneau) { fermerPanneau(); boutonListe.focus(); }
        } else if (e.key === "Enter" && etat.mode && !chezNous(e) && document.activeElement && document.activeElement !== document.body) {
          // au clavier : Tab jusqu'à l'élément, puis Entrée
          e.preventDefault();
          e.stopImmediatePropagation();
          var b = document.activeElement.getBoundingClientRect();
          choisir(document.activeElement, b.left + b.width / 2, b.top + b.height / 2);
        }
      }, true);
      if (window.ResizeObserver) new window.ResizeObserver(placerBientot).observe(document.documentElement);
      var attente = 0;
      if (window.MutationObserver) {
        new window.MutationObserver(function (liste) {
          for (var i = 0; i < liste.length; i++) if (liste[i].target === hote || (hote && hote.contains(liste[i].target))) return;
          window.clearTimeout(attente);
          attente = window.setTimeout(resoudre, 400);
        }).observe(document.body, { childList: true, subtree: true });
      }
      intervalle = window.setInterval(placer, 1500);
      window.setInterval(function () { if (document.visibilityState === "visible" && !etat.mode && !etat.nouvelle) charger(); }, 60000);
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && !etat.nouvelle) charger(); });
      // une autre épingle demandée par l'adresse, la page déjà ouverte : les retours à jour, puis l'épingle
      window.addEventListener("hashchange", function () { if (ancre() && etat.charge && barre && barre.parentNode) charger().then(function () { allerAuRetour(); }); });
      charger().then(function () { if (barre && barre.parentNode && !allerAuRetour()) astuce(0, barre); });
    } catch (e) {
      // jamais une page cassée par le calque
      try { if (hote && hote.parentNode) hote.parentNode.removeChild(hote); } catch (e2) { /* rien */ }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
