# E-Sports Club CUJ

Website for the E-Sports Club of Central University of Jammu, built around
**Dominion 2026** — the Engineering Day esports event, 15 September 2026.

This is one Next.js app. The designed homepage is preserved at
`public/home.html` and served at `/` through a rewrite; `/register` is the
serverless registration flow backed by Supabase.

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. Vercel → **Add New → Project → Import** the repo.
3. Framework preset: **Next.js**. Keep the default build and output settings.
4. Deploy.

Every push to `main` redeploys automatically.
Local preview: `npm run dev`, then open `localhost:3000`.

## The one thing to fill in

Near the top of the `<script>` block in `public/home.html`:

```js
const LINKS = {
  register: "/register"
};
```

While it's empty, all four Register buttons render in a dashed "pending" state
with the note *"Registration link goes live shortly"*, so no button ever points
nowhere. Paste the URL and every one of them activates.

## Editing content

All copy lives in the `SITE` object in `public/home.html`. Nothing is hardcoded in the
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
| `public/img/dominion-2026-poster.png` | Event poster + social link preview |
| `public/img/logo-esports-cuj.png` | Club logo — rail, nav, footer |
| `public/img/logo-cuj-university.png` | University crest — hero, rail, footer |
| `public/img/favicon.png` | Browser tab icon |

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

### Rulebook PDFs

The registration UI has mobile-friendly slots for both game rulebooks. Add the
final PDFs at these paths:

```
public/rulebooks/dominion-2026-bgmi.pdf
public/rulebooks/dominion-2026-free-fire.pdf
```

Then set each matching `available` flag to `true` in `data/rulebooks.ts`.

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
  p4_name     text, p4_ign text, p4_uid text, p4_roll text,
  dept_check_note text
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

### `dept_check_note` — finding teams that need manual department checks

The roll pattern above only matches BE programmes (`YYBE<DEPT><NUMBER>`).
Dominion is open to every department, so students on MBA, MA, MSc and other
non-BE programmes will have roll numbers that don't match — the same-department
check is skipped for them rather than rejecting the team. That skip is not
silent: every insert sets `dept_check_note`, either `null` (every player's
roll matched the pattern, so the check actually ran) or a message naming which
roles didn't match, e.g. `"Not verified for: Player 3."`.

Before the event, filter the exported CSV for a non-empty `dept_check_note`
and verify those specific players by hand — everyone else has already been
checked automatically. In the Supabase SQL editor:

```sql
select team_name, game, dept_check_note
from registrations
where dept_check_note is not null
order by created_at;
```
