  /* =========================================================
     Core helpers
     ========================================================= */
  /* App identity. A copy of this app for another purpose changes these, so its saved data,
     photos and backups never mix with JollyTrip's on the same web address. */
  var APP = { id: 'jollytrip', key: 'jt_' };
  var DAY = 86400000;
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
  function num(v) { var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : 0; }
  function plural(n, w, pl) { return n + ' ' + (n === 1 ? w : (pl || w + 's')); }
  function pad(x) { return ('0' + x).slice(-2); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function D(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { return iso(new Date()); }
  function addDays(s, n) { var d = D(s); d.setDate(d.getDate() + n); return iso(d); }
  function diff(a, b) { return Math.round((D(b) - D(a)) / DAY); }
  function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !isNaN(D(s).getTime()); }
  function fmtD(s, o) { return D(s).toLocaleDateString(undefined, o || { weekday: 'short', day: 'numeric', month: 'short' }); }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtHM(hm) { if (!hm) return ''; var p = String(hm).split(':'); return new Date(2000, 0, 1, +p[0] || 0, +p[1] || 0).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  function range(t) { return fmtD(t.start, { day: 'numeric', month: 'short' }) + ' – ' + fmtD(t.end, { day: 'numeric', month: 'short', year: 'numeric' }); }
  function firstName(n) { return String(n || '').replace(/^demo\s*·\s*/i, '').trim().split(/\s+/)[0] || 'there'; }
  function initials(n) { return String(n || '?').replace(/^demo\s*·\s*/i, '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase() || '?'; }
  function kb(n) { return n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB'; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip'; }
  function byDate(a, b) { var x = (a.date || '') + (a.time || ''), y = (b.date || '') + (b.time || ''); return x < y ? -1 : x > y ? 1 : 0; }

  /* =========================================================
     Storage: JSON → lz-string → chunked cookies, with a local-storage fallback
     ========================================================= */
  var CHUNK = 3600, MAX_CHUNKS = 30;
  /* Inside Claude the page runs in a frame, so cookies are partitioned third-party cookies.
     Hosted on its own (GitHub Pages) it uses first-party cookies scoped to this app's folder. */
  var IS_TOP = (function () { try { return window.top === window.self; } catch (e) { return false; } })();
  var CK_PATH = IS_TOP ? (location.pathname.replace(/[^\/]*$/, '') || '/') : '/';
  var SECURE = location.protocol === 'https:';
  var C_OPTS = IS_TOP ? { expires: 400, path: CK_PATH, sameSite: 'Lax', secure: SECURE } : { expires: 400, path: '/', sameSite: 'None', secure: true, partitioned: true };
  var R_OPTS = IS_TOP ? { path: CK_PATH, sameSite: 'Lax', secure: SECURE } : { path: '/', sameSite: 'None', secure: true, partitioned: true };
  var Store = {
    mode: 'memory', mem: {}, note: '',
    init: function () {
      var ok = false;
      try {
        if (window.Cookies && window.LZString) {
          Cookies.set(APP.key + 'probe', '1', C_OPTS);
          ok = Cookies.get(APP.key + 'probe') === '1';
          Cookies.remove(APP.key + 'probe', R_OPTS);
        }
      } catch (e) { ok = false; }
      if (ok) { this.mode = 'cookie'; return; }
      try {
        localStorage.setItem(APP.key + 'probe', '1');
        var l = localStorage.getItem(APP.key + 'probe') === '1';
        localStorage.removeItem(APP.key + 'probe');
        if (l) { this.mode = 'local'; this.note = 'This browser blocks cookies here, so JollyTrip saves to local storage instead.'; return; }
      } catch (e) { }
      this.mode = 'memory';
      this.note = 'This browser blocks cookies and local storage here. Your trips last only until you close this tab. Copy a backup before you leave.';
    },
    count: function (key) { try { return parseInt(Cookies.get(key + '_n') || '0', 10) || 0; } catch (e) { return 0; } },
    get: function (key) {
      try {
        if (this.mode === 'cookie') {
          var n = this.count(key);
          if (!n) return this.getLocal(key);
          var s = '';
          for (var i = 0; i < n; i++) { var part = Cookies.get(key + '_' + i); if (part == null) return this.getLocal(key); s += part; }
          var json = LZString.decompressFromEncodedURIComponent(s);
          return json ? JSON.parse(json) : this.getLocal(key);
        }
        if (this.mode === 'local') return this.getLocal(key);
        return this.mem[key] ? JSON.parse(this.mem[key]) : null;
      } catch (e) { return null; }
    },
    getLocal: function (key) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    clearCookie: function (key) {
      var n = this.count(key);
      try { for (var i = 0; i < Math.max(n, 1); i++) Cookies.remove(key + '_' + i, R_OPTS); Cookies.remove(key + '_n', R_OPTS); } catch (e) { }
    },
    set: function (key, obj) {
      var json = JSON.stringify(obj);
      if (this.mode === 'cookie') {
        var comp = LZString.compressToEncodedURIComponent(json);
        var n = Math.max(1, Math.ceil(comp.length / CHUNK));
        if (n > MAX_CHUNKS) {
          try { localStorage.setItem(key, json); this.clearCookie(key); return { ok: true, overflow: true }; } catch (e) { return { ok: false }; }
        }
        var old = this.count(key);
        try {
          for (var i = 0; i < n; i++) Cookies.set(key + '_' + i, comp.slice(i * CHUNK, (i + 1) * CHUNK), C_OPTS);
          for (var j = n; j < old; j++) Cookies.remove(key + '_' + j, R_OPTS);
          Cookies.set(key + '_n', String(n), C_OPTS);
        } catch (e) { }
        if (Cookies.get(key + '_' + (n - 1)) == null || this.count(key) !== n) {
          this.clearCookie(key);
          try { localStorage.setItem(key, json); return { ok: true, overflow: true }; } catch (e) { return { ok: false }; }
        }
        try { localStorage.setItem(key, json); } catch (e) { }
        return { ok: true };
      }
      if (this.mode === 'local') { try { localStorage.setItem(key, json); return { ok: true }; } catch (e) { return { ok: false }; } }
      this.mem[key] = json; return { ok: true };
    },
    remove: function (key) {
      if (this.mode === 'cookie') this.clearCookie(key);
      try { localStorage.removeItem(key); } catch (e) { }
      delete this.mem[key];
    },
    usage: function (key, obj) {
      var json = JSON.stringify(obj || {});
      var comp = window.LZString ? LZString.compressToEncodedURIComponent(json).length : 0;
      var chunks = this.mode === 'cookie' ? this.count(key) : 0;
      var where = this.mode === 'memory' ? 'memory' : (chunks ? 'cookie' : 'local');
      var total = 0; try { total = document.cookie.length; } catch (e) { }
      return { raw: json.length, comp: comp, chunks: chunks, where: where, cookieBytes: total };
    }
  };
  /* Data from the first version of JollyTrip (one set of trips, no accounts). */
  function legacyData() {
    var o = null;
    try { o = Store.get('jt'); } catch (e) { }
    if (!o || !Array.isArray(o.trips)) o = Store.getLocal('jollytrip.v1');
    return o && Array.isArray(o.trips) ? o : null;
  }
  function clearLegacy() { try { Store.clearCookie('jt'); } catch (e) { } try { localStorage.removeItem('jt'); localStorage.removeItem('jollytrip.v1'); } catch (e) { } }

  /* Passwords: PBKDF2 via Web Crypto, salted per account. They never leave this device. */
  function hashPw(pw, salt) {
    try {
      var enc = new TextEncoder();
      return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']).then(function (key) {
        return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 120000, hash: 'SHA-256' }, key, 256);
      }).then(function (bits) {
        return 'pbkdf2$' + Array.prototype.map.call(new Uint8Array(bits), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      }).catch(function () { return fnv(pw, salt); });
    } catch (e) { return Promise.resolve(fnv(pw, salt)); }
  }
  function fnv(pw, salt) { var h = 2166136261, s = salt + ':' + pw; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return 'fnv$' + h.toString(16); }

  /* =========================================================
     Photos: shrunk to JPEG and kept in the browser's IndexedDB, never in cookies
     ========================================================= */
  var Photos = {
    db: null, ok: true, mem: {}, urls: {}, ready: null,
    open: function () {
      var self = this;
      this.ready = new Promise(function (res) {
        try {
          var r = indexedDB.open(APP.id, 2), done = false;
          r.onupgradeneeded = function () {
            var db = r.result;
            if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('versions')) db.createObjectStore('versions', { keyPath: 'id' }).createIndex('pid', 'pid');
          };
          r.onsuccess = function () { self.db = r.result; self.db.onversionchange = function () { try { self.db.close(); } catch (e) { } }; if (!done) { done = true; res(); } };
          r.onerror = function () { self.ok = false; if (!done) { done = true; res(); } };
          r.onblocked = function () { setTimeout(function () { if (!done) { done = true; self.ok = false; res(); } }, 3000); };
        } catch (e) { self.ok = false; res(); }
      });
      return this.ready;
    },
    put: function (id, blob) {
      var self = this;
      return this.ready.then(function () {
        if (!self.db) { self.mem[id] = blob; return; }
        return new Promise(function (res) {
          try { var t = self.db.transaction('photos', 'readwrite'); t.objectStore('photos').put({ id: id, blob: blob, at: Date.now() }); t.oncomplete = function () { res(); }; t.onerror = t.onabort = function () { self.mem[id] = blob; self.ok = false; res(); }; }
          catch (e) { self.mem[id] = blob; self.ok = false; res(); }
        });
      });
    },
    get: function (id) {
      var self = this;
      return this.ready.then(function () {
        if (self.mem[id]) return self.mem[id];
        if (!self.db) return null;
        return new Promise(function (res) { try { var r = self.db.transaction('photos').objectStore('photos').get(id); r.onsuccess = function () { res(r.result ? r.result.blob : null); }; r.onerror = function () { res(null); }; } catch (e) { res(null); } });
      });
    },
    keys: function () {
      var self = this;
      return this.ready.then(function () {
        var m = Object.keys(self.mem);
        if (!self.db) return m;
        return new Promise(function (res) { try { var r = self.db.transaction('photos').objectStore('photos').getAllKeys(); r.onsuccess = function () { res(m.concat(r.result || [])); }; r.onerror = function () { res(m); }; } catch (e) { res(m); } });
      });
    },
    del: function (ids) {
      var self = this; ids = [].concat(ids).filter(Boolean);
      ids.forEach(function (id) { delete self.mem[id]; if (self.urls[id]) { try { URL.revokeObjectURL(self.urls[id]); } catch (e) { } delete self.urls[id]; } });
      return this.ready.then(function () {
        if (!self.db || !ids.length) return;
        return new Promise(function (res) { try { var t = self.db.transaction('photos', 'readwrite'), st = t.objectStore('photos'); ids.forEach(function (id) { st.delete(id); }); t.oncomplete = t.onerror = function () { res(); }; } catch (e) { res(); } });
      });
    },
    url: function (id) {
      var self = this;
      if (self.urls[id]) return Promise.resolve(self.urls[id]);
      return this.get(id).then(function (b) { if (!b) return null; var u = URL.createObjectURL(b); self.urls[id] = u; return u; });
    }
  };
  /* Saved versions of each account, in the same IndexedDB database. They never go into cookies. */
  var Versions = {
    mem: {},
    store: function (mode) { try { if (Photos.db && Photos.db.objectStoreNames.contains('versions')) return Photos.db.transaction('versions', mode).objectStore('versions'); } catch (e) { } return null; },
    ok: function () { return !!this.store('readonly'); },
    add: function (rec) {
      var self = this;
      return Photos.ready.then(function () {
        var st = self.store('readwrite'); if (!st) { self.mem[rec.id] = rec; return; }
        return new Promise(function (res) { try { var q = st.put(rec); q.onsuccess = function () { res(); }; q.onerror = function () { self.mem[rec.id] = rec; res(); }; } catch (e) { self.mem[rec.id] = rec; res(); } });
      });
    },
    all: function () {
      var self = this;
      return Photos.ready.then(function () {
        var m = Object.keys(self.mem).map(function (k) { return self.mem[k]; }), st = self.store('readonly');
        if (!st) return m;
        return new Promise(function (res) { try { var q = st.getAll(); q.onsuccess = function () { res(m.concat(q.result || [])); }; q.onerror = function () { res(m); }; } catch (e) { res(m); } });
      });
    },
    list: function (pid) { return this.all().then(function (a) { return a.filter(function (v) { return v.pid === pid; }).sort(function (x, y) { return y.at - x.at; }); }); },
    del: function (ids) {
      var self = this; ids = [].concat(ids).filter(Boolean);
      ids.forEach(function (id) { delete self.mem[id]; });
      return Photos.ready.then(function () {
        var st = self.store('readwrite'); if (!st || !ids.length) return;
        return new Promise(function (res) { try { ids.forEach(function (id) { st.delete(id); }); st.transaction.oncomplete = st.transaction.onerror = function () { res(); }; } catch (e) { res(); } });
      });
    }
  };
  function shrink(file, max, square) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, sx = 0, sy = 0, sw = w, sh = h;
        if (square) { var m = Math.min(w, h); sx = (w - m) / 2; sy = (h - m) / 2; sw = sh = m; }
        var k = Math.min(1, max / Math.max(sw, sh)), cw = Math.max(1, Math.round(sw * k)), ch = Math.max(1, Math.round(sh * k));
        var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        var cx = cv.getContext('2d'); cx.fillStyle = '#FFFFFF'; cx.fillRect(0, 0, cw, ch); cx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { if (b) res(b); else rej(new Error('encode')); }, 'image/jpeg', square ? 0.85 : 0.78);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('decode')); };
      img.src = url;
    });
  }
  function hydrate(root) {
    (root || document).querySelectorAll('img[data-photo]:not([data-h])').forEach(function (img) {
      img.setAttribute('data-h', '1');
      Photos.url(img.dataset.photo).then(function (u) { if (u) img.src = u; else img.remove(); });
    });
  }
  function photoImg(id, alt) { return '<img data-photo="' + esc(id) + '" alt="' + esc(alt || '') + '" decoding="async">'; }
  function blobToData(b) { return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { res(null); }; r.readAsDataURL(b); }); }
  function dataToBlob(u) { var m = /^data:([^;,]+);base64,(.*)$/.exec(u || ''); if (!m) return null; var bin = atob(m[2]), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: m[1] }); }

  /* =========================================================
     Currency
     ========================================================= */
  var CURRENCIES = (function () {
    var list = [];
    try { list = Intl.supportedValuesOf('currency'); } catch (e) { }
    if (!list || !list.length) list = ['AED', 'AUD', 'BHD', 'CAD', 'CHF', 'CNY', 'EGP', 'EUR', 'GBP', 'HKD', 'IDR', 'INR', 'JPY', 'KRW', 'KWD', 'LKR', 'MYR', 'NZD', 'OMR', 'PHP', 'QAR', 'SAR', 'SGD', 'THB', 'TRY', 'USD', 'VND', 'ZAR'];
    var dn = null; try { dn = new Intl.DisplayNames(['en'], { type: 'currency' }); } catch (e) { }
    return list.map(function (c) { var n = c; try { n = dn ? dn.of(c) || c : c; } catch (e) { } return { code: c, name: n }; });
  })();
  var POPULAR = ['QAR', 'AED', 'SAR', 'INR', 'USD', 'EUR', 'GBP', 'JPY', 'THB', 'SGD', 'MYR', 'IDR', 'TRY', 'CHF', 'AUD', 'LKR', 'EGP'];
  function curOptions(sel) {
    function o(c) { return '<option value="' + c.code + '"' + (c.code === sel ? ' selected' : '') + '>' + esc(c.code + ' · ' + c.name) + '</option>'; }
    return '<optgroup label="Popular">' + CURRENCIES.filter(function (c) { return POPULAR.indexOf(c.code) >= 0; }).map(o).join('') + '</optgroup><optgroup label="All currencies">' + CURRENCIES.filter(function (c) { return POPULAR.indexOf(c.code) < 0; }).map(o).join('') + '</optgroup>';
  }
  var TZ_CUR = { 'Asia/Qatar': 'QAR', 'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Kuwait': 'KWD', 'Asia/Bahrain': 'BHD', 'Asia/Muscat': 'OMR', 'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR', 'Asia/Karachi': 'PKR', 'Asia/Dhaka': 'BDT', 'Asia/Colombo': 'LKR', 'Asia/Singapore': 'SGD', 'Asia/Tokyo': 'JPY', 'Asia/Shanghai': 'CNY', 'Asia/Hong_Kong': 'HKD', 'Asia/Seoul': 'KRW', 'Asia/Bangkok': 'THB', 'Asia/Kuala_Lumpur': 'MYR', 'Asia/Jakarta': 'IDR', 'Asia/Manila': 'PHP', 'Europe/London': 'GBP', 'Europe/Zurich': 'CHF', 'Europe/Istanbul': 'TRY', 'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Pacific/Auckland': 'NZD', 'America/Toronto': 'CAD', 'Africa/Cairo': 'EGP', 'Africa/Johannesburg': 'ZAR' };
  function guessCur() { try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (TZ_CUR[tz]) return TZ_CUR[tz]; if (/^Europe\//.test(tz)) return 'EUR'; } catch (e) { } return 'USD'; }
  var nf = {};
  function fmt(cur, v, compact) {
    var big = Math.abs(v) >= 100, k = cur + (compact ? 'c' : big ? 'b' : 's');
    if (!nf[k]) {
      try { nf[k] = new Intl.NumberFormat(undefined, compact ? { style: 'currency', currency: cur, notation: 'compact', maximumFractionDigits: 1 } : { style: 'currency', currency: cur, minimumFractionDigits: 0, maximumFractionDigits: big ? 0 : 2 }); }
      catch (e) { nf[k] = { format: function (x) { return cur + ' ' + Math.round(x).toLocaleString(); } }; }
    }
    return nf[k].format(v);
  }
  function hidden() { return !!(S.p && S.p.settings && S.p.settings.hide); }
  function curHome() { var t = trip(); return t ? t.home : (S.p ? S.p.home : guessCur()); }
  function money(v, cur, o) {
    o = o || {}; cur = cur || curHome();
    if (hidden() && !o.show) return cur + ' ••••';
    return fmt(cur, Number(v) || 0, o.compact);
  }
  var nfShort = null;
  function short(v) { if (hidden()) return '•'; if (v < 1000) return Math.round(v).toLocaleString(); try { nfShort = nfShort || new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }); return nfShort.format(v); } catch (e) { return String(Math.round(v)); } }
  function rateText(t) { return '1 ' + t.local + ' = ' + (+t.rate).toLocaleString(undefined, { maximumSignificantDigits: 4 }) + ' ' + t.home; }
  /* Any amount in this trip's home or local currency, converted to home. */
  function homeAmt(t, amt, cur, rate) { return !cur || cur === t.home ? num(amt) : num(amt) * (num(rate) || num(t.rate) || 1); }
  function exHome(t, x) { return homeAmt(t, x.amt, x.cur, x.rate); }
