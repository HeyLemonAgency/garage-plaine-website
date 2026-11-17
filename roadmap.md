# Garage de la Plaine
- [x] Verify existing website information and live vehicle stock.
- [x] Create the shared visual system and homepage matching the moodboard.
- [x] Build company, services, stock, Suzuki and contact pages; preserve WIR, fuel station and vehicle purchase content.
- [x] Verify navigation, contact actions, live Autolina inventory and mobile/tablet layouts; all ten route tests pass.
- [x] Version de test hors de Google : les adresses *.netlify.app répondent « X-Robots-Tag: noindex » et leur robots.txt ne donne pas de plan du site (`isTestHost`, `src/lib/site.ts`). Décidé selon l’adresse demandée : garageplaine.ch sera indexable dès qu’il est branché, sans rien changer.
- [ ] Lancement : retirer LEMON_RELECTURE (`netlify.toml`, `[build.environment]`) : la production ne montre jamais le calque « Commenter » de la plateforme Lemon. Faire cette construction après avoir branché garageplaine.ch : les liens canoniques et le plan du site prennent alors sa vraie adresse (`URL` de Netlify).
