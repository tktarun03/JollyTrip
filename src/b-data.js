  /* =========================================================
     Catalogs
     ========================================================= */
  var CATS = {
    stay: { label: 'Stay', short: 'Stay', color: '#7B6EAF' },
    flights: { label: 'Flights', short: 'Flights', color: '#4C79B6' },
    transport: { label: 'Getting around', short: 'Transport', color: '#3B8C77' },
    food: { label: 'Food & drinks', short: 'Food', color: '#C06D47' },
    activities: { label: 'Sights & activities', short: 'Activities', color: '#B2628A' },
    shopping: { label: 'Shopping & gifts', short: 'Shopping', color: '#B4873A' },
    other: { label: 'Other', short: 'Other', color: '#878D96' }
  };
  function cs(k) { return (CATS[k] || CATS.other).short; }
  /* Kinds of itinerary items, and the spend category each one logs to. */
  var PLK = {
    sight: { label: 'Sight', cat: 'activities', icon: 'pin' },
    activity: { label: 'Activity', cat: 'activities', icon: 'activities' },
    food: { label: 'Food', cat: 'food', icon: 'food' },
    transport: { label: 'Travel', cat: 'transport', icon: 'transport' },
    shopping: { label: 'Shopping', cat: 'shopping', icon: 'shopping' },
    rest: { label: 'Downtime', cat: 'other', icon: 'moon' },
    note: { label: 'Note', cat: 'other', icon: 'note' }
  };
  var BKT = {
    flight: { label: 'Flight', cat: 'flights', icon: 'flights', a: 'Flight', b: 'Return flight', endName: 'Return date', hasEnd: true },
    stay: { label: 'Stay', cat: 'stay', icon: 'stay', a: 'Check in', b: 'Check out', endName: 'Check-out date', hasEnd: true },
    car: { label: 'Car rental', cat: 'transport', icon: 'car', a: 'Pick up car', b: 'Drop off car', endName: 'Drop-off date', hasEnd: true },
    train: { label: 'Train or bus', cat: 'transport', icon: 'transport', a: 'Departs', b: 'Return', endName: 'Return date', hasEnd: true },
    tour: { label: 'Tour or tickets', cat: 'activities', icon: 'activities', a: '', b: '', endName: '', hasEnd: false },
    other: { label: 'Other', cat: 'other', icon: 'other', a: '', b: 'Ends', endName: 'End date', hasEnd: true }
  };
  var WTYPES = { card: { label: 'Card', icon: 'card' }, cash: { label: 'Cash', icon: 'cash' }, bank: { label: 'Bank account', icon: 'bank' }, wallet: { label: 'Travel card or app', icon: 'phone' } };
  var PACK_GROUPS = ['Documents', 'Clothes', 'Toiletries', 'Health', 'Electronics', 'Kids', 'Other'];
  var PACK_TEMPLATE = {
    Documents: ['Passports', 'Visas or e-visas', 'Flight tickets', 'Hotel confirmations', 'Travel insurance', 'Driving licence', 'Cards and some cash'],
    Clothes: ['Clothes for each day', 'Sleepwear', 'Comfortable walking shoes', 'Jacket or layers', 'Swimwear'],
    Toiletries: ['Toothbrushes and toothpaste', 'Shampoo and soap', 'Hairbrush', 'Sunscreen'],
    Health: ['Regular medicines', 'Small first-aid kit', 'Hand sanitiser'],
    Electronics: ['Phone chargers', 'Power bank', 'Travel adapter', 'Headphones'],
    Kids: ['Snacks for the journey', 'Flight entertainment', 'Wet wipes', 'Favourite toy'],
    Other: ['Water bottles', 'Day bag', 'Umbrella']
  };
  var ROAST = {
    stay: 'Nice pillows. Pricey pillows.',
    flights: 'Up, up and away goes the budget.',
    transport: 'Could have walked. The view was free.',
    food: 'Calories don’t count on holiday. Prices do.',
    activities: 'Memories are priceless. This one had a price.',
    shopping: 'Another fridge magnet for the collection.',
    other: 'Logged. Judged. Moving on.'
  };
  function roastFor(x) { return ROAST[x.cat] || ROAST.other; }

  /* =========================================================
     Icons (thin line art) and the mascot
     ========================================================= */
  var P = {
    stay: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
    flights: '<path d="M10.5 13.5 4 11l1.2-1.2 7 1 3.3-3.3c.8-.8 2-.8 2.5-.2.6.6.6 1.7-.2 2.5l-3.3 3.3 1 7L14.3 21l-2.5-6.5-3 3v2.3L7.6 21 6 18l-3-1.6 1.2-1.2h2.3z"/>',
    transport: '<rect x="6" y="3.5" width="12" height="13" rx="3"/><path d="M6 11h12M9 20l-1.5 1.5M15 20l1.5 1.5M9 14h.01M15 14h.01"/>',
    car: '<path d="M5 16v-5l2-5h10l2 5v5"/><path d="M4 16h16v2.5H4zM7.5 13h.01M16.5 13h.01"/>',
    food: '<path d="M5 3v7a2 2 0 0 0 2 2v9M9 3v7a2 2 0 0 1-2 2M7 3v6M17 21V3c-2 1.5-3 4-3 7h3"/>',
    activities: '<path d="M4 10a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 1 0-4V6H4zM14 6v12"/>',
    shopping: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    other: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    note: '<path d="M6 3.5h9l3 3V20.5H6z"/><path d="M9 10h6M9 14h6M9 18h3"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    chart: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
    dots: '<circle cx="12" cy="5.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="18.5" r="1.2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    left: '<path d="m15 5-7 7 7 7"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>',
    download: '<path d="M12 4v11M8 11l4 4 4-4M5 19h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 6M18 19.5a5.5 5.5 0 0 0-2.5-4.6"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    flame: '<path d="M12 21c-3.9 0-7-2.8-7-6.6 0-3.1 2-5.3 3.6-7 .4 1.8 1.5 3 2.6 3.4C11 7.6 12.4 5 15 3c.2 3 1.7 4.6 2.8 6.2A7.2 7.2 0 0 1 19 13.9C19 18 15.9 21 12 21z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    bag: '<rect x="4" y="7" width="16" height="13" rx="2.5"/><path d="M9 7V5a3 3 0 0 1 6 0v2M4 12h16"/>',
    bank: '<path d="M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18M12 3l9 5H3z"/>',
    card: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18M7 15h4"/>',
    cash: '<rect x="3" y="7" width="18" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.5"/><path d="M6.5 10v.01M17.5 15v.01"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
    msg: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    upload: '<path d="M12 16V5M8 9l4-4 4 4M5 19h14"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16" height="11" rx="2.5"/><path d="M16 13.5h.01"/>',
    nav: '<path d="M12 2.5 19.5 21 12 16.8 4.5 21z"/>',
    face: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 16a3.5 3.5 0 0 0 5 0"/>',
    doc: '<path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4M9 13h6M9 16.5h4"/>',
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8 10h8M8 14h5"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4.2h-4.2"/>',
    open: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  function ic(n, s) { s = s || 20; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || P.other) + '</svg>'; }
  function mascot(mood, size) {
    var s = size || 56, sw = 'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"', rays = '', face;
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4 + Math.PI / 8;
      rays += '<path d="M' + (50 + Math.cos(a) * 39).toFixed(1) + ' ' + (50 + Math.sin(a) * 39).toFixed(1) + 'L' + (50 + Math.cos(a) * 46).toFixed(1) + ' ' + (50 + Math.sin(a) * 46).toFixed(1) + '" ' + sw + '/>';
    }
    if (mood === 'broke') face = '<path d="M38 41l6 6M44 41l-6 6M56 41l6 6M62 41l-6 6" ' + sw + '/><path d="M41 63q9-7 18 0" ' + sw + '/>';
    else if (mood === 'nervous') face = '<circle cx="41" cy="45" r="2.6" fill="currentColor"/><circle cx="59" cy="45" r="2.6" fill="currentColor"/><path d="M39 59q2.75-2.75 5.5 0t5.5 0t5.5 0t5.5 0" ' + sw + '/><path d="M70 30q4 6 0 9q-4-3 0-9z" fill="currentColor"/>';
    else face = '<path d="M37 46q4-5 8 0M55 46q4-5 8 0" ' + sw + '/><path d="M40 56q10 9 20 0" ' + sw + '/>';
    return '<svg class="mascot" width="' + s + '" height="' + s + '" viewBox="0 0 100 100" aria-hidden="true"' + (mood === 'broke' ? ' style="opacity:.7"' : '') + '><circle cx="50" cy="50" r="31" ' + sw + '/>' + rays + face + '</svg>';
  }
  function ring(pct, size) {
    var r = (size - 6) / 2, C = 2 * Math.PI * r, cx = size / 2;
    return '<svg class="ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' +
      '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke-width="2" style="stroke:var(--line)"/>' +
      '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + (C * (1 - Math.min(Math.max(pct, 0), 1))).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="stroke:var(--accent)"/>' +
      '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" style="fill:var(--ink);font:300 15px \'Albert Sans\', sans-serif;letter-spacing:-0.02em">' + Math.round(pct * 100) + '%</text></svg>';
  }
  var AV = ['#1F6B67', '#4C79B6', '#7B6EAF', '#B2628A', '#C06D47', '#B4873A', '#3B8C77', '#5E6670'];
  function avatar(p, s) {
    s = s || 36;
    return '<span class="av" style="width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * 0.36) + 'px;--c:' + esc(p.color || AV[0]) + '" aria-hidden="true">' + esc(initials(p.name)) + (p.photo ? photoImg(p.photo) : '') + '</span>';
  }
  var POSTCARD = '<svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="140" fill="var(--accent-soft)"/><circle cx="236" cy="74" r="30" fill="var(--accent)" opacity=".13"/><circle cx="236" cy="74" r="16" fill="var(--accent)" opacity=".3"/><path d="M0 94 Q 80 84 160 94 T 320 94 V140 H0Z" fill="var(--accent)" opacity=".12"/><path d="M0 108 Q 80 98 160 108 T 320 108 V140 H0Z" fill="var(--accent)" opacity=".2"/><path d="M0 122 Q 80 114 160 122 T 320 122 V140 H0Z" fill="var(--accent)" opacity=".3"/></svg>';

  /* =========================================================
     Branding: name, logo, accent, mascot and catchphrase (per device)
     ========================================================= */
  var BR_DEF = { name: 'JollyTrip', logo: '', hideName: false, mascotName: 'Sunny', showMascot: true, catch: 'Slow down, explorer.', accent: '' };
  var BR = Object.assign({}, BR_DEF);
  var LOGO_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/;
  var HEX_RE = /^#[0-9a-fA-F]{6}$/;
  function cleanBrand(b) {
    b = Object.assign({}, BR_DEF, b || {});
    b.name = String(b.name || '').trim().slice(0, 32) || BR_DEF.name;
    b.mascotName = String(b.mascotName || '').trim().slice(0, 20) || BR_DEF.mascotName;
    b.catch = String(b.catch || '').trim().slice(0, 40) || BR_DEF.catch;
    b.logo = LOGO_RE.test(String(b.logo || '')) ? b.logo : '';
    b.accent = HEX_RE.test(String(b.accent || '')) ? b.accent : '';
    b.hideName = !!b.hideName && !!b.logo;
    b.showMascot = b.showMascot !== false;
    return b;
  }
  function mixHex(a, b, t) { function ch(h, i) { return parseInt(h.substr(i, 2), 16); } return '#' + [1, 3, 5].map(function (i) { var v = Math.round(ch(a, i) * (1 - t) + ch(b, i) * t); return ('0' + v.toString(16)).slice(-2); }).join(''); }
  function lum(hex) { var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function applyBrand(b) {
    b = b || BR;
    var st = document.getElementById('brand-css');
    if (!st) { st = document.createElement('style'); st.id = 'brand-css'; (document.head || document.documentElement).appendChild(st); }
    var a = HEX_RE.test(b.accent || '') ? b.accent : '';
    if (!a) { st.textContent = ''; }
    else {
      var dark = '--accent:' + mixHex(a, '#FFFFFF', 0.4) + ';--accent-soft:' + mixHex(a, '#121515', 0.8) + ';';
      st.textContent = ':root{--accent:' + a + ';--accent-soft:' + mixHex(a, '#FFFFFF', 0.87) + ';}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){' + dark + '}}:root[data-theme="dark"]{' + dark + '}';
    }
    try { document.title = b.name; } catch (e) { }
  }
  function wordmark(b, small) {
    var mark = b.logo ? '<img class="logo" src="' + esc(b.logo) + '" alt="' + esc(b.name) + (b.hideName ? '' : ' logo') + '">' : (b.showMascot ? mascot('chill', small ? 18 : 30) : (small ? ic('sun', 14) : ''));
    return '<span class="brand' + (small ? ' sm' : '') + '">' + mark + (b.logo && b.hideName ? '' : '<span>' + esc(b.name) + '</span>') + '</span>';
  }
  function heroMark(mood, size) { return BR.showMascot ? mascot(mood, size) : ''; }
  function moodLine(m) {
    if (!BR.showMascot) return { chill: 'On track', nervous: 'Getting close', broke: 'Over today' }[m];
    return BR.mascotName + ' ' + { chill: 'is beaming', nervous: 'is sweating', broke: 'has set for the day' }[m];
  }
  function stampText(c) { var w = String(c).replace(/[^\p{L}\p{N} ]/gu, '').trim().toUpperCase().split(/\s+/), out = ''; for (var i = 0; i < w.length; i++) { var n = out ? out + ' ' + w[i] : w[i]; if (n.length > 12) break; out = n; } return out || 'OVER'; }

  /* =========================================================
     App version and what changed
     ========================================================= */
  var APP_VERSION = '3.7';
  var CHANGELOG = [
    { v: '3.7', date: '2026-11-06', items: ['Save backup makes a file you can keep in Files or iCloud Drive, and Restore from backup can read it back. Today reminds you when your last backup is more than a week old.', 'Add to Calendar: the whole trip from Plan → Bookings, or one booking from its sheet or pass. Check-in, check-out, flights, balances due and timed plans come with alerts.', 'Add to Apple Wallet now uses a pass you’ve just attached, before you save the booking.'] },
    { v: '3.6', date: '2026-11-05', items: ['Directions: tap the arrow next to a place or booking and choose Apple Maps, Google Maps or Waze, for driving, walking or transit. Save a favourite in More → Maps and wallet.', 'Add to Apple Wallet on every booking: uses the airline’s or hotel’s own pass if attached, or makes one with the free WalletWallet service.', 'Bookings have an address, read from pasted or scanned confirmations when possible.'] },
    { v: '3.5', date: '2026-11-05', items: ['Travel wallet: every booking as a pass with its code as a QR code, offline. Open it from Plan → Bookings or any booking.', 'Add the airline’s or hotel’s own Apple Wallet pass (.pkpass) to Apple Wallet, or open their Google Wallet link.', '“+ Add a wallet…” in the spend, booking and CSV import forms, so you can add a card or cash wallet without leaving the form.'] },
    { v: '3.4', date: '2026-11-03', items: ['Face ID or fingerprint can be turned on straight from More → Security or your profile. Without a PIN, it walks you through setting one first, and new PINs offer Face ID right away.'] },
    { v: '3.3', date: '2026-11-03', items: ['The app locks itself after 5 minutes without a touch, click or keystroke (with a PIN or Face ID set up). The time follows your Lock the app setting.', 'Pinch and double-tap zoom are turned off. Use More → Appearance → Text size instead.'] },
    { v: '3.2', date: '2026-11-03', items: ['Paste a booking’s confirmation text to fill in its details.', 'Bookings get a picture: the hotel photo from your PDF, a photo you attach, or a drawn picture for each kind of booking.', 'Messages now slide up from the bottom and have a close button.'] },
    { v: '3.1', date: '2026-11-03', items: ['Version history: your trips are saved automatically while you make changes, before big changes, and whenever you choose. Restore any version in one tap.', 'Undo straight after deleting, importing or restoring.', 'App lock with a PIN, plus Face ID or fingerprint unlock, in More → Security.', 'Attach booking confirmations as PDFs or photos. JollyTrip reads the code, dates and total, and can read the amount from a spend’s receipt photo.', 'Manage your profile, including your own picture.', 'A refresh button, and sheets whose title stays put while the content scrolls.'] },
    { v: '3.0', date: '2026-11-03', items: ['Rebuilt as a family trip planner: day-by-day itinerary, bookings with deposits and due dates, packing list and trip notes.', 'Accounts, branding, wallets, bank SMS and CSV import, streaks, category limits, trip fund, nightly recap and insights.', 'Bookings are set aside before the daily allowance.', 'Money splitting removed.'] },
    { v: '2.2', date: '2026-11-02', items: ['Works offline and installs to the home screen.', 'Share a trip summary and export spends as CSV.'] },
    { v: '2.1', date: '2026-11-02', items: ['Trip cover photos, photos on spends and traveller avatars.', 'Light theme by default.'] },
    { v: '2.0', date: '2026-11-02', items: ['Trips save to cookies, with a copy in local storage.'] },
    { v: '1.0', date: '2026-11-02', items: ['First version: daily allowance, local and home currency, several trips.'] }
  ];

  /* =========================================================
     State, accounts, migration
     ========================================================= */
  var S = { index: { v: 1, profiles: [] }, pid: null, p: null, tab: 'today', planSeg: 'itinerary', auth: { mode: 'home' }, sheet: null, lb: null, filter: { wallet: 'all', cat: 'all', q: '' }, limit: 80, showJson: false, bk: null, lastWallet: null, warned: false, legacy: null, locked: false, lockPid: null, lock: null, hiddenAt: 0, undo: null, savedJson: null, lastSnapJson: null, lastAutoAt: 0, vinfo: null };
  function meta(pid) { var id = pid || S.pid; for (var i = 0; i < S.index.profiles.length; i++) if (S.index.profiles[i].id === id) return S.index.profiles[i]; return null; }
  function accAvatar(m, s) { return avatar({ name: m && m.name || '?', color: m && m.color || AV[0], photo: m && m.photo || null }, s); }
  function trip() { if (!S.p) return null; for (var i = 0; i < S.p.trips.length; i++) if (S.p.trips[i].id === S.p.active) return S.p.trips[i]; return S.p.trips[0] || null; }
  function person(t, id) { for (var i = 0; i < t.people.length; i++) if (t.people[i].id === id) return t.people[i]; return null; }
  function walletById(t, id) { for (var i = 0; i < t.wallets.length; i++) if (t.wallets[i].id === id) return t.wallets[i]; return null; }
  function bookingById(t, id) { for (var i = 0; i < t.bookings.length; i++) if (t.bookings[i].id === id) return t.bookings[i]; return null; }
  function migrateTrip(t, p) {
    t = t || {};
    t.id = t.id || uid();
    t.name = String(t.name || 'Trip');
    t.place = String(t.place || '');
    if (!validDate(t.start)) t.start = today();
    if (!validDate(t.end) || t.end < t.start) t.end = t.start;
    t.home = t.home || (p && p.home) || guessCur();
    t.local = t.local || t.home;
    t.rate = t.local === t.home ? 1 : (num(t.rate) || 1);
    t.budget = num(t.budget);
    t.cover = t.cover || null;
    t.people = Array.isArray(t.people) ? t.people : [];
    t.people.forEach(function (x, i) { x.id = x.id || uid(); x.name = String(x.name || 'Traveller'); x.color = x.color || AV[i % AV.length]; x.photo = x.photo || null; });
    if (!Array.isArray(t.wallets) || !t.wallets.length) {
      t.wallets = [{ id: uid(), name: 'Card', type: 'card', cur: t.home, opening: 0 }, { id: uid(), name: 'Cash', type: 'cash', cur: t.local, opening: 0 }];
    }
    t.wallets.forEach(function (w) { w.id = w.id || uid(); w.name = String(w.name || 'Wallet'); w.type = WTYPES[w.type] ? w.type : 'card'; w.cur = w.cur === t.local ? t.local : t.home; w.opening = num(w.opening); });
    t.expenses = (Array.isArray(t.expenses) ? t.expenses : []).filter(function (x) { return x && validDate(x.date) && num(x.amt) > 0; });
    t.expenses.forEach(function (x) {
      x.id = x.id || uid(); x.amt = num(x.amt); x.cur = x.cur === t.local ? t.local : t.home;
      x.rate = x.cur === t.home ? 1 : (num(x.rate) || t.rate);
      x.cat = CATS[x.cat] ? x.cat : 'other'; x.note = String(x.note || ''); x.time = /^\d{2}:\d{2}$/.test(x.time || '') ? x.time : '';
      x.photos = Array.isArray(x.photos) ? x.photos : []; x.who = x.who || ''; x.wallet = x.wallet || ''; x.bookingId = x.bookingId || '';
      delete x.paidBy; delete x.split;
    });
    t.plan = (Array.isArray(t.plan) ? t.plan : []).filter(Boolean);
    t.plan.forEach(function (it) { it.id = it.id || uid(); it.day = validDate(it.day) ? it.day : ''; it.time = /^\d{2}:\d{2}$/.test(it.time || '') ? it.time : ''; it.title = String(it.title || 'Plan'); it.kind = PLK[it.kind] ? it.kind : 'sight'; it.place = String(it.place || ''); it.notes = String(it.notes || ''); it.cost = num(it.cost); it.cur = it.cur === t.local ? t.local : t.home; it.done = !!it.done; });
    t.bookings = (Array.isArray(t.bookings) ? t.bookings : []).filter(Boolean);
    t.bookings.forEach(function (b) { b.id = b.id || uid(); b.type = BKT[b.type] ? b.type : 'other'; b.name = String(b.name || BKT[b.type].label); b.provider = String(b.provider || ''); b.start = validDate(b.start) ? b.start : t.start; b.end = validDate(b.end) ? b.end : ''; b.time = b.time || ''; b.endTime = b.endTime || ''; b.conf = String(b.conf || ''); b.total = num(b.total); b.cur = b.cur === t.local ? t.local : t.home; b.due = validDate(b.due) ? b.due : ''; b.notes = String(b.notes || ''); b.photos = Array.isArray(b.photos) ? b.photos : []; b.files = Array.isArray(b.files) ? b.files.filter(function (f) { return f && f.id; }) : []; b.cover = b.cover || null; b.gwallet = /^https:\/\//i.test(b.gwallet || '') ? String(b.gwallet).trim() : ''; b.address = String(b.address || ''); });
    t.packing = (Array.isArray(t.packing) ? t.packing : []).filter(Boolean);
    t.packing.forEach(function (k) { k.id = k.id || uid(); k.text = String(k.text || ''); k.group = PACK_GROUPS.indexOf(k.group) >= 0 ? k.group : 'Other'; k.who = k.who || ''; k.done = !!k.done; });
    t.notes = String(t.notes || '');
    t.fund = t.fund && Array.isArray(t.fund.entries) ? t.fund : { target: '', entries: [] };
    t.fund.entries = t.fund.entries.filter(function (e) { return e && num(e.amt) > 0; });
    t.caps = (Array.isArray(t.caps) ? t.caps : []).filter(function (k) { return k && CATS[k.cat] && num(k.amount) > 0; });
    return t;
  }
  function migrate(p) {
    p = p || {};
    p.v = 2;
    p.home = p.home || guessCur();
    p.createdAt = p.createdAt || Date.now();
    p.settings = Object.assign({ theme: 'light', ts: 'device', hide: false, roast: true }, p.settings || {});
    p.trips = (Array.isArray(p.trips) ? p.trips : []).map(function (t) { return migrateTrip(t, p); });
    if (!p.trips.some(function (t) { return t.id === p.active; })) p.active = p.trips[0] ? p.trips[0].id : null;
    return p;
  }
  function saveIndex() { Store.set(APP.key + 'idx', S.index); }
  function save() {
    if (!S.p || !S.pid) return;
    S.p.savedAt = Date.now();
    var r = Store.set(APP.key + 'p_' + S.pid, S.p);
    autoVersion();
    if (!r.ok) toast('Couldn’t save', 'This browser’s storage is full or blocked. Copy a backup from More to keep your trips.');
    else if (r.overflow && !S.warned) { S.warned = true; toast('Moved to local storage', 'Your trips outgrew cookie space, so they now save to local storage on this device.'); }
  }
  function setSession(pid) { if (pid) Store.set(APP.key + 'sess', { pid: pid }); else Store.remove(APP.key + 'sess'); }
  function loadProfile(pid) { var p = Store.get(APP.key + 'p_' + pid); if (!p) return false; S.pid = pid; S.p = migrate(p); nf = {}; S.tab = 'today'; S.filter = { wallet: 'all', cat: 'all', q: '' }; S.showJson = false; applySettings(); initVersions(''); return true; }
  function signOut(silent) { S.undo = null; S.vinfo = null; S.pid = null; S.p = null; S.sheet = null; S.lb = null; setSession(null); nf = {}; S.auth = { mode: 'home' }; applySettings(); if (!silent) { renderAll(); toast('Signed out', 'Your trips stay saved on this device.'); } }
  function deleteProfile(pid) { Versions.list(pid).then(function (vs) { return Versions.del(vs.map(function (v) { return v.id; })); }); Store.remove(APP.key + 'p_' + pid); S.index.profiles = S.index.profiles.filter(function (x) { return x.id !== pid; }); saveIndex(); }
  /* =========================================================
     Version history and undo
     ========================================================= */
  var AUTO_GAP = 20 * 60000;
  function snapJson(p) { var o = JSON.parse(JSON.stringify(p || S.p)); delete o.savedAt; return JSON.stringify(o); }
  function vcounts(p) {
    var c = { trips: p.trips.length, spends: 0, plans: 0, bookings: 0, packing: 0, names: [] };
    p.trips.forEach(function (t) { c.spends += t.expenses.length; c.plans += t.plan.length; c.bookings += t.bookings.length; c.packing += t.packing.length; c.names.push(t.name + ' (' + plural(t.expenses.length, 'spend') + ')'); });
    return c;
  }
  function snapshot(kind, label, json) {
    if (!S.p || !S.pid) return Promise.resolve(null);
    json = json || snapJson();
    if (kind === 'auto' && json === S.lastSnapJson) return Promise.resolve(null);
    var counts; try { counts = vcounts(migrate(JSON.parse(json))); } catch (e) { counts = vcounts(S.p); }
    var rec = { id: 'v_' + uid(), pid: S.pid, at: Date.now(), kind: kind, label: label || '', size: json.length, counts: counts, data: json };
    S.lastSnapJson = json; if (kind === 'auto') S.lastAutoAt = rec.at;
    return Versions.add(rec).then(function () { return pruneVersions(rec.pid); }).then(function () { S.vinfo = null; return rec; });
  }
  /* Before the first change in each 20-minute stretch, keep the state as it was. */
  function autoVersion() {
    var now = snapJson(), prev = S.savedJson;
    if (prev && prev !== now && Date.now() - S.lastAutoAt >= AUTO_GAP && prev !== S.lastSnapJson) snapshot('auto', '', prev);
    S.savedJson = now;
  }
  function pruneVersions(pid) {
    return Versions.list(pid).then(function (vs) {
      var keep = { auto: 40, before: 25, manual: 60 }, seen = { auto: 0, before: 0, manual: 0 }, drop = [];
      vs.forEach(function (v) { var k = keep[v.kind] ? v.kind : 'auto'; seen[k]++; if (seen[k] > keep[k]) drop.push(v.id); });
      if (drop.length) return Versions.del(drop);
    });
  }
  function initVersions(firstLabel) {
    S.undo = null; S.vinfo = null; S.savedJson = snapJson(); S.lastSnapJson = null; S.lastAutoAt = 0;
    var pid = S.pid;
    return Versions.list(pid).then(function (vs) {
      if (pid !== S.pid) return;
      var a = vs.filter(function (v) { return v.kind === 'auto'; })[0];
      S.lastAutoAt = a ? a.at : 0; S.lastSnapJson = vs[0] ? vs[0].data : null;
      if (!vs.length || (vs[0].data !== S.savedJson && Date.now() - vs[0].at > AUTO_GAP)) return snapshot('auto', vs.length ? '' : (firstLabel || 'First saved version'), S.savedJson);
    });
  }
  /* Keeps the state before a change so it can be undone; big changes also become a saved version. */
  function checkpoint(label, keepVersion) {
    var json = snapJson();
    S.undo = { json: json, label: label, at: Date.now() };
    if (keepVersion) snapshot('before', label, json);
  }
  function fmtWhen(ts) { return new Date(ts).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
  function applySettings() {
    var s = S.p ? S.p.settings : { theme: 'light', ts: 'device' }, r = document.documentElement;
    if (s.theme === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', s.theme === 'dark' ? 'dark' : 'light');
    if (s.ts === 'small' || s.ts === 'large') r.setAttribute('data-ts', s.ts); else r.removeAttribute('data-ts');
    try { var bg = getComputedStyle(document.body).backgroundColor; document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.removeAttribute('media'); m.setAttribute('content', bg); }); } catch (e) { }
  }

  /* =========================================================
     Example data
     ========================================================= */
  function demoProfile() {
    var t0 = today(), s = addDays(t0, -4), e = addDays(s, 8), J = 'JPY', Q = 'QAR', R = 0.0244;
    var you = 'm1', mee = 'm2', aar = 'm3', diy = 'm4';
    var card = 'w1', cash = 'w2';
    var bF = 'b1', bR = 'b2', bO = 'b3', bT = 'b4';
    function x(off, time, amt, cur, cat, note, wallet, extra) { var o = { id: uid(), date: addDays(s, off), time: time, amt: amt, cur: cur, rate: cur === Q ? 1 : R, cat: cat, note: note, wallet: wallet, who: '', photos: [], bookingId: '' }; return Object.assign(o, extra || {}); }
    function it(off, time, kind, title, place, cost, done, notes) { return { id: uid(), day: off === null ? '' : addDays(s, off), time: time, kind: kind, title: title, place: place || '', notes: notes || '', cost: cost || 0, cur: J, done: !!done }; }
    var t = {
      id: 'demo-trip', demo: true, name: 'Kyoto & Osaka', place: 'Japan', start: s, end: e, home: Q, local: J, rate: R, budget: 22000, cover: null,
      people: [{ id: you, name: 'You', color: AV[0] }, { id: mee, name: 'Meera', color: AV[3] }, { id: aar, name: 'Aarav', color: AV[1] }, { id: diy, name: 'Diya', color: AV[5] }],
      wallets: [{ id: card, name: 'Credit card', type: 'card', cur: Q, opening: 0 }, { id: cash, name: 'Yen cash', type: 'cash', cur: J, opening: 80000 }],
      bookings: [
        { id: bF, type: 'flight', name: 'Doha – Osaka Kansai', provider: 'Qatar Airways', start: s, time: '07:45', end: e, endTime: '23:30', conf: 'QR8K2P', total: 7800, cur: Q, due: '', notes: '4 seats, 30 kg each', photos: [] },
        { id: bR, type: 'stay', name: 'Ryokan in Gion', provider: 'Example Ryokan', start: s, time: '15:00', end: addDays(s, 4), endTime: '10:00', conf: 'GION-44821', total: 168000, cur: J, due: s, notes: 'Breakfast included. Family room.', photos: [] },
        { id: bO, type: 'stay', name: 'Osaka hotel, Namba', provider: 'Example Hotel Namba', start: addDays(s, 4), time: '14:00', end: e, endTime: '11:00', conf: 'NMB-7730', total: 92000, cur: J, due: e, notes: 'Pay at checkout.', photos: [] },
        { id: bT, type: 'tour', name: 'Tea ceremony, Arashiyama', provider: 'Example Tea House', start: addDays(s, 2), time: '14:00', end: '', endTime: '', conf: 'TEA-2291', total: 24000, cur: J, due: '', notes: '4 people', photos: [] }
      ],
      expenses: [
        x(-40, '21:10', 7800, Q, 'flights', 'Return flights, 4 seats', card, { bookingId: bF }),
        x(-30, '20:05', 50000, J, 'stay', 'Ryokan deposit', card, { bookingId: bR }),
        x(-10, '18:40', 24000, J, 'activities', 'Tea ceremony tickets', card, { bookingId: bT }),
        x(-6, '12:00', 340, Q, 'other', 'Travel insurance', card),
        x(0, '15:20', 118000, J, 'stay', 'Ryokan balance', card, { bookingId: bR }),
        x(0, '11:30', 7200, J, 'transport', 'Haruka airport express ×4', cash),
        x(0, '12:10', 8000, J, 'transport', 'ICOCA cards and top-ups', cash),
        x(0, '19:40', 6400, J, 'food', 'Ramen near Kyoto Station', cash),
        x(0, '21:15', 2300, J, 'food', 'Konbini snacks', cash, { who: aar }),
        x(1, '08:10', 1600, J, 'activities', 'Kiyomizu-dera entry', cash),
        x(1, '12:30', 7600, J, 'food', 'Nishiki Market lunch', cash),
        x(1, '19:00', 31200, J, 'food', 'Kaiseki dinner', card),
        x(1, '16:20', 3800, J, 'shopping', 'Kimono-pattern hair clips', cash, { who: diy }),
        x(2, '09:20', 3520, J, 'transport', 'Sagano scenic train', cash),
        x(2, '12:45', 6200, J, 'food', 'Tofu lunch', cash),
        x(2, '17:30', 2800, J, 'food', 'Matcha soft serve ×4', cash),
        x(3, '08:30', 2280, J, 'transport', 'Kintetsu to Nara', cash),
        x(3, '10:15', 2400, J, 'activities', 'Todai-ji entry', cash),
        x(3, '10:40', 800, J, 'activities', 'Deer crackers', cash, { who: aar }),
        x(3, '13:00', 7400, J, 'food', 'Kakinoha-zushi lunch', cash),
        x(3, '16:30', 11800, J, 'shopping', 'Matcha and tenugui gifts', card, { who: mee }),
        x(4, '10:05', 3600, J, 'transport', 'Train to Osaka', cash),
        x(4, '11:20', 2600, J, 'food', 'Coffee and pastries', cash)
      ],
      plan: [
        it(0, '17:00', 'sight', 'Evening walk through Gion and Hanamikoji', 'Hanamikoji Street, Kyoto', 0, true),
        it(0, '19:30', 'food', 'Ramen near Kyoto Station', 'Kyoto Ramen Koji', 6000, true),
        it(1, '07:30', 'sight', 'Kiyomizu-dera before the crowds', 'Kiyomizu-dera, Kyoto', 1600, true),
        it(1, '12:00', 'food', 'Nishiki Market lunch', 'Nishiki Market, Kyoto', 7000, true),
        it(1, '19:00', 'food', 'Kaiseki dinner', 'Gion, Kyoto', 30000, true, 'Booked for 4, kids menu available'),
        it(2, '08:30', 'sight', 'Arashiyama bamboo grove', 'Arashiyama Bamboo Grove', 0, true),
        it(2, '10:30', 'transport', 'Sagano scenic train', 'Torokko Saga Station', 3520, true),
        it(3, '08:30', 'transport', 'Day trip to Nara', 'Kintetsu Kyoto Station', 2280, true),
        it(3, '10:00', 'sight', 'Todai-ji and the deer park', 'Todai-ji, Nara', 3200, true),
        it(3, '16:30', 'sight', 'Fushimi Inari at dusk', 'Fushimi Inari Taisha, Kyoto', 0, true),
        it(4, '10:00', 'transport', 'Train to Osaka', 'Kyoto Station', 3600, true),
        it(4, '15:30', 'sight', 'Osaka Castle park', 'Osaka Castle', 2400, false),
        it(4, '19:00', 'food', 'Dotonbori street food', 'Dotonbori, Osaka', 8000, false, 'Takoyaki, okonomiyaki, kushikatsu'),
        it(5, '08:30', 'activity', 'Universal Studios Japan', 'Universal Studios Japan', 36000, false, 'Express passes for 2 rides'),
        it(6, '10:00', 'activity', 'Kaiyukan Aquarium', 'Osaka Aquarium Kaiyukan', 10800, false),
        it(6, '13:00', 'food', 'Kushikatsu lunch in Shinsekai', 'Shinsekai, Osaka', 6000, false),
        it(6, '17:00', 'rest', 'Pool and early night', '', 0, false),
        it(7, '09:00', 'transport', 'Day trip to Kobe', 'Osaka-Umeda Station', 3200, false),
        it(7, '12:30', 'food', 'Kobe beef lunch', 'Kobe', 24000, false),
        it(8, '12:00', 'shopping', 'Last gifts on Shinsaibashi', 'Shinsaibashi-suji, Osaka', 15000, false),
        it(null, '', 'sight', 'teamLab Botanical Garden', 'Nagai Park, Osaka', 6400, false),
        it(null, '', 'activity', 'Half day at Arima Onsen', 'Arima Onsen', 12000, false)
      ],
      packing: [], notes: 'Emergency in Japan: 110 police, 119 ambulance or fire.\nRyokan: Example Ryokan, Gion, Kyoto. Check-out 10:00.\nOsaka hotel: Example Hotel Namba. Pay at checkout.\nIC cards: keep the receipts for refunds at Kansai airport.',
      fund: { target: '', entries: [-180, -150, -120, -90, -60, -30].map(function (d, i) { return { id: uid(), date: addDays(s, d), amt: [4000, 3500, 3500, 3500, 3500, 3000][i] }; }) },
      caps: [{ cat: 'food', amount: 2600 }, { cat: 'shopping', amount: 450 }]
    };
    PACK_GROUPS.forEach(function (g) { PACK_TEMPLATE[g].forEach(function (txt) { t.packing.push({ id: uid(), text: txt, group: g, who: g === 'Kids' ? (txt === 'Favourite toy' ? diy : '') : '', done: true }); }); });
    t.packing[t.packing.length - 1].done = false;
    return migrate({ home: Q, demo: true, createdAt: Date.now(), trips: [t], active: t.id, settings: { theme: 'light', roast: true } });
  }

  /* =========================================================
     Trip maths
     ========================================================= */
  function bookingHome(t, b) { return homeAmt(t, b.total, b.cur, t.rate); }
  function bookingPaid(t, b) { return t.expenses.reduce(function (s, x) { return x.bookingId === b.id ? s + exHome(t, x) : s; }, 0); }
  function bookingState(t, b) {
    var tot = bookingHome(t, b), paid = bookingPaid(t, b), left = Math.max(tot - paid, 0), td = today();
    var st = tot < 0.005 && paid < 0.005 ? 'none' : left < 0.5 ? 'paid' : paid > 0.5 ? 'part' : 'unpaid';
    var overdue = st !== 'paid' && st !== 'none' && b.due && b.due < td, soon = st !== 'paid' && st !== 'none' && b.due && !overdue && diff(td, b.due) <= 7;
    return { tot: tot, paid: paid, left: left, st: st, overdue: overdue, soon: soon };
  }
  function linked(t, x) { return !!(x.bookingId && bookingById(t, x.bookingId)); }
  function calc(t) {
    var td = today(), n = Math.max(diff(t.start, t.end) + 1, 1);
    var status = td < t.start ? 'upcoming' : td > t.end ? 'done' : 'active';
    var committed = 0, unpaid = 0;
    t.bookings.forEach(function (b) { var st = bookingState(t, b); committed += Math.max(st.tot, st.paid); unpaid += st.left; });
    var total = 0, pre = 0, beforeToday = 0, todaySpent = 0, byDay = {}, byCat = {}, todayCats = {}, free = 0;
    t.expenses.forEach(function (x) {
      var h = exHome(t, x); total += h; byCat[x.cat] = (byCat[x.cat] || 0) + h;
      if (linked(t, x)) return;
      free += h;
      if (x.date < t.start) pre += h; else if (x.date <= t.end) byDay[x.date] = (byDay[x.date] || 0) + h;
      if (x.date < td) beforeToday += h;
      if (x.date === td) { todaySpent += h; todayCats[x.cat] = (todayCats[x.cat] || 0) + h; }
    });
    var budget = num(t.budget), pool = budget - committed, base = Math.max(pool - pre, 0) / n;
    var dayIdx = status === 'active' ? diff(t.start, td) + 1 : null;
    var daysLeft = status === 'active' ? n - dayIdx + 1 : status === 'upcoming' ? n : 0;
    var allowance = status === 'active' ? Math.max(pool - beforeToday, 0) / daysLeft : status === 'upcoming' ? base : 0;
    var tomorrow = status === 'active' && daysLeft > 1 ? Math.max(pool - beforeToday - todaySpent, 0) / (daysLeft - 1) : null;
    return { n: n, td: td, status: status, committed: committed, unpaid: unpaid, total: total, free: free, pre: pre, beforeToday: beforeToday, todaySpent: todaySpent, byDay: byDay, byCat: byCat, todayCats: todayCats, budget: budget, pool: pool, base: base, dayIdx: dayIdx, daysLeft: daysLeft, allowance: allowance, safe: allowance - todaySpent, over: status === 'active' && allowance - todaySpent < -0.004, tomorrow: tomorrow, left: budget - total - unpaid };
  }
  /* Replays the trip day by day to know each past day's own allowance. */
  function replay(t, c) {
    var out = [], used = c.pre;
    for (var i = 0; i < c.n; i++) {
      var ds = addDays(t.start, i); if (ds >= c.td) break;
      var allow = Math.max(c.pool - used, 0) / (c.n - i), sp = c.byDay[ds] || 0;
      used += sp; out.push({ ds: ds, allow: allow, sp: sp, under: sp <= allow + 0.5 });
    }
    return out;
  }
  var MILESTONES = [[2, 'Off to a good start'], [4, 'Savvy traveller'], [7, 'Budget globetrotter'], [14, 'Legend of the road']];
  function streakInfo(t, c) {
    var days = replay(t, c), cur = 0, best = 0, run = 0, map = {};
    for (var i = days.length - 1; i >= 0; i--) { if (days[i].under) cur++; else break; }
    days.forEach(function (d) { run = d.under ? run + 1 : 0; if (run > best) best = run; map[d.ds] = d; });
    return { current: cur, best: Math.max(best, cur), noSpend: days.filter(function (d) { return d.sp === 0; }).length, map: map, todayOk: c.todaySpent <= c.allowance + 0.5, days: days };
  }
  function capStatus(t, c) {
    return t.caps.map(function (k) { var a = c.byCat[k.cat] || 0, cap = num(k.amount); return { cat: k.cat, spent: a, cap: cap, pct: a / cap, left: cap - a }; }).sort(function (a, b) { return b.pct - a.pct; });
  }
  function moodOf(c) { if (c.over) return 'broke'; if (c.allowance > 0 && c.todaySpent / c.allowance >= 0.8) return 'nervous'; return 'chill'; }
  function walletBal(t, w) {
    return num(w.opening) - t.expenses.reduce(function (s, x) {
      if (x.wallet !== w.id) return s;
      if (x.cur === w.cur) return s + num(x.amt);
      var h = exHome(t, x); return s + (w.cur === t.home ? h : h / (num(t.rate) || 1));
    }, 0);
  }
  function fundSaved(t) { return t.fund.entries.reduce(function (s, e) { return s + num(e.amt); }, 0); }
  function fundTarget(t) { return num(t.fund.target) || num(t.budget); }
  function plannedCost(t, it) { return homeAmt(t, it.cost, it.cur, t.rate); }
  function inTrip(t, ds) { return ds && ds >= t.start && ds <= t.end; }
  function bookingEvents(t, ds) {
    var out = [];
    t.bookings.forEach(function (b) {
      var T = BKT[b.type] || BKT.other;
      if (b.start === ds) out.push({ b: b, time: b.time || '', label: T.a ? T.a + ' · ' + b.name : b.name, end: false });
      if (T.hasEnd && b.end && b.end === ds && (b.end !== b.start || b.endTime)) out.push({ b: b, time: b.endTime || '', label: (T.b || 'Ends') + ' · ' + b.name, end: true });
    });
    return out;
  }
  function dayAgenda(t, ds) {
    var list = bookingEvents(t, ds).map(function (e) { return { type: 'bk', time: e.time, e: e }; });
    t.plan.forEach(function (it, i) { if (it.day === ds) list.push({ type: 'plan', time: it.time, it: it, i: i }); });
    return list.sort(function (a, b) { var x = a.time || '99:99', y = b.time || '99:99'; return x < y ? -1 : x > y ? 1 : (a.type === 'bk' ? -1 : 1); });
  }
  function tripPhotos(t) {
    var out = [];
    t.expenses.slice().sort(byDate).reverse().forEach(function (x) { (x.photos || []).forEach(function (id) { out.push({ id: id, cap: (x.note || cs(x.cat)) + ' · ' + fmtD(x.date) }); }); });
    t.bookings.forEach(function (b) { (b.photos || []).forEach(function (id) { out.push({ id: id, cap: b.name }); }); });
    return out;
  }
  function recentNotes(t) {
    var seen = {}, out = [], list = t.expenses.slice().sort(byDate).reverse();
    for (var i = 0; i < list.length && out.length < 6; i++) {
      var x = list[i]; if (!x.note || linked(t, x)) continue;
      var k = x.note.trim().toLowerCase(); if (seen[k]) continue;
      seen[k] = 1; out.push({ note: x.note, cat: x.cat, amt: x.amt, cur: x.cur, wallet: x.wallet });
    }
    return out;
  }

  /* =========================================================
     Photo housekeeping: delete photos nothing points at any more
     ========================================================= */
  function refsOf(p, o) {
    (p && p.trips || []).forEach(function (t) {
      if (t.cover) o[t.cover] = 1;
      (t.people || []).forEach(function (x) { if (x.photo) o[x.photo] = 1; });
      (t.expenses || []).forEach(function (x) { (x.photos || []).forEach(function (id) { o[id] = 1; }); });
      (t.bookings || []).forEach(function (b) { (b.photos || []).forEach(function (id) { o[id] = 1; }); (b.files || []).forEach(function (f) { o[f.id] = 1; }); if (b.cover) o[b.cover] = 1; });
    });
    return o;
  }
  function allRefs() {
    var o = {};
    S.index.profiles.forEach(function (m) { refsOf(m.id === S.pid ? S.p : Store.get(APP.key + 'p_' + m.id), o); });
    if (S.p) refsOf(S.p, o);
    S.index.profiles.forEach(function (m) { if (m.photo) o[m.photo] = 1; });
    var lg = legacyData(); if (lg) refsOf(lg, o);
    if (S.sheet && S.sheet.d) {
      var d = S.sheet.d;
      (d.photos || []).forEach(function (id) { o[id] = 1; });
      (d.files || []).forEach(function (f) { o[f.id] = 1; });
      if (d.photo) o[d.photo] = 1;
      if (d.cover) o[d.cover] = 1;
      (d.people || []).forEach(function (x) { if (x.photo) o[x.photo] = 1; });
    }
    return o;
  }
  function gc() {
    return Versions.all().then(function (vs) {
      var r = allRefs();
      vs.forEach(function (v) { try { refsOf(JSON.parse(v.data), r); } catch (e) { } });
      if (S.undo) { try { refsOf(JSON.parse(S.undo.json), r); } catch (e) { } }
      return Photos.keys().then(function (ks) { var drop = ks.filter(function (k) { return !r[k]; }); if (drop.length) return Photos.del(drop); });
    });
  }

  /* =========================================================
     Bank SMS reader
     ========================================================= */
  var MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
  function parseWhen(s, maxBackDays) {
    var now = new Date(), d = null, m = null, rest = String(s || '');
    if ((m = rest.match(/\b(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})/))) d = new Date(+m[1], +m[2] - 1, +m[3]);
    else if ((m = rest.match(/\b(\d{1,2})[-\/. ]?(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?[-\/., ]*((?:19|20)?\d{2})?\b/i))) { var y = m[3] ? +m[3] : now.getFullYear(); if (y < 100) y += 2000; d = new Date(y, MON[m[2].toLowerCase()], +m[1]); }
    else if ((m = rest.match(/\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})\b/))) { var yy = +m[3], a = +m[1], b = +m[2]; if (yy < 100) yy += 2000; d = b > 12 ? new Date(yy, a - 1, b) : new Date(yy, b - 1, a); }
    if (!d || isNaN(d.getTime())) return null;
    rest = rest.replace(m[0], ' ');
    var tm = rest.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?/i), hm = '';
    if (tm) { var hh = +tm[1] % 24, ap = (tm[3] || '').toLowerCase(); if (ap === 'pm' && hh < 12) hh += 12; if (ap === 'am' && hh === 12) hh = 0; hm = pad(hh) + ':' + pad(+tm[2] % 60); }
    var ts = d.getTime();
    if (ts > Date.now() + DAY || ts < Date.now() - (maxBackDays || 400) * DAY) return null;
    return { date: iso(d), time: hm };
  }
  var CUR_TOK = '(?:rs\\.?|inr|₹|aed|dhs?|qar|qr|sar|kwd|bhd|omr|usd|us\\$|eur|gbp|sgd|s\\$|jpy|yen|¥|thb|baht|myr|rm|idr|rp|try|chf|aud|a\\$|cad|lkr|egp|cny|rmb|hkd|krw|₩|php|₱|vnd|zar|nzd|\\$|€|£)';
  var AMT_RE = (function () {
    var body = '(' + CUR_TOK + ')\\s*([0-9][0-9,]*(?:\\.[0-9]{1,3})?)|([0-9][0-9,]*(?:\\.[0-9]{1,3})?)\\s*(' + CUR_TOK + ')';
    try { return new RegExp('(?<![a-z])' + '(?:' + body + ')' + '(?![a-z])', 'gi'); } catch (e) { return new RegExp(body, 'gi'); }
  })();
  var TOKMAP = { rs: 'INR', 'rs.': 'INR', inr: 'INR', '₹': 'INR', aed: 'AED', dh: 'AED', dhs: 'AED', qar: 'QAR', qr: 'QAR', sar: 'SAR', kwd: 'KWD', bhd: 'BHD', omr: 'OMR', usd: 'USD', 'us$': 'USD', eur: 'EUR', '€': 'EUR', gbp: 'GBP', '£': 'GBP', sgd: 'SGD', 's$': 'SGD', jpy: 'JPY', yen: 'JPY', '¥': 'JPY', thb: 'THB', baht: 'THB', myr: 'MYR', rm: 'MYR', idr: 'IDR', rp: 'IDR', 'try': 'TRY', chf: 'CHF', aud: 'AUD', 'a$': 'AUD', cad: 'CAD', lkr: 'LKR', egp: 'EGP', cny: 'CNY', rmb: 'CNY', hkd: 'HKD', krw: 'KRW', '₩': 'KRW', php: 'PHP', '₱': 'PHP', vnd: 'VND', zar: 'ZAR', nzd: 'NZD' };
  function tokCur(tok, t) {
    tok = String(tok || '').toLowerCase();
    var dollars = ['USD', 'SGD', 'AUD', 'CAD', 'HKD', 'NZD'];
    if (tok === '$') return dollars.indexOf(t.local) >= 0 ? t.local : dollars.indexOf(t.home) >= 0 ? t.home : 'USD';
    if (tok === '¥' && t.local === 'CNY') return 'CNY';
    return TOKMAP[tok] || '';
  }
  function smsAmount(s, t) {
    var m; AMT_RE.lastIndex = 0;
    while ((m = AMT_RE.exec(s))) {
      if (/(bal|balance|avl|avbl|limit|lmt|available)[^0-9]*$/i.test(s.slice(Math.max(0, m.index - 22), m.index))) continue;
      var v = parseFloat((m[2] || m[3] || '').replace(/,/g, ''));
      if (v > 0) { AMT_RE.lastIndex = 0; return { v: v, cur: tokCur(m[1] || m[4], t) }; }
    }
    return null;
  }
  var SMS_SKIP = /(\botp\b|one[- ]time password|collect request|requested (?:money|payment)|will be (?:debited|deducted|charged)|\bis due\b|due (?:on|date|by)|minimum (?:amount )?due|e-?mandate|pre-?approved|apply now|congrat|\bfailed\b|\bdeclined\b|unsuccessful)/i;
  var SMS_DEBIT = /\b(debited|debit(?!\s*card)|spent|paid|sent|withdrawn|withdrawal|purchased?|charged|deducted|txn of|payment of|(?:was|been|is) used|used (?:for|at|on)|transaction (?:of|for|at)|pos (?:txn|transaction|purchase))\b/i;
  var SMS_CREDIT = /\b(credited|credit(?!\s*card)|received|deposited|refund(?:ed)?|cashback|reversed)\b/i;
  var PSP = /^(paytm|payu|ybl|okaxis|oksbi|okhdfcbank|okicici|axl|ibl|apl|rzp|razorpay|pay|payments?|upi|bharatpe|gpay|phonepe|mer|merchant|pos|online|in|com|www|icici|hdfc|sbi|axis|kotak|yes|bank|\d+|[a-z]?\d+[a-z0-9]*)$/i;
  var NOT_NAME = /^(upi|neft|imps|rtgs|your|my|a\/?c|ac|acct|account|card|vpa|you|us|the|bank|atm|self|mobile|net ?banking|ref|txn|info)$/i;
  function tidyName(n) {
    n = String(n || '').replace(/\s+/g, ' ').replace(/^((upi|neft|imps|rtgs|pos|ach|nach|atw|atm|ecom|bil|onl|mmt|ib|mb)[\s\/\-:]+)+/i, '').replace(/\b(pvt|private|ltd|limited|llp|inc|co|kk|technologies|payments?|services|retail)\b\.?/gi, '').replace(/[\s.\-,]+$/, '').trim();
    if (!n) return '';
    if (n === n.toUpperCase() || n === n.toLowerCase()) n = n.toLowerCase().replace(/(^|\s)[a-z]/g, function (c) { return c.toUpperCase(); });
    return n.slice(0, 40);
  }
  function smsMerchant(s) {
    var m = s.match(/([a-z0-9][a-z0-9._-]{1,48})@([a-z][a-z0-9]{1,15})\b/i);
    if (m) { var parts = m[1].split(/[._-]/).filter(function (p) { return p && !PSP.test(p); }); if (parts.length) return tidyName(parts[0]); }
    var re = /\b(?:at|to|towards|trf to|transfer to|paid to|sent to|by|info:?)\s+([A-Za-z][A-Za-z0-9&'. -]{1,40}?)(?=\s+(?:on|via|ref|upi|txn|avl|avbl|bal|using|from|for|dated|at|with|in|thru|through)\b|[.,;:\n(]|$)/gi, x;
    while ((x = re.exec(s))) { var nm = x[1].trim(); if (!NOT_NAME.test(nm) && !/^(a\/c|x+\d+)/i.test(nm)) return tidyName(nm); }
    return '';
  }
  function smsWallet(s, t) {
    var ws = t.wallets, m = s.match(/(?:a\/?c|acct|account|card)[^0-9]{0,14}(\d{3,4})\b/i);
    if (m) { var hit = ws.filter(function (w) { return w.name.indexOf(m[1]) >= 0; })[0]; if (hit) return hit.id; }
    var cw = ws.filter(function (w) { return w.type === 'card'; })[0];
    if (/\bcard\b/i.test(s) && cw) return cw.id;
    var bw = ws.filter(function (w) { return w.type === 'bank'; })[0];
    return (cw || bw || ws[0] || {}).id || '';
  }
  var CAT_RULES = [
    ['flights', /airways|airline|air ?arabia|flydubai|emirates|etihad|qatar ?air|indigo|air india|vistara|akasa|spicejet|ryanair|easyjet|airasia|jetstar|peach|scoot|lufthansa|turkish|saudia|\bflight/i],
    ['stay', /hotel|resort|\binn\b|hostel|ryokan|airbnb|booking\.com|agoda|expedia|marriott|hilton|hyatt|accor|novotel|ibis|radisson|sheraton|\boyo\b|guest ?house|villa|lodge/i],
    ['transport', /uber|careem|grab|lyft|\bbolt\b|\bola\b|rapido|taxi|\bcab\b|metro|\bjr\b|railway|\brail\b|train|shinkansen|suica|icoca|pasmo|oyster|\bbus\b|ferry|petrol|fuel|\bshell\b|parking|toll|hertz|avis|sixt|europcar|rental|airport express/i],
    ['food', /restaurant|resto|caf[eé]|coffee|starbucks|costa|mcdonald|kfc|burger|pizza|bakery|bistro|ramen|sushi|izakaya|\bbar\b|\bpub\b|food|kitchen|grill|diner|eatery|tea ?house|konbini|7-?eleven|lawson|familymart|deli|dessert|ice ?cream|gelato/i],
    ['activities', /museum|ticket|tour|\bpark\b|\bzoo\b|aquarium|disney|universal|klook|viator|getyourguide|temple|shrine|gallery|cinema|theatre|theater|attraction|entry|admission|safari|cruise|spa|onsen/i],
    ['shopping', /mall|store|shop|duty ?free|souvenir|market|uniqlo|zara|h&m|ikea|don quijote|donki|daiso|muji|amazon|noon|outlet|boutique|pharmacy|chemist/i]
  ];
  function catMemory(t) { var mem = {}; t.expenses.forEach(function (x) { if (x.note) mem[x.note.trim().toLowerCase()] = x.cat; }); return mem; }
  function guessCat(name, mem) {
    var k = String(name || '').trim().toLowerCase();
    if (k && mem && mem[k]) return mem[k];
    for (var i = 0; i < CAT_RULES.length; i++) if (CAT_RULES[i][1].test(name || '')) return CAT_RULES[i][0];
    return 'other';
  }
  function isDup(t, item) {
    var m = String(item.note || '').toLowerCase();
    return t.expenses.some(function (x) { return x.date === item.date && x.cur === item.cur && Math.abs(num(x.amt) - item.amt) < 0.01 && (!x.note || !m || x.note.toLowerCase() === m); });
  }
  function parseSms(raw, t, mem) {
    var s = String(raw).replace(/\s+/g, ' ').trim();
    if (SMS_SKIP.test(s)) return { ok: false, raw: s, why: 'Looks like an OTP, reminder or offer, not a payment.' };
    var a = smsAmount(s, t);
    if (!a) return { ok: false, raw: s, why: 'No amount found.' };
    var d = s.search(SMS_DEBIT), c = s.search(SMS_CREDIT);
    if (d < 0 && c < 0) return { ok: false, raw: s, why: 'Couldn’t tell whether money went out or came in.' };
    if (!(d >= 0 && (c < 0 || d < c))) return { ok: false, raw: s, why: 'Money in, not a spend.' };
    var note = smsMerchant(s), when = parseWhen(s) || { date: today(), time: nowHM() };
    var cur = a.cur === t.local ? t.local : a.cur === t.home ? t.home : (a.cur ? a.cur : t.home);
    var item = { ok: true, raw: s, amt: a.v, cur: cur === t.local || cur === t.home ? cur : t.home, foreign: cur !== t.local && cur !== t.home ? cur : '', note: note, cat: guessCat(note, mem), date: when.date, time: when.time, wallet: smsWallet(s, t) };
    item.dup = isDup(t, item); item.on = !item.dup && !item.foreign;
    return item;
  }
  function splitSms(text) {
    var tx = String(text || '').trim(); if (!tx) return [];
    var chunks = tx.split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (chunks.length === 1) {
      var lines = tx.split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean);
      if (lines.length > 1 && lines.every(function (l) { AMT_RE.lastIndex = 0; return AMT_RE.test(l) || SMS_SKIP.test(l); })) chunks = lines;
      AMT_RE.lastIndex = 0;
    }
    return chunks.slice(0, 100);
  }
  function sampleSms(t) {
    var d = D(today()), y = D(addDays(today(), -1));
    var ddmmyy = pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + String(d.getFullYear()).slice(2);
    var mon = pad(y.getDate()) + '-' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][y.getMonth()] + '-' + String(y.getFullYear()).slice(2);
    var L = t.local, H = t.home;
    return [
      'Your Credit Card XX4821 was used for ' + L + ' 4,800.00 at ICHIRAN DOTONBORI on ' + ddmmyy + ' 13:40. Avl Lmt: ' + H + ' 12,345.00',
      'Debit Card **4821\nwas used for ' + L + ' 1,250.00\nat FAMILYMART NAMBA\nat 08:15\n' + mon,
      'Purchase of ' + H + ' 210.00 at KLOOK TRAVEL on ' + ddmmyy + ' 09:05 with card ending 4821.',
      'Your OTP for login is 482913. Do not share it with anyone.'
    ].join('\n\n');
  }

  /* =========================================================
     CSV import and export
     ========================================================= */
  function parseAmt(v) {
    var s = String(v == null ? '' : v).trim(); if (!s) return 0;
    var neg = /^-|^\(.*\)$|-$|\bdr\.?$/i.test(s);
    s = s.replace(/[^0-9.,]/g, '');
    if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    else if (/,\d{1,2}$/.test(s)) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
    var n = parseFloat(s);
    return isFinite(n) ? (neg ? -n : n) : 0;
  }
  function csvArrays(text) {
    text = String(text || '').replace(/^﻿/, '');
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { row.push(f); f = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; if (row.some(function (x) { return x.trim(); })) rows.push(row); row = []; }
      else f += ch;
    }
    row.push(f); if (row.some(function (x) { return x.trim(); })) rows.push(row);
    return rows;
  }
  function parseCsv(text) {
    var arr = csvArrays(text), hi = 0;
    for (var i = 0; i < Math.min(arr.length, 30); i++) { var line = arr[i].join(' '); if (/date|\bdt\b/i.test(line) && /amount|amt|debit|withdrawal|spent|value/i.test(line)) { hi = i; break; } }
    var headers = (arr[hi] || []).map(function (h, k) { h = String(h || '').trim(); return h || 'Column ' + (k + 1); });
    var rows = arr.slice(hi + 1, hi + 3001).map(function (r) { var o = {}; headers.forEach(function (h, k) { o[h] = r[k] == null ? '' : String(r[k]); }); return o; });
    return { headers: headers, rows: rows };
  }
  function detectCols(h) {
    function find(re) { for (var i = 0; i < h.length; i++) if (re.test(h[i])) return h[i]; return ''; }
    return {
      date: find(/^(txn |transaction |value |posting |booking )?(date|dt)\b/i) || find(/date|\bdt\b/i),
      time: find(/^time$/i),
      desc: find(/^what$|^note$|payee|merchant|description|narration|particulars|details|remarks/i) || find(/name/i),
      amount: find(/^amount$|^amt\b|transaction amount|^value$/i) || find(/^amount/i),
      debit: find(/debit|withdrawal|money out|paid out|^dr\b/i),
      currency: find(/^currency$|^cur$|^ccy$/i),
      cat: find(/categor/i)
    };
  }
  function matchCat(v) { v = String(v || '').trim().toLowerCase(); if (!v) return ''; for (var k in CATS) if (k === v || CATS[k].label.toLowerCase() === v || CATS[k].short.toLowerCase() === v) return k; return ''; }
  function csvDate(v) {
    v = String(v || '').trim(); if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) { var tm = v.match(/[ T](\d{2}):(\d{2})/); return { date: v.slice(0, 10), time: tm ? tm[1] + ':' + tm[2] : '' }; }
    return parseWhen(v, 3650);
  }
  function csvItems(sh, t) {
    var mp = sh.map, mem = catMemory(t), items = [], bad = 0, dups = 0, skipped = 0;
    sh.rows.forEach(function (r) {
      var when = mp.date ? csvDate(r[mp.date]) : null;
      if (!when) { bad++; return; }
      var amt = 0;
      if (mp.debit) amt = Math.abs(parseAmt(r[mp.debit]));
      if (!amt && mp.amount) {
        var a = parseAmt(r[mp.amount]);
        if (sh.sign === 'signed') { if (a >= 0) { skipped++; return; } amt = -a; } else amt = Math.abs(a);
      }
      if (!(amt > 0)) { bad++; return; }
      var c = mp.currency ? String(r[mp.currency] || '').trim().toUpperCase() : '';
      var cur = c === t.local ? t.local : c === t.home ? t.home : (sh.cur || t.home);
      var note = mp.desc ? tidyName(r[mp.desc]) : '';
      if (mp.time && /^\d{1,2}:\d{2}/.test(String(r[mp.time] || ''))) { var p2 = String(r[mp.time]).split(':'); when.time = pad(+p2[0]) + ':' + pad(+p2[1]); }
      var item = { amt: Math.round(amt * 100) / 100, cur: cur, date: when.date, time: when.time || '', note: note, cat: matchCat(mp.cat ? r[mp.cat] : '') || guessCat(note, mem), wallet: sh.wallet };
      if (isDup(t, item)) { dups++; if (!sh.keepDups) return; }
      items.push(item);
    });
    return { items: items, bad: bad, dups: dups, skipped: skipped };
  }
  function csvCell(v) { v = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function csvText(t) {
    var head = ['Date', 'Time', 'Trip day', 'What', 'Category', 'Amount', 'Currency', 'Rate to ' + t.home, 'Amount in ' + t.home, 'Wallet', 'For', 'Booking', 'Photos'];
    var rows = t.expenses.slice().sort(byDate).map(function (x) {
      var day = x.date < t.start ? 'Before' : x.date > t.end ? 'After' : diff(t.start, x.date) + 1;
      var w = walletById(t, x.wallet), who = person(t, x.who), b = bookingById(t, x.bookingId);
      return [x.date, x.time, day, x.note, (CATS[x.cat] || CATS.other).label, x.amt, x.cur, x.cur === t.home ? 1 : x.rate, Math.round(exHome(t, x) * 100) / 100, w ? w.name : '', who ? who.name : 'Family', b ? b.name : '', (x.photos || []).length];
    });
    return '﻿' + [head].concat(rows).map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
  }
  function summaryText(t) {
    var c = calc(t), o = { show: true };
    var L = [BR.name + ' · ' + t.name, (t.place ? t.place + ' · ' : '') + range(t) + (t.people.length ? ' · ' + plural(t.people.length, 'traveller') : ''), ''];
    L.push('Spent ' + money(c.total, t.home, o) + ' of ' + money(c.budget, t.home, o) + ' (' + Math.round(c.budget ? c.total / c.budget * 100 : 0) + '%)');
    if (c.unpaid > 0.5) L.push('Still to pay on bookings: ' + money(c.unpaid, t.home, o));
    L.push(c.left >= 0 ? money(c.left, t.home, o) + ' left in the budget' : money(-c.left, t.home, o) + ' over budget');
    if (t.people.length > 1) L.push('Per person ' + money((c.total + c.unpaid) / t.people.length, t.home, o));
    if (c.status === 'active') L.push('Day ' + c.dayIdx + ' of ' + c.n + ' · safe to spend today ' + money(Math.max(c.safe, 0), t.home, o));
    var keys = Object.keys(CATS).filter(function (k) { return c.byCat[k]; }).sort(function (a, b) { return c.byCat[b] - c.byCat[a]; });
    if (keys.length) { L.push('', 'Where it went'); keys.forEach(function (k) { L.push('• ' + CATS[k].label + ': ' + money(c.byCat[k], t.home, o)); }); }
    if (t.bookings.length) { L.push('', 'Bookings'); t.bookings.slice().sort(function (a, b) { return a.start < b.start ? -1 : 1; }).forEach(function (b) { var st = bookingState(t, b); L.push('• ' + b.name + ' · ' + fmtD(b.start, { day: 'numeric', month: 'short' }) + (b.conf ? ' · ' + b.conf : '') + ' · ' + (st.st === 'paid' ? 'paid' : st.st === 'none' ? 'no total yet' : money(st.left, t.home, o) + ' to pay')); }); }
    return L.join('\n');
  }
