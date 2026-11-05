# JollyTrip

A minimalist planner and budget for family holidays. A sibling of BasKar.

**Live:** https://tktarun03.github.io/JollyTrip/

## What it does

**Plan**
- **Itinerary**: a card for each day of the trip, with times, places (opens in Maps), estimated costs and tick-boxes. Ideas you haven't put on a day yet sit in their own list. Any planned item with a cost can be logged as a spend in one tap.
- **Bookings**: flights, stays, car hire, trains and tickets, each with its confirmation code, total cost, deposits and the date the balance is due. Bookings show up on the right days of the itinerary, and Today reminds you a week before a balance is due.
- **Packing**: a family checklist grouped by Documents, Clothes, Toiletries, Health, Electronics, Kids and Other. Items can be assigned to one person, the essentials can be added in one tap, and everything can be unticked again for the trip home.
- **Notes**: hotel addresses, emergency numbers and anything else you want to keep.
- **Travel wallet**: every booking as a pass with its booking code as a QR code, dates, travellers and picture. It works offline. JollyTrip can't issue Apple or Google Wallet passes itself, because both need signing keys held on a server. It can add a `.pkpass` file the airline or hotel sent to Apple Wallet, and open their "Save to Google Wallet" link.
- **Add to Apple Wallet**: uses the airline's or hotel's own `.pkpass` if you attached one. Otherwise it makes a pass with [WalletWallet](https://www.walletwallet.dev/): one tap with your own free API key (1,000 passes a month, stored only on your device; the booking details are sent to WalletWallet), or with their free [web tool](https://walletwallet.alen.ro/), opened with the booking code copied.
- **Directions**: an arrow button on itinerary places, bookings and passes asks which app to use (Apple Maps, Google Maps or Waze), with Drive, Walk or Transit, and can remember your choice.
- **Add a wallet anywhere**: "+ Add a wallet…" in the spend, booking-deposit and CSV import forms creates a card or cash wallet and returns to the form with it selected.
- **Paste booking details**: paste the confirmation email text and the same reader fills in the booking.
- **Booking pictures**: the hotel photo inside a confirmation PDF, a photo you attach (one with almost no text is taken as a picture), or a drawn picture for each kind of booking.
- **Booking documents**: attach the confirmation as a PDF, photo or screenshot. JollyTrip reads the confirmation code, dates, time, provider and total, and fills in the empty fields for you to check. Digital PDFs are read with [pdf.js](https://mozilla.github.io/pdf.js/); photos and scanned PDFs use [Tesseract.js](https://tesseract.projectnaptha.com/) OCR. Both load from jsDelivr the first time they're needed (about 5 MB), and are then cached for offline use.

**Spend**
- **Daily allowance**: "Safe to spend today". Bookings are set aside first. The rest of the budget is spread over the days left, so a cheap day raises tomorrow's allowance and an expensive one lowers it.
- **Local and home currency**: log in either one. Each spend keeps the exchange rate it was logged at.
- **Wallets**: cash, cards, bank accounts and travel cards, each in its own currency and with its own balance.
- **Bank SMS and CSV import**: paste card messages, or import a statement. JollyTrip works out the amount, currency, shop, date and card, skips duplicates, and you check everything before it's added.
- **Photos**: a trip cover, plus photos of receipts, tickets or the view on any spend or booking. A spend's receipt photo can be read to fill in the amount and shop name.
- **Family**: tag a spend for one person, see per-person costs, and give each traveller a colour or photo avatar.

**Keep on track**
- Streaks of days spent at or under that day's allowance, category limits with warnings, a trip fund for saving up before you go, and a nightly recap receipt with tomorrow's plan.
- Insights: how the trip is pacing against the budget, the biggest day-to-day spend, the split by category, planned versus actual spending, and the share paid in local currency.
- Share a trip summary to WhatsApp, or export every spend as a CSV.

**Safety nets**
- **Version history**: versions of each account are saved on the device automatically while you make changes (at most every 20 minutes), before big changes such as deleting a trip or importing spends, and whenever you save one yourself. Restore any version in one tap. Restoring first saves your current state, so a rollback can itself be undone.
- **Undo** straight after deleting, importing or restoring.
- **App lock**: a 4- or 6-digit PIN, plus Face ID, Touch ID, fingerprint or Windows Hello through the browser's built-in passkey support (WebAuthn, platform authenticator, no server). It locks when the app opens, after a chosen time away, and after the same time idle (5 minutes by default). The lock keeps people out of the app; the stored data isn't encrypted.

**Make it yours**
- Several accounts on one device, each with an optional password, a profile picture and colour, and several trips per account.
- A refresh button, and a What's new screen (More) listing every version.
- Branding: app name, logo, accent colour, mascot ("Sunny") and the catchphrase for over-budget days.
- Light theme by default, with Dark and System options. Text size follows the device setting, with Smaller and Larger options. Amounts can be hidden, and the cheeky comments can be turned off. Pinch and double-tap zoom are disabled; use the text size setting instead.
- Works offline and installs to the home screen.

## Where data is saved

Everything stays in the browser on the device you use. Nothing is uploaded.

| What | Where |
|---|---|
| Accounts and trips | Compressed JSON split across cookies scoped to the app's folder, with a copy in `localStorage`. Large accounts move to `localStorage` only. |
| Passwords | Salted PBKDF2 hashes, kept on the device. They can't be reset. |
| Photos and PDFs | The browser's IndexedDB. Photos are shrunk to JPEG (receipts up to 2000 px, avatars 256 px); PDFs up to 12 MB are kept as they are. |
| Saved versions | IndexedDB on the device. They aren't included in backups. |
| PIN | A salted PBKDF2 hash in the account list. Face unlock stores only a passkey ID; the passkey itself stays in the device's secure hardware. |
| Backup | More → Copy backup puts trips and photos into one block of text. Paste it into Restore on another device. |

Trips from the first version of JollyTrip move into the first account you create.

Notes:

- **iPhone:** Safari can clear a website's data after 7 days without a visit. Add JollyTrip to the Home Screen (Share → Add to Home Screen) and use it only from there. The Home Screen app keeps its storage separate from Safari, so move any existing trips across with Copy backup → Restore.
- **Android / desktop Chrome:** use "Install app" in the browser menu.
- **Opening the file directly** (a `file://` address): most browsers block cookies there, so the app falls back to `localStorage`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app. It's built from separate source files, with `js-cookie` 3.0.5, `lz-string` 1.5.0 and `qrcode-generator` 1.4.4 (all MIT) inlined, so saving works offline. Only the web font needs a connection. |
| `manifest.webmanifest` | App name, icons and colours for installing |
| `sw.js` | The offline service worker. When online it fetches the page fresh; when offline it serves the cached copy. It also caches the pinned receipt-reader libraries. It never stores your trips. |
| `icons/` | App icons, including the maskable Android icon and the iPhone Home Screen icon |

Hosted on GitHub Pages from `main` / root. Bump `VERSION` in `sw.js` when you change cached files other than `index.html`.
