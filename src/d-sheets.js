  /* =========================================================
     Sheets
     ========================================================= */
  function sheetHead(title) { return '<div class="sheet-head"><h2 id="sheet-title">' + esc(title) + '</h2><button type="button" class="icon-btn" data-act="close" aria-label="Close">' + ic('x', 18) + '</button></div><!--/head-->'; }
  function errLine(sh) { return sh.err ? '<p class="error" role="alert">' + esc(sh.err) + '</p>' : ''; }
  function delBtn(sh, label, armedLabel, act) { return '<button type="button" class="btn danger block' + (sh.armed ? ' armed' : '') + '" data-act="' + act + '">' + esc(sh.armed ? armedLabel : label) + '</button>'; }
  function curSeg(t, d, act) {
    if (t.local === t.home) return '';
    return '<div class="seg" role="group" aria-label="Currency"><button type="button" data-act="' + act + '" data-cur="' + t.local + '" aria-pressed="' + (d.cur === t.local) + '">' + esc(t.local) + ' · local</button><button type="button" data-act="' + act + '" data-cur="' + t.home + '" aria-pressed="' + (d.cur === t.home) + '">' + esc(t.home) + ' · home</button></div>';
  }
  function photoField(d, src, max) {
    return '<div class="field"><span class="label">Photos</span><div class="thumbs">' + d.photos.map(function (id, i) {
      return '<div class="thumb"><button type="button" class="thumb-open" data-act="lb" data-src="' + src + '" data-i="' + i + '" aria-label="View photo ' + (i + 1) + '">' + photoImg(id) + '</button><button type="button" class="rm" data-act="ph-rm" data-i="' + i + '" aria-label="Remove photo ' + (i + 1) + '">' + ic('x', 14) + '</button></div>';
    }).join('') + (d.photos.length < max ? '<label class="thumb-add">' + ic('camera', 20) + '<span>Add</span><input type="file" accept="image/*" multiple class="sr-only" data-upload="sheet-photos" aria-label="Add photos"></label>' : '') + '</div></div>';
  }
  function convText(t, d) {
    if (t.local === t.home || d.cur !== t.local || !num(d.amt)) return '';
    var r = d.rate && d.id ? d.rate : t.rate;
    return '≈ ' + money(num(d.amt) * r, t.home, { show: true }) + ' at ' + (r === t.rate ? rateText(t) : 'the rate saved with this spend');
  }

  function sheetSpend(sh) {
    var t = trip(), d = sh.d, isNew = !d.id, quick = isNew ? recentNotes(t) : [];
    var wopts = walletOptions(t, d.wallet);
    return sheetHead(isNew ? 'Add a spend' : 'Edit spend') +
      (isNew ? '<button type="button" class="btn ghost sm" data-act="open-sms" style="align-self:flex-start">' + ic('msg', 16) + ' Paste a bank SMS instead</button>' : '') +
      curSeg(t, d, 'sp-cur') +
      '<div class="stack-xs"><label class="money-input" for="sp-amt"><input id="sp-amt" data-f="amt" type="number" inputmode="decimal" step="any" min="0" placeholder="0" value="' + esc(d.amt) + '" aria-label="Amount"><span class="cur">' + esc(d.cur) + '</span></label><span class="conv" id="sp-conv">' + esc(convText(t, d)) + '</span></div>' +
      (quick.length ? '<div class="field"><span class="label">Again?</span><div class="chips scroll">' + quick.map(function (q, i) { return '<button type="button" class="chip" data-act="sp-quick" data-i="' + i + '" style="--c:' + CATS[q.cat].color + '"><i class="dot"></i>' + esc(q.note) + ' <span class="sub">' + esc(money(q.amt, q.cur, { show: true })) + '</span></button>'; }).join('') + '</div></div>' : '') +
      '<div class="field"><span class="label">Category</span><div class="chips">' + Object.keys(CATS).map(function (k) { return '<button type="button" class="chip" data-act="sp-cat" data-k="' + k + '" aria-pressed="' + (d.cat === k) + '" style="--c:' + CATS[k].color + '"><i class="dot"></i>' + esc(cs(k)) + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><label for="sp-note">What was it?</label><input id="sp-note" class="input" data-f="note" type="text" maxlength="80" placeholder="Dinner at the night market" value="' + esc(d.note) + '"></div>' +
      '<div class="grid2"><div class="field"><label for="sp-date">Date</label><input id="sp-date" class="input" data-f="date" type="date" value="' + esc(d.date) + '"></div><div class="field"><label for="sp-time">Time</label><input id="sp-time" class="input" data-f="time" type="time" value="' + esc(d.time) + '"></div></div>' +
      '<div class="field"><label for="sp-wallet">Paid from</label><select id="sp-wallet" class="input" data-f="wallet">' + wopts + '</select></div>' +
      (t.people.length > 1 ? '<div class="field"><span class="label">For</span><div class="chips"><button type="button" class="chip" data-act="sp-who" data-id="" aria-pressed="' + (!d.who) + '">Whole family</button>' + t.people.map(function (p) { return '<button type="button" class="chip" data-act="sp-who" data-id="' + esc(p.id) + '" aria-pressed="' + (d.who === p.id) + '">' + esc(p.name) + '</button>'; }).join('') + '</div></div>' : '') +
      (t.bookings.length ? '<div class="field"><label for="sp-bk">Payment for a booking?</label><select id="sp-bk" class="input" data-f="bookingId"><option value="">No, a day-to-day spend</option>' + t.bookings.map(function (b) { return '<option value="' + esc(b.id) + '"' + (d.bookingId === b.id ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('') + '</select><span class="hint">Booking payments come out of what’s set aside for bookings, not today’s allowance.</span></div>' : '') +
      photoField(d, 'ed', 6) + (d.photos.length ? ocrNote(sh.ocr) + '<button type="button" class="btn quiet sm" data-act="ocr-run" style="align-self:flex-start"' + (sh.ocr && sh.ocr.busy ? ' disabled' : '') + '>' + ic('scan', 16) + ' Read the receipt</button>' : '') + errLine(sh) +
      '<button type="button" class="btn block" data-act="sp-save" data-primary="1">' + (isNew ? 'Add spend' : 'Save changes') + '</button>' +
      (isNew ? '' : delBtn(sh, 'Delete spend', 'Tap again to delete', 'sp-del'));
  }

  function sheetTrip(sh) {
    var d = sh.d, isNew = !d.id, two = d.local !== d.home;
    return sheetHead(isNew ? 'Plan a trip' : 'Trip details') +
      '<div class="field"><span class="label">Cover photo</span><div class="cover">' + (d.cover ? photoImg(d.cover) : POSTCARD) + '</div><div class="row wrap"><label class="btn quiet sm">' + ic('camera', 16) + (d.cover ? 'Change photo' : 'Choose photo') + '<input type="file" accept="image/*" class="sr-only" data-upload="cover"></label>' + (d.cover ? '<button type="button" class="btn quiet sm" data-act="tr-cover-rm">Remove</button>' : '') + '</div></div>' +
      '<div class="field"><label for="tr-name">Trip name</label><input id="tr-name" class="input" data-f="name" type="text" maxlength="40" placeholder="Summer in Georgia" value="' + esc(d.name) + '"></div>' +
      '<div class="field"><label for="tr-place">Destination</label><input id="tr-place" class="input" data-f="place" type="text" maxlength="40" placeholder="Tbilisi and Kazbegi" value="' + esc(d.place) + '"></div>' +
      '<div class="grid2"><div class="field"><label for="tr-start">From</label><input id="tr-start" class="input" data-f="start" type="date" value="' + esc(d.start) + '"></div><div class="field"><label for="tr-end">To</label><input id="tr-end" class="input" data-f="end" type="date" value="' + esc(d.end) + '"></div></div>' +
      '<div class="grid2"><div class="field"><label for="tr-home">Home currency</label><select id="tr-home" class="input" data-f="home" data-rr="1">' + curOptions(d.home) + '</select></div><div class="field"><label for="tr-local">Local currency</label><select id="tr-local" class="input" data-f="local" data-rr="1">' + curOptions(d.local) + '</select></div></div>' +
      (two ? '<div class="field"><label for="tr-rate">Exchange rate · 1 ' + esc(d.local) + ' in ' + esc(d.home) + '</label><input id="tr-rate" class="input" data-f="rate" type="number" inputmode="decimal" step="any" min="0" value="' + esc(d.rate) + '"><span class="hint">Use today’s rate from your bank or a currency app. Each spend keeps the rate it was logged at.</span>' +
        (!isNew ? '<label class="row" style="gap:10px;margin-top:4px;cursor:pointer"><input type="checkbox" id="tr-reapply" data-f="reapply"' + (d.reapply ? ' checked' : '') + ' style="width:18px;height:18px;accent-color:var(--ink)"><span class="hint" style="color:var(--ink-2)">Also convert existing ' + esc(d.local) + ' spends at this rate</span></label>' : '') + '</div>' : '') +
      '<div class="field"><label for="tr-budget">Total budget in ' + esc(d.home) + '</label><input id="tr-budget" class="input" data-f="budget" type="number" inputmode="decimal" step="any" min="0" placeholder="15000" value="' + esc(d.budget) + '"><span class="hint">Include flights and stays. Bookings are set aside first, and the rest becomes your daily allowance.</span></div>' +
      '<div class="field"><span class="label">Who’s going</span><div class="stack" style="gap:8px">' + d.people.map(function (p, i) {
        var open = d.pick === i;
        var row = '<div class="people-row"><button type="button" class="av-btn" data-act="tr-pick" data-i="' + i + '" aria-expanded="' + open + '" aria-label="Change picture for ' + esc(p.name || 'traveller') + '">' + avatar(p, 42) + '<span class="edit-dot">' + ic('edit', 10) + '</span></button><input class="input" data-f="people.' + i + '.name" type="text" maxlength="24" placeholder="Name" value="' + esc(p.name) + '" aria-label="Traveller ' + (i + 1) + '"><button type="button" class="icon-btn" data-act="tr-rm" data-i="' + i + '" aria-label="Remove ' + esc(p.name || 'traveller') + '">' + ic('x', 16) + '</button></div>';
        if (open) row += '<div class="picker"><span class="label">Colour</span><div class="swatches" role="group" aria-label="Avatar colour">' + AV.map(function (col) { return '<button type="button" class="swatch" style="--c:' + col + '" data-act="tr-color" data-i="' + i + '" data-c="' + col + '" aria-pressed="' + (p.color === col) + '" aria-label="Colour ' + col + '"></button>'; }).join('') + '</div>' +
          '<div class="row wrap"><label class="btn quiet sm">' + ic('camera', 16) + (p.photo ? 'Change photo' : 'Use a photo') + '<input type="file" accept="image/*" class="sr-only" data-upload="avatar" data-i="' + i + '"></label>' + (p.photo ? '<button type="button" class="btn quiet sm" data-act="tr-av-rm" data-i="' + i + '">Remove photo</button>' : '') + '</div></div>';
        return row;
      }).join('') + '<button type="button" class="btn quiet sm" data-act="tr-add" style="align-self:flex-start">' + ic('plus', 16) + ' Add someone</button></div><span class="hint">Used for per-person costs, packing and tagging spends for one person.</span></div>' +
      errLine(sh) +
      '<button type="button" class="btn block" data-act="tr-save" data-primary="1">' + (isNew ? 'Create trip' : 'Save trip') + '</button>' +
      (isNew ? '' : delBtn(sh, 'Delete trip', 'Tap again to delete this trip, its plan and spends', 'tr-del'));
  }

  function sheetTrips() {
    var a = trip();
    return sheetHead('Your trips') + '<div class="trips-grid">' + S.p.trips.slice().sort(function (x, y) { return x.start < y.start ? 1 : -1; }).map(function (t) {
      var c = calc(t), spent = c.total + c.unpaid, pct = c.budget ? spent / c.budget : 0;
      var pill = c.status === 'active' ? '<span class="pill sea">Day ' + c.dayIdx + ' of ' + c.n + '</span>' : c.status === 'upcoming' ? '<span class="pill info">In ' + plural(diff(today(), t.start), 'day') + '</span>' : '<span class="pill info">Finished</span>';
      return '<button type="button" class="trip' + (a && a.id === t.id ? ' on' : '') + '" data-act="trip-open" data-id="' + esc(t.id) + '"><div class="cover mini">' + (t.cover ? photoImg(t.cover) : POSTCARD) + '</div><div class="row between" style="align-items:flex-start"><div class="grow"><h3 class="ellip">' + esc(t.name) + '</h3><span class="hint">' + esc((t.place ? t.place + ' · ' : '') + range(t)) + '</span></div>' + pill + '</div>' +
        '<div class="row between"><span class="num md">' + esc(money(spent, t.home)) + '</span><span class="hint">of ' + esc(money(c.budget, t.home)) + '</span></div><div class="prog"><span class="' + (pct > 1 ? 'over' : '') + '" style="width:' + Math.min(100, pct * 100).toFixed(1) + '%"></span></div></button>';
    }).join('') + '</div><button type="button" class="btn block" data-act="trip-new">' + ic('plus', 18) + ' Plan a new trip</button>';
  }

  function sheetWallet(sh) {
    var t = trip(), d = sh.d, n = d.id ? t.expenses.filter(function (x) { return x.wallet === d.id; }).length : 0;
    return sheetHead(d.id ? 'Edit wallet' : 'Add a wallet') +
      '<div class="field"><label for="wl-name">Name</label><input id="wl-name" class="input" data-f="name" maxlength="30" placeholder="e.g. Travel card, Yen cash" value="' + esc(d.name) + '"><span class="hint">Put the card’s last 4 digits in the name and pasted bank SMS get matched to it.</span></div>' +
      '<div class="field"><span class="label">Type</span><div class="chips">' + Object.keys(WTYPES).map(function (k) { return '<button type="button" class="chip" data-act="wl-type" data-k="' + k + '" aria-pressed="' + (d.type === k) + '">' + esc(WTYPES[k].label) + '</button>'; }).join('') + '</div></div>' +
      (t.local !== t.home ? '<div class="field"><span class="label">Currency</span>' + curSeg(t, d, 'wl-cur') + '</div>' : '') +
      '<div class="field"><label for="wl-open">Starting balance</label><div class="money-input sm"><input id="wl-open" data-f="opening" type="number" inputmode="decimal" step="any" placeholder="0" value="' + esc(d.opening) + '"><span class="cur">' + esc(d.cur) + '</span></div><span class="hint">Cash you’re taking, or a travel card’s balance. Leave 0 for credit cards.</span></div>' +
      errLine(sh) + '<button type="button" class="btn block" data-act="wl-save" data-primary="1">' + (d.id ? 'Save wallet' : 'Add wallet') + '</button>' +
      (d.id ? delBtn(sh, 'Delete wallet', 'Tap again to delete' + (n ? '. Its ' + plural(n, 'spend') + ' stay.' : ''), 'wl-del') : '');
  }

  function sheetBooking(sh) {
    var t = trip(), d = sh.d, T = BKT[d.type] || BKT.other, b = d.id ? bookingById(t, d.id) : null, st = b ? bookingState(t, b) : null;
    var pays = b ? t.expenses.filter(function (x) { return x.bookingId === b.id; }).sort(byDate) : [];
    return sheetHead(d.id ? 'Booking' : 'Add a booking') +
      '<div class="cover mini bk-cover">' + (d.cover ? photoImg(d.cover, d.name) : bookingArt(d.type)) + '<div class="row cover-act" style="gap:6px;background:none;box-shadow:none">' + (d.cover ? '<button type="button" class="btn sm" data-act="bk-cover-rm" style="background:var(--surface);color:var(--ink)">Remove</button>' : '') + '<label class="btn sm" style="background:var(--surface);color:var(--ink);box-shadow:0 4px 14px rgba(17,22,20,.16)">' + ic('camera', 16) + (d.cover ? 'Change picture' : 'Add a picture') + '<input type="file" accept="image/*" class="sr-only" data-upload="bk-cover"></label></div></div>' +
      autofillCard(sh) +
      '<div class="field"><span class="label">Type</span><div class="chips">' + Object.keys(BKT).map(function (k) { return '<button type="button" class="chip" data-act="bk-type" data-k="' + k + '" aria-pressed="' + (d.type === k) + '" style="--c:' + CATS[BKT[k].cat].color + '"><i class="dot"></i>' + esc(BKT[k].label) + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><label for="bk-name">Name</label><input id="bk-name" class="input" data-f="name" maxlength="60" placeholder="' + esc(d.type === 'flight' ? 'Doha – Tbilisi' : d.type === 'stay' ? 'Hotel in the old town' : 'What is it?') + '" value="' + esc(d.name) + '"></div>' +
      '<div class="grid2"><div class="field"><label for="bk-prov">' + (d.type === 'flight' ? 'Airline' : 'Provider') + '</label><input id="bk-prov" class="input" data-f="provider" maxlength="40" value="' + esc(d.provider) + '"></div><div class="field"><label for="bk-conf">Confirmation code</label><input id="bk-conf" class="input" data-f="conf" maxlength="30" autocapitalize="characters" value="' + esc(d.conf) + '"></div></div>' +
      '<div class="grid2"><div class="field"><label for="bk-start">' + esc(T.a ? T.a.replace(/ car$/, '') : 'Date') + '</label><input id="bk-start" class="input" data-f="start" type="date" value="' + esc(d.start) + '"></div><div class="field"><label for="bk-time">Time</label><input id="bk-time" class="input" data-f="time" type="time" value="' + esc(d.time) + '"></div></div>' +
      (T.hasEnd ? '<div class="grid2"><div class="field"><label for="bk-end">' + esc(T.endName) + ' <span class="muted">(optional)</span></label><input id="bk-end" class="input" data-f="end" type="date" value="' + esc(d.end) + '"></div><div class="field"><label for="bk-etime">Time</label><input id="bk-etime" class="input" data-f="endTime" type="time" value="' + esc(d.endTime) + '"></div></div>' : '') +
      curSeg(t, d, 'bk-cur') +
      '<div class="field"><label for="bk-total">Total cost</label><div class="money-input sm"><input id="bk-total" data-f="total" type="number" inputmode="decimal" step="any" min="0" placeholder="0" value="' + esc(d.total) + '"><span class="cur">' + esc(d.cur) + '</span></div></div>' +
      (d.id ? '' : '<div class="field"><label for="bk-paid">Paid so far</label><div class="money-input sm"><input id="bk-paid" data-f="paidNow" type="number" inputmode="decimal" step="any" min="0" placeholder="0" value="' + esc(d.paidNow) + '"><span class="cur">' + esc(d.cur) + '</span></div><span class="hint">A deposit or the full amount. It’s logged as a spend today.</span></div><div class="field"><label for="bk-from">Paid from</label><select id="bk-from" class="input" data-f="paidFrom">' + walletOptions(t, d.paidFrom) + '</select></div>') +
      '<div class="field"><label for="bk-due">Balance due by <span class="muted">(optional)</span></label><input id="bk-due" class="input" data-f="due" type="date" value="' + esc(d.due) + '"><span class="hint">You get a reminder on Today a week before.</span></div>' +
      '<div class="field"><label for="bk-addr">Address <span class="muted">(optional)</span></label><input id="bk-addr" class="input" data-f="address" maxlength="160" placeholder="' + esc(d.type === 'flight' ? 'Airport or terminal' : 'Street, area, city') + '" value="' + esc(d.address || '') + '"><div id="bk-dir">' + dirBtn(placeQuery(trip(), d.address || (d.type !== 'flight' ? d.name : ''))) + '</div></div>' +
      '<div class="field"><label for="bk-notes">Notes</label><textarea id="bk-notes" class="input" data-f="notes" style="min-height:80px" placeholder="Seats, baggage, address, check-in rules…">' + esc(d.notes) + '</textarea></div>' +
      docsField(sh) + walletCard(sh) +
      (b ? '<section class="card tight"><div class="card-head"><h3 class="h3">Payments</h3><span class="hint">' + (st.st === 'none' ? 'Add the total to track payments' : st.st === 'paid' ? 'Paid in full' : esc(money(st.left, t.home)) + ' to pay') + '</span></div><div class="rows">' + (pays.length ? pays.map(function (x) { return txnRow(t, x); }).join('') : '<p class="hint" style="padding:6px 0 12px">No payments logged yet.</p>') + '</div>' +
        (st.st !== 'paid' && st.st !== 'none' ? '<button type="button" class="add-row" data-act="bk-pay">' + ic('plus', 16) + ' Log a payment of ' + esc(money(st.left, t.home, { show: true })) + '</button>' : '<div class="spacer"></div>') + '</section>' : '') +
      errLine(sh) + '<button type="button" class="btn block" data-act="bk-save" data-primary="1">' + (d.id ? 'Save booking' : 'Add booking') + '</button>' +
      (d.id ? delBtn(sh, 'Delete booking', 'Tap again to delete. Its payments stay as spends.', 'bk-del') : '');
  }

  function dayOptions(t, sel) {
    var c = Math.max(diff(t.start, t.end) + 1, 1), o = '<option value=""' + (!inTrip(t, sel) ? ' selected' : '') + '>Ideas · not on a day yet</option>';
    for (var i = 0; i < c; i++) { var ds = addDays(t.start, i); o += '<option value="' + ds + '"' + (ds === sel ? ' selected' : '') + '>Day ' + (i + 1) + ' · ' + esc(fmtD(ds)) + '</option>'; }
    return o;
  }
  function mapLink(t, place) { return place ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place + (t.place ? ', ' + t.place : '')) : ''; }
  function brandPreview(d) { return '<div class="row between">' + wordmark(d) + '<span class="pill sea">Accent</span></div><p class="hint">' + esc(d.showMascot ? d.mascotName + ' says' : 'Over budget') + ': “' + esc(d.catch) + '”</p>'; }
  function sheetItem(sh) {
    var t = trip(), d = sh.d;
    var mapUrl = mapLink(t, d.place);
    return sheetHead(d.id ? 'Edit plan' : 'Add to the plan') +
      '<div class="field"><label for="it-title">What’s the plan?</label><input id="it-title" class="input" data-f="title" maxlength="80" placeholder="Sunset at the old fortress" value="' + esc(d.title) + '"></div>' +
      '<div class="field"><span class="label">Kind</span><div class="chips">' + Object.keys(PLK).map(function (k) { return '<button type="button" class="chip" data-act="it-kind" data-k="' + k + '" aria-pressed="' + (d.kind === k) + '" style="--c:' + CATS[PLK[k].cat].color + '"><i class="dot"></i>' + esc(PLK[k].label) + '</button>'; }).join('') + '</div></div>' +
      '<div class="grid2"><div class="field"><label for="it-day">Day</label><select id="it-day" class="input" data-f="day">' + dayOptions(t, d.day) + '</select></div><div class="field"><label for="it-time">Time</label><input id="it-time" class="input" data-f="time" type="time" value="' + esc(d.time) + '"></div></div>' +
      '<div class="field"><label for="it-place">Place</label><input id="it-place" class="input" data-f="place" maxlength="80" placeholder="Name or address" value="' + esc(d.place) + '"><div id="it-dir">' + dirBtn(placeQuery(t, d.place)) + '</div></div>' +
      curSeg(t, d, 'it-cur') +
      '<div class="field"><label for="it-cost">Estimated cost <span class="muted">(optional)</span></label><div class="money-input sm"><input id="it-cost" data-f="cost" type="number" inputmode="decimal" step="any" min="0" placeholder="0" value="' + esc(d.cost || '') + '"><span class="cur">' + esc(d.cur) + '</span></div><span class="hint">For the whole family. Used in Insights to compare plan and actual.</span></div>' +
      '<div class="field"><label for="it-notes">Notes</label><textarea id="it-notes" class="input" data-f="notes" style="min-height:80px" placeholder="Opening hours, tickets, who’s coming…">' + esc(d.notes) + '</textarea></div>' +
      '<div class="setrow"><div class="grow"><span class="label" id="it-done-lbl">Done</span><span class="hint">Ticked off on the itinerary.</span></div><button type="button" class="switch" role="switch" aria-labelledby="it-done-lbl" aria-checked="' + !!d.done + '" data-act="it-done"><span></span></button></div>' +
      errLine(sh) + '<button type="button" class="btn block" data-act="it-save" data-primary="1">' + (d.id ? 'Save' : 'Add to plan') + '</button>' +
      (d.id && num(d.cost) > 0 ? '<button type="button" class="btn ghost block" data-act="it-log">' + ic('plus', 16) + ' Log ' + esc(money(num(d.cost), d.cur, { show: true })) + ' as a spend</button>' : '') +
      (d.id ? delBtn(sh, 'Remove from plan', 'Tap again to remove', 'it-del') : '');
  }

  function sheetFund(sh) {
    var t = trip(), d = sh.d, saved = fundSaved(t), target = fundTarget(t);
    return sheetHead('Trip fund') +
      '<div class="goal">' + ring(target ? saved / target : 0, 64) + '<div class="grow"><span class="h3">' + esc(money(saved)) + ' of ' + esc(money(target)) + '</span><span class="hint">' + esc(fundEta(t, saved, target)) + '</span></div></div>' +
      '<div class="field"><label for="fd-amt">Add savings</label><div class="money-input sm"><input id="fd-amt" data-f="amt" type="number" inputmode="decimal" step="any" min="0" placeholder="0" value="' + esc(d.amt) + '"><span class="cur">' + esc(t.home) + '</span></div></div>' +
      '<div class="field"><label for="fd-date">Date</label><input id="fd-date" class="input" data-f="date" type="date" value="' + esc(d.date) + '"></div>' +
      errLine(sh) + '<button type="button" class="btn block" data-act="fd-add" data-primary="1">Add to the fund</button>' +
      '<div class="field"><label for="fd-target">Target</label><div class="money-input sm"><input id="fd-target" data-f="target" type="number" inputmode="decimal" step="any" min="0" placeholder="' + esc(num(t.budget)) + '" value="' + esc(d.target) + '"><span class="cur">' + esc(t.home) + '</span></div><span class="hint">Leave empty to use the trip budget.</span></div>' +
      '<button type="button" class="btn ghost block" data-act="fd-target">Save target</button>' +
      (t.fund.entries.length ? '<section class="card tight"><div class="card-head"><h3 class="h3">Saved so far</h3><span class="hint">' + plural(t.fund.entries.length, 'entry', 'entries') + '</span></div><div class="rows">' + t.fund.entries.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(function (e) { return '<div class="crow"><span class="tile" style="--c:var(--accent)">' + ic('target', 17) + '</span><span class="grow">' + esc(fmtD(e.date, { day: 'numeric', month: 'short', year: 'numeric' })) + '</span><span class="tnum">' + esc(money(e.amt)) + '</span><button type="button" class="icon-btn sm" data-act="fd-del" data-id="' + esc(e.id) + '" aria-label="Remove this entry" style="border:0">' + ic('x', 14) + '</button></div>'; }).join('') + '</div><div class="spacer"></div></section>' : '');
  }

  function sheetCaps(sh) {
    var d = sh.d;
    return sheetHead('Category limits') + '<p class="hint">A cap for the whole trip, in ' + esc(trip().home) + '. You get a warning at 80% and when you cross it.</p>' +
      '<div class="stack" style="gap:8px">' + d.caps.map(function (k, i) {
        return '<div class="people-row" style="grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) 42px"><select class="input" data-f="caps.' + i + '.cat" aria-label="Category">' + Object.keys(CATS).map(function (c) { return '<option value="' + c + '"' + (k.cat === c ? ' selected' : '') + '>' + esc(CATS[c].label) + '</option>'; }).join('') + '</select><input class="input" data-f="caps.' + i + '.amount" type="number" inputmode="decimal" step="any" min="0" placeholder="Limit" value="' + esc(k.amount) + '" aria-label="Limit"><button type="button" class="icon-btn" data-act="cap-rm" data-i="' + i + '" aria-label="Remove this limit">' + ic('x', 16) + '</button></div>';
      }).join('') + '<button type="button" class="btn quiet sm" data-act="cap-add" style="align-self:flex-start">' + ic('plus', 16) + ' Add a limit</button></div>' +
      '<button type="button" class="btn block" data-act="cap-save" data-primary="1">Save limits</button>';
  }

  function smsRow(t, x, i) {
    return '<div class="srow"><input type="checkbox" id="sm-' + i + '" data-sms="' + i + '"' + (x.on ? ' checked' : '') + '>' +
      '<label for="sm-' + i + '" class="grow"><strong>' + esc(x.note || 'Payment') + '</strong><span class="hint">' + esc(fmtD(x.date, { day: 'numeric', month: 'short' }) + (x.time ? ' · ' + fmtHM(x.time) : '') + ' · ' + ((walletById(t, x.wallet) || {}).name || 'No wallet')) + '</span>' +
      (x.dup ? '<span class="pill warn" style="align-self:flex-start;margin-top:6px">Already logged?</span>' : '') + (x.foreign ? '<span class="pill warn" style="align-self:flex-start;margin-top:6px">In ' + esc(x.foreign) + ', not this trip’s currency. Check the amount.</span>' : '') + '</label>' +
      '<span class="amt"><b>' + esc(money(x.amt, x.cur, { show: true })) + '</b></span>' +
      '<div class="srow-sub"><select class="input" data-smscat="' + i + '" aria-label="Category for ' + esc(x.note || 'this payment') + '">' + Object.keys(CATS).map(function (k) { return '<option value="' + k + '"' + (x.cat === k ? ' selected' : '') + '>' + esc(CATS[k].label) + '</option>'; }).join('') + '</select></div></div>';
  }
  function sheetSms(sh) {
    var t = trip();
    if (sh.step === 'review') {
      var n = sh.items.filter(function (x) { return x.on; }).length;
      return sheetHead('Check before adding') +
        '<p class="hint">Found ' + plural(sh.items.length, 'payment') + '. Categories are guessed from the shop name. Fix any that are wrong and ' + esc(BR.name) + ' remembers next time.</p>' +
        (sh.items.length ? '<section class="card tight"><div class="rows">' + sh.items.map(function (x, i) { return smsRow(t, x, i); }).join('') + '</div></section>' : '<section class="card"><p class="hint">None of these looked like payments.</p></section>') +
        (sh.bad.length ? '<details class="card"><summary>Skipped ' + plural(sh.bad.length, 'message') + '</summary>' + sh.bad.map(function (b) { return '<div class="stack-xs"><span class="label">' + esc(b.why) + '</span><span class="mono">' + esc(b.raw.slice(0, 180)) + '</span></div>'; }).join('') + '</details>' : '') +
        '<button type="button" class="btn block" data-act="sms-add"' + (n ? '' : ' disabled') + '>Add ' + plural(n, 'spend') + '</button><button type="button" class="btn ghost block" data-act="sms-back">Back</button>';
    }
    return sheetHead('Paste bank SMS') +
      '<p class="hint">Copy one or more card or bank messages from your phone and paste them here. ' + esc(BR.name) + ' reads the amount, currency, shop, date and card, and you check them before anything is added. Nothing leaves this browser.</p>' +
      '<div class="field"><label for="sms-text">Messages</label><textarea id="sms-text" class="input code" data-f="text" rows="7" spellcheck="false" placeholder="Your card XX4821 was used for JPY 4,800 at ICHIRAN…">' + esc(sh.d.text) + '</textarea><span class="hint">Leave a blank line between messages.</span></div>' +
      errLine(sh) + '<button type="button" class="btn block" data-act="sms-read">Read messages</button><button type="button" class="btn ghost block" data-act="sms-sample">Fill in example messages</button>';
  }

  function sheetCsv(sh) {
    var t = trip();
    if (sh.step !== 'map') {
      return sheetHead('Import CSV') +
        '<p class="hint">Use a card statement downloaded from your bank, or a file exported from ' + esc(BR.name) + '. You match the columns and check the result before anything is added.</p>' +
        '<label class="btn block">' + ic('upload', 18) + ' Choose a CSV file<input type="file" accept=".csv,text/csv,text/plain" class="sr-only" data-upload="csv"></label>' +
        '<div class="field"><label for="csv-text">Or paste CSV text</label><textarea id="csv-text" class="input code" data-f="text" rows="5" spellcheck="false" placeholder="Date,Description,Amount&#10;2026-11-01,Ichiran Dotonbori,4800">' + esc(sh.d.text) + '</textarea></div>' +
        errLine(sh) + '<button type="button" class="btn ghost block" data-act="csv-read">Read pasted CSV</button>';
    }
    var mp = sh.map, res = csvItems(sh, t);
    function sel(key, label, req) {
      return '<div class="field"><label for="cm-' + key + '">' + label + '</label><select id="cm-' + key + '" class="input" data-csvmap="' + key + '">' + (req && !mp[key] ? '<option value="" selected>Pick a column</option>' : '<option value="">Not in file</option>') +
        sh.headers.map(function (h) { return '<option value="' + esc(h) + '"' + (mp[key] === h ? ' selected' : '') + '>' + esc(h) + '</option>'; }).join('') + '</select></div>';
    }
    var preview = res.items.slice(0, 5).map(function (x) { return '<div class="txn" style="cursor:default"><span class="tile" style="--c:' + CATS[x.cat].color + '">' + ic(x.cat, 17) + '</span><span class="grow"><strong class="ellip">' + esc(x.note || cs(x.cat)) + '</strong><span class="hint">' + esc(cs(x.cat) + ' · ' + fmtD(x.date, { day: 'numeric', month: 'short', year: 'numeric' })) + '</span></span><span class="amt"><b>' + esc(money(x.amt, x.cur, { show: true })) + '</b></span></div>'; }).join('');
    return sheetHead('Match the columns') +
      '<p class="hint">' + plural(sh.rows.length, 'row') + ' found. We guessed which column is which. Fix anything that’s off.</p>' +
      '<div class="grid2">' + sel('date', 'Date', true) + sel('desc', 'What or where') + sel('amount', 'Amount') + sel('debit', 'Money out') + sel('currency', 'Currency') + sel('cat', 'Category') + '</div>' +
      (mp.amount && !mp.debit ? '<div class="field"><label for="cm-sign">How amounts work in this file</label><select id="cm-sign" class="input" data-csvsign="1"><option value="spend"' + (sh.sign === 'spend' ? ' selected' : '') + '>Every amount is a spend</option><option value="signed"' + (sh.sign === 'signed' ? ' selected' : '') + '>Minus means spend, plus means money in (skipped)</option></select></div>' : '') +
      (t.local !== t.home && !mp.currency ? '<div class="field"><span class="label">Amounts are in</span><div class="seg" role="group" aria-label="Currency of the amounts"><button type="button" data-act="csv-cur" data-cur="' + t.local + '" aria-pressed="' + (sh.cur === t.local) + '">' + esc(t.local) + '</button><button type="button" data-act="csv-cur" data-cur="' + t.home + '" aria-pressed="' + (sh.cur === t.home) + '">' + esc(t.home) + '</button></div></div>' : '') +
      '<div class="field"><label for="cm-wallet">Paid from</label><select id="cm-wallet" class="input" data-csvwallet="1">' + walletOptions(t, sh.wallet) + '</select></div>' +
      '<div class="setrow"><div class="grow"><span class="label" id="cm-dup-lbl">Include possible duplicates</span><span class="hint">Rows with the same amount, day and name as a spend you already logged.</span></div><button type="button" class="switch" role="switch" aria-labelledby="cm-dup-lbl" aria-checked="' + !!sh.keepDups + '" data-act="csv-dups"><span></span></button></div>' +
      '<section class="card tight"><div class="card-head"><span class="label">Preview</span><span class="hint">' + res.items.length + ' ready' + (res.dups ? ' · ' + res.dups + ' duplicate' + (res.dups === 1 ? '' : 's') + (sh.keepDups ? ' included' : ' skipped') : '') + (res.skipped ? ' · ' + res.skipped + ' money in skipped' : '') + (res.bad ? ' · ' + res.bad + ' unreadable' : '') + '</span></div><div class="rows">' +
      (preview || '<p class="hint" style="padding:8px 0 14px">Nothing to import yet. Check the Date and Amount columns.</p>') + '</div>' + (res.items.length > 5 ? '<p class="hint" style="padding:6px 0 14px">…and ' + (res.items.length - 5) + ' more.</p>' : '<div class="spacer"></div>') + '</section>' +
      '<button type="button" class="btn block" data-act="csv-import"' + (res.items.length ? '' : ' disabled') + '>Import ' + plural(res.items.length, 'spend') + '</button><button type="button" class="btn ghost block" data-act="csv-back">Choose another file</button>';
  }

  function sheetText(sh) {
    return sheetHead(sh.title) + '<p class="hint">' + esc(sh.msg) + '</p><textarea id="text-out" class="input code" readonly aria-label="' + esc(sh.title) + '" style="min-height:260px">' + esc(sh.body) + '</textarea><button type="button" class="btn block" data-act="text-copy">' + ic('copy', 18) + ' Copy</button>';
  }
  function sheetRestore(sh) {
    return sheetHead('Restore from backup') + '<p class="hint">Paste a ' + esc(BR.name) + ' backup copied from More. It replaces this account’s trips and brings back their photos.</p><textarea id="restore-box" class="input code" data-f="text" style="min-height:200px" spellcheck="false" placeholder="Paste the backup here">' + esc(sh.d.text) + '</textarea>' + errLine(sh) + '<button type="button" class="btn block" data-act="restore">Replace with this backup</button>';
  }

  function sheetRecap() {
    var t = trip(), c = calc(t), roastOn = S.p.settings.roast, m = meta() || {};
    var title, body;
    if (c.todaySpent === 0) { title = roastOn ? 'A zero-spend day?' : 'No spending today'; body = roastOn ? 'Nothing spent out of ' + money(c.allowance) + '. Either you’re a monk or you forgot to log something.' : 'You spent nothing out of ' + money(c.allowance) + '.'; }
    else if (c.over) { title = roastOn ? BR.catch : 'Over today’s allowance'; body = 'Today’s allowance was ' + money(c.allowance) + ' and you spent ' + money(c.todaySpent) + '. ' + (roastOn ? 'Tomorrow quietly pays for today.' : 'Tomorrow’s allowance adjusts to cover it.'); }
    else { title = roastOn ? 'Nicely done.' : 'Under today’s allowance'; body = 'Today’s allowance was ' + money(c.allowance) + ' and you spent ' + money(c.todaySpent) + '. You kept ' + money(c.safe) + ' for the days ahead.'; }
    var stamp = c.todaySpent === 0 ? 'ZERO DAY' : c.over ? (roastOn ? stampText(BR.catch) : 'OVER') : 'ON TRACK';
    var sc = c.over ? 'var(--stamp-bad)' : 'var(--stamp-good)';
    var items = t.expenses.filter(function (x) { return x.date === c.td && !linked(t, x); }).sort(byDate).map(function (x) {
      return '<div class="line"><span class="rmuted">' + esc(x.time ? fmtHM(x.time) : '—') + '</span><span style="max-width:46%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc((x.note || cs(x.cat)).toUpperCase()) + '</span><span class="lead"></span><span>' + esc(money(exHome(t, x))) + '</span></div>';
    }).join('');
    var tomorrowNote = c.tomorrow === null ? 'Tomorrow is the trip home.' : c.tomorrow < c.base - 0.5 ? 'Down from your ' + money(c.base) + ' base. Today is spread over the ' + plural(c.daysLeft - 1, 'day') + ' left.' : 'At or above your ' + money(c.base) + ' base. Unspent money carries forward.';
    var tmr = c.tomorrow !== null ? addDays(c.td, 1) : null, tmrAgenda = tmr ? dayAgenda(t, tmr) : [];
    var appicon = BR.logo ? '<img src="' + esc(BR.logo) + '" alt="" style="width:26px;height:26px;object-fit:contain">' : BR.showMascot ? mascot(moodOf(c), 28) : '<span style="font-weight:500">' + esc(BR.name.charAt(0)) + '</span>';
    return sheetHead('Tonight’s recap') +
      '<div class="notif"><span class="appicon">' + appicon + '</span><div class="grow"><div class="row between"><strong>' + esc(title) + '</strong><span class="notif-time">10:00 PM</span></div><p>' + esc(body) + '</p></div></div>' +
      '<div class="receipt-wrap"><div class="receipt"><div class="rhead"><strong style="letter-spacing:.2em;font-size:0.9rem">' + esc(BR.name.toUpperCase()) + '</strong><span style="letter-spacing:.1em">' + (roastOn ? 'SOUVENIRS OF SPENDING' : 'DAILY SUMMARY') + '</span><span class="rmuted">' + esc(('Day ' + c.dayIdx + ' of ' + c.n + ' · ' + t.name).toUpperCase()) + '</span><span class="rmuted">' + esc(fmtD(c.td, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()) + ' · ' + esc(firstName(m.name).toUpperCase()) + '</span></div><div class="rule"></div>' +
      (items || '<span style="text-align:center;padding:6px 0">' + (roastOn ? 'NO ITEMS. SUSPICIOUS.' : 'NO SPENDS LOGGED.') + '</span>') +
      '<div class="rule"></div><div class="line"><span>SPENT</span><span class="lead"></span><strong>' + esc(money(c.todaySpent)) + '</strong></div><div class="line"><span>ALLOWANCE</span><span class="lead"></span><strong>' + esc(money(c.allowance)) + '</strong></div>' +
      '<div class="line" style="font-size:0.9rem;color:' + sc + '"><strong>' + (c.over ? 'OVER BY' : 'KEPT') + '</strong><span class="lead"></span><strong>' + esc(money(Math.abs(c.safe))) + '</strong></div>' +
      '<span class="stamp" style="--sc:' + sc + '">' + esc(stamp) + '</span></div><div class="receipt-edge"></div></div>' +
      '<section class="card"><span class="eyebrow">Tomorrow’s allowance</span><span class="num xl"' + (c.tomorrow !== null && c.tomorrow < c.base - 0.5 ? ' style="color:var(--bad)"' : '') + '>' + (c.tomorrow === null ? 'Last day' : esc(money(c.tomorrow))) + '</span><p class="hint">' + esc(tomorrowNote) + '</p></section>' +
      (tmr ? '<section class="card tight"><div class="card-head"><h3 class="h3">Tomorrow’s plan</h3><span class="hint">' + esc(fmtD(tmr)) + '</span></div><div class="rows">' + (tmrAgenda.length ? tmrAgenda.map(function (e) { return agendaRow(t, e); }).join('') : '<p class="hint" style="padding:6px 0 12px">Nothing planned. A free day.</p>') + '</div><div class="spacer"></div></section>' : '') +
      '<button type="button" class="btn quiet block" data-act="close">Done</button>';
  }

  function sheetBrand(sh) {
    var d = sh.d, low = d.accent && contrast(d.accent, '#FFFFFF') < 4.5;
    return sheetHead('Branding') + '<p class="hint">Rename the app, add your logo and pick an accent colour. It applies to every account on this device.</p>' +
      '<section class="card" id="b-preview" aria-live="polite">' + brandPreview(d) + '</section>' +
      '<div class="field"><label for="b-name">App name</label><input id="b-name" class="input" data-f="name" maxlength="32" value="' + esc(d.name) + '"></div>' +
      '<div class="field"><span class="label">Logo</span><div class="logo-box">' + (d.logo ? '<img src="' + esc(d.logo) + '" alt="Logo preview">' : '<span class="hint">No logo yet</span>') + '</div><div class="row wrap"><label class="btn ghost sm">' + (d.logo ? 'Replace logo' : 'Upload logo') + '<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="sr-only" data-upload="logo"></label>' + (d.logo ? '<button type="button" class="btn quiet sm" data-act="br-logo-rm">Remove</button>' : '') + '</div><span class="hint">PNG, JPG, WebP or SVG. It’s shrunk to 160px so it fits in cookie storage.</span></div>' +
      (d.logo ? '<div class="setrow"><div class="grow"><span class="label" id="b-hn">Logo already shows the name</span><span class="hint">Hides the text next to the logo.</span></div><button type="button" class="switch" role="switch" aria-labelledby="b-hn" aria-checked="' + !!d.hideName + '" data-act="br-hidename"><span></span></button></div>' : '') +
      '<div class="field"><label for="b-accent">Accent colour</label><div class="color-row"><input id="b-accent" type="color" data-f="accent" data-rr="change" value="' + esc(d.accent || '#1F6B67') + '"><button type="button" class="btn quiet sm" data-act="br-accent-reset">Use default</button></div><span class="hint">' + (low ? 'This colour is light for text on white. A darker shade will read better.' : 'Used for today’s bar, links and progress. Dark mode gets a lighter version automatically.') + '</span></div>' +
      '<div class="setrow"><div class="grow"><span class="label" id="b-m">Show mascot</span><span class="hint">Off replaces the sun and its jokes with plain status words.</span></div><button type="button" class="switch" role="switch" aria-labelledby="b-m" aria-checked="' + d.showMascot + '" data-act="br-mascot"><span></span></button></div>' +
      (d.showMascot ? '<div class="field"><label for="b-mname">Mascot name</label><input id="b-mname" class="input" data-f="mascotName" maxlength="20" value="' + esc(d.mascotName) + '"></div>' : '') +
      '<div class="field"><label for="b-catch">Over-budget catchphrase</label><input id="b-catch" class="input" data-f="catch" maxlength="40" value="' + esc(d.catch) + '"><span class="hint">Shown when you go over a day’s allowance, and stamped on the recap.</span></div>' +
      errLine(sh) + '<button type="button" class="btn block" data-act="br-save">Save branding</button>' + delBtn(sh, 'Restore the original branding', 'Tap again to restore the original branding', 'br-reset');
  }

  function sheetAccounts() {
    return sheetHead('Accounts') + '<div class="rows">' + S.index.profiles.map(function (m) {
      var me = m.id === S.pid;
      return '<button type="button" class="prow" data-act="' + (me ? 'close' : 'switch-to') + '" data-id="' + esc(m.id) + '">' + accAvatar(m, 42) + '<span class="grow"><strong>' + esc(m.name) + '</strong><span class="hint">' + (me ? 'Signed in' : m.hash ? 'Tap to unlock' : 'Tap to switch') + (m.demo ? ' · Example data' : '') + '</span></span>' + (me ? '<span style="color:var(--good)">' + ic('check', 20) + '</span>' : ic('chev', 18)) + '</button>';
    }).join('') + '</div><div class="duo"><button type="button" class="btn quiet" data-act="add-account">' + ic('plus', 18) + ' New account</button><button type="button" class="btn quiet" data-act="signout">' + ic('logout', 18) + ' Sign out</button></div>';
  }

  function vtitle(v) { return v.kind === 'manual' ? (v.label ? '“' + v.label + '”' : 'Saved by you') : v.kind === 'before' ? v.label : (v.label || 'Automatic save'); }
  function vdiff(v, cur, curJson) {
    if (v.data === curJson) return 'Same as now';
    var c = v.counts || {}, parts = [];
    [['trips', 'trip'], ['spends', 'spend'], ['plans', 'plan'], ['bookings', 'booking'], ['packing', 'packing item']].forEach(function (k) {
      var d = (c[k[0]] || 0) - (cur[k[0]] || 0);
      if (d) parts.push(Math.abs(d) + (d > 0 ? ' more ' : ' fewer ') + (Math.abs(d) === 1 ? k[1] : k[1] + 's'));
    });
    return parts.length ? 'Compared with now: ' + parts.join(', ') : 'Same counts as now, different details';
  }
  function sheetHistory(sh) {
    var cur = vcounts(S.p), curJson = snapJson(), list = sh.list;
    var h = sheetHead('Version history') +
      '<p class="hint">' + esc(BR.name) + ' keeps versions of this account on this device. It saves one automatically while you make changes (at most every 20 minutes), before big changes like deleting a trip or importing spends, and whenever you save one yourself. Restoring a version saves your current state first, so you can always come back.</p>' +
      '<section class="card"><div class="field"><label for="vh-label">Save a version now</label><input id="vh-label" class="input" data-f="label" maxlength="60" placeholder="Optional name, e.g. Before changing hotels" value="' + esc(sh.d.label) + '"></div><button type="button" class="btn" data-act="vh-save" data-primary="1">' + ic('target', 18) + ' Save this version</button></section>';
    if (!Versions.ok()) h += '<p class="notice">This browser can’t store versions here, so they last only until you close the tab.</p>';
    if (!list) return h + '<p class="hint">Loading versions…</p>';
    if (!list.length) return h + '<section class="card"><p class="hint">No versions yet. One is saved the next time you make a change.</p></section>';
    var groups = [], g = null, td = today();
    list.forEach(function (v) { var ds = iso(new Date(v.at)); if (!g || g.ds !== ds) { g = { ds: ds, items: [] }; groups.push(g); } g.items.push(v); });
    h += groups.map(function (gr) {
      var lbl = gr.ds === td ? 'Today' : gr.ds === addDays(td, -1) ? 'Yesterday' : fmtD(gr.ds, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      return '<section class="card tight"><div class="card-head"><span class="eyebrow">' + esc(lbl) + '</span><span class="hint">' + plural(gr.items.length, 'version') + '</span></div><div class="rows">' + gr.items.map(function (v) {
        var c = v.counts || {}, armed = sh.armed === v.id, open = sh.open === v.id, icon = v.kind === 'manual' ? 'target' : v.kind === 'before' ? 'lock' : 'clock';
        var line = plural(c.trips || 0, 'trip') + ' · ' + plural(c.spends || 0, 'spend') + ' · ' + plural(c.plans || 0, 'plan') + ' · ' + plural(c.bookings || 0, 'booking');
        return '<div class="vrow"><span class="tile" style="--c:var(--accent)">' + ic(icon, 17) + '</span>' +
          '<button type="button" class="it-main" data-act="vh-open" data-id="' + esc(v.id) + '" aria-expanded="' + open + '"><strong>' + esc(vtitle(v)) + '</strong><span class="hint">' + esc(new Date(v.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) + ' · ' + line) + '</span><span class="hint">' + esc(vdiff(v, cur, curJson)) + '</span>' +
          (open ? '<span class="hint" style="color:var(--ink-2);margin-top:4px">' + esc((c.names || []).join(' · ') || 'No trips') + ' · ' + esc(kb(v.size || 0)) + '</span>' : '') + '</button>' +
          '<span class="vact"><button type="button" class="btn sm' + (armed ? '' : ' quiet') + '" data-act="vh-restore" data-id="' + esc(v.id) + '"' + (v.data === curJson ? ' disabled' : '') + '>' + (armed ? 'Tap to restore' : 'Restore') + '</button><button type="button" class="icon-btn sm" data-act="vh-del" data-id="' + esc(v.id) + '" aria-label="Delete this version" style="border:0">' + ic('x', 14) + '</button></span></div>';
      }).join('') + '</div><div class="spacer"></div></section>';
    }).join('');
    var size = list.reduce(function (a, v) { return a + (v.size || 0); }, 0), autos = list.filter(function (v) { return v.kind === 'auto'; }).length;
    h += errLine(sh) + '<p class="hint">' + plural(list.length, 'version') + (list.length === 1 ? ' uses ' : ' use ') + esc(kb(size)) + ' on this device. ' + esc(BR.name) + ' keeps the latest 40 automatic saves, 25 before-change saves and 60 of your own. Versions aren’t part of backups, and photos removed since a version was saved come back only if they’re still on this device.</p>' +
      (autos ? '<button type="button" class="btn danger block' + (sh.armed === 'all' ? ' armed' : '') + '" data-act="vh-clear">' + (sh.armed === 'all' ? 'Tap again to delete ' + plural(autos, 'automatic version') : 'Delete automatic versions') + '</button>' : '');
    return h;
  }
  function sheetAbout() {
    return sheetHead('What’s new') + '<div class="row">' + (BR.showMascot ? mascot('chill', 44) : '') + '<div class="grow"><strong style="font-size:var(--t-md)">' + esc(BR.name) + ' ' + APP_VERSION + '</strong><span class="hint">Everything stays on this device. It works offline once opened.</span></div></div>' +
      CHANGELOG.map(function (r, i) {
        return '<section class="card' + (i ? ' tight' : '') + '"' + (i ? ' style="padding-block:0.875rem"' : '') + '><div class="row between"><h3 class="h3">Version ' + esc(r.v) + (i === 0 ? ' · current' : '') + '</h3><span class="hint">' + esc(fmtD(r.date, { day: 'numeric', month: 'short', year: 'numeric' })) + '</span></div><ul class="cl">' + r.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>';
      }).join('') + '<p class="hint">Rolling back your trips is in More → Version history. Updates to the app arrive automatically the next time you open it online.</p>';
  }
  var SHEETS = { spend: sheetSpend, trip: sheetTrip, trips: sheetTrips, wallet: sheetWallet, booking: sheetBooking, item: sheetItem, fund: sheetFund, caps: sheetCaps, sms: sheetSms, csv: sheetCsv, text: sheetText, restore: sheetRestore, recap: sheetRecap, brand: sheetBrand, accounts: sheetAccounts, history: sheetHistory, about: sheetAbout };
