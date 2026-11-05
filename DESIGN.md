# Design Context — Garage de la Plaine

Read this before any visual or UI change. It records who the site is for, how it should feel, and the design system already in `src/styles.css`, so new work matches what exists.

Sources: the client brief in `README.md`, the tokens and classes in `src/styles.css`, the verified facts in `src/lib/garage.ts`, and the rules in `AGENTS.md`. Written 2026-11-05 from the code as it stands. Points marked _(assumed)_ were inferred and should be confirmed with the client.

## Register

A brand and marketing site for a local business, not a product UI. Visitors either act (call, find the garage, ask for an appointment) or browse (stock, services, Suzuki). There are no accounts, no dashboard and no stock data of our own. Stock belongs to the dealer's Autolina feed.

## Users

- **Who.** Drivers in Denges and La Côte, 5 minutes from Morges and 10 from Lausanne. Long-standing customers, Suzuki buyers, people with bodywork and insurance claims, people selling or trading in a car, WIR members and fuel-station users. Many are older, long-time locals _(assumed)_.
- **Situation.** Often on a phone, often with a problem: a service is due, a warning light, an accident. They want the answer in seconds, not an experience.
- **Tasks, in priority order** (from the brief):
  1. Call the garage.
  2. Find the address and opening hours.
  3. See the vehicles available.
  4. Understand the services.
  5. Ask for an appointment.
- **Language.** Swiss French (`lang="fr-CH"`). The site is French only.

## Brand personality

**Fiable · Proche · Soigné** (trustworthy, local, meticulous).

- The feeling to leave behind: _these people will look after my car properly._ Reassurance, not excitement.
- Premium but approachable. Established, not flashy. Closer to a contemporary Swiss company or a European car brand than to a garage template.
- Suzuki is a partner, not the identity. Its red and its logo support the Garage de la Plaine brand and never take over a page.

### Voice and writing conventions

- Address visitors as _vous_. Calm, plain and factual. No exclamation marks, and no superlatives that the original site cannot back up ("40+ ans", "plus de 20 ans" Suzuki are verified).
- Headlines are short statements that end with a full stop, often in two beats: "L’esprit Suzuki. La proximité en plus.", "Tout pour votre voiture."
- Swiss typography: the curly apostrophe (’) in words, the en dash with spaces ( – ) in ranges, the Swiss thousands separator `CHF 25’990.–` and `108’990 km`, and times written as `07h30 – 12h00`.
- Show phone numbers in local form (`021 801 68 42`) and link them in international form (`tel:+41218016842`).
- Every fact (address, hours, people, services, emails) comes from `src/lib/garage.ts`. Never invent prices, history, staff, reviews or services.

## Aesthetic direction

**Light, editorial, Swiss.** A warm off-white page, a deep petrol navy that carries the brand, pale sage bands for rhythm, anthracite text and a little Suzuki red as a signal. Lots of whitespace, large display type, thin-line icons, hairline borders and very soft shadows.

The site is light-only by design. The brief asks for a white, airy site, and no dark theme is defined.

### Anti-references (from the brief)

Avoid all of these:

- Black or very dark page backgrounds.
- Racing graphics, chequered flags, speed lines.
- Carbon-fibre or metal textures.
- Aggressive gradients.
- Large fields of red.
- The generic "independent garage" template look: stock banners, clip-art icons, crowded promo blocks.

### Colour tokens (`:root` in `src/styles.css`)

| Token                | Value                  | ≈ Hex     | Role                                                                            |
| -------------------- | ---------------------- | --------- | ------------------------------------------------------------------------------- |
| `--background`       | `oklch(.984 .002 100)` | `#fafaf8` | Warm off-white page                                                             |
| `--foreground`       | `oklch(.25 .012 240)`  | `#1d2227` | Anthracite body text                                                            |
| `--primary`          | `oklch(.235 .046 235)` | `#032131` | Petrol navy: display headings, primary buttons, info bar, footer, icons         |
| `--accent`           | `oklch(.575 .23 27)`   | `#e10d1c` | Suzuki red: signals only (see below). Also used as `--ring` and `--destructive` |
| `--secondary`        | `oklch(.917 .011 151)` | `#dfe6e0` | Pale sage: trust band, contact band                                             |
| `--muted`            | `oklch(.962 .003 160)` | `#f1f3f2` | Quiet bands: page intros, partnership sections, alternate service rows          |
| `--muted-foreground` | `oklch(.49 .012 235)`  | `#5a6266` | Secondary copy, metadata                                                        |
| `--card`             | `oklch(1 0 0)`         | `#ffffff` | Cards, header, form fields                                                      |
| `--border`           | `oklch(.903 .006 230)` | `#dbe0e2` | Hairline borders                                                                |

Always use these tokens. Do not add one-off colours. Tints are made with `color-mix(in oklch, …)` from existing tokens, as the stylesheet already does.

**Where red is allowed.** Red goes only on small elements:

- the eyebrow dot;
- the 46 × 3 px "red rule" under key headlines;
- the 2 px active or hover underline in the nav;
- the arrows on cards;
- checklist ticks;
- the outline "appointment" button;
- the phone pill in the info bar;
- hover borders on service cards.

Never use red as a section background, a headline colour or body text.

### Typography

- **Display:** Manrope, weights 700 and 800. **Body:** Inter, weights 400–600. Both load from Google Fonts in `src/routes/__root.tsx`.
- Global `letter-spacing: 0`. The one exception is the eyebrow: uppercase, 1.5 px tracking, weight 600.
- Current scale (desktop → phone ≤ 520 px):

| Element            | Size       | Notes                                     |
| ------------------ | ---------- | ----------------------------------------- |
| Hero `h1`          | 54 → 39 px | Weight 800, `--primary`, line height 1.15 |
| Page intro `h1`    | 44 → 33 px | `--primary`                               |
| Editorial `h2`     | 35 → 28 px |                                           |
| Section `h2`       | 29 → 23 px |                                           |
| Card `h3`          | 14 → 12 px |                                           |
| Body               | 14 px      | Inter, line height 1.75                   |
| Eyebrow            | 10 → 9 px  | Uppercase, `--muted-foreground`           |
| Card and meta copy | 11 → 10 px | See the accessibility gaps below          |

### Shape, depth and icons

- Radii are small and precise: 4 px for fields and chips, 5–6 px for buttons, cards and images, 8 px at most. No pill shapes and no large rounded blobs.
- Borders are 1 px `--border`. Shadows are barely there: `--shadow-card` (3.5 % navy) and `--shadow-nav` (5.5 % navy).
- Icons come from `lucide-react` at stroke width 1.5, in `--primary` or `--accent`. Outline icons only, never filled or multicolour.

### Signature motifs

These are what make the site recognisable. Reuse them before inventing new ones.

- **Eyebrow → headline → red rule → copy → CTA.** This is the standard order for editorial sections.
- **Eyebrow label** (`.eyebrow`, optionally with `.eyebrow-dot`) above every section heading.
- **Two-column editorial split** (`.editorial-grid`): a real photograph beside copy, alternating sides from one section to the next.
- **Sage trust band** (`.trust-band`): four line-icon facts separated by hairlines.
- **Suzuki signature chip** in the hero: a white card holding the Suzuki logo and "Partenaire officiel Suzuki".
- **Navy footer** and **navy info bar** that frame every page.

### Components

- Buttons: use `<Button variant="premium">` (filled navy) and `<Button variant="appointment">` (white with a red outline). Both are 46 px tall (44 px on phones), 12 px text at weight 600, and lift 2 px on hover. Site pages do not use the default shadcn button variants.
- Styling lives in hand-written classes in `src/styles.css`. Tailwind utilities appear only for small adjustments (`size-4`, `flex gap-3`). New sections should add classes there that follow the same tokens and naming.
- Most shadcn/ui primitives in `src/components/ui/` are scaffolding and are not used by the site. If you use one, restyle it to these tokens first.
- Shared sections live in `src/components/garage/`:
  - `sections.tsx`: `Hero`, `TrustBar`, `ServicesPreview`, `Partnership`, `CompanyStory`, `PageIntro`, `CheckList`, `SectionHeading`;
  - `contact.tsx`: `ContactSection`, `ContactForm`, `Hours`, `Location`;
  - `stock.tsx`: `StockPreview`;
  - `site-shell.tsx`: header, footer and the mobile call bar.

### Layout

- `.container` is `min(1184px, 100% − 80px)`. The side gutters narrow to 24 px at ≤ 1100 px and to 18 px at ≤ 520 px.
- Breakpoints:
  - 1500 px: taller hero.
  - 1100 px: tighter nav and type.
  - 800 px: the nav becomes a menu, 4-column grids become 2 columns, and editorial splits stack.
  - 520 px: phone layout, and the fixed bottom bar with "Appeler" and "Rendez-vous" appears.
- Section rhythm: about 58 px of vertical padding on desktop and 38–42 px on phones. A sage or muted band separates groups of white sections.

### Motion

Motion stays quiet:

- a 0.6 s fade-and-rise when content appears (`.reveal`);
- hover lifts of 2–4 px;
- image zooms on hover of no more than 1.025;
- the nav underline grows from left to right in 0.2 s.

No parallax, scroll-jacking, bouncing or looping animation. `prefers-reduced-motion` turns everything off, and every new animation must respect it.

### Imagery

- Use the real garage photographs and the supplied logo through the `*.asset.json` pointers in `src/assets/`: workshop, bodywork, showroom, façade and pump.
- Generated editorial images (currently only the hero `suzuki-lake.jpg`) must carry the "Visuel d’illustration" caption. They must never pass as the real garage, its team or its stock.
- Vehicle photos come from Autolina listings only. The homepage preview is a dated editorial snapshot, and the full list is always the live Autolina iframe.

## Design principles

1. **The phone is always within a thumb's reach.** The phone number appears in the info bar, the contact sections and the mobile call bar. No design may hide or demote it.
2. **Facts before flourish.** Every claim comes from `src/lib/garage.ts` or the original site. If a fact is missing, leave a gap rather than filling it.
3. **Red is a signal, not a surface.** If you notice the red before the content, there is too much of it.
4. **Honest imagery.** Real photographs show the real business. Illustrations are labelled. Stock comes from the dealer.
5. **One idea per section.** Generous whitespace, one headline, one main action per block.
6. **One system on every page.** Inner pages get the same care as the homepage: the same tokens, motifs, buttons and rhythm.
7. **Forms say what really happens.** They prepare an email in the visitor's own email app and say so. Never show "message sent" unless a delivery service actually sent it.

## Accessibility

- Target: **WCAG 2.2 AA** _(assumed)_.
- Measured contrast for the current tokens:

| Pair                                                  | Ratio                   | Result                              |
| ----------------------------------------------------- | ----------------------- | ----------------------------------- |
| foreground on background                              | 15.3:1                  | Pass                                |
| primary on white, and white on primary                | 16.6:1                  | Pass                                |
| muted-foreground on white / background / muted / sage | 6.2 / 6.0 / 5.6 / 4.9:1 | Pass                                |
| accent on white, and white on accent                  | 4.9:1                   | Pass for normal text, keep it short |
| border on white (form-field edges)                    | 1.3:1                   | **Fails** the 3:1 non-text minimum  |

### Gaps found during this setup (not fixed yet)

- **Small type.** Body text is 14 px, and a lot of copy is 9–11 px: eyebrows, card text, vehicle details, form notes, footer, info bar, hero caption. For this audience, aim for 16 px body text and at least 12 px for metadata.
- **Form fields.** Input borders are 1.3:1, and focus shows only as a border-colour change with `outline: none`. Field edges need at least 3:1, and keyboard focus needs a clearly visible ring.
- **404 and error pages.** They are in English and use the template's generic styling, outside this system.
- **Facts written directly into pages.** Tiago Bessa's number and the team emails are typed into several routes (`entreprise`, `contact`, `suzuki`, `reprise`) instead of coming from `src/lib/garage.ts`.
- **Map.** The location panel is a decorative CSS drawing with a link to Google Maps. It is not an embedded map.
