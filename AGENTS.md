<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep French garage content in a shared source module, with individual TanStack content routes and reusable site sections; this keeps verified facts consistent across all pages.
- Use Autolina as the live inventory source and external listing destination, never a local stock database; stock must stay owned by the dealer's feed. The homepage preview reads the dealer's Autolina listing page at request time (`src/lib/autolina.ts`, `src/lib/stock.functions.ts`) and falls back to a plain stock link; never hard-code cars or prices.
- Keep the mechanical services folded into a single dropdown item (`MechanicalList`): the garage asked for sales and bodywork to lead. Tiago Bessa (service vente) is the contact on every car-related page.
- Keep the supplied logo and actual garage photographs as image files in `src/assets/` (imported directly, no Lovable asset pointers), and distinguish generated editorial imagery from real inventory imagery; avoid misrepresenting the business.
- The site is hosted on Netlify: `vite.config.ts` pins nitro's `netlify` preset and `netlify.toml` holds the build settings; don't reintroduce Lovable- or Cloudflare-hosted dependencies.
- Contact forms compose a departmental email in the visitor's email application unless a mail-delivery service is configured; never claim a message was sent without delivery.
