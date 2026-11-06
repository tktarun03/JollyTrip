# Roadmap

Last reviewed: 6 November 2026 (version 3.7).

Size: **S** is under an hour of work, **M** is a session, **L** is several sessions. Each item has an ID, so a request can just say "do R3".

## How to ask for work (and keep it cheap)

- **One roadmap item per chat**, named by its ID: "Do R2 from ROADMAP.md". A fresh chat that reads `CLAUDE.md` and `docs/CODEMAP.md` costs far less than a long chat carrying everything that came before.
- **Say what "done" looks like**, for example "works on my iPhone from the Home Screen".
- **Bugs:** send a screenshot and the steps to reproduce. That's quicker than describing it.
- When an item is done, it moves to `CHANGELOG.md` and leaves this file.

## Now: next release (3.8)

| ID | Item | Size | Why |
|---|---|---|---|
| R1 | Confirm 3.7 on iPhone (`docs/RELEASE.md` checklist). If Calendar doesn't show "Add All", hand the `.ics` to the share sheet instead. | S | Calendar hand-off from a home-screen web app is unverified. |
| R2 | Ask the browser to keep data (`navigator.storage.persist()`), and show the result in More → Storage. | S | Lowers the chance of iPhone Safari clearing trips. |
| R3 | Fast unit tests for the money maths (`calc()`, allowance, booking state, SMS and CSV parsers), run in Node without a browser. | M | The budget is the core promise, and these tests run in seconds. |

## Next

| ID | Item | Size | Notes |
|---|---|---|---|
| R4 | Split the three largest files (`b-data.js`, `e-events.js`, `f-extra.js`, about 60 KB each) by feature: catalogs, budget maths, parsers, lock, OCR. | M | Smaller files make each change cheaper to read. No behaviour change, and the tests guard it. |
| R5 | Encrypt saved data with the PIN (AES-GCM through Web Crypto). | M | Today the lock only hides the app. Forgetting the PIN would mean restoring from a backup. |
| R6 | Duplicate a trip, or start one from a template (packing list, wallets, people). | S | For families who repeat similar trips. |
| R7 | Trips through more than two currencies, such as a multi-country route. | M | The data model has one local currency per trip, so this needs a migration. |

## Later (needs a decision first)

| ID | Item | Size | Decision needed |
|---|---|---|---|
| R8 | Shared core for BasKar and JollyTrip (storage, lock, versions, backups, sheets, toasts) as one source both apps build from. | L | Worth it only if both apps keep growing. Until then, `docs/ARCHITECTURE.md` → "Reusing this app" covers starting a new app. |
| R9 | Family sync between phones. | L | Needs either a server (which breaks the "nothing uploaded" promise) or a shared file in iCloud Drive or Google Drive with conflict handling. |
| R10 | Weather and opening hours on itinerary days. | M | Needs an outside API, and that service would see your trip's places. |

## Known limits (by design, for now)

- No sync: one device per account. Backups are files.
- Apple Wallet passes need WalletWallet or the provider's own `.pkpass`.
- Receipt reading downloads about 5 MB the first time and is slow on older phones.
