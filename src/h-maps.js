  /* =========================================================
     Directions: ask which map app to open (Apple Maps, Google Maps, Waze), or use the saved choice
     ========================================================= */
  var MAP_APPS = {
    apple: { label: 'Apple Maps', url: function (q, m) { return 'https://maps.apple.com/?daddr=' + encodeURIComponent(q) + '&dirflg=' + ({ drive: 'd', walk: 'w', transit: 'r' }[m] || 'd'); } },
    google: { label: 'Google Maps', url: function (q, m) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q) + '&travelmode=' + ({ drive: 'driving', walk: 'walking', transit: 'transit' }[m] || 'driving'); } },
    waze: { label: 'Waze', drive: true, url: function (q) { return 'https://waze.com/ul?q=' + encodeURIComponent(q) + '&navigate=yes'; } }
  };
  function placeQuery(t, place) { place = String(place || '').trim(); if (!place) return ''; return t && t.place && place.toLowerCase().indexOf(t.place.toLowerCase()) < 0 ? place + ', ' + t.place : place; }
  function bookingQuery(t, b) { if (b.type === 'flight' && !b.address) return ''; return placeQuery(t, b.address || b.name); }
  function dirBtn(q, small) { return q ? '<button type="button" class="' + (small ? 'icon-btn sm dir-btn' : 'btn quiet sm') + '" data-act="maps" data-q="' + esc(q) + '" aria-label="Directions to ' + esc(q) + '">' + ic('nav', small ? 15 : 16) + (small ? '' : ' Directions') + '</button>' : ''; }
  function openLink(url) { var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }
  function sheetMaps(sh) {
    var mode = sh.mode || 'drive';
    return sheetHead('Directions') + '<p class="hint">To <strong style="color:var(--ink)">' + esc(sh.q) + '</strong></p>' +
      '<div class="seg" role="group" aria-label="How you’re travelling">' + [['drive', 'Drive'], ['walk', 'Walk'], ['transit', 'Transit']].map(function (o) { return '<button type="button" data-act="maps-mode" data-v="' + o[0] + '" aria-pressed="' + (mode === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="stack" style="gap:8px">' + Object.keys(MAP_APPS).map(function (k) {
        var A = MAP_APPS[k], off = A.drive && mode !== 'drive';
        return '<button type="button" class="ready" data-act="maps-go" data-app="' + k + '"' + (off ? ' disabled style="opacity:.45"' : '') + '><span class="tile" style="--c:var(--accent)">' + ic(k === 'waze' ? 'car' : 'map', 18) + '</span><span class="grow"><strong>' + esc(A.label) + '</strong><span class="hint">' + (off ? 'Driving only' : k === 'apple' ? 'Built into iPhone, iPad and Mac' : k === 'google' ? 'Opens the app if it’s installed, otherwise the website' : 'Opens the Waze app if it’s installed') + '</span></span>' + ic('chev', 18) + '</button>';
      }).join('') + '</div>' +
      '<label class="row" style="gap:10px;cursor:pointer"><input type="checkbox" id="maps-remember"' + (sh.remember ? ' checked' : '') + ' data-mapsremember="1" style="width:18px;height:18px;accent-color:var(--ink)"><span class="hint" style="color:var(--ink-2)">Always use this app. You can change it in More → Maps and wallet.</span></label>';
  }

  /* =========================================================
     Apple Wallet passes through WalletWallet (free tool, or the free API with your own key)
     ========================================================= */
  var WW_TOOL = 'https://walletwallet.alen.ro/', WW_API = 'https://api.walletwallet.dev/api/pkpass';
  function passFields(t, b) {
    var T = BKT[b.type] || BKT.other, d1 = fmtD(b.start, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + (b.time ? ' ' + fmtHM(b.time) : '');
    var sec = [{ label: T.a || 'Date', value: d1 }];
    if (T.hasEnd && b.end) sec.push({ label: T.b || 'Ends', value: fmtD(b.end, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + (b.endTime ? ' ' + fmtHM(b.endTime) : '') });
    var back = [];
    if (b.provider) back.push({ label: 'Provider', value: b.provider });
    if (b.address) back.push({ label: 'Address', value: b.address });
    if (t.people.length) back.push({ label: 'Travellers', value: t.people.map(function (p) { return p.name; }).join(', ') });
    if (b.notes) back.push({ label: 'Notes', value: b.notes.slice(0, 500) });
    back.push({ label: 'Trip', value: t.name + ' · ' + range(t) });
    var colors = { flight: 'blue', stay: 'orange', car: 'green', train: 'blue', tour: 'purple', other: 'dark' };
    var body = { logoText: BR.name, description: T.label + ': ' + b.name, colorPreset: colors[b.type] || 'dark', headerFields: b.conf ? [{ label: 'CODE', value: b.conf }] : [], primaryFields: [{ label: T.label.toUpperCase(), value: b.name.slice(0, 60) }], secondaryFields: sec, backFields: back };
    if (b.conf) { body.barcodeValue = b.conf; body.barcodeFormat = 'QR'; }
    return body;
  }
  function wwSummary(t, b) {
    var f = passFields(t, b);
    return [b.name, f.secondaryFields.map(function (x) { return x.label + ': ' + x.value; }).join(' · '), b.conf ? 'Code: ' + b.conf : ''].filter(Boolean).join('\n');
  }
  function sheetApplePass(sh) {
    var t = trip(), b = bookingById(t, sh.id); if (!b) return sheetHead('Add to Apple Wallet') + '<p class="hint">This booking is gone.</p>';
    var key = S.p.settings.wwKey || '', pk = bookingPkpass(b);
    return sheetHead('Add to Apple Wallet') +
      (pk ? '<section class="card"><strong>The pass you attached</strong><p class="hint">' + esc(pk.name) + '. Passes from the airline or hotel are the ones their staff can scan.</p><button type="button" class="btn" data-act="pkpass-add" data-id="' + esc(pk.id) + '">' + ic('wallet', 18) + ' Add this pass</button></section>' : '') +
      '<section class="card"><div class="row between"><strong>One tap, with WalletWallet</strong><span class="pill ' + (key ? 'good' : 'info') + '">' + (key ? 'Key saved' : 'Needs a free key') + '</span></div>' +
      '<p class="hint">Makes a pass from this booking: name, dates, travellers and a QR code of ' + (b.conf ? 'code ' + esc(b.conf) : 'the booking code (add one first for a QR code)') + '. WalletWallet’s free plan covers 1,000 passes a month. The booking details are sent to WalletWallet to sign the pass.</p>' +
      (key ? '<button type="button" class="btn" data-act="ww-make" data-id="' + esc(b.id) + '"' + (sh.busy ? ' disabled' : '') + '>' + ic('wallet', 18) + (sh.busy ? ' Making your pass…' : ' Make and add the pass') + '</button>'
        : '<div class="field"><label for="ww-key">Your WalletWallet API key</label><input id="ww-key" class="input" data-f="key" autocomplete="off" spellcheck="false" placeholder="ww_live_…" value="' + esc(sh.d.key) + '"><span class="hint">Get one free at <a class="link" href="https://www.walletwallet.dev/" target="_blank" rel="noopener">walletwallet.dev</a>. It’s stored only on this device.</span></div><button type="button" class="btn" data-act="ww-key-save">Save key and make the pass</button>') +
      '</section>' +
      '<section class="card"><strong>Free, no account: WalletWallet web tool</strong><p class="hint">Opens WalletWallet in a new tab with this booking’s details copied. Paste them in, then download the pass and tap Add. Nothing is sent until you do.</p><button type="button" class="btn quiet" data-act="ww-tool" data-id="' + esc(b.id) + '">' + ic('open', 16) + ' Copy details and open WalletWallet</button></section>' +
      errLine(sh) + '<p class="hint">WalletWallet is a third-party service, not part of ' + esc(BR.name) + '. Passes it makes are handy copies, not the airline’s or hotel’s official ticket.</p>';
  }
  function b64ToBlob(b64, type) { var bin = atob(String(b64).replace(/\s/g, '')), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: type }); }
  function makeWalletPass(b) {
    var t = trip(), sh = S.sheet, key = S.p.settings.wwKey;
    sh.busy = true; sh.err = ''; renderSheet();
    fetch(WW_API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key }, body: JSON.stringify(passFields(t, b)) })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) throw new Error('key');
        if (r.status === 429) throw new Error('limit');
        if (!r.ok) throw new Error('http ' + r.status);
        var ct = r.headers.get('Content-Type') || '';
        if (/json/i.test(ct)) return r.json().then(function (j) { if (!j || !j.applePass) throw new Error('nopass'); return b64ToBlob(j.applePass, 'application/vnd.apple.pkpass'); });
        return r.blob().then(function (bl) { return new Blob([bl], { type: 'application/vnd.apple.pkpass' }); });
      })
      .then(function (blob) {
        var id = 'doc_' + uid();
        return Photos.put(id, blob).then(function () {
          b.files = (b.files || []).filter(function (f) { return !(isPkpass(f) && f.made); });
          b.files.push({ id: id, name: slug(b.name) + '.pkpass', size: blob.size, mime: 'application/vnd.apple.pkpass', made: true });
          save(); if (S.sheet === sh) { sh.busy = false; renderSheet(); }
          addPkpass(id);
        });
      })
      .catch(function (e) {
        if (S.sheet !== sh) return;
        sh.busy = false;
        var m = String(e && e.message || '');
        sh.err = m === 'key' ? 'WalletWallet didn’t accept the key. Remove it in More → Maps and wallet and try again.' : m === 'limit' ? 'You’ve used this month’s free passes. Use the free web tool below instead.' : (IS_TOP ? 'Couldn’t reach WalletWallet. Check your connection, or use the free web tool below.' : 'This preview blocks outside services. Open ' + BR.name + ' from its own web address, or use the free web tool below.');
        renderSheet();
      });
  }

  Object.assign(SHEETS, { maps: sheetMaps, applepass: sheetApplePass });
  Object.assign(ACT, {
    maps: function (el) {
      var q = el.dataset.q; if (!q) return;
      var app = S.p && S.p.settings.mapApp;
      if (app && MAP_APPS[app]) { openLink(MAP_APPS[app].url(q, 'drive')); return; }
      var back = S.sheet && S.sheet.type !== 'maps' ? S.sheet : null;
      openSheet({ type: 'maps', q: q, mode: 'drive', remember: false, back: back });
    },
    'maps-mode': function (el) { S.sheet.mode = el.dataset.v; renderSheet(); },
    'maps-go': function (el) {
      var sh = S.sheet, A = MAP_APPS[el.dataset.app]; if (!A) return;
      if (sh.remember) { S.p.settings.mapApp = el.dataset.app; save(); }
      openLink(A.url(sh.q, sh.mode));
      closeSheet();
      if (sh.remember) toast('Directions open in ' + A.label, 'Change it in More → Maps and wallet.');
    },
    'apple-pass': function (el) { var back = S.sheet && S.sheet.type !== 'applepass' ? S.sheet : null; S.pass = null; renderPass(); openSheet({ type: 'applepass', id: el.dataset.id, d: { key: '' }, back: back }); },
    'ww-key-save': function () {
      var sh = S.sheet, k = String(sh.d.key || '').trim();
      if (!/^ww_(live|test)_[A-Za-z0-9]{8,}$/.test(k)) { sheetErr('That doesn’t look like a WalletWallet key. It starts with ww_live_.'); return; }
      S.p.settings.wwKey = k; save(); sh.err = '';
      var b = bookingById(trip(), sh.id); if (b) makeWalletPass(b); else renderSheet();
    },
    'ww-make': function (el) { var b = bookingById(trip(), el.dataset.id); if (b) makeWalletPass(b); },
    'ww-tool': function (el) {
      var t = trip(), b = bookingById(t, el.dataset.id); if (!b) return;
      var txt = wwSummary(t, b);
      try { navigator.clipboard.writeText(b.conf || txt).catch(function () { }); } catch (e) { }
      openLink(WW_TOOL);
      toast('Opened WalletWallet', b.conf ? 'Code ' + b.conf + ' is copied. Use it as the barcode, and the booking name as the title.' : 'Details copied. Add a booking code for a scannable pass.');
    },
    'ww-key-clear': function () { delete S.p.settings.wwKey; save(); renderView(); toast('Key removed'); }
  });
