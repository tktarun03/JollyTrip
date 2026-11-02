# JollyTrip

A minimalist planner and budget for family holidays. A sibling of BasKar.

**Live:** https://tktarun03.github.io/JollyTrip/

## What it does

**Plan**
- **Itinerary**: a card for each day of the trip, with times, places (opens in Maps), estimated costs and tick-boxes. Ideas you haven't put on a day yet sit in their own list. Any planned item with a cost can be logged as a spend in one tap.
- **Bookings**: flights, stays, car hire, trains and tickets, each with its confirmation code, total cost, deposits and the date the balance is due. Bookings show up on the right days of the itinerary, and Today reminds you a week before a balance is due.
- **Packing**: a family checklist grouped by Documents, Clothes, Toiletries, Health, Electronics, Kids and Other. Items can be assigned to one person, the essentials can be added in one tap, and everything can be unticked again for the trip home.
- **Notes**: hotel addresses, emergency numbers and anything else you want to keep.

**Spend**
- **Daily allowance**: "Safe to spend today". Bookings are set aside first. The rest of the budget is spread over the days left, so a cheap day raises tomorrow's allowance and an expensive one lowers it.
- **Local and home currency**: log in either one. Each spend keeps the exchange rate it was logged at.
- **Wallets**: cash, cards, bank accounts and travel cards, each in its own currency and with its own balance.
- **Bank SMS and CSV import**: paste card messages, or import a statement. JollyTrip works out the amount, currency, shop, date and card, skips duplicates, and you check everything before it's added.
- **Photos**: a trip cover, plus photos of receipts, tickets or the view on any spend or booking.
- **Family**: tag a spend for one person, see per-person costs, and give each traveller a colour or photo avatar.

**Keep on track**
- Streaks of days spent at or under that day's allowance, category limits with warnings, a trip fund for saving up before you go, and a nightly recap receipt with tomorrow's plan.
- Insights: how the trip is pacing against the budget, the biggest day-to-day spend, the split by category, planned versus actual spending, and the share paid in local currency.
- Share a trip summary to WhatsApp, or export every spend as a CSV.

**Make it yours**
- Several accounts on one device, each with an optional password, and several trips per account.
- Branding: app name, logo, accent colour, mascot ("Sunny") and the catchphrase for over-budget days.
- Light theme by default, with Dark and System options. Text size follows the device setting, with Smaller and Larger options. Amounts can be hidden, and the cheeky comments can be turned off.
- Works offline and installs to the home screen.

## Where data is saved

Everything stays in the browser on the device you use. Nothing is uploaded.

| What | Where |
|---|---|
| Accounts and trips | Compressed JSON split across cookies scoped to the app's folder, with a copy in `localStorage`. Large accounts move to `localStorage` only. |
| Passwords | Salted PBKDF2 hashes, kept on the device. They can't be reset. |
| Photos | The browser's IndexedDB, shrunk to JPEG (1600 px; avatars 256 px) |
| Backup | More → Copy backup puts trips and photos into one block of text. Paste it into Restore on another device. |

Trips from the first version of JollyTrip move into the first account you create.

Notes:

- **iPhone:** Safari can clear a website's data after 7 days without a visit. Add JollyTrip to the Home Screen (Share → Add to Home Screen) and use it only from there. The Home Screen app keeps its storage separate from Safari, so move any existing trips across with Copy backup → Restore.
- **Android / desktop Chrome:** use "Install app" in the browser menu.
- **Opening the file directly** (a `file://` address): most browsers block cookies there, so the app falls back to `localStorage`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app. It's built from separate source files, with `js-cookie` 3.0.5 and `lz-string` 1.5.0 (both MIT) inlined, so saving works offline. Only the web font needs a connection. |
| `manifest.webmanifest` | App name, icons and colours for installing |
| `sw.js` | The offline service worker. When online it fetches the page fresh; when offline it serves the cached copy. It never stores your trips. |
| `icons/` | App icons, including the maskable Android icon and the iPhone Home Screen icon |

Hosted on GitHub Pages from `main` / root. Bump `VERSION` in `sw.js` when you change cached files other than `index.html`.
