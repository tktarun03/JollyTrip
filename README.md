# JollyTrip

A minimalist vacation budget and expense tracker. A sibling of BasKar.

**Live:** https://tktarun03.github.io/JollyTrip/

## What it does

- **Daily allowance**: "Safe to spend today", worked out from what's left of the budget divided by the days left. Flights and stays booked before the trip count toward the budget, not toward any single day.
- **Local and home currency**: log each spend in the local currency at an exchange rate you type in. Each spend keeps the rate it was logged at.
- **Split**: who paid, each person's share, and the fewest payments needed to settle up.
- **Photos**: a trip cover photo, plus up to 6 photos per spend (receipts, tickets, the view), with a full-screen viewer.
- **Avatars**: a colour or a photo for each traveler.
- **Share summary**: one tap to send totals, categories and who pays whom to WhatsApp or any app (copied to the clipboard on desktop).
- **Export CSV**: every spend with its date, currency, rate, home amount, payer and sharers. Opens in Excel, Numbers or Google Sheets.
- **Works offline and installs like an app**: after one visit online, it opens with no connection.
- **Several trips**, each with its own dates, budget, currencies and travelers.
- **Light theme by default**, with Dark and System options. Text size follows the device setting (Dynamic Type on iPhone), with Smaller and Larger options.

## Where data is saved

Everything stays in the browser on the device you use. Nothing is uploaded.

| What | Where |
|---|---|
| Trips and spends | Compressed into cookies (scoped to the app's folder), mirrored to `localStorage` |
| Photos | The browser's IndexedDB, shrunk to JPEG (1600 px; avatars 256 px) |
| Backup | Settings → Copy backup: one text blob with trips and photos, pasted into Restore on another device |

Notes:

- **iPhone:** add JollyTrip to the Home Screen (Share → Add to Home Screen) and use it only from that icon. Safari can clear a website's data after 7 days without a visit; the Home Screen app avoids that. The Home Screen app keeps its own storage, separate from Safari, so trips entered in Safari won't appear there. Move them with Copy backup → Restore.
- **Android / desktop Chrome:** use "Install app" in the browser menu.
- **Opening the file directly** (a `file://` address): most browsers block cookies there, so the app falls back to `localStorage`.
- **Libraries:** `js-cookie` 3.0.5 and `lz-string` 1.5.0 (both MIT) are inlined, so saving works offline. Only the web font needs a connection.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app |
| `manifest.webmanifest` | App name, icons and colours for installing |
| `sw.js` | Service worker. Online it fetches the page fresh, so updates arrive; offline it serves the cached copy. It never stores your trips. |
| `icons/` | App icons, including the maskable Android icon and the iPhone Home Screen icon |

Hosted on GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root. When you change any cached file other than `index.html`, bump `VERSION` in `sw.js` so phones pick up the new files.
