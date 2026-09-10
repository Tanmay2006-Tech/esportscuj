# E-Sports Club CUJ

Website for the E-Sports Club of Central University of Jammu, built around
**Dominion 2026** — the Engineering Day esports event, 15 September 2026.

Two things live in this repo right now:

- **`index.html`** — the original static site. No build step, no
  dependencies, no backend. Stays deployed as-is until the Next.js app below
  passes its own checklist.
- **A Next.js app** (`app/`, `data/`, `lib/`) — the replacement, being built
  in steps. Currently only `/register` is functional; `/` is a placeholder.

The static site's docs are below, unchanged. The Next.js app is documented
further down under **Next.js app**.

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

---

## Next.js app

Next.js (App Router) + TypeScript, deployed on Vercel, data in Supabase.
Registration closes 13 September 2026, 23:59 IST; the event is 15 September
2026.

### Local setup

```
npm install
cp .env.local.example .env.local   # fill in the two Supabase values below
npm run dev
```

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL — safe for the browser
SUPABASE_SERVICE_ROLE_KEY=         # server only — never NEXT_PUBLIC_, never in a client component
```

Set both in Vercel's project settings too before deploying. The service role
key must only ever be read inside a server action (`lib/supabase/admin.ts`).
If it reaches a client component, the database is public.

### Database

One table, one row per team, built in the Supabase SQL editor:

```sql
create table registrations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  game        text not null check (game in ('BGMI','Free Fire')),
  team_name   text not null,
  department  text not null,
  year        text not null,
  semester    text not null,
  igl_name    text not null,
  igl_ign     text not null,
  igl_uid     text not null,
  igl_roll    text not null,
  igl_phone   text not null,
  p2_name     text not null,
  p2_ign      text not null,
  p2_uid      text not null,
  p2_roll     text not null,
  p3_name     text, p3_ign text, p3_uid text, p3_roll text,
  p4_name     text, p4_ign text, p4_uid text, p4_roll text
);

alter table registrations enable row level security;
```

RLS is enabled with **no policies at all** — that's deliberate. With zero
policies, both `anon` and `authenticated` are denied every operation by
default: no reads, no writes, from the browser or a leaked anon key. Only two
things can touch this table:

- The `/register` server action, using `SUPABASE_SERVICE_ROLE_KEY`. Supabase's
  service role has `BYPASSRLS`, so it ignores RLS regardless of policies.
- You, logged into the Supabase dashboard, reading the table editor directly.

### Exporting entries

Supabase → **Table editor** → `registrations` → **Download CSV** → open in
Excel. One row per team, every column readable, no joins or views needed.

### Checking for duplicate UIDs across teams

The flat table can't enforce this with a constraint, and it isn't checked by
the app. Before the event, run this in the Supabase SQL editor to find any
in-game UID that shows up on more than one team:

```sql
select uid, count(*) as times_used, array_agg(team_name) as teams
from (
  select igl_uid as uid, team_name from registrations
  union all
  select p2_uid, team_name from registrations
  union all
  select p3_uid, team_name from registrations where p3_uid is not null
  union all
  select p4_uid, team_name from registrations where p4_uid is not null
) all_uids
group by uid
having count(*) > 1
order by times_used desc;
```

### Registration validation (server-side, in `app/register/actions.ts`)

Every rejection returns a specific message — never "something went wrong".
Checked in this order:

1. Honeypot field (`website`) — must be empty. Message is deliberately vague.
2. Deadline — rejected after 13 September 2026, 23:59 IST.
3. Game must be `BGMI` or `Free Fire`.
4. Team name, department, year, semester required.
5. IGL name, IGN, UID, roll number and phone required.
6. IGL phone normalized (strips spaces, dashes, a leading `+91`, a leading
   `0`) then must be exactly 10 digits.
7. Player 2 name, IGN, UID and roll number required (squad minimum is 2).
8. Players 3 and 4 are all-or-nothing — if any of their four fields is
   filled, all four must be.
9. No duplicate in-game UID within the submission (trimmed, case-insensitive).
10. Same-department check: each player's roll number is parsed against
    `/^\d{2}BE([A-Z]{2,6})\d{2,4}$/i` (e.g. `24BECSE62` → department `CSE`).
    If a player's parsed department differs from the IGL's, the team is
    rejected, naming that player. A roll number that doesn't match the
    pattern is **not** rejected — it's accepted and left for the club to
    verify by hand.

No slot caps, no per-department limits, no cross-team UID check (see above).
