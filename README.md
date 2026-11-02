# JollyTrip

A minimalist vacation budget and expense tracker. A sibling of BasKar.

**Live:** https://tktarun03.github.io/jollytrip/ (after GitHub Pages is turned on)

## What it does

- **Daily allowance**: "Safe to spend today", worked out from what's left of the budget divided by the days left. Flights and stays booked before the trip count toward the budget, not toward any single day.
- **Local and home currency**: log each spend in the local currency at an exchange rate you type in. Each spend keeps the rate it was logged at.
- **Split**: who paid, each person's share, and the fewest payments needed to settle up.
- **Photos**: a trip cover photo, plus up to 6 photos per spend (receipts, tickets, the view), with a full-screen viewer.
- **Avatars**: a colour or a photo for each traveler.
- **Several trips**, each with its own dates, budget, currencies and travelers.
- **Light theme by default**, with Dark and System options. Text size follows the device setting (Dynamic Type on iPhone), with Smaller and Larger options.

## Where data is saved

Everything stays in the browser on the device you use. Nothing is uploaded.

| What | Where |
|---|---|
| Trips and spends | Compressed into cookies (scoped to `/jollytrip/`), mirrored to `localStorage` |
| Photos | The browser's IndexedDB, shrunk to JPEG (1600 px; avatars 256 px) |
| Backup | Settings → Copy backup: one text blob with trips and photos, pasted into Restore on another device |

Notes:

- **iPhone:** Safari can clear site data after 7 days without a visit. Add JollyTrip to the Home Screen (Share → Add to Home Screen) and open it from there.
- **Opening the file directly** (a `file://` address): most browsers block cookies there, so the app falls back to `localStorage`.
- **Libraries:** `js-cookie` 3.0.5 and `lz-string` 1.5.0 (both MIT) are inlined, so saving works offline. Only the web font needs a connection.

## Hosting

It's a single file: `index.html`. To publish it on GitHub Pages, go to Settings → Pages → Deploy from a branch → `main` / root.
