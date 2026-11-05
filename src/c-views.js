  /* =========================================================
     Sign-in screens
     ========================================================= */
  function storageBadge() {
    var m = Store.mode;
    var label = m === 'cookie' ? 'Saved in cookies' : m === 'local' ? 'Saved in local storage' : 'Not saved';
    return '<span class="badge" style="--c:' + (m === 'cookie' ? 'var(--good)' : m === 'local' ? 'var(--warn)' : 'var(--bad)') + '"><i></i>' + esc(label) + '</span>';
  }
  function renderAuth() {
    if (S.auth.mode === 'create') return renderCreate();
    if (S.auth.mode === 'signin') return renderSignin();
    var profs = S.index.profiles, cur = guessCur();
    var h = '<header class="row between">' + wordmark(BR) + storageBadge() + '</header>' +
      '<section class="welcome"><h1 class="display">Plan the trip. Enjoy the trip. Know where the money went.</h1><p class="lede">' + esc(BR.name) + ' keeps your family holiday in one place: the day-by-day plan, bookings and packing list, plus one number for what you can spend today.</p></section>' +
      '<section class="card" aria-label="Example of the daily allowance"><span class="badge" style="align-self:flex-start">Example</span>' +
      '<div class="hero-top"><div class="stack-xs"><span class="eyebrow">Safe to spend today</span><span class="num hero-num">' + esc(fmt(cur, cur === 'JPY' ? 24000 : 640, false)) + '</span></div>' + heroMark('chill', 52) + '</div>' +
      '<div class="bar"><span style="width:22%;background:' + CATS.food.color + '"></span><span style="width:12%;background:' + CATS.transport.color + '"></span></div>' +
      '<p class="bubble"><span class="mood">' + esc(moodLine('chill')) + '</span>Day 3 of 9. Tea ceremony at 2 PM.</p></section>';
    if (profs.length) {
      h += '<section class="card tight"><div class="card-head"><span class="eyebrow">On this device</span><span class="hint">' + profs.length + '</span></div><div class="rows">' +
        profs.map(function (m) { return '<button type="button" class="prow" data-act="pick" data-id="' + esc(m.id) + '">' + accAvatar(m, 42) + '<span class="grow"><strong>' + esc(m.name) + '</strong><span class="hint">' + (m.hash ? 'Locked with a password' : 'No password') + (m.demo ? ' · Example data' : '') + '</span></span>' + ic('chev', 18) + '</button>'; }).join('') +
        '</div><div class="spacer"></div></section>';
    }
    if (S.legacy && S.legacy.trips.filter(function (t) { return !t.demo; }).length) h += '<p class="notice">Found ' + plural(S.legacy.trips.filter(function (t) { return !t.demo; }).length, 'trip') + ' from the earlier version of ' + esc(BR.name) + '. They move into the first account you create.</p>';
    h += '<div class="stack"><button type="button" class="btn block" data-act="create">Create an account</button><button type="button" class="btn ghost block" data-act="demo">Try the example trip</button><button type="button" class="btn quiet sm" data-act="brand" style="align-self:center">Customise branding</button></div>';
    if (Store.note) h += '<p class="notice">' + esc(Store.note) + '</p>';
    h += '<p class="fine foot">Nothing leaves this browser. Each account is saved as JSON, compressed and split across cookies on this device, and photos stay in the browser’s photo storage. Clearing site data deletes them, so copy a backup from More now and then.</p>';
    return h;
  }
  function renderSignin() {
    var m = meta(S.auth.pick);
    if (!m) { S.auth = { mode: 'home' }; return renderAuth(); }
    return '<header class="row"><button type="button" class="icon-btn" data-act="auth-home" aria-label="Back">' + ic('back') + '</button></header>' +
      '<section class="stack" style="align-items:flex-start;padding-top:8px">' + accAvatar(m, 68) + '<h1 class="h2">' + esc(m.name) + '</h1></section>' +
      '<form id="signin-form" class="stack" novalidate><div class="field"><label for="si-pw">Password</label><input id="si-pw" class="input" type="password" autocomplete="current-password" required></div>' +
      (S.auth.err ? '<p class="error" role="alert">' + esc(S.auth.err) + '</p>' : '') +
      '<button type="submit" class="btn block">' + ic('lock', 18) + ' Unlock</button></form>' +
      '<p class="fine">Passwords are hashed and stay on this device, so they can’t be reset. If you’ve lost it, delete this account and start again.</p>' +
      '<button type="button" class="btn danger block' + (S.auth.armed ? ' armed' : '') + '" data-act="auth-del">' + (S.auth.armed ? 'Tap again to delete ' + esc(firstName(m.name)) + '’s trips' : 'Delete this account') + '</button>';
  }
  function renderCreate() {
    var d = S.auth.d;
    return '<header class="row"><button type="button" class="icon-btn" data-act="auth-home" aria-label="Back">' + ic('back') + '</button></header>' +
      '<div class="stack-xs"><h1 class="h2">Create your account</h1><p class="hint">It lives only in this browser. Add one for each person who plans trips on this device.</p></div>' +
      '<form id="create-form" class="stack" novalidate>' +
      '<div class="field"><label for="c-name">Your name</label><input id="c-name" class="input" data-a="name" autocomplete="name" value="' + esc(d.name) + '" required></div>' +
      '<div class="field"><label for="c-cur">Home currency</label><select id="c-cur" class="input" data-a="home">' + curOptions(d.home) + '</select><span class="hint">Budgets and totals show in this currency. Each trip also has a local currency.</span></div>' +
      '<div class="field"><label for="c-pw">Password <span class="muted">(optional)</span></label><input id="c-pw" class="input" type="password" data-a="pw" autocomplete="new-password" value="' + esc(d.pw) + '"><span class="hint">Leave it empty on a device only your family uses. It can’t be reset.</span></div>' +
      (d.pw ? '<div class="field"><label for="c-pw2">Confirm password</label><input id="c-pw2" class="input" type="password" data-a="pw2" autocomplete="new-password" value="' + esc(d.pw2) + '"></div>' : '') +
      (S.auth.err ? '<p class="error" role="alert">' + esc(S.auth.err) + '</p>' : '') +
      '<button type="submit" class="btn block">Create account</button></form>';
  }

  /* =========================================================
     Shared pieces
     ========================================================= */
  function header(t, title) {
    var m = meta() || { name: '' }, hide = hidden();
    return '<header class="app-head"><div class="grow">' +
      '<div class="row" style="gap:6px;min-width:0">' + (t ? '<button type="button" class="trip-btn" data-act="trips"><span class="ellip">' + esc(t.name) + '</span>' + ic('down', 14) + '</button>' : wordmark(BR, true)) + (S.p && S.p.demo ? '<span class="badge">Example</span>' : '') + '</div>' +
      '<h1>' + esc(title) + '</h1></div>' +
      '<button type="button" class="icon-btn" data-act="refresh" aria-label="Refresh">' + ic('refresh', 18) + '</button>' +
      '<button type="button" class="icon-btn" data-act="privacy" aria-pressed="' + hide + '" aria-label="' + (hide ? 'Show amounts' : 'Hide amounts') + '">' + ic(hide ? 'eyeoff' : 'eye', 18) + '</button>' +
      '<button type="button" class="av-btn" data-act="profile" aria-label="Your profile">' + accAvatar(m, 42) + '</button></header>';
  }
  function greeting() { var hr = new Date().getHours(); return (hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening') + ', ' + firstName((meta() || {}).name); }
  function coverBanner(t) {
    return '<div class="cover banner">' + (t.cover ? photoImg(t.cover, t.name) : POSTCARD) +
      '<label class="btn sm cover-act">' + ic('camera', 16) + (t.cover ? 'Change cover' : 'Add cover photo') + '<input type="file" accept="image/*" class="sr-only" data-upload="cover-direct"></label></div>';
  }
  function txnRow(t, x) {
    var foreign = x.cur !== t.home, ph = x.photos && x.photos.length, w = walletById(t, x.wallet), who = person(t, x.who), b = linked(t, x) ? bookingById(t, x.bookingId) : null;
    var tile = ph ? '<span class="tile photo">' + photoImg(x.photos[0]) + '</span>' : '<span class="tile" style="--c:' + (CATS[x.cat] || CATS.other).color + '">' + ic(CATS[x.cat] ? x.cat : 'other', 17) + '</span>';
    var meta2 = [cs(x.cat)]; if (x.time) meta2.push(fmtHM(x.time)); if (w) meta2.push(w.name); if (who) meta2.push('for ' + who.name); if (b) meta2.push('booking'); if (ph) meta2.push(plural(ph, 'photo'));
    return '<button type="button" class="txn" data-act="sp-edit" data-id="' + esc(x.id) + '">' + tile +
      '<span class="grow"><strong class="ellip">' + esc(x.note || cs(x.cat)) + '</strong><span class="hint ellip">' + esc(meta2.join(' · ')) + '</span></span>' +
      '<span class="amt"><b>' + esc(money(exHome(t, x), t.home)) + '</b>' + (foreign ? '<span>' + esc(money(x.amt, x.cur)) + '</span>' : '') + '</span></button>';
  }
  function agendaRow(t, e) {
    if (e.type === 'bk') {
      var b = e.e.b, T = BKT[b.type] || BKT.other, st = bookingState(t, b);
      var sub = [T.label]; if (b.conf) sub.push(b.conf); if (!e.e.end) sub.push(st.st === 'paid' ? 'Paid' : st.st === 'none' ? 'No total yet' : money(st.left, t.home) + ' to pay');
      return '<div class="it bk"><span class="it-time">' + (e.time ? esc(fmtHM(e.time)) : '—') + '</span><span class="tile sm" style="--c:' + CATS[T.cat].color + '">' + ic(T.icon, 15) + '</span>' +
        '<button type="button" class="it-main" data-act="bk-edit" data-id="' + esc(b.id) + '"><strong>' + esc(e.e.label) + '</strong><span class="hint ellip">' + esc(sub.join(' · ')) + '</span></button>' + dirBtn(bookingQuery(t, b), true) + '</div>';
    }
    var it = e.it, K = PLK[it.kind] || PLK.sight, sub2 = [K.label]; if (it.place) sub2.push(it.place); if (it.cost) sub2.push('≈ ' + money(plannedCost(t, it), t.home));
    return '<div class="it' + (it.done ? ' done' : '') + '"><span class="it-time">' + (it.time ? esc(fmtHM(it.time)) : '—') + '</span>' +
      '<button type="button" class="check" data-act="pl-done" data-id="' + esc(it.id) + '" aria-pressed="' + it.done + '" aria-label="' + (it.done ? 'Mark not done: ' : 'Mark done: ') + esc(it.title) + '">' + ic('check', 14) + '</button>' +
      '<button type="button" class="it-main" data-act="pl-edit" data-id="' + esc(it.id) + '"><strong>' + esc(it.title) + '</strong><span class="hint ellip">' + esc(sub2.join(' · ')) + '</span></button>' + dirBtn(placeQuery(t, it.place), true) + '</div>';
  }
  function agendaCard(t, ds, title) {
    var ag = dayAgenda(t, ds);
    return '<section class="card tight"><div class="card-head"><h2 class="h3">' + esc(title) + '</h2><button type="button" class="link" data-act="go-plan" data-day="' + ds + '">Open plan</button></div>' +
      '<div class="rows">' + (ag.length ? ag.map(function (e) { return agendaRow(t, e); }).join('') : '<div class="empty"><p class="hint">Nothing planned for this day yet.</p><button type="button" class="btn ghost sm" data-act="pl-add" data-day="' + ds + '">' + ic('plus', 16) + ' Add to the plan</button></div>') + '</div><div class="spacer"></div></section>';
  }
  function bookingAlerts(t) {
    return t.bookings.map(function (b) { return { b: b, st: bookingState(t, b) }; }).filter(function (x) { return x.st.overdue || x.st.soon; }).sort(function (a, b) { return a.b.due < b.b.due ? -1 : 1; }).slice(0, 2).map(function (x) {
      var dd = diff(today(), x.b.due);
      return '<button type="button" class="alert' + (x.st.overdue ? '' : ' warn') + '" data-act="bk-edit" data-id="' + esc(x.b.id) + '"><span class="tile" style="--c:var(--ink-2)">' + ic('calendar', 18) + '</span><span class="grow"><strong>' + esc(x.b.name) + ' · ' + esc(money(x.st.left, t.home)) + ' to pay</strong><span class="hint">' + (x.st.overdue ? 'Was due ' + plural(-dd, 'day') + ' ago' : dd === 0 ? 'Due today' : dd === 1 ? 'Due tomorrow' : 'Due in ' + plural(dd, 'day')) + '</span></span>' + ic('chev', 18) + '</button>';
    }).join('');
  }
  function capAlerts(t, c) {
    return capStatus(t, c).filter(function (x) { return x.pct >= 0.8; }).map(function (x) {
      var over = x.pct >= 1;
      return '<div class="alert' + (over ? '' : ' warn') + '" role="status"><span class="tile" style="--c:' + CATS[x.cat].color + '">' + ic(x.cat, 18) + '</span><span class="grow"><strong>' + esc(CATS[x.cat].label) + (over ? ' is over its limit' : ' is near its limit') + '</strong><span class="hint">' + esc(money(x.spent)) + ' of ' + esc(money(x.cap)) + ' · ' + (over ? esc(money(-x.left)) + ' over' : esc(money(x.left)) + ' left') + '</span></span></div>';
    }).join('');
  }
  function dayChart(t, c) {
    var cols = [], max = c.base * 1.4;
    for (var i = 0; i < c.n; i++) { var ds = addDays(t.start, i), v = c.byDay[ds] || 0; cols.push({ ds: ds, v: v, i: i + 1 }); if (v > max) max = v; }
    max = Math.max(max, 1);
    var H = 84, showAmt = c.n <= 12, st = streakInfo(t, c);
    var bars = cols.map(function (d) {
      var future = d.ds > c.td, isT = d.ds === c.td, rec = st.map[d.ds], col;
      if (isT) col = d.v > c.allowance ? 'var(--bad)' : 'var(--accent)';
      else col = rec && !rec.under ? 'var(--bad)' : 'var(--faint)';
      var bar = future && !d.v ? '<div class="dbar future"></div>' : '<div class="dbar" style="height:' + Math.max(3, Math.round(d.v / max * H)) + 'px;background:' + col + '"></div>';
      return '<div class="dcol" title="' + esc(fmtD(d.ds) + ': ' + money(d.v, t.home)) + '">' + (showAmt ? '<span class="damt">' + (d.v >= 0.5 ? esc(short(d.v)) : d.v ? '&lt;1' : '&nbsp;') + '</span>' : '') +
        '<div class="dbox">' + (c.base > 0 ? '<i class="bl" style="bottom:' + Math.round(c.base / max * H) + 'px"></i>' : '') + bar + '</div><span class="dlab' + (isT ? ' today' : '') + '">' + d.i + '</span></div>';
    }).join('');
    return '<section class="card"><div class="row between"><h2 class="h3">Day by day</h2><span class="hint">in ' + esc(t.home) + '</span></div>' +
      '<div class="days-wrap"><div class="days" role="img" aria-label="Spending per trip day against the daily base">' + bars + '</div></div>' +
      '<div class="legend"><span><i class="dash"></i>Base ' + esc(money(c.base, t.home)) + '/day</span><span><i class="sw" style="background:var(--bad)"></i>Over that day’s allowance</span><span><i class="sw" style="background:var(--accent)"></i>Today</span></div>' +
      '<p class="hint">Bookings and spends from before the trip count toward the budget but not toward any single day.</p></section>';
  }
  function photosCard(t) {
    var pics = tripPhotos(t);
    return '<section class="card"><div class="row between"><h2 class="h3">Photos</h2><span class="hint">' + plural(pics.length, 'photo') + '</span></div>' +
      (pics.length ? '<div class="photo-grid">' + pics.slice(0, 8).map(function (p, i) { return '<button type="button" data-act="lb" data-src="trip" data-i="' + i + '" aria-label="View ' + esc(p.cap) + '">' + photoImg(p.id) + (i === 7 && pics.length > 8 ? '<span class="more">+' + (pics.length - 7) + '</span>' : '') + '</button>'; }).join('') + '</div>'
        : '<p class="hint">Attach receipts, tickets or the view to any spend or booking. Photos stay on this device.</p>') + '</section>';
  }
  function spendsCard(t, list, title, emptyText) {
    return '<section class="card tight"><div class="card-head"><h2 class="h3">' + esc(title) + '</h2><span class="hint">' + plural(list.length, 'spend') + '</span></div><div class="rows">' +
      (list.length ? list.map(function (x) { return txnRow(t, x); }).join('') : '<div class="empty"><p class="hint">' + esc(emptyText) + '</p><button type="button" class="btn ghost sm" data-act="open-sms">' + ic('msg', 16) + ' Paste a bank SMS</button></div>') +
      '</div><div class="spacer"></div></section>';
  }

  /* =========================================================
     Today
     ========================================================= */
  function renderToday(t) {
    var c = calc(t), h = header(t, greeting()) + coverBanner(t);
    if (c.status === 'upcoming') return h + todayUpcoming(t, c);
    if (c.status === 'done') return h + todayDone(t, c);
    return h + todayActive(t, c);
  }
  function todayActive(t, c) {
    var mood = moodOf(c), roastOn = S.p.settings.roast, denom = Math.max(c.allowance, c.todaySpent, 1);
    var todayList = t.expenses.filter(function (x) { return x.date === c.td; }).sort(byDate).reverse();
    var last = todayList.filter(function (x) { return !linked(t, x); })[0];
    var segs = Object.keys(CATS).filter(function (k) { return c.todayCats[k]; }).map(function (k) { return '<span style="width:' + (c.todayCats[k] / denom * 100).toFixed(2) + '%;background:' + CATS[k].color + '"></span>'; }).join('');
    var bubble;
    if (roastOn) bubble = c.over ? BR.catch + ' You’re spending tomorrow’s holiday.' : last ? roastFor(last) : 'Clean slate. Make memories, not debts.';
    else bubble = c.over ? 'You’re over today’s allowance. Tomorrow adjusts automatically.' : last ? 'Last spend: ' + (last.note || cs(last.cat)) + ', ' + money(exHome(t, last), t.home) + '.' : 'Nothing logged yet today.';
    var adj = c.allowance - c.base, adjText;
    if (c.pool <= 0) adjText = 'Your bookings use up the whole budget. Raise the budget in trip details.';
    else if (Math.abs(adj) < 0.5) adjText = 'Right on your base of ' + money(c.base) + ' a day.';
    else if (adj > 0) adjText = 'Base ' + money(c.base) + ' a day, plus ' + money(adj) + ' you didn’t spend on earlier days.';
    else adjText = 'Base ' + money(c.base) + ' a day, minus ' + money(-adj) + ' to cover earlier days.';
    if (c.committed > 0.5) adjText += ' Bookings (' + money(c.committed) + ') are set aside first.';
    var left = '<section class="hero" aria-label="Today’s allowance"><div class="hero-top"><div class="stack-xs"><span class="eyebrow">' + (c.over ? 'Over today’s allowance by' : 'Safe to spend today') + '</span>' +
      '<span class="num hero-num' + (c.over ? ' over' : '') + '">' + esc(money(Math.abs(c.safe))) + '</span></div>' + heroMark(mood, 58) + '</div>' +
      '<div class="bar" role="img" aria-label="' + esc(money(c.todaySpent) + ' spent of ' + money(c.allowance)) + '">' + segs + '</div>' +
      '<div class="row between hero-foot"><span>' + esc(money(c.todaySpent)) + ' spent · Day ' + c.dayIdx + ' of ' + c.n + '</span><span class="muted">of ' + esc(money(c.allowance)) + '</span></div>' +
      '<p class="bubble"><span class="mood">' + esc(roastOn ? moodLine(mood) : (c.over ? 'Over today' : 'On track')) + '</span>' + esc(bubble) + '</p></section>' +
      '<p class="hint pad">' + esc(adjText) + '</p>' + capAlerts(t, c) + bookingAlerts(t);
    left += '<div class="duo"><div class="card mini"><span class="eyebrow">Tomorrow</span><span class="num md">' + (c.tomorrow === null ? 'Last day' : esc(money(c.tomorrow))) + '</span><span class="hint">' + (c.tomorrow === null ? 'Enjoy the trip home.' : 'If you stop spending now.') + '</span></div>' +
      '<div class="card mini"><span class="eyebrow">Left in budget</span><span class="num md"' + (c.left < 0 ? ' style="color:var(--bad)"' : '') + '>' + esc(money(c.left)) + '</span><span class="hint">' + plural(c.daysLeft, 'day') + ' to go' + (c.unpaid > 0.5 ? ', after ' + esc(money(c.unpaid)) + ' still owed on bookings' : '') + '</span></div></div>';
    var st = streakInfo(t, c), nextM = MILESTONES.filter(function (x) { return x[0] > st.current; })[0], reached = MILESTONES.filter(function (x) { return x[0] <= st.current; }).pop();
    var sText = st.current ? 'Days at or under that day’s allowance. Best: ' + st.best + '. ' + (st.todayOk ? 'Stay under today to make it ' + (st.current + 1) + '.' : 'Today is over, so this resets tomorrow.') : (st.todayOk ? 'Finish today under the allowance to start one.' : 'Today is over. Fresh start tomorrow.');
    if (nextM) sText += ' ' + plural(nextM[0] - st.current, 'more day') + ' to “' + nextM[1] + '”.';
    var prevM = reached ? reached[0] : 0, pct = nextM ? (st.current - prevM) / (nextM[0] - prevM) : 1;
    left += '<section class="card"><div class="streak"><span class="flame' + (st.current ? '' : ' cold') + '">' + ic('flame', 22) + '</span><div class="grow"><span class="streak-title">' + (st.current ? plural(st.current, 'day') + ' streak' : 'No streak yet') + (reached ? ' · ' + esc(reached[1]) : '') + '</span><span class="hint">' + esc(sText) + '</span></div></div>' +
      '<div class="prog" aria-hidden="true"><span style="width:' + Math.max(3, pct * 100).toFixed(0) + '%"></span></div></section>';
    left += dayChart(t, c);
    var right = agendaCard(t, c.td, 'Today’s plan') + spendsCard(t, todayList, 'Today’s spends', 'Nothing logged yet today. Tap + when you pay for something.') +
      '<button type="button" class="btn ghost block" data-act="recap">' + ic('moon', 18) + ' Tonight’s recap</button>' + photosCard(t);
    return '<div class="split2"><div>' + left + '</div><div>' + right + '</div></div>';
  }
  function readinessRow(icon, title, sub, pct, act, extra) {
    return '<button type="button" class="ready" data-act="' + act + '"' + (extra || '') + '><span class="tile" style="--c:var(--accent)">' + ic(icon, 18) + '</span><span class="grow"><strong>' + esc(title) + '</strong><span class="hint">' + esc(sub) + '</span>' + (pct === null ? '' : '<span class="prog" style="margin-top:6px"><span style="width:' + Math.max(2, Math.min(100, pct * 100)).toFixed(0) + '%"></span></span>') + '</span>' + ic('chev', 18) + '</button>';
  }
  function todayUpcoming(t, c) {
    var days = diff(c.td, t.start), planned = t.plan.filter(function (it) { return inTrip(t, it.day); }).length, daysWith = {};
    t.plan.forEach(function (it) { if (inTrip(t, it.day)) daysWith[it.day] = 1; });
    var packed = t.packing.filter(function (k) { return k.done; }).length, saved = fundSaved(t), target = fundTarget(t);
    var left = '<section class="hero"><div class="hero-top"><div class="stack-xs"><span class="eyebrow">Your trip starts</span><span class="num hero-num">' + (days === 1 ? 'Tomorrow' : esc(plural(days, 'day')) + '</span><span class="hint">to go · ' + esc(range(t))) + '</span></div>' + heroMark('chill', 58) + '</div>' +
      '<p class="bubble"><span class="mood">' + esc(moodLine('chill')) + '</span>' + esc((t.place ? t.place + ' with ' : 'With ') + (t.people.length ? plural(t.people.length, 'traveller') : 'you') + ', ' + plural(c.n, 'day') + '.') + '</p></section>';
    left += '<div class="duo"><div class="card mini"><span class="eyebrow">Daily budget there</span><span class="num md">' + esc(money(c.base)) + '</span><span class="hint">After bookings and spends so far.</span></div>' +
      '<div class="card mini"><span class="eyebrow">Booked</span><span class="num md">' + esc(money(c.committed)) + '</span><span class="hint">' + (c.unpaid > 0.5 ? esc(money(c.unpaid)) + ' still to pay' : 'All paid') + '</span></div></div>';
    left += '<section class="card tight"><div class="card-head"><h2 class="h3">Getting ready</h2></div><div class="rows">' +
      readinessRow('calendar', 'Bookings', t.bookings.length ? plural(t.bookings.length, 'booking') + (c.unpaid > 0.5 ? ' · ' + money(c.unpaid) + ' to pay' : ' · all paid') : 'Add flights, stays and tickets', null, 'go-plan', ' data-seg="bookings"') +
      readinessRow('map', 'Itinerary', planned ? plural(planned, 'plan') + ' across ' + Object.keys(daysWith).length + ' of ' + plural(c.n, 'day') : 'Plan what to do each day', c.n ? Object.keys(daysWith).length / c.n : 0, 'go-plan', ' data-seg="itinerary"') +
      readinessRow('bag', 'Packing', t.packing.length ? packed + ' of ' + plural(t.packing.length, 'item') + ' packed' : 'Start a packing list', t.packing.length ? packed / t.packing.length : 0, 'go-plan', ' data-seg="packing"') +
      readinessRow('target', 'Trip fund', money(saved) + ' of ' + money(target) + ' saved', target ? saved / target : 0, 'fund') +
      '</div><div class="spacer"></div></section>';
    var pre = t.expenses.slice().sort(byDate).reverse().slice(0, 5);
    var right = bookingAlerts(t) + agendaCard(t, t.start, 'Day 1 · ' + fmtD(t.start)) + spendsCard(t, pre, 'Spends so far', 'Nothing spent yet. Log deposits and visas as you pay them.') + photosCard(t);
    return '<div class="split2"><div>' + left + '</div><div>' + right + '</div></div>';
  }
  function todayDone(t, c) {
    var maxDay = null; Object.keys(c.byDay).forEach(function (k) { if (!maxDay || c.byDay[k] > c.byDay[maxDay]) maxDay = k; });
    var spent = c.total + c.unpaid, overB = spent > c.budget;
    var left = '<section class="hero"><div class="hero-top"><div class="stack-xs"><span class="eyebrow">Trip total</span><span class="num hero-num">' + esc(money(spent)) + '</span></div><span class="pill info">Finished</span></div>' +
      '<p class="bubble"><span class="mood">' + esc(overB ? 'Over budget' : 'Under budget') + '</span>' + esc((overB ? money(spent - c.budget) + ' over' : money(c.budget - spent) + ' under') + ' your ' + money(c.budget) + ' budget. ' + money(c.free / c.n) + ' a day on top of bookings.') + '</p></section>' +
      '<div class="duo"><div class="card mini"><span class="eyebrow">Biggest day</span><span class="num md">' + (maxDay ? esc(money(c.byDay[maxDay])) : '—') + '</span><span class="hint">' + (maxDay ? 'Day ' + (diff(t.start, maxDay) + 1) + ' · ' + esc(fmtD(maxDay)) : 'No spends on trip days') + '</span></div>' +
      '<div class="card mini"><span class="eyebrow">Per person</span><span class="num md">' + esc(money(spent / Math.max(t.people.length, 1))) + '</span><span class="hint">' + plural(Math.max(t.people.length, 1), 'traveller') + '</span></div></div>' + dayChart(t, c);
    var right = catCard(t, c) + photosCard(t) + '<button type="button" class="btn block" data-act="share">' + ic('share', 18) + ' Share trip summary</button>';
    return '<div class="split2"><div>' + left + '</div><div>' + right + '</div></div>';
  }
  function catCard(t, c) {
    var keys = Object.keys(CATS).filter(function (k) { return c.byCat[k]; }).sort(function (a, b) { return c.byCat[b] - c.byCat[a]; });
    var top = keys.length ? c.byCat[keys[0]] : 1;
    return '<section class="card tight"><div class="card-head"><h2 class="h3">Where it went</h2><span class="hint">' + esc(money(c.total)) + '</span></div><div class="rows">' +
      (keys.length ? keys.map(function (k) {
        return '<div class="crow"><span class="tile" style="--c:' + CATS[k].color + '">' + ic(k, 17) + '</span><div class="grow"><div class="row between"><span>' + esc(CATS[k].label) + '</span><span class="tnum">' + esc(money(c.byCat[k])) + '</span></div>' +
          '<div class="row"><div class="cbar" style="--c:' + CATS[k].color + '"><span style="width:' + (c.byCat[k] / top * 100).toFixed(1) + '%"></span></div><span class="hint" style="width:3em;text-align:right">' + Math.round(c.byCat[k] / Math.max(c.total, 1) * 100) + '%</span></div></div></div>';
      }).join('') : '<div class="empty"><p class="hint">Categories appear after your first spend.</p></div>') + '</div><div class="spacer"></div></section>';
  }

  /* =========================================================
     Plan: itinerary, bookings, packing, notes
     ========================================================= */
  function renderPlan(t) {
    var seg = S.planSeg, segs = [['itinerary', 'Itinerary'], ['bookings', 'Bookings'], ['packing', 'Packing'], ['notes', 'Notes']];
    var h = header(t, 'Plan') + '<div class="seg" role="group" aria-label="Plan section">' + segs.map(function (x) { return '<button type="button" data-act="plan-seg" data-seg="' + x[0] + '" aria-pressed="' + (seg === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>';
    if (seg === 'bookings') return h + '<div class="narrow">' + planBookings(t) + '</div>';
    if (seg === 'packing') return h + '<div class="narrow">' + planPacking(t) + '</div>';
    if (seg === 'notes') return h + '<div class="narrow">' + planNotes(t) + '</div>';
    return h + '<div class="narrow">' + planItinerary(t) + '</div>';
  }
  function planItinerary(t) {
    var c = calc(t), td = today(), out = '', totalPlanned = 0;
    t.plan.forEach(function (it) { if (inTrip(t, it.day)) totalPlanned += plannedCost(t, it); });
    out += '<p class="hint pad">' + plural(c.n, 'day') + ' · ' + esc(range(t)) + (totalPlanned ? ' · ≈ ' + esc(money(totalPlanned)) + ' of activities and meals planned' : '') + '. Tick things off as you go.</p>';
    for (var i = 0; i < c.n; i++) {
      var ds = addDays(t.start, i), ag = dayAgenda(t, ds), isT = ds === td, planned = 0;
      t.plan.forEach(function (it) { if (it.day === ds) planned += plannedCost(t, it); });
      var spent = c.byDay[ds] || 0, info = [];
      if (planned) info.push('≈ ' + money(planned) + ' planned');
      if (spent) info.push(money(spent) + ' spent');
      out += '<section class="card tight day-card' + (isT ? ' today' : '') + '" id="day-' + ds + '"><div class="day-top"><div class="grow"><span class="eyebrow"' + (isT ? ' style="color:var(--accent)"' : '') + '>Day ' + (i + 1) + (isT ? ' · Today' : '') + '</span><h2 class="h3">' + esc(fmtD(ds, { weekday: 'long', day: 'numeric', month: 'short' })) + '</h2></div><span class="hint" style="text-align:right">' + esc(info.join(' · ')) + '</span></div>' +
        '<div class="rows">' + ag.map(function (e) { return agendaRow(t, e); }).join('') + '</div>' +
        '<button type="button" class="add-row" data-act="pl-add" data-day="' + ds + '">' + ic('plus', 16) + ' Add to Day ' + (i + 1) + '</button></section>';
    }
    var ideas = t.plan.filter(function (it) { return !inTrip(t, it.day); });
    out += '<section class="card tight"><div class="day-top"><div class="grow"><span class="eyebrow">Not on a day yet</span><h2 class="h3">Ideas</h2></div><span class="hint">' + plural(ideas.length, 'idea') + '</span></div><div class="rows">' +
      ideas.map(function (it) { return agendaRow(t, { type: 'plan', time: it.time, it: it }); }).join('') +
      '</div>' + (ideas.length ? '' : '<p class="hint" style="padding:0 0 10px">Places you might fit in. Move them onto a day when you decide.</p>') +
      '<button type="button" class="add-row" data-act="pl-add" data-day="">' + ic('plus', 16) + ' Add an idea</button></section>';
    return out;
  }
  function planBookings(t) {
    var tot = 0, paid = 0, left = 0;
    var list = t.bookings.map(function (b) { var st = bookingState(t, b); tot += st.tot; paid += Math.min(st.paid, st.tot); left += st.left; return { b: b, st: st }; }).sort(function (a, b) { return (a.b.start + a.b.time) < (b.b.start + b.b.time) ? -1 : 1; });
    var h = '<div class="duo"><div class="card mini"><span class="eyebrow">Booked</span><span class="num md">' + esc(money(tot)) + '</span><span class="hint">' + plural(t.bookings.length, 'booking') + '</span></div><div class="card mini"><span class="eyebrow">Still to pay</span><span class="num md"' + (left > 0.5 ? '' : ' style="color:var(--good)"') + '>' + esc(money(left)) + '</span><span class="hint">' + esc(money(paid)) + ' paid so far</span></div></div>';
    h += '<section class="card tight"><div class="rows">' + (list.length ? list.map(function (x) {
      var b = x.b, st = x.st, T = BKT[b.type] || BKT.other;
      var when = fmtD(b.start, { day: 'numeric', month: 'short' }) + (b.time ? ' ' + fmtHM(b.time) : '') + (b.end && b.end !== b.start ? ' – ' + fmtD(b.end, { day: 'numeric', month: 'short' }) : '');
      var pill = st.st === 'none' ? '<span class="pill info">No total yet</span>' : st.st === 'paid' ? '<span class="pill good">Paid</span>' : st.overdue ? '<span class="pill bad">Overdue</span>' : st.st === 'part' ? '<span class="pill warn">Part paid</span>' : '<span class="pill info">Not paid</span>';
      return '<button type="button" class="txn" data-act="bk-edit" data-id="' + esc(b.id) + '"><span class="tile photo bk-thumb">' + (b.cover ? photoImg(b.cover) : bookingArt(b.type)) + '</span><span class="grow"><strong class="ellip">' + esc(b.name) + '</strong><span class="hint ellip">' + esc(T.label + ' · ' + when) + '</span>' + (b.conf ? '<span style="margin-top:4px"><span class="conf">' + esc(b.conf) + '</span></span>' : '') + '</span>' +
        '<span class="amt"><b>' + esc(money(st.tot)) + '</b>' + pill + '</span></button>';
    }).join('') : '<div class="empty"><p>No bookings yet.</p><p class="hint">Add flights, stays, car hire and tickets. They show on the right days of your itinerary, and their cost is set aside before your daily allowance.</p></div>') + '</div><div class="spacer"></div></section>';
    h += '<button type="button" class="btn ghost block" data-act="bk-add">' + ic('plus', 18) + ' Add a booking</button>';
    if (t.bookings.length) h = '<button type="button" class="alert info" data-act="pass-open" data-id=""><span class="tile" style="--c:var(--ink)">' + ic('wallet', 18) + '</span><span class="grow"><strong>Travel wallet</strong><span class="hint">Your bookings as passes with QR codes. Works offline.</span></span>' + ic('chev', 18) + '</button>' + h;
    return h;
  }
  function planPacking(t) {
    var total = t.packing.length, done = t.packing.filter(function (k) { return k.done; }).length;
    var h = '<section class="card"><div class="row between"><div class="grow"><span class="eyebrow">Packed</span><span class="num md">' + done + ' of ' + total + '</span></div>' + (total ? ring(done / total, 56) : '') + '</div>' +
      '<div class="pk-add"><input id="pk-text" class="input" placeholder="Add an item, e.g. Sunglasses" aria-label="New packing item" maxlength="60"><button type="button" class="btn" data-act="pk-add">Add</button></div>' +
      '<div class="grid2"><select id="pk-group" class="input" aria-label="Group for the new item">' + PACK_GROUPS.map(function (g) { return '<option value="' + g + '"' + (S.pkGroup === g ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select>' +
      '<select id="pk-who" class="input" aria-label="Who it’s for"><option value="">Whole family</option>' + t.people.map(function (p) { return '<option value="' + esc(p.id) + '"' + (S.pkWho === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></div></section>';
    PACK_GROUPS.forEach(function (g) {
      var items = t.packing.filter(function (k) { return k.group === g; });
      if (!items.length) return;
      h += '<section class="card tight"><div class="card-head"><h2 class="h3">' + esc(g) + '</h2><span class="hint">' + items.filter(function (k) { return k.done; }).length + ' of ' + items.length + '</span></div><div class="rows">' +
        items.map(function (k) {
          var who = person(t, k.who);
          return '<div class="pk' + (k.done ? ' done' : '') + '"><button type="button" class="check" data-act="pk-toggle" data-id="' + esc(k.id) + '" aria-pressed="' + k.done + '" aria-label="' + (k.done ? 'Unpack ' : 'Pack ') + esc(k.text) + '">' + ic('check', 14) + '</button><span class="txt">' + esc(k.text) + '</span>' + (who ? avatar(who, 22) : '<span></span>') + '<button type="button" class="icon-btn sm" data-act="pk-del" data-id="' + esc(k.id) + '" aria-label="Remove ' + esc(k.text) + '" style="border:0">' + ic('x', 14) + '</button></div>';
        }).join('') + '</div><div class="spacer"></div></section>';
    });
    if (!total) h += '<section class="card"><p>Your packing list is empty.</p><p class="hint">Start with a family checklist and edit it, or add your own items above.</p></section>';
    h += '<div class="row wrap"><button type="button" class="btn quiet sm" data-act="pk-template">' + ic('bag', 16) + ' Add family essentials</button>' + (done ? '<button type="button" class="btn quiet sm" data-act="pk-reset">Untick all for the trip home</button>' : '') + '</div>';
    return h;
  }
  function planNotes(t) {
    return '<section class="card"><label class="label" for="trip-notes">Trip notes</label><textarea id="trip-notes" class="input" data-notes="1" style="min-height:280px" placeholder="Hotel addresses, emergency numbers, visa details, things to remember…">' + esc(t.notes) + '</textarea><span class="hint" id="notes-status">Saved on this device as you type.</span></section>';
  }

  /* =========================================================
     Spends
     ========================================================= */
  function renderSpends(t) {
    var c = calc(t), f = S.filter;
    var wopts = '<option value="all">All wallets</option>' + t.wallets.map(function (w) { return '<option value="' + esc(w.id) + '"' + (f.wallet === w.id ? ' selected' : '') + '>' + esc(w.name) + '</option>'; }).join('');
    var copts = '<option value="all">All categories</option>' + Object.keys(CATS).map(function (k) { return '<option value="' + k + '"' + (f.cat === k ? ' selected' : '') + '>' + esc(CATS[k].label) + '</option>'; }).join('');
    return header(t, 'Spends') + '<div class="narrow">' +
      '<div class="row wrap"><button type="button" class="btn quiet sm" data-act="open-sms">' + ic('msg', 16) + 'Paste bank SMS</button><button type="button" class="btn quiet sm" data-act="open-csv">' + ic('upload', 16) + 'Import CSV</button><button type="button" class="btn quiet sm" data-act="csv">' + ic('download', 16) + 'Export CSV</button><button type="button" class="btn quiet sm" data-act="share">' + ic('share', 16) + 'Share summary</button></div>' +
      '<p class="hint pad">' + plural(t.expenses.length, 'spend') + ' · ' + esc(money(c.total)) + ' in total</p>' +
      '<label class="input row" style="border-radius:999px;gap:8px;color:var(--muted)">' + ic('search', 17) + '<input id="f-q" type="search" placeholder="Search what you bought" aria-label="Search spends" value="' + esc(f.q) + '" style="flex:1;min-width:0;border:0;background:transparent;outline:none;font-size:max(16px,1rem);color:var(--ink)"></label>' +
      '<div class="duo"><select id="f-wallet" class="input" data-filter="wallet" aria-label="Filter by wallet">' + wopts + '</select><select id="f-cat" class="input" data-filter="cat" aria-label="Filter by category">' + copts + '</select></div>' +
      '<div id="spend-list">' + spendList(t) + '</div></div>';
  }
  function spendList(t) {
    var f = S.filter, q = f.q.trim().toLowerCase();
    var list = t.expenses.filter(function (x) { return (f.cat === 'all' || x.cat === f.cat) && (f.wallet === 'all' || x.wallet === f.wallet) && (!q || String(x.note || '').toLowerCase().indexOf(q) >= 0 || cs(x.cat).toLowerCase().indexOf(q) >= 0); });
    if (!list.length) return '<section class="card"><div class="empty"><p class="hint">' + (t.expenses.length ? 'No spends match these filters.' : 'No spends yet. Tap + to log the first one, or paste a bank SMS.') + '</p></div></section>';
    list.sort(byDate).reverse();
    var shown = list.slice(0, S.limit), groups = [], cur = null;
    shown.forEach(function (x) { var k = x.date < t.start ? 'pre' : x.date; if (!cur || cur.k !== k) { cur = { k: k, items: [], sum: 0 }; groups.push(cur); } cur.items.push(x); cur.sum += exHome(t, x); });
    var h = '<section class="card tight">' + groups.map(function (g) {
      var label = g.k === 'pre' ? 'Before the trip' : (g.k > t.end ? 'After the trip · ' : 'Day ' + (diff(t.start, g.k) + 1) + ' · ') + fmtD(g.k);
      return '<div class="day-head"><span class="eyebrow">' + esc(label) + '</span><span class="hint tnum">' + esc(money(g.sum)) + '</span></div><div class="rows">' + g.items.map(function (x) { return txnRow(t, x); }).join('') + '</div>';
    }).join('') + '<div class="spacer"></div></section>';
    if (list.length > shown.length) h += '<button type="button" class="btn quiet block" data-act="more">Show ' + Math.min(80, list.length - shown.length) + ' more</button>';
    return h;
  }

  /* =========================================================
     Insights
     ========================================================= */
  function renderInsights(t) {
    var c = calc(t), h = header(t, 'Insights'), left = '', right = '';
    var spentSoFar = 0; Object.keys(c.byDay).forEach(function (k) { if (k <= c.td) spentSoFar += c.byDay[k]; });
    if (c.status === 'active') {
      var avg = spentSoFar / c.dayIdx, projected = c.pre + c.committed + avg * c.n, diffB = c.budget - projected;
      left += '<section class="hero" style="gap:14px"><span class="eyebrow">Day ' + c.dayIdx + ' of ' + c.n + ' · at this pace</span><div class="row wrap" style="align-items:baseline;gap:10px"><span class="num hero-num">' + esc(money(projected)) + '</span><span class="hint">for the whole trip</span></div>' +
        '<div class="prog"><span class="' + (projected > c.budget ? 'over' : '') + '" style="width:' + Math.min(100, c.budget ? projected / c.budget * 100 : 100).toFixed(1) + '%"></span></div>' +
        '<p style="color:var(--ink-2)">You’re averaging ' + esc(money(avg)) + ' a day on top of bookings. That ends <span style="color:' + (diffB < 0 ? 'var(--bad)' : 'var(--good)') + ';font-weight:500">' + esc(money(Math.abs(diffB))) + (diffB < 0 ? ' over' : ' under') + '</span> your ' + esc(money(c.budget)) + ' budget.</p></section>';
    } else if (c.status === 'upcoming') {
      left += '<section class="hero" style="gap:14px"><span class="eyebrow">Before you go</span><div class="row wrap" style="align-items:baseline;gap:10px"><span class="num hero-num">' + esc(money(c.committed + c.pre)) + '</span><span class="hint">committed of ' + esc(money(c.budget)) + '</span></div>' +
        '<div class="prog"><span style="width:' + Math.min(100, c.budget ? (c.committed + c.pre) / c.budget * 100 : 0).toFixed(1) + '%"></span></div>' +
        '<p style="color:var(--ink-2)">' + esc(money(c.committed)) + ' in bookings and ' + esc(money(c.pre)) + ' already spent leaves ' + esc(money(Math.max(c.pool - c.pre, 0))) + ', or ' + esc(money(c.base)) + ' a day for ' + plural(c.n, 'day') + '.</p></section>';
    } else {
      var spent = c.total + c.unpaid;
      left += '<section class="hero" style="gap:14px"><span class="eyebrow">The whole trip</span><span class="num hero-num">' + esc(money(spent)) + '</span><p style="color:var(--ink-2)">' + esc(spent > c.budget ? money(spent - c.budget) + ' over' : money(c.budget - spent) + ' under') + ' your ' + esc(money(c.budget)) + ' budget, or ' + esc(money(spent / Math.max(t.people.length, 1))) + ' per person.</p></section>';
    }
    var free = {}, cnt = {};
    t.expenses.forEach(function (x) { if (linked(t, x)) return; free[x.cat] = (free[x.cat] || 0) + exHome(t, x); cnt[x.cat] = (cnt[x.cat] || 0) + 1; });
    var fk = Object.keys(free).sort(function (a, b) { return free[b] - free[a]; });
    if (fk.length) {
      var k0 = fk[0], a0 = free[k0];
      left += '<section class="leak"><span class="eyebrow">Biggest day-to-day spend</span><h2 class="h2">' + esc(CATS[k0].label) + '</h2><p style="color:var(--ink-2)">' + esc(money(a0)) + ' across ' + plural(cnt[k0], 'spend') + ', averaging ' + esc(money(a0 / cnt[k0])) + ' each.</p>' +
        (c.daysLeft > 0 ? '<p class="keep">Trimming it by a quarter for the rest of the trip would keep about ' + esc(money(a0 / Math.max(c.dayIdx || c.n, 1) * c.daysLeft / 4)) + '.' + (t.caps.some(function (x) { return x.cat === k0; }) ? '' : ' You can set a limit for it in More.') + '</p>' : '') + '</section>';
    }
    left += dayChart(t, c);
    var keys = Object.keys(CATS).filter(function (k) { return c.byCat[k]; }).sort(function (a, b) { return c.byCat[b] - c.byCat[a]; });
    if (keys.length) {
      var acc = 0, stops = keys.map(function (k) { var a = acc; acc += c.byCat[k] / c.total * 100; return CATS[k].color + ' ' + a.toFixed(2) + '% ' + acc.toFixed(2) + '%'; }).join(', ');
      right += '<section class="card"><span class="label">By category</span><div class="donut" style="background:conic-gradient(' + stops + ')" role="img" aria-label="Share of spending by category"><div class="donut-center"><span class="eyebrow">Spent</span><span class="num md">' + esc(money(c.total, t.home, { compact: c.total >= 100000 })) + '</span></div></div><div class="rows">' +
        keys.map(function (k) {
          var cap = (t.caps.filter(function (x) { return x.cat === k; })[0] || {}).amount, a = c.byCat[k], overCap = cap && a > cap, pct = cap ? Math.min(100, a / cap * 100) : a / c.byCat[keys[0]] * 100;
          return '<div class="crow"><span class="tile" style="--c:' + CATS[k].color + '">' + ic(k, 17) + '</span><div class="grow"><div class="row between"><span>' + esc(CATS[k].label) + '</span><span class="tnum">' + esc(money(a)) + '</span></div><div class="cbar" style="--c:' + (overCap ? 'var(--bad)' : CATS[k].color) + '"><span style="width:' + pct.toFixed(1) + '%"></span></div><span class="hint" style="margin-top:4px">' + (cap ? 'Limit ' + esc(money(cap)) + (overCap ? ', ' + esc(money(a - cap)) + ' over' : ', ' + esc(money(cap - a)) + ' left') : Math.round(a / c.total * 100) + '% of spending') + '</span></div></div>';
        }).join('') + '</div></section>';
    }
    var plan = {}, act = c.byCat;
    t.plan.forEach(function (it) { if (it.cost && inTrip(t, it.day)) { var k = (PLK[it.kind] || PLK.sight).cat; plan[k] = (plan[k] || 0) + plannedCost(t, it); } });
    t.bookings.forEach(function (b) { var k = (BKT[b.type] || BKT.other).cat; plan[k] = (plan[k] || 0) + bookingHome(t, b); });
    var pk = Object.keys(CATS).filter(function (k) { return plan[k] || act[k]; });
    if (Object.keys(plan).length) {
      right += '<section class="card tight"><div class="card-head"><h2 class="h3">Plan against actual</h2><span class="hint">bookings + itinerary estimates</span></div><div class="rows">' + pk.map(function (k) {
        var p = plan[k] || 0, a = act[k] || 0, d2 = a - p;
        return '<div class="crow"><span class="tile" style="--c:' + CATS[k].color + '">' + ic(k, 17) + '</span><div class="grow"><span>' + esc(CATS[k].label) + '</span><span class="hint">Planned ' + esc(money(p)) + ' · spent ' + esc(money(a)) + '</span></div><span class="pill ' + (p === 0 ? 'info' : d2 > 0.5 ? 'warn' : 'good') + '">' + (p === 0 ? 'Unplanned' : d2 > 0.5 ? '+' + esc(money(d2)) : esc(money(-d2)) + ' to go') + '</span></div>';
      }).join('') + '</div><div class="spacer"></div></section>';
    }
    var byWho = {}; t.expenses.forEach(function (x) { if (x.who) byWho[x.who] = (byWho[x.who] || 0) + exHome(t, x); });
    var whoKeys = Object.keys(byWho).filter(function (id) { return person(t, id); });
    if (whoKeys.length) {
      right += '<section class="card tight"><div class="card-head"><h2 class="h3">Spends for one person</h2><span class="hint">the rest is for the whole family</span></div><div class="rows">' + whoKeys.sort(function (a, b) { return byWho[b] - byWho[a]; }).map(function (id) { var p = person(t, id); return '<div class="crow">' + avatar(p, 32) + '<span class="grow">' + esc(p.name) + '</span><span class="tnum">' + esc(money(byWho[id])) + '</span></div>'; }).join('') + '</div><div class="spacer"></div></section>';
    }
    if (t.local !== t.home && c.total) {
      var loc = t.expenses.reduce(function (s, x) { return x.cur === t.local ? s + exHome(t, x) : s; }, 0);
      right += '<section class="card"><div class="row between"><span class="label">Paid in ' + esc(t.local) + '</span><span class="tnum">' + Math.round(loc / c.total * 100) + '%</span></div><div class="prog"><span style="width:' + (loc / c.total * 100).toFixed(1) + '%"></span></div><p class="hint">' + esc(money(loc)) + ' in ' + esc(t.local) + ', ' + esc(money(c.total - loc)) + ' in ' + esc(t.home) + '. Converted at ' + esc(rateText(t)) + ' unless a spend saved its own rate.</p></section>';
    }
    right += '<button type="button" class="btn ghost block" data-act="share">' + ic('share', 18) + ' Share trip summary</button>';
    return h + '<div class="split2"><div>' + left + '</div><div>' + right + '</div></div>';
  }

  /* =========================================================
     More: trip, money, appearance, data, account
     ========================================================= */
  function renderMore(t) {
    var m = meta() || {}, s = S.p.settings, u = Store.usage('jt_p_' + S.pid, S.p), left = '', right = '';
    if (t) {
      var c = calc(t), saved = fundSaved(t), target = fundTarget(t);
      left += '<section class="card"><div class="cover mini">' + (t.cover ? photoImg(t.cover) : POSTCARD) + '</div><div class="row between" style="align-items:flex-start"><div class="grow"><h2 class="h3" style="font-size:var(--t-lg);font-weight:300">' + esc(t.name) + '</h2><span class="hint">' + esc((t.place ? t.place + ' · ' : '') + range(t)) + '</span><span class="hint">Budget ' + esc(money(c.budget)) + (t.local !== t.home ? ' · ' + esc(rateText(t)) : '') + '</span></div><span class="av-stack">' + t.people.slice(0, 5).map(function (p) { return avatar(p, 26); }).join('') + '</span></div>' +
        '<div class="duo"><button type="button" class="btn quiet sm" data-act="trip-edit">' + ic('edit', 16) + 'Trip details</button><button type="button" class="btn quiet sm" data-act="trips">' + ic('map', 16) + 'All trips</button></div></section>';
      left += '<section class="card tight"><div class="card-head"><h2 class="h3">Wallets</h2><button type="button" class="link" data-act="wl-add">Add</button></div><div class="rows">' + t.wallets.map(function (w) {
        var bal = walletBal(t, w), T = WTYPES[w.type] || WTYPES.card, spentOnly = !num(w.opening);
        var big = spentOnly ? money(-bal, w.cur) : money(bal, w.cur), small = spentOnly ? 'spent' : 'left of ' + money(w.opening, w.cur);
        return '<button type="button" class="txn" data-act="wl-edit" data-id="' + esc(w.id) + '"><span class="tile" style="--c:var(--ink-2)">' + ic(T.icon, 17) + '</span><span class="grow"><strong>' + esc(w.name) + '</strong><span class="hint">' + esc(T.label + ' · ' + w.cur) + '</span></span><span class="amt"><b' + (!spentOnly && bal < 0 ? ' style="color:var(--bad)"' : '') + '>' + esc(big) + '</b><span>' + esc(small) + '</span></span></button>';
      }).join('') + '</div><p class="hint" style="padding:0 0 12px">Cash and travel cards show what’s left of the starting amount. Cards with no starting amount show what you’ve spent on them.</p></section>';
      left += '<section class="card"><div class="goal">' + ring(target ? saved / target : 0, 64) + '<div class="grow"><span class="h3">Trip fund</span><span class="hint">' + esc(money(saved)) + ' saved of ' + esc(money(target)) + '</span><span class="hint">' + esc(fundEta(t, saved, target)) + '</span></div></div><div class="duo"><button type="button" class="btn sm" data-act="fund">Add savings</button><button type="button" class="btn ghost sm" data-act="fund">Edit</button></div></section>';
      left += '<section class="card tight"><div class="card-head"><h2 class="h3">Category limits</h2><button type="button" class="link" data-act="caps">Edit</button></div><div class="rows">' +
        (t.caps.length ? capStatus(t, c).map(function (x) { return '<div class="crow"><span class="tile" style="--c:' + CATS[x.cat].color + '">' + ic(x.cat, 17) + '</span><div class="grow"><div class="row between"><span>' + esc(CATS[x.cat].label) + '</span><span class="tnum">' + esc(money(x.spent)) + ' / ' + esc(money(x.cap)) + '</span></div><div class="cbar" style="--c:' + (x.pct >= 1 ? 'var(--bad)' : CATS[x.cat].color) + '"><span style="width:' + Math.min(100, x.pct * 100).toFixed(1) + '%"></span></div></div></div>'; }).join('') : '<p class="hint" style="padding:6px 0 14px">A cap for the categories that run away, like food or shopping. You get a warning at 80% and when you cross it.</p>') +
        '</div><div class="spacer"></div></section>';
    }
    right += '<section class="card"><span class="label">Appearance</span>' +
      '<div class="field"><span class="hint">Theme</span><div class="seg" role="group" aria-label="Theme">' + [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']].map(function (o) { return '<button type="button" data-act="theme" data-v="' + o[0] + '" aria-pressed="' + (s.theme === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><span class="hint">Text size</span><div class="seg" role="group" aria-label="Text size">' + [['device', 'Device'], ['small', 'Smaller'], ['large', 'Larger']].map(function (o) { return '<button type="button" data-act="ts" data-v="' + o[0] + '" aria-pressed="' + (s.ts === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div><span class="hint">Device follows the text size set on your phone or browser.</span></div>' +
      '<div class="setrow"><div class="grow"><span class="label" id="hide-lbl">Hide amounts</span><span class="hint">Shows •••• instead of numbers. The eye at the top does the same.</span></div><button type="button" class="switch" role="switch" aria-labelledby="hide-lbl" aria-checked="' + !!s.hide + '" data-act="privacy"><span></span></button></div>' +
      '<div class="setrow"><div class="grow"><span class="label" id="roast-lbl">Cheeky comments</span><span class="hint">' + esc(BR.showMascot ? BR.mascotName : BR.name) + ' teases your spending. Turn off for plain messages.</span></div><button type="button" class="switch" role="switch" aria-labelledby="roast-lbl" aria-checked="' + !!s.roast + '" data-act="roast"><span></span></button></div>' +
      '<div class="setrow"><div class="grow"><span class="label">Branding</span><span class="hint">App name, logo, accent colour and mascot, for everyone on this device.</span></div><button type="button" class="btn ghost sm" data-act="brand">Edit</button></div></section>';
    var photoCount = Object.keys(refsOf(S.p, {})).length, spendCount = S.p.trips.reduce(function (a, x) { return a + x.expenses.length; }, 0);
    right += '<section class="card"><div class="row between"><h2 class="h3">Storage & backup</h2>' + storageBadge() + '</div>' +
      '<dl class="stats"><div><dt>Account data</dt><dd>' + kb(u.raw) + '</dd></div><div><dt>Compressed</dt><dd>' + (u.comp ? kb(u.comp) : '—') + '</dd></div><div><dt>Cookie chunks</dt><dd>' + (u.chunks || '—') + '</dd></div><div><dt>Trips · spends · photos</dt><dd>' + S.p.trips.length + ' · ' + spendCount + ' · ' + photoCount + '</dd></div></dl>' +
      '<p class="hint">' + (u.where === 'cookie' ? 'A cookie holds about 4 KB, so your trips are compressed and split across ' + plural(u.chunks, 'cookie') + ', with a copy in local storage. Photos live in the browser’s photo storage.' : u.where === 'local' ? (Store.mode === 'cookie' ? 'Your trips outgrew cookie space, so they now live in local storage.' : esc(Store.note)) : esc(Store.note)) + ' Everything stays on this device.</p>' +
      (Photos.ok ? '' : '<p class="notice">This browser can’t store photos here, so photos last only until you close the tab.</p>') +
      '<div class="row wrap"><button type="button" class="btn quiet sm" data-act="backup">' + ic('copy', 16) + 'Copy backup</button><button type="button" class="btn quiet sm" data-act="restore-open">Restore from backup</button><button type="button" class="btn quiet sm" data-act="json">' + (S.showJson ? 'Hide JSON' : 'View JSON') + '</button>' + (t ? '<button type="button" class="btn quiet sm" data-act="csv">Export CSV</button><button type="button" class="btn quiet sm" data-act="open-csv">Import CSV</button>' : '') + '</div>' +
      '<p class="hint">The backup includes photos, so it can be large. Paste it into Restore on another device to move everything across.</p>' +
      (S.showJson ? '<pre class="json" tabindex="0">' + esc(JSON.stringify(S.p, null, 2)) + '</pre>' : '') + '</section>';
    right += securityCard(m);
    var mapApp = S.p.settings.mapApp || '';
    right += '<section class="card"><h2 class="h3">Maps and wallet</h2>' +
      '<div class="field"><label for="map-app">Directions open in</label><select id="map-app" class="input" data-mapapp="1"><option value="">Ask me each time</option>' + Object.keys(MAP_APPS).map(function (k) { return '<option value="' + k + '"' + (mapApp === k ? ' selected' : '') + '>' + MAP_APPS[k].label + '</option>'; }).join('') + '</select><span class="hint">Used by the Directions buttons on places, bookings and passes.</span></div>' +
      '<div class="setrow"><div class="grow"><span class="label">Apple Wallet passes</span><span class="hint">' + (S.p.settings.wwKey ? 'WalletWallet key saved on this device. One-tap passes are on.' : 'Add to Apple Wallet uses the free WalletWallet web tool. Add your free API key on any booking for one-tap passes.') + '</span></div>' + (S.p.settings.wwKey ? '<button type="button" class="btn ghost sm" data-act="ww-key-clear">Remove key</button>' : '') + '</div></section>';
    var vi = S.vinfo; if (!vi) refreshVinfo();
    right += '<section class="card"><div class="row between"><h2 class="h3">Version history</h2>' + (vi ? '<span class="hint">' + plural(vi.count, 'version') + '</span>' : '') + '</div>' +
      '<p class="hint">' + (vi && vi.last ? 'Last saved ' + esc(fmtWhen(vi.last)) + '. ' : '') + 'Go back to an earlier state of your trips if something goes wrong. Versions save automatically as you make changes.</p>' +
      '<div class="row wrap"><button type="button" class="btn quiet sm" data-act="history">' + ic('clock', 16) + 'See versions</button><button type="button" class="btn quiet sm" data-act="vh-quick">' + ic('target', 16) + 'Save a version now</button>' + (S.undo ? '<button type="button" class="btn quiet sm" data-act="undo">' + ic('back', 16) + 'Undo last change</button>' : '') + '</div></section>';
    right += '<section class="card"><div class="row">' + accAvatar(m, 46) + '<div class="grow"><strong style="font-size:var(--t-md)">' + esc(m.name) + '</strong><span class="hint">' + (m.hash ? 'Locked with a password' : 'No password') + ' · home currency ' + esc(S.p.home) + '</span></div></div>' +
      '<button type="button" class="btn quiet block" data-act="profile">' + ic('edit', 18) + ' Manage profile</button><div class="duo"><button type="button" class="btn quiet" data-act="accounts">' + ic('users', 18) + ' Switch</button><button type="button" class="btn quiet" data-act="signout">' + ic('logout', 18) + ' Sign out</button></div>' +
      (S.p.demo ? '<button type="button" class="btn ghost block" data-act="reset-demo">Reset the example trip</button>' : '') +
      '<button type="button" class="btn danger block' + (S.armed === 'acct' ? ' armed' : '') + '" data-act="acct-del">' + (S.armed === 'acct' ? 'Tap again to delete this account and its trips' : 'Delete this account') + '</button></section>';
    right += '<section class="card"><div class="setrow"><div class="grow"><span class="label">' + esc(BR.name) + ' ' + APP_VERSION + '</span><span class="hint">Works offline once opened, and keeps everything on this device. Nothing is uploaded.</span></div><button type="button" class="btn ghost sm" data-act="about">What’s new</button></div></section>';
    return header(t, 'More') + '<div class="split2"><div>' + (left || '<section class="card"><p>No trip yet.</p><button type="button" class="btn" data-act="trip-new">' + ic('plus', 18) + ' Plan a trip</button></section>') + '</div><div>' + right + '</div></div>';
  }
  function fundEta(t, saved, target) {
    if (saved >= target - 0.5) return 'Fully funded. Enjoy it.';
    var days = diff(today(), t.start), need = target - saved;
    if (days <= 0) return money(need) + ' short of the target.';
    var weeks = Math.max(days / 7, 1);
    return 'Save ' + money(need / weeks) + ' a week to be ready by ' + fmtD(t.start, { day: 'numeric', month: 'short' }) + '.';
  }
  function noTrip() {
    return header(null, greeting()) + '<section class="welcome"><h2 class="display" style="font-size:clamp(2rem,8vw,2.75rem)">Where to next?</h2><p class="lede">Set the dates and a budget. Then plan each day, add your bookings and packing list, and log spends as you go.</p><button type="button" class="btn" data-act="trip-new" style="align-self:flex-start">' + ic('plus', 18) + ' Plan a trip</button></section>';
  }
