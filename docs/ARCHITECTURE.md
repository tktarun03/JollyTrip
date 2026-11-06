# Architecture

## Shape

```
src/*.js, style.css, head.html, body.html
        │  python3 build.py (concatenates inside one IIFE, inlines libraries)
        ▼
index.html  ──served by──▶  GitHub Pages  ──cached by──▶  sw.js (offline)
        │
        └─ data stays in the browser: cookies + localStorage (JSON), IndexedDB (photos, versions)
```

There's no server, account system or sync. "Accounts" are local profiles on one device. A file backup moves data between devices.

**Why one file and plain JavaScript?** The app installs to the Home Screen, works offline, and stays a few hundred KB with no dependency updates to chase. The cost: the source files are long, and the code relies on conventions rather than types. `docs/CODEMAP.md` and the tests make up for that.

## Source files (load order)

| File | Owns |
|---|---|
| `a-core.js` | `APP` identity, date and number helpers, `Store` (storage), `Photos` (IndexedDB), image shrinking, currencies and `money()` |
| `b-data.js` | Catalogs (categories `CATS`, plan kinds `PLK`, booking types `BKT`, wallet types, packing), icons, branding `BR`, `APP_VERSION` and `CHANGELOG`, state `S`, `migrate()`, `save()`, version history, the example trip, budget maths `calc()`, bank SMS and CSV parsing |
| `c-views.js` | Sign-in screens and the five tabs: Today, Plan, Spends, Insights, More |
| `d-sheets.js` | Bottom sheets and the `SHEETS` registry |
| `e-events.js` | `renderView` / `renderSheet` / `openSheet` / `closeSheet`, `toast`, the core `ACT` table, input / change / submit listeners, uploads |
| `f-extra.js` | App lock (PIN, WebAuthn Face ID), profile, OCR (pdf.js, Tesseract.js), booking autofill |
| `g-wallet.js` | Travel wallet passes, `.pkpass` hand-off, "+ Add a wallet…" from forms |
| `h-maps.js` | Directions chooser, WalletWallet Apple Wallet passes |
| `i-backup-cal.js` | Backup files and the reminder, calendar `.ics` export |
| `z-start.js` | Boot: zoom lock, storage init, session, idle lock, service worker |

## Data model

One **profile** per local account, saved under `jt_p_<id>`:

```
profile { v: 2, home: 'QAR', active: tripId, createdAt, savedAt, demo?,
          settings { theme, ts, hide, roast, lastBackup, backupSnooze, mapApp, wwKey },
          trips: [trip] }

trip { id, name, place, start, end (YYYY-MM-DD), home, local, rate, budget, cover (photo id),
       people:   [{ id, name, color, photo }],
       wallets:  [{ id, name, type: card|cash|bank|wallet, cur, opening }],
       expenses: [{ id, date, time, amt, cur, rate, cat, note, who, wallet, bookingId, photos[] }],
       plan:     [{ id, day ('' = idea), time, title, kind, place, notes, cost, cur, done }],
       bookings: [{ id, type, name, provider, conf, start, time, end, endTime, total, cur, due,
                    notes, address, photos[], files[{ id, name, mime, size }], cover, gwallet }],
       packing:  [{ id, text, group, who, done }],
       notes, fund { target, entries[] }, caps [{ cat, amount }] }
```

`migrateTrip()` is the schema: it fills every missing field with a default, so old saves always load. Photo, PDF and pass blobs live in IndexedDB under the ids above, never inside the JSON.

## Storage

| Key / store | Holds |
|---|---|
| `jt_idx` | Account list: id, name, colour, photo, password hash, PIN hash, Face ID passkey id, lock timing |
| `jt_p_<id>` | One profile (above) |
| `jt_sess`, `jt_brand`, `jt_ver` | Signed-in account, branding, last app version seen |
| IndexedDB `jollytrip` → `photos` | Blobs by id |
| IndexedDB `jollytrip` → `versions` | History snapshots by profile |

`Store` compresses the JSON with lz-string and splits it across cookies of 3600 characters each, scoped to the app's folder, with a copy in `localStorage`. A profile too big for 30 cookies lives only in `localStorage`. `gc()` deletes blobs that nothing references any more, checking profiles, versions, undo and open drafts.

## Rendering and events

- Views and sheets are functions that return HTML strings, with every value passed through `esc()`. After changing `S`, call `renderView()`, `renderSheet()` or `renderAll()`.
- One delegated click listener: `[data-act]` → `ACT[name](el, e)`.
- One input listener: `[data-f="a.b"]` inside a sheet writes to `S.sheet.d.a.b` without re-rendering, so focus isn't lost.
- `sheetHead()` ends with `<!--/head-->`. `renderSheet()` splits there into a fixed `.sheet-top` and a scrolling `.sheet-body`.
- Sheets can stack: pass `back: S.sheet` when opening, and `closeSheet()` returns to it.
- `toast(title, body, action)` slides up from the bottom. `UNDO` is the standard undo action.

## Safety nets

- **Version history:** `autoVersion()` (at most every 20 minutes), `checkpoint(label)` before big changes, and manual snapshots. Pruned to 40 automatic, 25 "before" and 60 manual.
- **Lock:** PIN (PBKDF2, 5 tries then a 30-second wait), WebAuthn platform passkey for Face ID. It locks on open, after time away, and after idle time. It's a privacy lock only: data isn't encrypted.
- **Backups:** one JSON file with photos as data URLs. Today reminds after 7 days.

## Reusing this app for something else

The shell is reusable: storage, lock, versions, backups, sheets, toasts, tabs and the offline setup. To start a new app from it:

1. Copy the repo.
2. Change `APP` in `src/a-core.js` (`id` and the storage `key` prefix), so data never mixes with JollyTrip's on the same `github.io` address. Also change the cache prefix in `sw.js`.
3. Change `BR_DEF` (name, colours, mascot) in `src/b-data.js`, the `<meta>` text in `build.py`, `manifest.webmanifest` and `icons/`.
4. Replace the domain parts: catalogs and `calc()` in `b-data.js`, the tabs in `c-views.js`, and the sheets in `d-sheets.js`.

Pulling the shared shell into its own package that both BasKar and JollyTrip use is on the roadmap. It isn't done yet.

## Limits to know

- One device per account; no sync. Backups are manual files.
- iPhone Safari may clear site data after 7 days without a visit. The Home Screen app is safer, and backups are the real protection.
- Apple Wallet passes need a signing server (WalletWallet) or the provider's own `.pkpass`.
- The OCR libraries (about 5 MB) download the first time they're used.
