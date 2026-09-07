# E-Sports Club CUJ

Website for the E-Sports Club of Central University of Jammu, built around
**Dominion 2026** — the Engineering Day esports event, 15 September 2026.

Static site. No build step, no dependencies, no backend.

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. Vercel → **Add New → Project → Import** the repo.
3. Framework preset: **Other**. Leave build command and output directory empty.
4. Deploy.

Every push to `main` redeploys automatically.
Local preview: `python3 -m http.server 8000`, then open `localhost:8000`.

## The one thing to fill in

Near the top of the `<script>` block in `index.html`:

```js
const LINKS = {
  register: ""    // <-- central all-clubs registration site
};
```

While it's empty, all four Register buttons render in a dashed "pending" state
with the note *"Registration link goes live shortly"*, so no button ever points
nowhere. Paste the URL and every one of them activates.

## Editing content

All copy lives in the `SITE` object in `index.html`. Nothing is hardcoded in the
markup except the About paragraphs.

| Key | Controls |
|---|---|
| `SITE.event` | Date, time, venue, entry, prizes, closing date |
| `SITE.titles` | Game cards — add a third here if one gets added |
| `SITE.rules` | Numbered entry rules |
| `SITE.stats` | The four big numbers |
| `SITE.achievements` | Convoquer '25 results. `gold: true` fills the badge blue |
| `SITE.archive` | Past tournaments — text only, no images |
| `SITE.core` / `SITE.members` | Office bearers and members |

## Images

| File | Use |
|---|---|
| `dominion-2026-poster.png` | Event poster + social link preview |
| `logo-esports-cuj.png` | Club logo — rail, nav, footer |
| `logo-cuj-university.png` | University crest — hero, rail, footer |
| `favicon.png` | Browser tab icon |

Past tournaments carry no imagery — they're a text archive.

## Design system

One accent, ultramarine `#1A2AE8`, on a bone neutral `#EAE8E1` with ink
`#12141B`. All tokens are CSS custom properties in `:root`.

Typography is Archivo variable only, using its width axis as the hierarchy:
`wdth 118 / wght 830` display, `wdth 64` numerals, `wdth 100 / wght 620` tracked
labels.

Motion: one hero entrance, section rules that draw in once, and hover states.
All disabled under `prefers-reduced-motion`.

## Notes

- Convenor phone numbers appear on the team cards, taken from the public poster.
  Remove `tel` from `SITE.core` if you'd rather they weren't indexed.
- The club logo sits in a 36px square crop in the side rail. A transparent PNG of
  just the crest would sit better there.
