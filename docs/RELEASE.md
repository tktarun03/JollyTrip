# Releasing a version

1. **Version:** in `src/b-data.js`, bump `APP_VERSION` and add an entry at the top of `CHANGELOG`. It's shown in the app and copied to `CHANGELOG.md` by the build.
2. **Build:** `python3 build.py`
3. **Test:** `npm test`. All tests must pass.
4. **Offline cache:** bump `VERSION` in `sw.js` only if you changed a cached file other than `index.html` (icons, manifest, or a pinned OCR library version).
5. **Commit and push to `main`.** GitHub Actions re-runs the build check and the tests, and GitHub Pages deploys within about a minute.
6. **Check the live app** at https://tktarun03.github.io/JollyTrip/. An "Updated to x.y" toast appears once.

## iPhone check (things the automated tests can't cover)

Use the Home Screen app, and check whichever of these the release touched:

- [ ] Face ID: More → Security → Turn on. Close the app, reopen it, and unlock with your face.
- [ ] Add to Apple Wallet: an attached airline `.pkpass` opens in Wallet. WalletWallet makes a pass with your key.
- [ ] Add to Calendar: the trip file shows "Add All", and the events have alerts.
- [ ] Save backup: Save to Files → iCloud Drive. Restore from backup picks the file.
- [ ] Receipt reading: on a spend photo, "Read the receipt" fills the amount and shop.
- [ ] Pinch and double-tap don't zoom.
- [ ] Idle lock after 5 minutes.
