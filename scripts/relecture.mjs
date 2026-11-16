// After `vite build`: only the test version (LEMON_RELECTURE=1, set in netlify.toml until launch)
// serves the Lemon platform's « Commenter » layer. Any other build removes it from the output,
// so production has neither the script tag (src/routes/__root.tsx) nor the file.
// The client and the public/ files go to dist/ (nitro's netlify preset, see netlify.toml).
import { existsSync, rmSync } from "node:fs";

const dossier = "dist/relecture";

if (process.env.LEMON_RELECTURE === "1") {
  if (!existsSync(`${dossier}/retours.js`)) {
    console.error(`Relecture : ${dossier}/retours.js manque dans la construction.`);
    process.exit(1);
  }
  console.log("Relecture : calque « Commenter » inclus (version de test).");
} else {
  rmSync(dossier, { recursive: true, force: true });
  console.log("Relecture : calque « Commenter » retiré (LEMON_RELECTURE n'est pas à 1).");
}
