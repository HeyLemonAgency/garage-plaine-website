export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="fr-CH">
  <head>
    <meta charset="utf-8" />
    <title>Page momentanément indisponible — Garage de la Plaine</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #f9f9f7; color: #22272c; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.4rem; margin: 0 0 0.5rem; color: #0b2233; }
      p { color: #5b636b; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.65rem 1.1rem; border-radius: 5px; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #0b2233; color: #fff; }
      .secondary { background: #fff; color: #d7261e; border-color: #d7261e; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Cette page n’a pas pu s’afficher.</h1>
      <p>Un problème est survenu de notre côté. Réessayez dans un instant, ou appelez-nous au 021 801 68 42.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Réessayer</button>
        <a class="secondary" href="tel:+41218016842">Appeler le garage</a>
      </div>
    </div>
  </body>
</html>`;
}
