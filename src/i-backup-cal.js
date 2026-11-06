  /* =========================================================
     Backups as files, with a weekly reminder
     ========================================================= */
  var BACKUP_EVERY = 7 * DAY;
  function lastBackupText() { var lb = S.p && S.p.settings.lastBackup; if (!lb) return 'Never backed up'; var d = Math.floor((Date.now() - lb) / DAY); return 'Last backup ' + (d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'); }
  function needsBackup() {
    if (!S.p || S.p.demo) return false;
    var s = S.p.settings, now = Date.now();
    if (s.backupSnooze && now < s.backupSnooze) return false;
    var hasData = S.p.trips.some(function (t) { return t.expenses.length || t.bookings.length || t.plan.length; });
    return hasData && (!s.lastBackup || now - s.lastBackup > BACKUP_EVERY);
  }
  function backupReminder() {
    if (!needsBackup()) return '';
    return '<section class="alert warn" role="status" style="align-items:flex-start"><span class="tile" style="--c:var(--warn)">' + ic('download', 18) + '</span><span class="grow"><strong>Back up your trips</strong><span class="hint">' + esc(lastBackupText()) + '. Your trips live only on this phone. Save a backup file to Files or iCloud Drive so you can get them back.</span><span class="row wrap" style="margin-top:8px"><button type="button" class="btn sm" data-act="backup-file">Save backup</button><button type="button" class="btn ghost sm" data-act="backup-snooze">Later</button></span></span></section>';
  }
  function backupName() { var d = new Date(); return slug(BR.name) + '-backup-' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '.json'; }
  function markBackedUp() { S.p.settings.lastBackup = Date.now(); delete S.p.settings.backupSnooze; save(); }
  function sheetBackupReady(sh) {
    var canShare = IS_TOP && navigator.canShare && (function () { try { return navigator.canShare({ files: [new File(['{}'], 'x.json', { type: 'application/json' })] }); } catch (e) { return false; } })();
    return sheetHead('Your backup is ready') + '<div class="lock" style="padding:0.5rem 0 0"><span class="flame" style="width:72px;height:72px">' + ic('download', 32) + '</span><h3 class="h3">' + esc(sh.name) + '</h3><p class="hint">' + esc(kb(sh.txt.length)) + ' · ' + plural(sh.trips, 'trip') + (sh.photos ? ' and ' + plural(sh.photos, 'photo or file', 'photos and files') : '') + '</p></div>' +
      (IS_TOP ? '<button type="button" class="btn block" data-act="backup-share">' + ic('download', 18) + (canShare ? ' Save to Files or iCloud Drive' : ' Download the file') + '</button>' : '<p class="notice">This preview can’t save files. Copy the backup instead, or open ' + esc(BR.name) + ' from its own web address.</p>') +
      '<button type="button" class="btn ghost block" data-act="backup-copy">' + ic('copy', 16) + ' Copy as text instead</button>' +
      '<p class="hint">' + (canShare ? 'In the share sheet, choose Save to Files, then pick iCloud Drive so it’s safe even if you lose this phone. ' : '') + 'To restore, go to More → Restore from backup and choose this file.</p>';
  }

  /* =========================================================
     Calendar export (.ics) with alerts
     ========================================================= */
  function icsEsc(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  /* Lines fold at 75 bytes of UTF-8, never splitting a character. */
  function u8len(ch) { var c = ch.codePointAt(0); return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4; }
  function icsFold(line) { var out = [], cur = '', n = 0; Array.from(line).forEach(function (ch) { var l = u8len(ch); if (n + l > 75) { out.push(cur); cur = ' '; n = 1; } cur += ch; n += l; }); out.push(cur); return out.join('\r\n'); }
  function icsStamp() { var d = new Date(); return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z'; }
  function icsDT(ds, hm) { return ds.replace(/-/g, '') + 'T' + String(hm).replace(':', '') + '00'; }
  function plusMin(ds, hm, mins) { var p = hm.split(':'), d = D(ds); d.setHours(+p[0], +p[1] + mins, 0, 0); return { ds: iso(d), hm: pad(d.getHours()) + ':' + pad(d.getMinutes()) }; }
  /* Times are "floating": they follow the phone's time zone, which is the local one while you travel. */
  function icsEvent(o) {
    var L = ['BEGIN:VEVENT', 'UID:' + o.uid + '@' + APP.id, 'DTSTAMP:' + icsStamp(), 'SUMMARY:' + icsEsc(o.title)];
    if (o.hm) { var e = plusMin(o.ds, o.hm, o.mins || 60); L.push('DTSTART:' + icsDT(o.ds, o.hm), 'DTEND:' + icsDT(e.ds, e.hm)); }
    else { L.push('DTSTART;VALUE=DATE:' + o.ds.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + addDays(o.endDs || o.ds, o.endDs ? 0 : 1).replace(/-/g, '')); L.push('TRANSP:TRANSPARENT'); }
    if (o.loc) L.push('LOCATION:' + icsEsc(o.loc));
    if (o.desc) L.push('DESCRIPTION:' + icsEsc(o.desc));
    if (o.alarm) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(o.title), 'TRIGGER:-PT' + o.alarm + 'M', 'END:VALARM');
    L.push('END:VEVENT');
    return L.map(icsFold).join('\r\n');
  }
  function icsWrap(name, events) { return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + icsEsc(BR.name) + '//Trip planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', icsFold('X-WR-CALNAME:' + icsEsc(name))].join('\r\n') + '\r\n' + events.join('\r\n') + '\r\nEND:VCALENDAR\r\n'; }
  function bookingEventsIcs(t, b) {
    var T = BKT[b.type] || BKT.other, loc = b.address || (b.type !== 'flight' ? placeQuery(t, b.name) : '');
    var desc = [T.label + (b.provider ? ' · ' + b.provider : ''), b.conf ? 'Booking code: ' + b.conf : '', b.notes ? b.notes.slice(0, 400) : '', 'From ' + BR.name + ' · ' + t.name].filter(Boolean).join('\n');
    var startAlarm = b.type === 'flight' ? 180 : b.time ? 60 : 900, out = [];
    out.push(icsEvent({ uid: b.id + '-a', title: (T.a ? T.a + ': ' : '') + b.name, ds: b.start, hm: b.time, mins: b.type === 'flight' ? 120 : 60, loc: loc, desc: desc, alarm: startAlarm }));
    if (T.hasEnd && b.end && (b.end !== b.start || b.endTime)) out.push(icsEvent({ uid: b.id + '-b', title: (T.b || 'Ends') + ': ' + b.name, ds: b.end, hm: b.endTime, mins: b.type === 'flight' ? 120 : 30, loc: loc, desc: desc, alarm: b.type === 'flight' ? 180 : b.endTime ? 60 : 900 }));
    var st = bookingState(t, b);
    if (b.due && (st.st === 'unpaid' || st.st === 'part')) out.push(icsEvent({ uid: b.id + '-due', title: 'Pay balance: ' + b.name + ' (' + money(st.left, t.home, { show: true }) + ')', ds: b.due, desc: desc, alarm: 900 }));
    return out;
  }
  function tripIcs(t) {
    var ev = [icsEvent({ uid: t.id + '-trip', title: t.name + (t.place ? ' · ' + t.place : ''), ds: t.start, endDs: addDays(t.end, 1), desc: 'Trip planned in ' + BR.name + '. ' + plural(t.people.length, 'traveller') + '.' })];
    t.bookings.forEach(function (b) { ev = ev.concat(bookingEventsIcs(t, b)); });
    t.plan.forEach(function (it) { if (!inTrip(t, it.day)) return; ev.push(icsEvent({ uid: it.id, title: it.title, ds: it.day, hm: it.time, mins: 60, loc: placeQuery(t, it.place), desc: [(PLK[it.kind] || PLK.sight).label, it.notes].filter(Boolean).join('\n'), alarm: it.time ? 30 : 0 })); });
    return icsWrap(t.name, ev);
  }
  function openIcs(text, name) {
    if (!IS_TOP) { toast('Open ' + BR.name + ' from its own web address', 'This preview can’t hand files to Calendar.'); return; }
    var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' }), u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; if (!/iPhone|iPad|Macintosh/.test(navigator.userAgent)) a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
    toast('Opening Calendar', /iPhone|iPad/.test(navigator.userAgent) ? 'Tap Add All to add the events with their alerts.' : 'Open the downloaded file to add the events to your calendar.');
  }
  function calCount(t) { var n = 1; t.bookings.forEach(function (b) { n += bookingEventsIcs(t, b).length; }); t.plan.forEach(function (it) { if (inTrip(t, it.day)) n++; }); return n; }

  Object.assign(SHEETS, { backupready: sheetBackupReady });
  Object.assign(ACT, {
    'backup-file': function () {
      toast('Preparing backup', 'Photos are included, so this can take a moment.');
      buildBackup().then(function (txt) { var o = JSON.parse(txt); hideToast(); openSheet({ type: 'backupready', txt: txt, name: backupName(), trips: (o.trips || []).length, photos: Object.keys(o.photos || {}).length }); });
    },
    'backup-share': function () {
      var sh = S.sheet, file;
      try { file = new File([sh.txt], sh.name, { type: 'application/json' }); } catch (e) { file = null; }
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: sh.name }).then(function () { markBackedUp(); closeSheet(); renderView(); toast('Backup saved', sh.name); }, function (e) { if (!e || e.name !== 'AbortError') toast('Couldn’t share the file', 'Try Copy as text instead.'); });
        return;
      }
      var u = URL.createObjectURL(new Blob([sh.txt], { type: 'application/json' })), a = document.createElement('a');
      a.href = u; a.download = sh.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
      markBackedUp(); closeSheet(); renderView(); toast('Backup downloaded', sh.name + '. Keep it somewhere safe, like iCloud Drive or Google Drive.');
    },
    'backup-copy': function () {
      var sh = S.sheet, txt = sh.txt;
      try { navigator.clipboard.writeText(txt).then(function () { markBackedUp(); closeSheet(); renderView(); toast('Backup copied', kb(txt.length) + '. Paste it somewhere safe, like a note or an email to yourself.'); }, function () { showText('Your backup', txt, kb(txt.length) + '. Tap Copy, then paste it somewhere safe.'); markBackedUp(); }); }
      catch (e) { showText('Your backup', txt, kb(txt.length) + '. Tap Copy, then paste it somewhere safe.'); markBackedUp(); }
    },
    'backup-snooze': function () { S.p.settings.backupSnooze = Date.now() + 3 * DAY; save(); renderView(); toast('Reminder in 3 days'); },
    'cal-trip': function () { var t = trip(); if (!t) return; openIcs(tripIcs(t), slug(t.name) + '.ics'); },
    'cal-booking': function (el) { var t = trip(), b = bookingById(t, el.dataset.id); if (!b) return; openIcs(icsWrap(b.name, bookingEventsIcs(t, b)), slug(b.name) + '.ics'); }
  });
