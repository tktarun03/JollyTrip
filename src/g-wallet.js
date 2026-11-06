  /* =========================================================
     Travel wallet: bookings shown as passes, plus Apple / Google Wallet hand-off
     JollyTrip can't issue Apple or Google Wallet passes itself (both need signing keys on a server).
     It can show its own offline pass, open a .pkpass the airline or hotel sent, and open a Google Wallet save link.
     ========================================================= */
  function isPkpass(f) { return !!f && (/vnd\.apple\.pkpass/i.test(f.mime || f.type || '') || /\.pkpass$/i.test(f.name || '')); }
  function bookingPkpass(b) { return (b.files || []).filter(isPkpass)[0] || null; }
  function qrSvg(text) {
    try { if (!window.qrcode || !text) return ''; var q = qrcode(0, 'M'); q.addData(String(text)); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { return ''; }
  }
  function walletCard(sh) {
    var d = sh.d, t = trip(), pk = (d.files || []).filter(isPkpass)[0], gw = /^https:\/\//i.test(String(d.gwallet || '').trim());
    return '<section class="card" style="gap:10px"><div class="row between"><span class="label">Wallet</span>' + ic('wallet', 18) + '</div>' +
      '<p class="hint">Show this booking as a pass, even offline, with its code as a QR code. Add the airline’s or hotel’s own pass to Apple or Google Wallet if they sent one.</p>' +
      '<div class="row wrap">' + (d.id ? '<button type="button" class="btn sm" data-act="pass-open" data-id="' + esc(d.id) + '">' + ic('wallet', 16) + ' Show pass</button>' : '<span class="hint">Save the booking to show its pass.</span>') +
      (d.id ? '<button type="button" class="btn quiet sm" data-act="apple-pass" data-id="' + esc(d.id) + '">' + ic('wallet', 16) + ' Add to Apple Wallet</button><button type="button" class="btn quiet sm" data-act="cal-booking" data-id="' + esc(d.id) + '">' + ic('calendar', 16) + ' Add to Calendar</button>' : '') +
      (gw ? '<a class="btn quiet sm" href="' + esc(String(d.gwallet).trim()) + '" target="_blank" rel="noopener">' + ic('open', 16) + ' Save to Google Wallet</a>' : '') + '</div>' +
      '<div class="field"><label for="bk-gw">Google Wallet link <span class="muted">(optional)</span></label><input id="bk-gw" class="input" data-f="gwallet" type="url" inputmode="url" placeholder="https://pay.google.com/gp/v/save/…" value="' + esc(d.gwallet || '') + '"><span class="hint">Copy the “Save to Google Wallet” link from your confirmation email.</span></div>' +
      '<p class="hint">Add to Apple Wallet uses the pass the airline or hotel sent if you attached one (a .pkpass file). Otherwise it makes one with the free WalletWallet service.</p></section>';
  }
  function passOrder(t) { return t.bookings.slice().sort(function (a, b) { return (a.start + (a.time || '')) < (b.start + (b.time || '')) ? -1 : 1; }); }
  function renderPass() {
    var root = $('#pass-root'); if (!root) return;
    var t = trip();
    if (!S.pass || !t || S.locked) { root.innerHTML = ''; return; }
    var list = passOrder(t); if (!list.length) { S.pass = null; root.innerHTML = ''; return; }
    var i = Math.max(0, Math.min(S.pass.i, list.length - 1)); S.pass.i = i;
    var b = list[i], T = BKT[b.type] || BKT.other, st = bookingState(t, b), pk = bookingPkpass(b), gw = /^https:\/\//i.test(b.gwallet || '');
    var when = function (ds, tm) { return '<strong>' + esc(fmtD(ds, { weekday: 'short', day: 'numeric', month: 'short' })) + '</strong><span class="hint">' + esc(tm ? fmtHM(tm) : fmtD(ds, { year: 'numeric' })) + '</span>'; };
    var qr = qrSvg(b.conf);
    var pill = st.st === 'none' ? '<span class="pill info">No total yet</span>' : st.st === 'paid' ? '<span class="pill good">Paid</span>' : '<span class="pill warn">' + esc(money(st.left, t.home)) + ' to pay</span>';
    root.innerHTML = '<div class="pass-wrap" data-act="pass-scrim" role="dialog" aria-modal="true" aria-label="Travel wallet">' +
      '<div class="pass-top"><span class="pass-count">Travel wallet · ' + (i + 1) + ' of ' + list.length + '</span><button type="button" class="lb-btn" data-act="pass-close" aria-label="Close travel wallet" style="position:static">' + ic('x', 18) + '</button></div>' +
      '<article class="pass"><div class="pass-art">' + (b.cover ? photoImg(b.cover, b.name) : bookingArt(b.type)) + '</div>' +
      '<div class="pass-body"><div class="row between"><span class="eyebrow">' + esc(T.label + (b.provider ? ' · ' + b.provider : '')) + '</span>' + pill + '</div>' +
      '<h2 class="h2">' + esc(b.name) + '</h2>' +
      '<div class="pass-grid"><div class="stack-xs"><span class="eyebrow">' + esc(T.a || 'Date') + '</span>' + when(b.start, b.time) + '</div>' +
      (T.hasEnd && b.end ? '<div class="stack-xs"><span class="eyebrow">' + esc(T.b || 'Ends') + '</span>' + when(b.end, b.endTime) + '</div>' : '<div></div>') + '</div>' +
      '<div class="pass-code">' + (qr ? '<div class="qr" role="img" aria-label="QR code of booking code ' + esc(b.conf) + '">' + qr + '</div>' : '') +
      '<div class="stack-xs"><span class="eyebrow">Booking code</span>' + (b.conf ? '<span class="conf big">' + esc(b.conf) + '</span><button type="button" class="link" data-act="pass-copy" data-v="' + esc(b.conf) + '" style="align-self:flex-start">' + ic('copy', 14) + ' Copy</button>' : '<span class="hint">None yet. Add it to the booking to show a QR code.</span>') + '</div></div>' +
      (t.people.length ? '<div class="row" style="gap:8px"><span class="av-stack">' + t.people.slice(0, 6).map(function (p) { return avatar(p, 26); }).join('') + '</span><span class="hint">' + esc(t.people.map(function (p) { return p.name; }).join(', ')) + '</span></div>' : '') +
      (b.notes ? '<p class="hint pass-notes">' + esc(b.notes.split('\n')[0].slice(0, 140)) + '</p>' : '') +
      '<div class="row wrap"><button type="button" class="btn sm" data-act="apple-pass" data-id="' + esc(b.id) + '">' + ic('wallet', 16) + ' Add to Apple Wallet</button><button type="button" class="btn quiet sm" data-act="cal-booking" data-id="' + esc(b.id) + '">' + ic('calendar', 16) + ' Calendar</button>' + dirBtn(bookingQuery(t, b)) +
      (gw ? '<a class="btn sm" href="' + esc(b.gwallet) + '" target="_blank" rel="noopener">' + ic('open', 16) + ' Save to Google Wallet</a>' : '') +
      '<button type="button" class="btn ghost sm" data-act="pass-edit" data-id="' + esc(b.id) + '">' + ic('edit', 16) + ' Booking details</button></div></div></article>' +
      (list.length > 1 ? '<div class="pass-nav"><button type="button" class="lb-btn" data-act="pass-step" data-d="-1" aria-label="Previous booking" style="position:static">' + ic('left', 20) + '</button><button type="button" class="lb-btn" data-act="pass-step" data-d="1" aria-label="Next booking" style="position:static">' + ic('right', 20) + '</button></div>' : '') +
      '<p class="pass-note">A handy pass with your booking code. It isn’t an official ticket, so keep the airline’s or hotel’s own pass too. Turn your screen brightness up when showing a QR code.</p></div>';
    hydrate(root);
  }
  function addPkpass(id) {
    Photos.get(id).then(function (b) {
      if (!b) { toast('Pass not found on this device'); return; }
      var blob = new Blob([b], { type: 'application/vnd.apple.pkpass' }), u = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = u; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
      toast('Opening the pass', /iPhone|iPad|Macintosh/.test(navigator.userAgent) ? 'Tap Add to put it in Apple Wallet.' : 'Apple Wallet passes open on iPhone, iPad and Mac. On other devices, use the Google Wallet link or the travel wallet.');
    });
  }
  /* Opens the wallet editor from a form, and comes back to that form with the new wallet chosen. */
  function openWalletFrom(key) {
    var back = S.sheet, t = trip(); if (!back || !t) return;
    var cur = (back.d && back.d.cur) || back.cur || t.local;
    openSheet({ type: 'wallet', d: { id: null, name: '', type: cur === t.local ? 'cash' : 'card', cur: cur === t.home ? t.home : t.local, opening: '' }, back: back, backKey: key }, '#wl-name');
  }
  function walletOptions(t, sel) {
    return '<option value="">No wallet</option>' + t.wallets.map(function (w) { return '<option value="' + esc(w.id) + '"' + (sel === w.id ? ' selected' : '') + '>' + esc(w.name + ' · ' + w.cur) + '</option>'; }).join('') + '<option value="__new">+ Add a wallet…</option>';
  }

  Object.assign(ACT, {
    'pass-open': function (el) {
      var t = trip(); if (!t || !t.bookings.length) { toast('No bookings yet', 'Add a booking to see it in your travel wallet.'); return; }
      var list = passOrder(t), id = el.dataset.id, i = id ? list.map(function (b) { return b.id; }).indexOf(id) : -1;
      if (i < 0) { var td = today(); i = list.map(function (b) { return (b.end || b.start) >= td; }).indexOf(true); if (i < 0) i = 0; }
      S.pass = { i: i }; renderPass();
    },
    'pass-close': function () { S.pass = null; renderPass(); },
    'pass-scrim': function (el, e) { if (e.target === el) { S.pass = null; renderPass(); } },
    'pass-step': function (el) { var n = passOrder(trip()).length; S.pass.i = (S.pass.i + (+el.dataset.d) + n) % n; renderPass(); },
    'pass-edit': function (el) { S.pass = null; renderPass(); openBooking(el.dataset.id); },
    'pass-copy': function (el) { var v = el.dataset.v; try { navigator.clipboard.writeText(v).then(function () { toast('Copied', v); }, function () { toast('Booking code', v); }); } catch (e) { toast('Booking code', v); } },
    'pkpass-add': function (el) { addPkpass(el.dataset.id); }
  });
