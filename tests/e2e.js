// End-to-end tests for JollyTrip. Run with `npm test` (needs `npx playwright install chromium` once).
// Each test opens the built index.html in a fresh phone-sized browser, so nothing carries over between tests.
'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIX = path.join(__dirname, 'fixtures');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg' };
let server, base, browser;

before(async () => {
  server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(ROOT, p === '/' ? 'index.html' : p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/index.html';
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); server?.close(); });

const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, ...opts });
  // Outside links (maps, WalletWallet, fonts) never leave the test machine.
  await ctx.route(/^https:\/\/(?!127\.0\.0\.1)/, (r) => r.fulfill({ status: 200, body: 'stub' }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base);
  await page.waitForSelector('#view');
  return { ctx, page, errors };
}
async function demo(page) { await page.click('[data-act="demo"]'); await page.waitForSelector('#nav [data-tab="today"]'); }
async function newAccountWithTrip(page) {
  await page.click('[data-act="create"]');
  await page.fill('#c-name', 'Asha');
  await page.click('#create-form button[type=submit]');
  await page.waitForSelector('#tr-name');
  await page.fill('#tr-name', 'Goa, with the kids');
  await page.fill('#tr-place', 'Goa');
  await page.fill('#tr-start', inDays(0));
  await page.fill('#tr-end', inDays(4));
  await page.fill('#tr-budget', '60000');
  await page.click('[data-act="tr-save"]');
  await page.waitForSelector('#nav [data-tab="plan"]');
}
async function addStay(page) {
  await page.click('[data-tab="plan"]');
  await page.click('[data-act="plan-seg"][data-seg="bookings"]');
  await page.click('[data-act="bk-add"]');
  await page.click('[data-act="bk-type"][data-k="stay"]');
  await page.fill('#bk-name', 'Taj Fort Aguada, Sinquerim');
  await page.fill('#bk-conf', 'TAJ55120');
  await page.fill('#bk-start', inDays(1)); await page.fill('#bk-time', '14:00');
  await page.fill('#bk-end', inDays(3)); await page.fill('#bk-etime', '11:00');
  await page.fill('#bk-total', '24000'); await page.fill('#bk-due', inDays(2));
  await page.fill('#bk-addr', 'Sinquerim, Candolim, Goa 403515');
  await page.click('[data-act="bk-save"]');
  await page.waitForSelector('[data-act="bk-edit"]');
}
const sheetTitle = (page) => page.innerText('.sheet-head h2');
const keypad = async (page, digits, scope = '.sheet') => { for (const k of digits) await page.click(`${scope} [data-act="kp"][data-k="${k}"]`); };

test('example trip opens on every tab without errors, and zoom is locked', async () => {
  const { ctx, page, errors } = await open();
  assert.match(await page.getAttribute('meta[name=viewport]', 'content'), /user-scalable=no/);
  await demo(page);
  for (const tab of ['today', 'plan', 'spends', 'insights', 'more']) {
    await page.click(`#nav [data-tab="${tab}"]`);
    assert.ok((await page.innerText('#view')).length > 50, tab + ' tab is empty');
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('sheet header stays put while the body scrolls', async () => {
  const { ctx, page, errors } = await open();
  await demo(page);
  await page.click('[data-tab="plan"]'); await page.click('[data-act="plan-seg"][data-seg="bookings"]');
  await page.click('[data-act="bk-edit"] >> nth=0');
  await page.waitForTimeout(600); // let the sheet finish sliding up
  const top = () => page.evaluate(() => document.querySelector('.sheet-head').getBoundingClientRect().top);
  const t1 = await top();
  await page.evaluate(() => { document.querySelector('.sheet-body').scrollTop = 600; });
  assert.ok(await page.evaluate(() => document.querySelector('.sheet-body').scrollTop) > 0, 'sheet body did not scroll');
  assert.equal(Math.round(await top()), Math.round(t1));
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('calendar export: valid .ics with the trip, booking times, balance due and alerts', async () => {
  const { ctx, page, errors } = await open();
  await newAccountWithTrip(page);
  await addStay(page);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="cal-trip"]')]);
  assert.match(dl.suggestedFilename(), /^goa-with-the-kids\.ics$/);
  const ics = fs.readFileSync(await dl.path(), 'utf8');
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(!/[^\r]\n/.test(ics), 'every line must end in CRLF');
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, 'line over 75 bytes: ' + line);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 4); // trip, check in, check out, balance due
  const day = (n) => inDays(n).replace(/-/g, '');
  assert.ok(ics.includes('DTSTART;VALUE=DATE:' + day(0)) && ics.includes('DTEND;VALUE=DATE:' + day(5)), 'trip spans all five days');
  assert.ok(ics.includes('SUMMARY:Check in: Taj Fort Aguada\\, Sinquerim'));
  assert.ok(ics.includes('DTSTART:' + day(1) + 'T140000') && ics.includes('DTSTART:' + day(3) + 'T110000'));
  assert.ok(ics.includes('LOCATION:Sinquerim\\, Candolim\\, Goa 403515'));
  assert.ok(ics.includes('TRIGGER:-PT60M'));
  assert.ok(/SUMMARY:Pay balance: Taj Fort Aguada/.test(ics));
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('backup: weekly reminder, save as a file, restore from that file, reject a wrong file', async () => {
  const { ctx, page, errors } = await open();
  await newAccountWithTrip(page);
  await page.click('[data-tab="today"]');
  assert.equal(await page.locator('.alert.warn [data-act="backup-file"]').count(), 0, 'no reminder before there is anything to lose');
  await addStay(page);
  await page.click('[data-tab="today"]');
  await page.click('.alert.warn [data-act="backup-file"]');
  await page.waitForSelector('[data-act="backup-share"]');
  assert.equal(await sheetTitle(page), 'Your backup is ready');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="backup-share"]')]);
  assert.match(dl.suggestedFilename(), /^jollytrip-backup-\d{4}-\d\d-\d\d\.json$/);
  const file = path.join(FIX, '..', '.tmp-backup.json');
  await dl.saveAs(file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(data.trips[0].bookings[0].conf, 'TAJ55120');
  assert.equal(await page.locator('.alert.warn [data-act="backup-file"]').count(), 0, 'reminder goes after a backup');

  // Delete the booking, then bring it back from the file.
  await page.click('[data-tab="plan"]'); await page.click('[data-act="plan-seg"][data-seg="bookings"]');
  await page.click('[data-act="bk-edit"] >> nth=0'); await page.click('[data-act="bk-del"]'); await page.click('[data-act="bk-del"]');
  assert.equal(await page.locator('[data-act="bk-edit"]').count(), 0);
  await page.click('[data-tab="more"]'); await page.click('[data-act="restore-open"]');
  await page.setInputFiles('[data-upload="restore-file"]', file);
  await page.waitForSelector('.sheet .notice');
  await page.click('[data-act="restore"]');
  await page.click('[data-tab="plan"]'); await page.click('[data-act="plan-seg"][data-seg="bookings"]');
  assert.equal(await page.locator('[data-act="bk-edit"]').count(), 1);

  // A JSON file that isn't a backup is refused.
  await page.click('[data-tab="more"]'); await page.click('[data-act="restore-open"]');
  await page.setInputFiles('[data-upload="restore-file"]', { name: 'other.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
  await page.waitForSelector('.sheet .notice');
  await page.click('[data-act="restore"]');
  assert.match(await page.innerText('.sheet .error'), /isn’t a JollyTrip backup/);
  await page.click('[data-act="close"]');

  // Eight days later the reminder is back, and Later hides it.
  await page.evaluate(() => { const real = Date.now; Date.now = () => real() + 8 * 86400000; });
  await page.click('[data-tab="today"]');
  assert.match(await page.innerText('.alert.warn'), /Last backup 8 days ago/);
  await page.click('[data-act="backup-snooze"]');
  assert.equal(await page.locator('[data-act="backup-snooze"]').count(), 0);
  fs.rmSync(file, { force: true });
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('PIN lock: wrong PIN refused, right PIN unlocks, reopening locks again', async () => {
  const { ctx, page, errors } = await open();
  await demo(page);
  await page.click('[data-tab="more"]'); await page.click('[data-act="pin-set"]');
  await keypad(page, '1234'); await page.waitForTimeout(400); await keypad(page, '1234');
  await page.waitForSelector('[data-act="lock-now"]');
  await page.click('[data-act="lock-now"] >> nth=0');
  await page.waitForSelector('.lock');
  for (const k of '9999') await page.keyboard.press(k);
  await page.waitForTimeout(700);
  assert.equal(await page.locator('.lock').count(), 1, 'wrong PIN must not unlock');
  for (const k of '1234') await page.keyboard.press(k);
  await page.waitForSelector('.lock', { state: 'detached' });
  await page.reload(); await page.waitForSelector('.lock');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('idle for more than 5 minutes locks the app', async () => {
  const { ctx, page, errors } = await open();
  await demo(page);
  await page.click('[data-tab="more"]'); await page.click('[data-act="pin-set"]');
  await keypad(page, '1234'); await page.waitForTimeout(400); await keypad(page, '1234');
  await page.waitForSelector('[data-act="lock-now"]');
  await page.evaluate(() => { const real = Date.now; Date.now = () => real() + 6 * 60000; });
  await page.waitForSelector('.lock', { timeout: 20000 });
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('undo brings back a deleted spend, and version history lists saved versions', async () => {
  const { ctx, page, errors } = await open();
  await demo(page);
  await page.click('[data-tab="spends"]');
  const count = () => page.locator('#spend-list .txn').count();
  const n = await count();
  await page.click('#spend-list .txn >> nth=0');
  await page.click('[data-act="sp-del"]'); await page.click('[data-act="sp-del"]');
  assert.equal(await count(), n - 1);
  await page.click('.toast-btn');
  assert.equal(await count(), n);
  await page.click('[data-tab="more"]'); await page.click('[data-act="history"]');
  await page.waitForSelector('[data-act="vh-restore"]');
  assert.ok(await page.locator('[data-act="vh-restore"]').count() >= 1);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('directions ask which map app, then open it', async () => {
  const { ctx, page, errors } = await open();
  await demo(page);
  await page.click('.dir-btn >> nth=0');
  await page.waitForSelector('[data-act="maps-go"][data-app="google"]');
  const [popup] = await Promise.all([ctx.waitForEvent('page'), page.click('[data-act="maps-go"][data-app="google"]')]);
  assert.match(popup.url(), /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('an attached .pkpass is offered first in Add to Apple Wallet', async () => {
  const { ctx, page, errors } = await open();
  await demo(page);
  await page.click('[data-tab="plan"]'); await page.click('[data-act="plan-seg"][data-seg="bookings"]');
  await page.click('[data-act="bk-edit"] >> nth=0');
  await page.setInputFiles('.thumb-add [data-upload="bk-docs"]', path.join(FIX, 'boarding.pkpass'));
  await page.waitForSelector('.doc [data-act="pkpass-add"]');
  await page.click('.card [data-act="apple-pass"]');
  await page.waitForSelector('.sheet-body [data-act="pkpass-add"]');
  assert.match(await page.innerText('.sheet-body'), /The pass you attached/);
  await page.click('[data-act="close"]'); // back to the booking
  assert.equal(await sheetTitle(page), 'Booking');
  assert.deepEqual(errors, []);
  await ctx.close();
});
