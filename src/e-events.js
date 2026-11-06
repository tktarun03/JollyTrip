  /* =========================================================
     Rendering
     ========================================================= */
  var TABS = [['today', 'Today', 'sun'], ['plan', 'Plan', 'map'], ['spends', 'Spends', 'list'], ['insights', 'Insights', 'chart'], ['more', 'More', 'dots']];
  function renderView() {
    var app = $('#app'), v = $('#view'), nav = $('#nav'), fab = $('#fab');
    document.documentElement.style.setProperty('--toast-b', S.locked || !S.p ? '16px' : '76px');
    if (S.locked) { app.classList.add('is-auth'); v.innerHTML = renderLock(); nav.hidden = true; fab.hidden = true; return; }
    if (!S.p) { app.classList.add('is-auth'); v.innerHTML = renderAuth(); nav.hidden = true; fab.hidden = true; return; }
    app.classList.remove('is-auth');
    var t = trip();
    var html = !t && S.tab !== 'more' ? noTrip() : S.tab === 'plan' ? renderPlan(t) : S.tab === 'spends' ? renderSpends(t) : S.tab === 'insights' ? renderInsights(t) : S.tab === 'more' ? renderMore(t) : renderToday(t);
    v.innerHTML = html;
    nav.hidden = false;
    nav.innerHTML = '<div class="tabbar-inner">' + TABS.map(function (x) { var dis = !t && x[0] !== 'today' && x[0] !== 'more'; return '<button type="button" class="tab" data-act="tab" data-tab="' + x[0] + '"' + (S.tab === x[0] ? ' aria-current="page"' : '') + (dis ? ' disabled' : '') + '>' + ic(x[2], 21) + x[1] + '</button>'; }).join('') + '</div>';
    var showFab = t && (S.tab === 'today' || S.tab === 'spends' || S.tab === 'insights' || (S.tab === 'plan' && S.planSeg !== 'notes'));
    fab.hidden = !showFab;
    fab.innerHTML = ic('plus', 22);
    fab.setAttribute('aria-label', S.tab === 'plan' ? (S.planSeg === 'bookings' ? 'Add a booking' : S.planSeg === 'packing' ? 'Add a packing item' : 'Add to the plan') : 'Add a spend');
    hydrate(v);
  }
  function renderSheet() {
    var root = $('#sheet-root'), sh = S.sheet;
    if (!sh || S.locked || !S.p && sh.type !== 'brand') { root.innerHTML = ''; root.removeAttribute('data-type'); return; }
    if (!trip() && ['spend', 'wallet', 'booking', 'item', 'fund', 'caps', 'sms', 'csv', 'recap'].indexOf(sh.type) >= 0) { S.sheet = null; root.innerHTML = ''; return; }
    var prev = root.querySelector('.sheet-body'), top = prev ? prev.scrollTop : 0, same = !!prev && root.getAttribute('data-type') === sh.type;
    var html = SHEETS[sh.type](sh), cut = html.indexOf('<!--/head-->'), head = cut >= 0 ? html.slice(0, cut) : '', body = cut >= 0 ? html.slice(cut + 12) : html;
    root.innerHTML = '<div class="sheet-wrap' + (same ? ' still' : '') + '" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div class="sheet-top"><div class="grabber"></div>' + head + '</div><div class="sheet-body">' + body + '</div></div></div>';
    root.setAttribute('data-type', sh.type);
    if (same) root.querySelector('.sheet-body').scrollTop = top;
    hydrate(root);
  }
  function openSheet(sh, focusSel) {
    S.sheet = sh; S.lb = null; renderLb();
    $('#sheet-root').removeAttribute('data-type');
    renderSheet();
    if (focusSel) setTimeout(function () { var f = $(focusSel); if (f) try { f.focus({ preventScroll: true }); } catch (e) { } }, 300);
  }
  function closeSheet() {
    if (S.sheet && S.sheet.back) { var back = S.sheet.back; S.sheet = back; $('#sheet-root').removeAttribute('data-type'); renderSheet(); return; }
    S.sheet = null; S.lb = null; renderLb(); renderSheet(); gc();
  }
  function sheetErr(msg) { if (S.sheet) { S.sheet.err = msg; renderSheet(); var e = document.querySelector('.sheet .error'); if (e) e.scrollIntoView({ block: 'nearest' }); } }
  function lbList() { return S.lb && S.lb.src === 'ed' ? (S.sheet && S.sheet.d && S.sheet.d.photos || []).map(function (id, i, a) { return { id: id, cap: 'Photo ' + (i + 1) + ' of ' + a.length }; }) : tripPhotos(trip()); }
  function renderLb() {
    var root = $('#lb-root');
    if (!S.lb) { root.innerHTML = ''; return; }
    var list = lbList(); if (!list.length) { S.lb = null; root.innerHTML = ''; return; }
    var i = Math.max(0, Math.min(S.lb.i, list.length - 1)), p = list[i]; S.lb.i = i;
    root.innerHTML = '<div class="lightbox" data-act="lb-close" role="dialog" aria-modal="true" aria-label="Photo">' + photoImg(p.id, p.cap) +
      '<button type="button" class="lb-btn lb-close" data-act="lb-close" aria-label="Close photo">' + ic('x', 18) + '</button>' +
      (list.length > 1 ? '<button type="button" class="lb-btn lb-prev" data-act="lb-step" data-d="-1" aria-label="Previous photo">' + ic('left', 20) + '</button><button type="button" class="lb-btn lb-next" data-act="lb-step" data-d="1" aria-label="Next photo">' + ic('right', 20) + '</button>' : '') +
      '<p class="lb-cap">' + esc(p.cap) + (list.length > 1 ? ' · ' + (i + 1) + '/' + list.length : '') + '</p></div>';
    hydrate(root);
  }
  function renderAll() { applySettings(); renderView(); renderSheet(); renderLb(); renderPass(); }
  var toastT;
  function toast(title, body, action) {
    var r = $('#toast-root');
    r.innerHTML = '<div class="toast"><div class="tbody"><strong>' + esc(title) + '</strong>' + (body ? '<span>' + esc(body) + '</span>' : '') + '</div>' + (action ? '<button type="button" class="toast-btn" data-act="' + esc(action.act) + '">' + esc(action.label) + '</button>' : '') + '<button type="button" class="toast-x" data-act="toast-x" aria-label="Dismiss">' + ic('x', 16) + '</button></div>';
    clearTimeout(toastT); toastT = setTimeout(hideToast, action ? 7000 : 4000);
  }
  function hideToast() { var el = document.querySelector('#toast-root .toast'); if (!el) return; el.classList.add('out'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 230); }
  var UNDO = { label: 'Undo', act: 'undo' };
  function loadHistory() { var pid = S.pid; Versions.list(pid).then(function (list) { if (S.sheet && S.sheet.type === 'history' && pid === S.pid) { S.sheet.list = list; renderSheet(); } }); }
  function refreshVinfo() {
    var pid = S.pid;
    Versions.list(pid).then(function (vs) {
      if (pid !== S.pid) return;
      var info = { count: vs.length, last: vs[0] ? vs[0].at : 0, size: vs.reduce(function (a, v) { return a + (v.size || 0); }, 0) };
      var changed = !S.vinfo || S.vinfo.count !== info.count || S.vinfo.last !== info.last;
      S.vinfo = info; if (changed && S.tab === 'more' && !S.sheet) renderView();
    });
  }
  function toTop() { var s = $('#scroller'); if (s) s.scrollTop = 0; }
  function focusSoon(sel) { setTimeout(function () { var f = $(sel); if (f) try { f.focus(); } catch (e) { } }, 60); }

  /* =========================================================
     Sharing, CSV, backups
     ========================================================= */
  function showText(title, body, msg) { openSheet({ type: 'text', title: title, body: body, msg: msg || 'Copying was blocked here, so the text is below. Select it and copy, or tap Copy.' }); setTimeout(function () { var b = $('#text-out'); if (b) { b.focus(); b.select(); } }, 320); }
  function copyText(txt, okTitle, okBody, sheetTitle) {
    try { navigator.clipboard.writeText(txt).then(function () { toast(okTitle, okBody); }, function () { showText(sheetTitle, txt); }); }
    catch (e) { showText(sheetTitle, txt); }
  }
  var PHONE = (function () { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();
  function shareSummary() {
    var t = trip(); if (!t) return;
    var txt = summaryText(t);
    if (IS_TOP && navigator.share && PHONE) { navigator.share({ title: BR.name + ' · ' + t.name, text: txt }).catch(function (e) { if (!e || e.name !== 'AbortError') copyText(txt, 'Summary copied', 'Paste it into WhatsApp or a message.', 'Trip summary'); }); return; }
    copyText(txt, 'Summary copied', 'Paste it into WhatsApp or a message.', 'Trip summary');
  }
  function exportCsv() {
    var t = trip(); if (!t) return;
    if (!t.expenses.length) { toast('Nothing to export yet', 'Log a few spends first.'); return; }
    var txt = csvText(t), name = slug(BR.name) + '-' + slug(t.name) + '.csv';
    if (!IS_TOP) { copyText(txt.replace(/^﻿/, ''), 'CSV copied', 'Paste it into a spreadsheet.', 'Spends as CSV'); return; }
    var blob = new Blob([txt], { type: 'text/csv;charset=utf-8' });
    try {
      var file = new File([blob], name, { type: 'text/csv' });
      if (PHONE && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(function () { }); return; }
    } catch (e) { }
    var a = document.createElement('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    toast('Saved ' + name, plural(t.expenses.length, 'spend') + '.');
  }
  function buildBackup() {
    var ids = Object.keys(refsOf(S.p, {}));
    return Promise.all(ids.map(function (id) { return Photos.get(id).then(function (b) { return b ? blobToData(b).then(function (u) { return u ? [id, u] : null; }) : null; }); }))
      .then(function (pairs) { var o = JSON.parse(JSON.stringify(S.p)), ph = {}; pairs.forEach(function (p) { if (p) ph[p[0]] = p[1]; }); o.photos = ph; o.app = APP.id; delete o.savedAt; return JSON.stringify(o); });
  }

  /* =========================================================
     Accounts
     ========================================================= */
  function enterProfile(pid) {
    if (!loadProfile(pid)) { S.auth = { mode: 'home' }; renderAll(); toast('Couldn’t open this account', 'Its data is missing from this browser. It may have been cleared.'); return; }
    setSession(pid); S.auth = { mode: 'home' }; S.sheet = null; renderAll(); toTop();
    var t = trip(), c = t ? calc(t) : null, m = meta();
    toast('Hi ' + firstName(m.name), !t ? 'Plan your first trip to get started.' : c.status === 'active' ? 'You can spend ' + money(Math.max(c.safe, 0)) + ' more today.' : c.status === 'upcoming' ? t.name + ' starts in ' + plural(diff(today(), t.start), 'day') + '.' : 'Welcome back.');
  }
  function createAccount() {
    var d = S.auth.d; S.auth.err = '';
    if (!d.name.trim()) S.auth.err = 'Add your name so you can tell accounts apart.';
    else if (d.pw && d.pw.length < 4) S.auth.err = 'Use a password of at least 4 characters, or leave it empty.';
    else if (d.pw && d.pw !== d.pw2) S.auth.err = 'The two passwords don’t match.';
    if (S.auth.err) { renderView(); return; }
    var id = uid(), salt = uid();
    (d.pw ? hashPw(d.pw, salt) : Promise.resolve('')).then(function (hash) {
      S.index.profiles.push({ id: id, name: d.name.trim(), salt: salt, hash: hash, color: AV[S.index.profiles.length % AV.length], createdAt: Date.now() });
      saveIndex();
      S.pid = id; S.p = migrate({ home: d.home, createdAt: Date.now(), trips: [] });
      var lg = S.legacy, moved = 0;
      if (lg) {
        lg.trips.filter(function (x) { return !x.demo; }).forEach(function (x) { S.p.trips.push(migrateTrip(x, S.p)); moved++; });
        if (lg.settings && lg.settings.ts) S.p.settings.ts = lg.settings.ts;
        S.p = migrate(S.p); clearLegacy(); S.legacy = null;
      }
      nf = {}; initVersions(moved ? 'Trips moved from the earlier version' : 'Account created'); save(); setSession(id); applySettings(); S.auth = { mode: 'home' }; S.tab = 'today';
      renderAll(); toTop();
      if (moved) toast('Welcome, ' + firstName(d.name), 'Your ' + plural(moved, 'earlier trip') + ' moved into this account.');
      else { toast('Welcome, ' + firstName(d.name), 'Let’s plan your first trip.'); ACT['trip-new'](); }
    });
  }
  function signIn(pw) {
    var m = meta(S.auth.pick); if (!m) return;
    hashPw(pw, m.salt).then(function (h) {
      if (h !== m.hash) { S.auth.err = 'That password doesn’t match this account. Try again.'; renderView(); focusSoon('#si-pw'); return; }
      enterProfile(m.id);
    });
  }
  function createDemo() {
    var ex = S.index.profiles.filter(function (x) { return x.demo; })[0];
    if (ex) { enterProfile(ex.id); return; }
    var id = uid();
    S.index.profiles.push({ id: id, name: 'Demo · Family', salt: uid(), hash: '', demo: true, color: AV[3], createdAt: Date.now() });
    saveIndex();
    S.pid = id; S.p = demoProfile(); nf = {}; initVersions('Example trip created'); save(); setSession(id); S.tab = 'today'; S.auth = { mode: 'home' };
    renderAll(); toTop();
    toast('Example trip ready', 'Everything here is example data. Explore, then create your own account.');
  }

  /* =========================================================
     Drafts
     ========================================================= */
  function tripDraft(t) {
    if (t) return { id: t.id, name: t.name, place: t.place, start: t.start, end: t.end, home: t.home, local: t.local, rate: t.rate, budget: t.budget, cover: t.cover, pick: -1, people: t.people.map(function (p) { return { id: p.id, name: p.name, color: p.color, photo: p.photo }; }), reapply: false };
    var s = addDays(today(), 30), m = meta() || {};
    return { id: null, name: '', place: '', start: s, end: addDays(s, 6), home: S.p.home, local: S.p.home, rate: 1, budget: '', cover: null, pick: -1, people: [{ id: uid(), name: firstName(m.name) === 'there' ? 'You' : firstName(m.name), color: AV[0], photo: null }], reapply: false };
  }
  function openSpend(id, pre) {
    var t = trip(), x = id ? t.expenses.filter(function (e) { return e.id === id; })[0] : null, d;
    if (x) d = { id: x.id, amt: String(x.amt), cur: x.cur, origCur: x.cur, rate: x.rate, cat: x.cat, note: x.note, date: x.date, time: x.time, wallet: x.wallet, who: x.who, photos: x.photos.slice(), bookingId: x.bookingId };
    else {
      var cur = t.local, last = S.lastWallet && walletById(t, S.lastWallet), w = last && last.cur === cur ? last : t.wallets.filter(function (w2) { return w2.cur === cur; })[0] || t.wallets[0];
      d = { id: null, amt: '', cur: cur, cat: 'food', note: '', date: today(), time: nowHM(), wallet: w ? w.id : '', who: '', photos: [], bookingId: '' };
    }
    if (pre) Object.assign(d, pre);
    openSheet({ type: 'spend', d: d }, x ? null : '#sp-amt');
  }
  function openItem(id, day) {
    var t = trip(), it = id ? t.plan.filter(function (p) { return p.id === id; })[0] : null;
    var d = it ? { id: it.id, day: it.day, time: it.time, title: it.title, kind: it.kind, place: it.place, notes: it.notes, cost: it.cost || '', cur: it.cur, done: it.done } : { id: null, day: day == null ? '' : day, time: '', title: '', kind: 'sight', place: '', notes: '', cost: '', cur: t.local, done: false };
    openSheet({ type: 'item', d: d }, it ? null : '#it-title');
  }
  function openBooking(id) {
    var t = trip(), b = id ? bookingById(t, id) : null;
    var d = b ? { id: b.id, type: b.type, name: b.name, provider: b.provider, start: b.start, time: b.time, end: b.end, endTime: b.endTime, conf: b.conf, total: b.total || '', cur: b.cur, due: b.due, notes: b.notes, photos: b.photos.slice(), files: (b.files || []).slice(), cover: b.cover || null, pasteText: '', gwallet: b.gwallet || '', address: b.address || '' } : { id: null, type: 'stay', name: '', provider: '', start: t.start, time: '', end: '', endTime: '', conf: '', total: '', cur: t.local, due: '', notes: '', photos: [], files: [], cover: null, pasteText: '', gwallet: '', address: '', paidNow: '', paidFrom: ((t.wallets.filter(function (x) { return x.type === 'card'; })[0] || t.wallets[0] || {}).id || '') };
    openSheet({ type: 'booking', d: d, initStart: d.start }, b ? null : '#bk-name');
  }
  function saveBooking(quiet) {
    var t = trip(), d = S.sheet.d, T = BKT[d.type] || BKT.other;
    var name = String(d.name || '').trim() || (d.provider ? d.provider.trim() : '');
    if (!name) { sheetErr('Give the booking a name.'); return null; }
    if (!validDate(d.start)) { sheetErr('Pick the date for this booking.'); return null; }
    if (d.end && (!validDate(d.end) || d.end < d.start)) { sheetErr('The end date must be on or after the start date.'); return null; }
    var rec = { id: d.id || uid(), type: d.type, name: name, provider: String(d.provider || '').trim(), start: d.start, time: d.time || '', end: T.hasEnd ? (d.end || '') : '', endTime: T.hasEnd ? (d.endTime || '') : '', conf: String(d.conf || '').trim().toUpperCase(), total: num(d.total), cur: d.cur, due: validDate(d.due) ? d.due : '', notes: String(d.notes || ''), photos: d.photos.slice(), files: (d.files || []).slice(), cover: d.cover || null, address: String(d.address || '').trim().slice(0, 160), gwallet: /^https:\/\//i.test(String(d.gwallet || '').trim()) ? String(d.gwallet).trim() : '' };
    if (d.id) t.bookings = t.bookings.map(function (b) { return b.id === d.id ? rec : b; });
    else {
      t.bookings.push(rec);
      var paid = num(d.paidNow);
      if (paid > 0) {
        var w = (d.paidFrom && walletById(t, d.paidFrom)) || t.wallets.filter(function (x) { return x.type === 'card' && x.cur === d.cur; })[0] || t.wallets.filter(function (x) { return x.type === 'card'; })[0] || t.wallets[0];
        t.expenses.push({ id: uid(), amt: paid, cur: d.cur, rate: d.cur === t.home ? 1 : t.rate, cat: T.cat, note: name + (paid < rec.total - 0.005 ? ' deposit' : ''), date: today(), time: nowHM(), wallet: w ? w.id : '', who: '', photos: [], bookingId: rec.id });
      }
    }
    d.id = rec.id;
    save();
    if (!quiet) { closeSheet(); renderView(); toast('Booking saved', rec.name + (rec.conf ? ' · ' + rec.conf : '')); }
    return rec;
  }
  function saveItem(quiet) {
    var t = trip(), d = S.sheet.d;
    if (!String(d.title || '').trim()) { sheetErr('Say what the plan is.'); return null; }
    var rec = { id: d.id || uid(), day: validDate(d.day) ? d.day : '', time: d.time || '', title: d.title.trim(), kind: d.kind, place: String(d.place || '').trim(), notes: String(d.notes || ''), cost: num(d.cost), cur: d.cur, done: !!d.done };
    if (d.id) t.plan = t.plan.map(function (p) { return p.id === d.id ? rec : p; }); else t.plan.push(rec);
    d.id = rec.id;
    save();
    if (!quiet) { closeSheet(); renderView(); toast(d.day ? 'Added to Day ' + (diff(t.start, d.day) + 1) : 'Saved to ideas', rec.title); }
    return rec;
  }

  /* =========================================================
     Actions
     ========================================================= */
  var ACT = {
    /* sign-in screens */
    pick: function (el) { var m = meta(el.dataset.id); if (!m) return; if (lockEnabled(m)) { lockApp(m.id); renderAll(); return; } if (!m.hash) { enterProfile(m.id); return; } S.auth = { mode: 'signin', pick: m.id }; renderView(); focusSoon('#si-pw'); },
    create: function () { S.auth = { mode: 'create', d: { name: '', home: guessCur(), pw: '', pw2: '' } }; renderView(); toTop(); focusSoon('#c-name'); },
    demo: createDemo,
    'auth-home': function () { S.auth = { mode: 'home' }; renderView(); toTop(); },
    'auth-del': function () {
      if (!S.auth.armed) { S.auth.armed = true; renderView(); return; }
      var m = meta(S.auth.pick); if (m) deleteProfile(m.id);
      S.auth = { mode: 'home' }; renderView(); gc(); toast('Account deleted', 'Its trips are gone from this device.');
    },
    brand: function () { openSheet({ type: 'brand', d: Object.assign({}, BR) }); },
    /* navigation */
    tab: function (el) { if (el.disabled) return; S.tab = el.dataset.tab; S.armed = null; S.limit = 80; renderView(); toTop(); },
    'plan-seg': function (el) { S.planSeg = el.dataset.seg; renderView(); },
    'go-plan': function (el) {
      S.tab = 'plan'; S.planSeg = el.dataset.seg || 'itinerary'; closeSheet(); renderView(); toTop();
      var ds = el.dataset.day; if (ds) setTimeout(function () { var x = document.getElementById('day-' + ds); if (x) x.scrollIntoView({ block: 'start' }); }, 30);
    },
    fab: function () {
      var t = trip(); if (!t) return;
      if (S.tab === 'plan') {
        if (S.planSeg === 'bookings') return openBooking(null);
        if (S.planSeg === 'packing') { var f = $('#pk-text'); if (f) { f.focus(); f.scrollIntoView({ block: 'center' }); } return; }
        return openItem(null, inTrip(t, today()) ? today() : t.start);
      }
      openSpend(null);
    },
    more: function () { S.limit += 80; var l = $('#spend-list'); if (l) { l.innerHTML = spendList(trip()); hydrate(l); } },
    close: closeSheet,
    scrim: function (el, e) { if (e.target === el) closeSheet(); },
    /* settings */
    privacy: function () { S.p.settings.hide = !S.p.settings.hide; save(); renderAll(); },
    roast: function () { S.p.settings.roast = !S.p.settings.roast; save(); renderView(); },
    theme: function (el) { S.p.settings.theme = el.dataset.v; save(); renderAll(); },
    ts: function (el) { S.p.settings.ts = el.dataset.v; save(); renderAll(); },
    accounts: function () { openSheet({ type: 'accounts' }); },
    'switch-to': function (el) { var m = meta(el.dataset.id); if (!m) return; if (lockEnabled(m)) { signOut(true); lockApp(m.id); renderAll(); return; } if (m.hash) { signOut(true); S.auth = { mode: 'signin', pick: m.id }; renderAll(); focusSoon('#si-pw'); return; } enterProfile(m.id); },
    'add-account': function () { signOut(true); ACT.create(); renderAll(); },
    signout: function () { signOut(); },
    'reset-demo': function () { checkpoint('Before resetting the example trip', true); S.p = demoProfile(); save(); S.tab = 'today'; renderAll(); toTop(); toast('Example trip reset', 'Back to day 5 in Osaka.', UNDO); },
    'acct-del': function () {
      if (S.armed !== 'acct') { S.armed = 'acct'; renderView(); return; }
      var name = (meta() || {}).name; deleteProfile(S.pid); signOut(true); S.armed = null; renderAll(); gc(); toast('Account deleted', (name || 'The account') + ' and its trips are gone from this device.');
    },
    json: function () { S.showJson = !S.showJson; renderView(); },
    backup: function () {
      toast('Preparing backup', 'Photos are included, so this can take a moment.');
      buildBackup().then(function (txt) {
        try { navigator.clipboard.writeText(txt).then(function () { toast('Backup copied', kb(txt.length) + '. Paste it somewhere safe, like a note or an email to yourself.'); }, function () { showText('Your backup', txt, kb(txt.length) + '. Tap Copy, then paste it somewhere safe, like a note or an email to yourself.'); }); }
        catch (e) { showText('Your backup', txt, kb(txt.length) + '. Tap Copy, then paste it somewhere safe.'); }
      });
    },
    'restore-open': function () { openSheet({ type: 'restore', d: { text: '' } }, '#restore-box'); },
    restore: function () {
      var o; try { o = JSON.parse(S.sheet.d.text); } catch (e) { o = null; }
      if (!o || !Array.isArray(o.trips)) { sheetErr('That isn’t a ' + BR.name + ' backup. Choose the .json backup file, or paste the whole text you copied.'); return; }
      var ph = o.photos || {}; delete o.photos; delete o.app;
      Promise.all(Object.keys(ph).map(function (id) { var b = dataToBlob(ph[id]); return b ? Photos.put(id, b) : null; })).then(function () {
        if (!o.home) o.home = S.p.home;
        checkpoint('Before restoring a backup', true);
        o.demo = S.p.demo && o.demo; S.p = migrate(o); S.p.settings.lastBackup = Date.now(); save(); S.sheet = null; S.tab = 'today'; renderAll(); toTop();
        toast('Restored', plural(S.p.trips.length, 'trip') + (Object.keys(ph).length ? ' and ' + plural(Object.keys(ph).length, 'photo') : '') + '.', UNDO);
      });
    },
    'text-copy': function () {
      var sh = S.sheet, box = $('#text-out');
      try { navigator.clipboard.writeText(sh.body).then(function () { toast('Copied'); }, function () { if (box) { box.focus(); box.select(); } toast('Select the text and copy it', 'This view blocks the copy button.'); }); }
      catch (e) { if (box) { box.focus(); box.select(); } }
    },
    share: shareSummary,
    csv: exportCsv,
    recap: function () { openSheet({ type: 'recap' }); },
    /* trips */
    trips: function () { openSheet({ type: 'trips' }); },
    'trip-open': function (el) { S.p.active = el.dataset.id; save(); S.sheet = null; S.tab = 'today'; S.filter = { wallet: 'all', cat: 'all', q: '' }; renderAll(); toTop(); },
    'trip-new': function () { openSheet({ type: 'trip', d: tripDraft(null) }, '#tr-name'); },
    'trip-edit': function () { openSheet({ type: 'trip', d: tripDraft(trip()) }); },
    'tr-pick': function (el) { var i = +el.dataset.i; S.sheet.d.pick = S.sheet.d.pick === i ? -1 : i; renderSheet(); },
    'tr-color': function (el) { S.sheet.d.people[+el.dataset.i].color = el.dataset.c; renderSheet(); },
    'tr-av-rm': function (el) { S.sheet.d.people[+el.dataset.i].photo = null; renderSheet(); },
    'tr-cover-rm': function () { S.sheet.d.cover = null; renderSheet(); },
    'tr-add': function () { var d = S.sheet.d; d.people.push({ id: uid(), name: '', color: AV[d.people.length % AV.length], photo: null }); d.pick = -1; renderSheet(); var ins = document.querySelectorAll('[data-f^="people."]'); if (ins.length) ins[ins.length - 1].focus(); },
    'tr-rm': function (el) { var d = S.sheet.d; d.people.splice(+el.dataset.i, 1); d.pick = -1; renderSheet(); },
    'tr-save': function () {
      var d = S.sheet.d;
      if (!String(d.name).trim()) return sheetErr('Give the trip a name.');
      if (!validDate(d.start) || !validDate(d.end) || d.end < d.start) return sheetErr('The end date must be on or after the start date.');
      if (!(num(d.budget) > 0)) return sheetErr('Set a total budget above zero.');
      var two = d.local !== d.home, rate = two ? num(d.rate) : 1;
      if (two && !(rate > 0)) return sheetErr('Enter the exchange rate for ' + d.local + '.');
      var people = d.people.filter(function (p) { return String(p.name).trim(); }).map(function (p) { return { id: p.id, name: p.name.trim(), color: p.color || AV[0], photo: p.photo || null }; });
      if (d.id) {
        checkpoint('Before editing the trip “' + d.name + '”', false);
        var t = S.p.trips.filter(function (x) { return x.id === d.id; })[0];
        var oldHome = t.home, oldLocal = t.local;
        Object.assign(t, { name: d.name.trim(), place: String(d.place).trim(), start: d.start, end: d.end, home: d.home, local: d.local, rate: rate, budget: num(d.budget), cover: d.cover || null, people: people });
        function remap(cur) { return cur === oldLocal ? t.local : cur === oldHome ? t.home : cur; }
        t.wallets.forEach(function (w) { w.cur = remap(w.cur); });
        t.plan.forEach(function (x) { x.cur = remap(x.cur); });
        t.bookings.forEach(function (x) { x.cur = remap(x.cur); });
        t.expenses.forEach(function (x) { x.cur = remap(x.cur); if (x.cur === t.home) x.rate = 1; else if (d.reapply) x.rate = rate; });
        t.expenses.forEach(function (x) { if (x.who && !people.some(function (p) { return p.id === x.who; })) x.who = ''; });
        t.packing.forEach(function (x) { if (x.who && !people.some(function (p) { return p.id === x.who; })) x.who = ''; });
        migrateTrip(t, S.p); save(); closeSheet(); renderView(); toast('Trip saved', t.name, UNDO);
      } else {
        var nt = migrateTrip({ name: d.name.trim(), place: String(d.place).trim(), start: d.start, end: d.end, home: d.home, local: d.local, rate: rate, budget: num(d.budget), cover: d.cover || null, people: people }, S.p);
        S.p.trips.unshift(nt); S.p.active = nt.id; save(); S.sheet = null; S.tab = 'plan'; S.planSeg = 'itinerary'; renderAll(); toTop();
        toast('Trip created', 'Now add bookings and plan each day.');
      }
    },
    'tr-del': function () {
      var sh = S.sheet; if (!sh.armed) { sh.armed = true; renderSheet(); return; }
      checkpoint('Before deleting the trip “' + sh.d.name + '”', true);
      S.p.trips = S.p.trips.filter(function (x) { return x.id !== sh.d.id; }); S.p.active = S.p.trips[0] ? S.p.trips[0].id : null;
      save(); closeSheet(); S.tab = 'today'; renderView(); toast('Trip deleted', sh.d.name, UNDO);
    },
    /* spends */
    'sp-edit': function (el) { openSpend(el.dataset.id); },
    'sp-cur': function (el) { var t = trip(), d = S.sheet.d; d.cur = el.dataset.cur; var w = walletById(t, d.wallet); if (w && w.cur !== d.cur) { var w2 = t.wallets.filter(function (x) { return x.cur === d.cur && x.type === w.type; })[0] || t.wallets.filter(function (x) { return x.cur === d.cur; })[0]; if (w2) d.wallet = w2.id; } renderSheet(); },
    'sp-cat': function (el) { S.sheet.d.cat = el.dataset.k; S.sheet.catSet = true; renderSheet(); },
    'sp-who': function (el) { S.sheet.d.who = el.dataset.id; renderSheet(); },
    'sp-quick': function (el) { var q = recentNotes(trip())[+el.dataset.i], d = S.sheet.d; if (!q) return; d.note = q.note; d.cat = q.cat; d.cur = q.cur; d.amt = String(q.amt); if (q.wallet) d.wallet = q.wallet; renderSheet(); },
    'ph-rm': function (el) { S.sheet.d.photos.splice(+el.dataset.i, 1); renderSheet(); },
    'sp-save': function () {
      var t = trip(), d = S.sheet.d, a = num(d.amt), td = today();
      if (!(a > 0)) return sheetErr('Enter an amount above zero.');
      if (!validDate(d.date)) return sheetErr('Pick the date you paid.');
      var rate = d.cur === t.home ? 1 : (d.id && d.cur === d.origCur && num(d.rate) ? num(d.rate) : t.rate);
      var rec = { id: d.id || uid(), amt: a, cur: d.cur, rate: rate, cat: d.cat, note: String(d.note || '').trim(), date: d.date, time: d.time || '', wallet: d.wallet || '', who: d.who || '', photos: d.photos.slice(), bookingId: d.bookingId || '' };
      var before = calc(t), capsB = capStatus(t, before);
      if (d.id) t.expenses = t.expenses.map(function (x) { return x.id === d.id ? rec : x; }); else t.expenses.push(rec);
      if (d.planId) t.plan.forEach(function (p) { if (p.id === d.planId) p.done = true; });
      S.lastWallet = rec.wallet;
      save(); closeSheet(); renderView();
      var after = calc(t), capsA = capStatus(t, after), roastOn = S.p.settings.roast, w = walletById(t, rec.wallet), bk = linked(t, rec) ? bookingById(t, rec.bookingId) : null;
      var title = (d.id ? 'Saved · ' : '') + money(exHome(t, rec)) + (rec.note ? ' · ' + rec.note : ''), body = bk ? 'Logged as a payment for ' + bk.name + '.' : roastOn ? roastFor(rec) : (w ? 'Paid from ' + w.name + '.' : 'Logged.');
      var done = false, b = after.allowance;
      if (!d.id && !bk && rec.date === td && after.status === 'active' && b > 0) {
        if (before.todaySpent < b && after.todaySpent >= b) { title = roastOn ? BR.catch : 'Today’s allowance is used up'; body = 'You’re ' + money(after.todaySpent - b) + ' over today. Tomorrow becomes ' + (after.tomorrow === null ? 'the last day' : money(after.tomorrow)) + '.'; done = true; }
      }
      var cb = capsB.filter(function (x) { return x.cat === rec.cat; })[0], ca = capsA.filter(function (x) { return x.cat === rec.cat; })[0];
      if (!done && ca && cb && cb.pct < 1 && ca.pct >= 1) { title = 'Limit crossed: ' + cs(rec.cat); body = money(ca.spent) + ' of your ' + money(ca.cap) + ' limit for this trip.'; done = true; }
      if (!done && !d.id && !bk && rec.date === td && after.status === 'active' && b > 0 && before.todaySpent < 0.8 * b && after.todaySpent >= 0.8 * b) { title = roastOn ? '80% gone. ' + (BR.showMascot ? BR.mascotName + ' is sweating.' : '') : '80% of today’s allowance used'; body = money(after.safe) + ' left for today.'; done = true; }
      if (!done && ca && cb && cb.pct < 0.8 && ca.pct >= 0.8) { title = 'Near your ' + cs(rec.cat) + ' limit'; body = money(ca.left) + ' left of ' + money(ca.cap) + '.'; }
      toast(title, body);
    },
    'sp-del': function () {
      var sh = S.sheet; if (!sh.armed) { sh.armed = true; renderSheet(); return; }
      checkpoint('Deleted the spend “' + (sh.d.note || cs(sh.d.cat)) + '”', false);
      var t = trip(); t.expenses = t.expenses.filter(function (x) { return x.id !== sh.d.id; }); save(); closeSheet(); renderView(); toast('Spend deleted', sh.d.note || '', UNDO);
    },
    /* bank SMS */
    'open-sms': function () { openSheet({ type: 'sms', step: 'input', d: { text: '' } }, '#sms-text'); },
    'sms-sample': function () { S.sheet.d.text = sampleSms(trip()); S.sheet.err = ''; renderSheet(); },
    'sms-read': function () {
      var t = trip(), chunks = splitSms(S.sheet.d.text);
      if (!chunks.length) return sheetErr('Paste at least one message first.');
      var mem = catMemory(t), items = [], bad = [];
      chunks.forEach(function (c) { var r = parseSms(c, t, mem); if (r.ok) items.push(r); else bad.push(r); });
      Object.assign(S.sheet, { step: 'review', items: items, bad: bad, err: '' }); renderSheet(); var s = document.querySelector('.sheet-body'); if (s) s.scrollTop = 0;
    },
    'sms-back': function () { S.sheet.step = 'input'; renderSheet(); },
    'sms-add': function () {
      var t = trip(), on = S.sheet.items.filter(function (x) { return x.on; });
      checkpoint('Before adding ' + plural(on.length, 'spend') + ' from bank messages', true);
      on.forEach(function (x) { t.expenses.push({ id: uid(), amt: x.amt, cur: x.cur, rate: x.cur === t.home ? 1 : t.rate, cat: x.cat, note: x.note, date: x.date, time: x.time, wallet: x.wallet, who: '', photos: [], bookingId: '' }); });
      save(); closeSheet(); renderView(); toast('Added ' + plural(on.length, 'spend'), 'From your bank messages.', UNDO);
    },
    /* CSV */
    'open-csv': function () { openSheet({ type: 'csv', step: 'pick', d: { text: '' } }); },
    'csv-read': function () { loadCsv(S.sheet.d.text); },
    'csv-back': function () { openSheet({ type: 'csv', step: 'pick', d: { text: '' } }); },
    'csv-dups': function () { S.sheet.keepDups = !S.sheet.keepDups; renderSheet(); },
    'csv-cur': function (el) { S.sheet.cur = el.dataset.cur; renderSheet(); },
    'csv-import': function () {
      var t = trip(), res = csvItems(S.sheet, t), keep = S.sheet.keepDups;
      checkpoint('Before importing ' + plural(res.items.length, 'spend') + ' from CSV', true);
      res.items.forEach(function (x) { t.expenses.push({ id: uid(), amt: x.amt, cur: x.cur, rate: x.cur === t.home ? 1 : t.rate, cat: x.cat, note: x.note, date: x.date, time: x.time, wallet: x.wallet || '', who: '', photos: [], bookingId: '' }); });
      save(); closeSheet(); renderView(); toast('Imported ' + plural(res.items.length, 'spend'), res.dups && !keep ? res.dups + ' possible duplicates skipped.' : '', UNDO);
    },
    /* plan items */
    'pl-add': function (el) { openItem(null, el.dataset.day || ''); },
    'pl-edit': function (el) { openItem(el.dataset.id); },
    'pl-done': function (el) { var t = trip(); t.plan.forEach(function (p) { if (p.id === el.dataset.id) p.done = !p.done; }); save(); renderView(); if (S.sheet) renderSheet(); },
    'it-kind': function (el) { S.sheet.d.kind = el.dataset.k; renderSheet(); },
    'it-cur': function (el) { S.sheet.d.cur = el.dataset.cur; renderSheet(); },
    'it-done': function () { S.sheet.d.done = !S.sheet.d.done; renderSheet(); },
    'it-save': function () { saveItem(false); },
    'it-log': function () {
      var t = trip(), rec = saveItem(true); if (!rec) return;
      openSpend(null, { amt: String(rec.cost), cur: rec.cur, cat: (PLK[rec.kind] || PLK.sight).cat, note: rec.title, date: inTrip(t, rec.day) ? rec.day : today(), time: rec.time || nowHM(), planId: rec.id });
    },
    'it-del': function () {
      var sh = S.sheet; if (!sh.armed) { sh.armed = true; renderSheet(); return; }
      checkpoint('Removed “' + sh.d.title + '” from the plan', false);
      var t = trip(); t.plan = t.plan.filter(function (p) { return p.id !== sh.d.id; }); save(); closeSheet(); renderView(); toast('Removed from the plan', sh.d.title, UNDO);
    },
    /* bookings */
    'bk-add': function () { openBooking(null); },
    'bk-edit': function (el) { openBooking(el.dataset.id); },
    'bk-type': function (el) { var d = S.sheet.d; S.sheet.typeSet = true; d.type = el.dataset.k; if (d.type === 'flight' && d.cur === trip().local) d.cur = trip().home; renderSheet(); },
    'bk-cur': function (el) { S.sheet.d.cur = el.dataset.cur; renderSheet(); },
    'bk-save': function () { saveBooking(false); },
    'bk-pay': function () {
      var t = trip(), rec = saveBooking(true); if (!rec) return;
      var st = bookingState(t, rec), amt = rec.cur === t.home ? st.left : st.left / (num(t.rate) || 1);
      var w = t.wallets.filter(function (x) { return x.type === 'card' && x.cur === rec.cur; })[0] || t.wallets.filter(function (x) { return x.cur === rec.cur; })[0] || t.wallets[0];
      renderView();
      openSpend(null, { amt: String(Math.round(amt * 100) / 100), cur: rec.cur, cat: (BKT[rec.type] || BKT.other).cat, note: rec.name + (st.paid > 0.5 ? ' balance' : ''), bookingId: rec.id, wallet: w ? w.id : '' });
    },
    'bk-del': function () {
      var sh = S.sheet; if (!sh.armed) { sh.armed = true; renderSheet(); return; }
      checkpoint('Before deleting the booking “' + sh.d.name + '”', true);
      var t = trip(); t.bookings = t.bookings.filter(function (b) { return b.id !== sh.d.id; }); t.expenses.forEach(function (x) { if (x.bookingId === sh.d.id) x.bookingId = ''; });
      save(); closeSheet(); renderView(); toast('Booking deleted', 'Its payments stay as normal spends.', UNDO);
    },
    /* packing */
    'pk-add': function () {
      var t = trip(), box = $('#pk-text'), txt = box ? box.value.trim() : '';
      if (!txt) { if (box) box.focus(); return; }
      S.pkGroup = ($('#pk-group') || {}).value || 'Other'; S.pkWho = ($('#pk-who') || {}).value || '';
      t.packing.push({ id: uid(), text: txt.slice(0, 60), group: S.pkGroup, who: S.pkWho, done: false }); save(); renderView(); focusSoon('#pk-text');
    },
    'pk-toggle': function (el) { var t = trip(); t.packing.forEach(function (k) { if (k.id === el.dataset.id) k.done = !k.done; }); save(); renderView(); },
    'pk-del': function (el) { var t = trip(), k0 = t.packing.filter(function (k) { return k.id === el.dataset.id; })[0]; checkpoint('Removed “' + (k0 ? k0.text : 'item') + '” from packing', false); t.packing = t.packing.filter(function (k) { return k.id !== el.dataset.id; }); save(); renderView(); toast('Removed from packing', k0 ? k0.text : '', UNDO); },
    'pk-template': function () {
      var t = trip(), have = {}, n = 0; checkpoint('Before adding the family essentials', false); t.packing.forEach(function (k) { have[k.text.toLowerCase()] = 1; });
      PACK_GROUPS.forEach(function (g) { PACK_TEMPLATE[g].forEach(function (txt) { if (!have[txt.toLowerCase()]) { t.packing.push({ id: uid(), text: txt, group: g, who: '', done: false }); n++; } }); });
      save(); renderView(); toast(n ? 'Added ' + plural(n, 'item') : 'Nothing new to add', n ? 'Remove what you don’t need.' : 'You already have the family essentials.', n ? UNDO : null);
    },
    'pk-reset': function () { checkpoint('Before unticking the packing list', false); var t = trip(); t.packing.forEach(function (k) { k.done = false; }); save(); renderView(); toast('All unticked', 'Ready to pack for the trip home.', UNDO); },
    /* wallets */
    'wl-add': function () { var t = trip(); openSheet({ type: 'wallet', d: { id: null, name: '', type: 'cash', cur: t.local, opening: '' } }, '#wl-name'); },
    'wl-edit': function (el) { var w = walletById(trip(), el.dataset.id); if (w) openSheet({ type: 'wallet', d: { id: w.id, name: w.name, type: w.type, cur: w.cur, opening: w.opening || '' } }); },
    'wl-type': function (el) { S.sheet.d.type = el.dataset.k; renderSheet(); },
    'wl-cur': function (el) { S.sheet.d.cur = el.dataset.cur; renderSheet(); },
    'wl-save': function () {
      var t = trip(), d = S.sheet.d;
      if (!String(d.name).trim()) return sheetErr('Give this wallet a name.');
      var rec = { id: d.id || uid(), name: d.name.trim(), type: d.type, cur: d.cur, opening: num(d.opening) };
      if (d.id) t.wallets = t.wallets.map(function (w) { return w.id === d.id ? rec : w; }); else t.wallets.push(rec);
      if (S.sheet.back) { var back = S.sheet.back, key = S.sheet.backKey; if (key === 'csv') back.wallet = rec.id; else back.d[key] = rec.id; save(); S.sheet = back; $('#sheet-root').removeAttribute('data-type'); renderSheet(); renderView(); toast('Wallet added', rec.name + ' is selected.'); return; }
      save(); closeSheet(); renderView(); toast(d.id ? 'Wallet saved' : 'Wallet added', rec.name);
    },
    'wl-del': function () {
      var sh = S.sheet; if (!sh.armed) { sh.armed = true; renderSheet(); return; }
      checkpoint('Before deleting the wallet “' + sh.d.name + '”', true);
      var t = trip(); t.wallets = t.wallets.filter(function (w) { return w.id !== sh.d.id; }); t.expenses.forEach(function (x) { if (x.wallet === sh.d.id) x.wallet = ''; });
      save(); closeSheet(); renderView(); toast('Wallet deleted', sh.d.name, UNDO);
    },
    /* trip fund */
    fund: function () { var t = trip(); openSheet({ type: 'fund', d: { amt: '', date: today(), target: t.fund.target || '' } }); },
    'fd-add': function () {
      var t = trip(), d = S.sheet.d, a = num(d.amt);
      if (!(a > 0)) return sheetErr('Enter an amount above zero.');
      t.fund.entries.push({ id: uid(), date: validDate(d.date) ? d.date : today(), amt: a }); save();
      d.amt = ''; S.sheet.err = ''; renderSheet(); renderView();
      var saved = fundSaved(t), target = fundTarget(t); toast(money(a) + ' added to the fund', saved >= target ? 'Fully funded!' : Math.round(saved / target * 100) + '% of the way there.');
    },
    'fd-target': function () { var t = trip(); t.fund.target = num(S.sheet.d.target) || ''; save(); renderSheet(); renderView(); toast('Target saved', money(fundTarget(t))); },
    'fd-del': function (el) { var t = trip(); checkpoint('Removed a trip fund entry', false); toast('Fund entry removed', '', UNDO); t.fund.entries = t.fund.entries.filter(function (e) { return e.id !== el.dataset.id; }); save(); renderSheet(); renderView(); },
    /* limits */
    caps: function () { var t = trip(); openSheet({ type: 'caps', d: { caps: t.caps.map(function (k) { return { cat: k.cat, amount: k.amount }; }) } }); },
    'cap-add': function () { var d = S.sheet.d, used = d.caps.map(function (k) { return k.cat; }), free = ['food', 'shopping', 'activities', 'transport', 'other', 'stay', 'flights'].filter(function (k) { return used.indexOf(k) < 0; })[0] || 'food'; d.caps.push({ cat: free, amount: '' }); renderSheet(); },
    'cap-rm': function (el) { S.sheet.d.caps.splice(+el.dataset.i, 1); renderSheet(); },
    'cap-save': function () {
      var t = trip(), seen = {};
      t.caps = S.sheet.d.caps.filter(function (k) { if (!CATS[k.cat] || !(num(k.amount) > 0) || seen[k.cat]) return false; seen[k.cat] = 1; return true; }).map(function (k) { return { cat: k.cat, amount: num(k.amount) }; });
      save(); closeSheet(); renderView(); toast('Limits saved', plural(t.caps.length, 'limit'));
    },
    /* branding */
    'br-logo-rm': function () { S.sheet.d.logo = ''; S.sheet.d.hideName = false; renderSheet(); },
    'br-hidename': function () { S.sheet.d.hideName = !S.sheet.d.hideName; renderSheet(); },
    'br-accent-reset': function () { S.sheet.d.accent = ''; applyBrand(S.sheet.d); renderSheet(); },
    'br-mascot': function () { S.sheet.d.showMascot = !S.sheet.d.showMascot; renderSheet(); },
    'br-save': function () {
      var d = S.sheet.d; if (!String(d.name || '').trim()) return sheetErr('Give the app a name.');
      BR = cleanBrand(d); var r = Store.set(APP.key + 'brand', BR); applyBrand(); S.sheet = null; renderAll();
      toast(r.ok ? 'Branding saved' : 'Branding applied, not saved', r.ok ? 'It shows on this device, for every account.' : 'This browser blocked storage, so it resets when you close the tab.');
    },
    'br-reset': function () {
      var sh = S.sheet; if (!sh.armed) { sh.armed = true; renderSheet(); return; }
      BR = cleanBrand({}); Store.remove(APP.key + 'brand'); applyBrand(); S.sheet = null; renderAll(); toast('Original branding restored');
    },
    /* version history, undo, about */
    undo: function () {
      if (!S.undo || !S.p) { toast('Nothing to undo'); return; }
      var u = S.undo; S.undo = null; clearTimeout(toastT); $('#toast-root').innerHTML = '';
      S.p = migrate(JSON.parse(u.json)); save(); S.sheet = null; renderAll();
      toast('Undone', u.label);
    },
    history: function () { openSheet({ type: 'history', d: { label: '' }, list: null }); loadHistory(); },
    'vh-quick': function () { snapshot('manual', '').then(function () { refreshVinfo(); toast('Version saved', 'Restore it any time from Version history.'); }); },
    'vh-save': function () {
      var label = String(S.sheet.d.label || '').trim().slice(0, 60);
      snapshot('manual', label).then(function () { if (S.sheet && S.sheet.type === 'history') { S.sheet.d.label = ''; loadHistory(); } toast('Version saved', label || 'Restore it any time from this list.'); });
    },
    'vh-open': function (el) { var sh = S.sheet; sh.open = sh.open === el.dataset.id ? null : el.dataset.id; renderSheet(); },
    'vh-restore': function (el) {
      var sh = S.sheet, id = el.dataset.id;
      if (sh.armed !== id) { sh.armed = id; renderSheet(); return; }
      var rec = (sh.list || []).filter(function (v) { return v.id === id; })[0]; if (!rec) return;
      var p; try { p = JSON.parse(rec.data); } catch (e) { sheetErr('This version can’t be read.'); return; }
      var demo = S.p.demo;
      checkpoint('Before restoring the version from ' + fmtWhen(rec.at), true);
      S.p = migrate(p); if (demo) S.p.demo = true;
      save(); S.sheet = null; S.tab = 'today'; renderAll(); toTop();
      toast('Version restored', 'Back to ' + fmtWhen(rec.at) + '. Your previous state is saved at the top of the list.', UNDO);
    },
    'vh-del': function (el) { var id = el.dataset.id; Versions.del(id).then(function () { if (S.sheet && S.sheet.list) S.sheet.list = S.sheet.list.filter(function (v) { return v.id !== id; }); renderSheet(); S.vinfo = null; }); },
    'vh-clear': function () {
      var sh = S.sheet; if (sh.armed !== 'all') { sh.armed = 'all'; renderSheet(); return; }
      var ids = (sh.list || []).filter(function (v) { return v.kind === 'auto'; }).map(function (v) { return v.id; });
      Versions.del(ids).then(function () { sh.armed = null; S.vinfo = null; loadHistory(); gc(); toast('Automatic versions deleted', plural(ids.length, 'version') + ' removed.'); });
    },
    about: function () { openSheet({ type: 'about' }); },
    /* photo viewer */
    lb: function (el) { S.lb = { src: el.dataset.src, i: +el.dataset.i }; renderLb(); },
    'lb-close': function (el, e) { if (e.target === el || el.classList.contains('lb-btn')) { S.lb = null; renderLb(); } },
    'lb-step': function (el) { var n = lbList().length; S.lb.i = (S.lb.i + (+el.dataset.d) + n) % n; renderLb(); }
  };

  function loadCsv(text) {
    var t = trip(), res = parseCsv(text);
    if (res.headers.length < 2 || !res.rows.length) return sheetErr('That doesn’t look like a CSV with a header row and data. Check the file and try again.');
    var mp = detectCols(res.headers), neg = mp.amount && res.rows.some(function (r) { return parseAmt(r[mp.amount]) < 0; });
    var cw = t.wallets.filter(function (w) { return w.type === 'card'; })[0] || t.wallets[0];
    openSheet({ type: 'csv', step: 'map', headers: res.headers, rows: res.rows, map: mp, sign: neg ? 'signed' : 'spend', wallet: cw ? cw.id : '', cur: t.home, keepDups: false, d: { text: '' } });
  }
  function processLogo(file) {
    if (!file || !S.sheet || S.sheet.type !== 'brand') return;
    if (!/^image\/(png|jpeg|webp|svg\+xml|gif)$/.test(file.type)) return sheetErr('Use a PNG, JPG, WebP or SVG file.');
    if (file.size > 5 * 1024 * 1024) return sheetErr('That file is over 5 MB. Use a smaller logo.');
    var fr = new FileReader();
    fr.onerror = function () { sheetErr('Couldn’t read that file. Try another one.'); };
    fr.onload = function () {
      var img = new Image();
      img.onerror = function () { sheetErr('Couldn’t read that image. Try a PNG or JPG.'); };
      img.onload = function () {
        try {
          var w = img.naturalWidth || 160, h = img.naturalHeight || 160, s = 160 / Math.max(w, h);
          if (file.type !== 'image/svg+xml') s = Math.min(1, s);
          var cw = Math.max(1, Math.round(w * s)), chh = Math.max(1, Math.round(h * s));
          var cv = document.createElement('canvas'); cv.width = cw; cv.height = chh; cv.getContext('2d').drawImage(img, 0, 0, cw, chh);
          var url = cv.toDataURL('image/png');
          try { var wp = cv.toDataURL('image/webp', 0.9); if (wp.indexOf('data:image/webp') === 0 && wp.length < url.length) url = wp; } catch (e) { }
          if (url.length > 60000) return sheetErr('That logo is still too large after shrinking. Try a simpler image.');
          S.sheet.d.logo = url; S.sheet.err = ''; renderSheet();
        } catch (e) { sheetErr('Couldn’t process that image. Try a PNG or JPG.'); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  function handleUpload(el) {
    var kind = el.dataset.upload, files = [].slice.call(el.files || []), idx = +el.dataset.i;
    el.value = '';
    if (!files.length) return;
    if (kind === 'logo') return processLogo(files[0]);
    if (kind === 'bk-docs') return handleDocs(files);
    if (kind === 'bk-cover') { var shc = S.sheet; shrink(files[0], 1600, false).then(function (b) { var id = 'ph_' + uid(); return Photos.put(id, b).then(function () { if (S.sheet === shc) { shc.d.cover = id; renderSheet(); } toast('Picture added'); }); }).catch(function () { toast('Couldn’t read that photo', 'Try a JPEG or PNG.'); }); return; }
    if (kind === 'restore-file') { var rf = new FileReader(), shr = S.sheet; rf.onload = function () { if (S.sheet !== shr) return; shr.d.text = String(rf.result || ''); shr.d.file = files[0].name; shr.err = ''; renderSheet(); }; rf.onerror = function () { sheetErr('Couldn’t read that file.'); }; rf.readAsText(files[0]); return; }
    if (kind === 'csv') { var fr = new FileReader(); fr.onload = function () { loadCsv(String(fr.result || '')); }; fr.onerror = function () { sheetErr('Couldn’t read that file.'); }; fr.readAsText(files[0]); return; }
    if (kind === 'sheet-photos') { var max = S.sheet.type === 'booking' ? 4 : 6; files = files.slice(0, Math.max(0, max - S.sheet.d.photos.length)); }
    else files = files.slice(0, 1);
    if (!files.length) return;
    var square = kind === 'avatar' || kind === 'profile-photo';
    toast(files.length > 1 ? 'Adding ' + files.length + ' photos…' : 'Adding photo…');
    Promise.all(files.map(function (f) { return shrink(f, square ? 256 : 1600, square).then(function (b) { var id = 'ph_' + uid(); return Photos.put(id, b).then(function () { return id; }); }).catch(function () { return null; }); })).then(function (ids) {
      var good = ids.filter(Boolean), bad = ids.length - good.length;
      if (good.length) {
        if (kind === 'sheet-photos' && S.sheet && S.sheet.d) { S.sheet.d.photos = S.sheet.d.photos.concat(good); renderSheet(); }
        else if (kind === 'cover' && S.sheet && S.sheet.d) { S.sheet.d.cover = good[0]; renderSheet(); }
        else if (kind === 'profile-photo' && S.sheet && S.sheet.d) { S.sheet.d.photo = good[0]; renderSheet(); }
        else if (square && S.sheet && S.sheet.d && S.sheet.d.people && S.sheet.d.people[idx]) { S.sheet.d.people[idx].photo = good[0]; renderSheet(); }
        else if (kind === 'cover-direct') { var t = trip(); if (t) { t.cover = good[0]; save(); renderView(); gc(); } }
      }
      toast(bad ? 'Couldn’t read ' + plural(bad, 'photo') : good.length > 1 ? plural(good.length, 'photo') + ' added' : 'Photo added', bad ? 'Try a JPEG or PNG.' : '');
    });
  }

  /* =========================================================
     Events
     ========================================================= */
  function setPath(o, path, v) { var ks = path.split('.'); for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = v; }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var fn = ACT[el.dataset.act];
    if (fn) fn(el, e);
  });
  var notesT;
  document.addEventListener('input', function (e) {
    var el = e.target, ds = el.dataset || {};
    if (ds.f && S.sheet && S.sheet.d) {
      setPath(S.sheet.d, ds.f, el.type === 'checkbox' ? el.checked : el.value);
      if (S.sheet.type === 'spend' && ds.f === 'amt') { var c = $('#sp-conv'); if (c) c.textContent = convText(trip(), S.sheet.d); }
      if (S.sheet.type === 'brand') { if (ds.f === 'accent') applyBrand(S.sheet.d); var pv = $('#b-preview'); if (pv) pv.innerHTML = brandPreview(S.sheet.d); }
      if (S.sheet.type === 'item' && ds.f === 'place') { var a = $('#it-dir'); if (a) a.innerHTML = dirBtn(placeQuery(trip(), el.value)); }
      if (S.sheet.type === 'booking' && (ds.f === 'address' || ds.f === 'name')) { var a2 = $('#bk-dir'), dd = S.sheet.d; if (a2) a2.innerHTML = dirBtn(placeQuery(trip(), dd.address || (dd.type !== 'flight' ? dd.name : ''))); }
    } else if (ds.a && S.auth.d) {
      var had = !!S.auth.d.pw; S.auth.d[ds.a] = el.value;
      if (ds.a === 'pw' && had !== !!el.value) { renderView(); var f = $('#c-pw'); if (f) { f.focus(); try { f.setSelectionRange(f.value.length, f.value.length); } catch (x) { } } }
    } else if (el.id === 'f-q') {
      S.filter.q = el.value; S.limit = 80; var l = $('#spend-list'); if (l) { l.innerHTML = spendList(trip()); hydrate(l); }
    } else if (ds.notes) {
      var t = trip(); if (!t) return; t.notes = el.value; var stl = $('#notes-status'); if (stl) stl.textContent = 'Saving…';
      clearTimeout(notesT); notesT = setTimeout(function () { save(); var s2 = $('#notes-status'); if (s2) s2.textContent = 'Saved on this device.'; }, 500);
    }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, ds = el.dataset || {};
    if (ds.upload) { handleUpload(el); return; }
    if (el.value === '__new' && S.sheet && (ds.f === 'wallet' || ds.f === 'paidFrom' || ds.csvwallet)) {
      el.value = ds.csvwallet ? (S.sheet.wallet || '') : (S.sheet.d[ds.f] || '');
      openWalletFrom(ds.csvwallet ? 'csv' : ds.f); return;
    }
    if (ds.f && S.sheet && S.sheet.d) {
      setPath(S.sheet.d, ds.f, el.type === 'checkbox' ? el.checked : el.value);
      if (ds.f === 'home' || ds.f === 'local') { if (S.sheet.d.home === S.sheet.d.local) S.sheet.d.rate = 1; }
      if (ds.rr) renderSheet();
      else if (S.sheet.type === 'trip' && (ds.f === 'start' || ds.f === 'end')) { /* keep focus */ }
      return;
    }
    if (ds.filter) { S.filter[ds.filter] = el.value; S.limit = 80; var l = $('#spend-list'); if (l) { l.innerHTML = spendList(trip()); hydrate(l); } return; }
    if (ds.sms != null && S.sheet && S.sheet.items) { S.sheet.items[+ds.sms].on = el.checked; renderSheet(); return; }
    if (ds.smscat != null && S.sheet && S.sheet.items) { S.sheet.items[+ds.smscat].cat = el.value; return; }
    if (ds.csvmap && S.sheet) { S.sheet.map[ds.csvmap] = el.value; renderSheet(); return; }
    if (ds.csvsign && S.sheet) { S.sheet.sign = el.value; renderSheet(); return; }
    if (ds.csvwallet && S.sheet) { S.sheet.wallet = el.value; return; }
    if (ds.mapsremember && S.sheet) { S.sheet.remember = el.checked; return; }
    if (ds.mapapp) { if (el.value) S.p.settings.mapApp = el.value; else delete S.p.settings.mapApp; save(); toast('Saved', el.value ? 'Directions open in ' + MAP_APPS[el.value].label + '.' : 'You’ll be asked each time.'); return; }
    if (ds.lockafter) { var mm = meta(); if (mm) { mm.lockAfter = +el.value; saveIndex(); toast('Saved', el.options[el.selectedIndex].text + '.'); } return; }
    if (el.id === 'pk-group') S.pkGroup = el.value;
    if (el.id === 'pk-who') S.pkWho = el.value;
  });
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target.id === 'create-form') createAccount();
    else if (e.target.id === 'signin-form') signIn(($('#si-pw') || {}).value || '');
  });
  document.addEventListener('keydown', function (e) {
    if (S.locked || (S.sheet && S.sheet.type === 'pin')) {
      if (/^\d$/.test(e.key)) { e.preventDefault(); ACT.kp({ dataset: { k: e.key } }); return; }
      if (e.key === 'Backspace') { e.preventDefault(); ACT.kp({ dataset: { k: 'del' } }); return; }
      if (S.locked) return;
    }
    if (S.pass) {
      if (e.key === 'Escape') ACT['pass-close']();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') ACT['pass-step']({ dataset: { d: e.key === 'ArrowRight' ? 1 : -1 } });
      return;
    }
    if (S.lb) {
      if (e.key === 'Escape') { S.lb = null; renderLb(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = lbList().length; S.lb.i = (S.lb.i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n; renderLb(); }
      return;
    }
    if (e.key === 'Escape' && S.sheet) { closeSheet(); return; }
    if (e.key === 'Enter' && e.target.id === 'pk-text') { e.preventDefault(); ACT['pk-add'](); return; }
    if (e.key === 'Enter' && S.sheet && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.closest('.sheet')) {
      var p = document.querySelector('.sheet [data-primary]'); if (p) { e.preventDefault(); if (e.target.dataset.f) setPath(S.sheet.d, e.target.dataset.f, e.target.value); p.click(); }
    }
  });

