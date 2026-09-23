# eFootball Market v2 — real cards, minimal UI

🌐 **Live 24/7: https://beraniahmed29-rgb.github.io/efootball-market/**

Premium mobile-first marketplace. **Real imported card images only** — no generated art, no initials.

> Independent community marketplace. Not affiliated with KONAMI.
> Card Value is a reference index, not an official price.
> Never share passwords / 2FA / recovery codes. Listings are demo data.

Open **`index.html`** (double-click, no server needed).

## Card database (real images)

```
assets/cards/Big_Time/   23 original PNGs (preserved byte-for-byte from BIG TIME.zip)
assets/cards/Epic/       (empty — shows "No cards imported yet" + import CTA)
assets/cards/Show_Time/  (empty — same)
js/cards.js              seed manifest: card_id, player_name, card_type,
                         card_version, image_path, current_value, currency, status
```

- `card_id` is the primary key. Messi exists 3x (`bt_messi_001/002/003`) — never merged.
- Card art fills ~70% of every tile. Broken images → "Image unavailable" (never initials).
- Thumbnails: same file, browser-scaled (`loading=lazy`). Originals never cropped/recolored.

## Structure

| File | Role |
|---|---|
| `index.html` | shell + bottom nav + global search (+JSZip CDN for imports) |
| `css/style.css` | minimal dark UI: teal accent, Epic violet / Big Time crimson / Show Time gold (badges only) |
| `js/cards.js` / `js/data.js` | card manifest / listings (card_ids) + wanted + sellers |
| `js/utils.js` | `cardById`, `liveVal`, `cardValue`, `matchScore`, `imgSrc`, `imgFail` |
| `js/store.js` | localStorage v2: saved, mine, purchases, price overrides+log, runtime cards, staging, image errors |
| `js/api.js` | backend boundary incl. `importZip()` (JSZip, dup detection, review/publish) |
| `js/components.js` | `cardTile`, `accountCard`, `wantedCard`, `cardPicker`, modal/toast |
| `js/pages.js` / `js/app.js` | views / hash router (`#/card/:card_id`, legacy `#/player/:name` alias kept) |

## Routes

`#/` Home (Popular + Big Time / Epic / Show Time shelves) · `#/explore` (search + All/Android/iOS/Verified + sort + optional card filter) · `#/prices` (search + type + sort) · `#/card/:id` (versions, containing accounts) · `#/account/:id` (Key Cards, CV total vs asking) · `#/sell` (4 steps: Basics → Rare Cards → Proof → Review) · `#/wanted` + `#/wanted-match/:id` · `#/notifications` · `#/profile` · `#/admin` (Card Database, Image Status, Import ZIP, Pending, Reported, Users, Transactions, Audit Log) · `#/how` · `#/search`.

## Admin

- **Card Database**: search/filter, rename, set value (logged with prev/new/ts/admin), activate/deactivate, duplicate + broken badges.
- **Image Status**: Run check → total / loaded / failed / missing / duplicates + failed table (Card ID, player, type, path, error).
- **Import ZIP**: progress bar → Import Complete (Epic/Big Time/Show Time, successful/failed/duplicates) → Review Cards (staging carousel) → Publish Cards or Discard. Only admins change values (UI + API level).

## Verification

`node <tmp>/accept.js` — 23/23 PASS: 23 files on disk, unique IDs, Messi x3, search→3 images, sell auto-total, listing/account thumbs, CV $48 math, unavailable-fallback, no invented players, mobile CSS.

## Next backend steps

Swap `js/api.js` → REST/Supabase; object storage for uploads (runtime cards currently persist as dataURLs); real vision verification; escrow; push notifications.
