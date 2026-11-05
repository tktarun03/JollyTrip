  /* =========================================================
     App lock: PIN and Face ID / fingerprint (WebAuthn platform authenticator)
     The lock keeps people out of the app on this device. Data is not encrypted.
     ========================================================= */
  function lockEnabled(m) { return !!(m && (m.pin || m.bio)); }
  function lockMeta() { return meta(S.lockPid || S.pid); }
  function lockApp(pid) { S.locked = true; S.lockPid = pid || null; S.lock = { entry: '', err: '', fails: 0, until: 0, busy: false, armed: false }; S.sheet = null; S.lb = null; }
  function b64u(buf) { var s = '', a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function rand(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return a; }
  var BIO = { avail: null };
  function bioName() { var ua = navigator.userAgent || ''; return /iPhone|iPad|Macintosh/.test(ua) ? 'Face ID or Touch ID' : /Android/.test(ua) ? 'fingerprint or face unlock' : /Windows/.test(ua) ? 'Windows Hello' : 'Face ID or fingerprint'; }
  function bioCheck() {
    if (BIO.avail !== null) return Promise.resolve(BIO.avail);
    try {
      if (!IS_TOP || !window.isSecureContext || !window.PublicKeyCredential || !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) { BIO.avail = false; return Promise.resolve(false); }
      return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(function (v) { BIO.avail = !!v; return BIO.avail; }, function () { BIO.avail = false; return false; });
    } catch (e) { BIO.avail = false; return Promise.resolve(false); }
  }
  function bioEnroll(m) {
    return navigator.credentials.create({ publicKey: {
      challenge: rand(32), rp: { name: BR.name },
      user: { id: new TextEncoder().encode(String(m.id)).slice(0, 64), name: m.name, displayName: m.name },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
      timeout: 60000, attestation: 'none'
    } }).then(function (c) { if (!c) throw new Error('none'); m.bio = { id: b64u(c.rawId), at: Date.now() }; saveIndex(); return true; });
  }
  function bioVerify(m) {
    return navigator.credentials.get({ publicKey: { challenge: rand(32), allowCredentials: [{ type: 'public-key', id: unb64u(m.bio.id), transports: ['internal', 'hybrid'] }], userVerification: 'required', timeout: 60000 } }).then(function (a) { return !!a; });
  }
  function keypad(showBio) {
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', showBio ? 'bio' : '', '0', 'del'];
    return '<div class="keypad" role="group" aria-label="PIN keypad">' + keys.map(function (k) {
      if (!k) return '<span></span>';
      if (k === 'bio') return '<button type="button" class="key fn" data-act="kp" data-k="bio" aria-label="Use ' + esc(bioName()) + '">' + ic('face', 26) + '</button>';
      if (k === 'del') return '<button type="button" class="key fn" data-act="kp" data-k="del" aria-label="Delete last digit">' + ic('left', 22) + '</button>';
      return '<button type="button" class="key" data-act="kp" data-k="' + k + '">' + k + '</button>';
    }).join('') + '</div>';
  }
  function pinDots(len, n) { var h = '<div class="dots" aria-label="' + n + ' of ' + len + ' digits entered">'; for (var i = 0; i < len; i++) h += '<i class="' + (i < n ? 'on' : '') + '"></i>'; return h + '</div>'; }
  function renderLock() {
    var m = lockMeta(); if (!m) { S.locked = false; return renderAuth(); }
    var L = S.lock, wait = L.until && Date.now() < L.until, canBio = m.bio && BIO.avail !== false;
    var msg = L.err || (wait ? 'Too many tries. Try again in ' + Math.ceil((L.until - Date.now()) / 1000) + ' seconds.' : m.pin ? 'Enter your PIN to open ' + BR.name + '.' : 'Use ' + bioName() + ' to open ' + BR.name + '.');
    return '<section class="lock">' + accAvatar(m, 76) + '<h1 class="h2">' + esc(m.name) + '</h1><p class="hint' + (L.err ? ' error' : '') + '" role="status">' + esc(msg) + '</p>' +
      (m.pin ? pinDots(m.pin.len, L.entry.length) + keypad(canBio) : '') +
      (canBio && !m.pin ? '<button type="button" class="btn" data-act="kp" data-k="bio">' + ic('face', 18) + ' Use ' + esc(bioName()) + '</button>' : '') +
      '<div class="row wrap" style="justify-content:center">' + (m.hash ? '<button type="button" class="btn quiet sm" data-act="lock-pw">Use password instead</button>' : '') + '<button type="button" class="btn quiet sm" data-act="lock-switch">' + ic('users', 16) + ' Switch account</button></div>' +
      '<details class="forgot"><summary>Forgot your PIN?</summary><p class="hint">' + (m.hash ? 'Use your account password instead.' : 'PINs stay on this device and can’t be reset. Without a password, the only way back in is to delete this account and its trips.') + '</p>' +
      (m.hash ? '' : '<button type="button" class="btn danger block' + (L.armed ? ' armed' : '') + '" data-act="lock-del">' + (L.armed ? 'Tap again to delete this account' : 'Delete this account') + '</button>') + '</details></section>';
  }
  function unlocked() {
    var pid = S.lockPid || S.pid; S.locked = false; S.lockPid = null; S.lock = null; S.lastActive = Date.now();
    if (!S.p || S.pid !== pid) enterProfile(pid); else { renderAll(); toast('Unlocked', ''); }
  }
  function lockKey(k) {
    var m = lockMeta(), L = S.lock; if (!m || !L || L.busy) return;
    if (k === 'bio') {
      if (!m.bio) return;
      L.busy = true;
      bioVerify(m).then(function (ok) { L.busy = false; if (ok) unlocked(); }, function () { L.busy = false; L.err = 'Not recognised. Try again, or use your PIN.'; renderView(); });
      return;
    }
    if (L.until && Date.now() < L.until) { renderView(); return; }
    if (k === 'del') { L.entry = L.entry.slice(0, -1); L.err = ''; renderView(); return; }
    if (!/^\d$/.test(k) || !m.pin || L.entry.length >= m.pin.len) return;
    L.entry += k; L.err = ''; renderView();
    if (L.entry.length === m.pin.len) {
      L.busy = true;
      hashPw(L.entry, m.pin.salt).then(function (h) {
        L.busy = false;
        if (h === m.pin.hash) { unlocked(); return; }
        L.fails++; L.entry = ''; L.err = 'Wrong PIN. Try again.';
        if (L.fails >= 5) { L.fails = 0; L.until = Date.now() + 30000; L.err = ''; setTimeout(function () { if (S.locked) renderView(); }, 30500); }
        renderView();
        var d = document.querySelector('.dots'); if (d) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); }
      });
    }
  }
  /* PIN set / change / remove, in a sheet */
  function bioUnavailableText() { return 'It works when ' + BR.name + ' is opened from its own web address (tktarun03.github.io/JollyTrip) or its home-screen icon, on a phone or computer with Face ID, Touch ID, a fingerprint reader or Windows Hello. It can’t work inside a preview such as Claude’s.'; }
  function sheetBio(sh) {
    var m = meta(), ok = BIO.avail !== false;
    return sheetHead(bioName()) + '<div class="lock" style="padding:0.5rem 0 0"><span class="flame" style="width:72px;height:72px">' + ic('face', 36) + '</span>' +
      (ok ? (m && m.pin && !m.bio ? '<span class="pill good">PIN lock is on</span>' : '') + '<h3 class="h3">Unlock with your face or fingerprint</h3><p class="hint" style="max-width:34ch">' + esc(BR.name) + ' asks your device to check it’s you. Your face or fingerprint never leaves the device. Your ' + (m && m.pin ? m.pin.len + '-digit ' : '') + 'PIN still works as a fallback.</p>' +
        '<button type="button" class="btn block" data-act="bio-enroll">' + ic('face', 18) + ' Turn on ' + esc(bioName()) + '</button><button type="button" class="btn ghost block" data-act="close">Not now</button>'
        : '<h3 class="h3">Not available here</h3><p class="hint" style="max-width:36ch">' + esc(bioUnavailableText()) + '</p><p class="hint" style="max-width:36ch">' + (m && m.pin ? 'Your PIN lock is on and works everywhere.' : '') + '</p><button type="button" class="btn block" data-act="close">OK</button>') + '</div>';
  }
  function sheetPin(sh) {
    if (sh.step === 'bio') return sheetBio(sh);
    var m = meta(), d = sh.d, len = sh.step === 'current' || sh.step === 'remove' ? m.pin.len : d.len;
    var title = sh.purpose === 'remove' ? 'Turn off PIN lock' : sh.purpose === 'change' ? 'Change PIN' : sh.thenBio ? 'First, set a PIN' : 'Set a PIN';
    var prompt = { current: 'Enter your current PIN.', remove: 'Enter your PIN to turn the lock off.', 'new': 'Choose a new ' + d.len + '-digit PIN.', confirm: 'Enter the same PIN again.' }[sh.step];
    return sheetHead(title) + '<p class="hint">' + esc(prompt) + (sh.thenBio && sh.step === 'new' ? ' It’s the fallback for when your face or finger isn’t recognised.' : '') + '</p>' +
      (sh.step === 'new' ? '<div class="seg" role="group" aria-label="PIN length"><button type="button" data-act="pin-len" data-v="4" aria-pressed="' + (d.len === 4) + '">4 digits</button><button type="button" data-act="pin-len" data-v="6" aria-pressed="' + (d.len === 6) + '">6 digits</button></div>' : '') +
      '<div class="lock" style="padding:0">' + pinDots(len, d.entry.length) + keypad(false) + '</div>' + errLine(sh) +
      (sh.purpose === 'remove' && m.bio ? '<p class="hint">Face ID or fingerprint unlock turns off too, because it needs the PIN as a fallback.</p>' : '');
  }
  function pinKey(k) {
    var sh = S.sheet, m = meta(), d = sh.d; if (sh.busy) return;
    var len = sh.step === 'current' || sh.step === 'remove' ? m.pin.len : d.len;
    if (k === 'del') { d.entry = d.entry.slice(0, -1); sh.err = ''; renderSheet(); return; }
    if (!/^\d$/.test(k) || d.entry.length >= len) return;
    d.entry += k; sh.err = ''; renderSheet();
    if (d.entry.length < len) return;
    if (sh.step === 'current' || sh.step === 'remove') {
      sh.busy = true;
      hashPw(d.entry, m.pin.salt).then(function (h) {
        sh.busy = false; d.entry = '';
        if (h !== m.pin.hash) { sh.err = 'That PIN isn’t right. Try again.'; renderSheet(); return; }
        if (sh.step === 'remove') { delete m.pin; delete m.bio; saveIndex(); closeSheet(); renderView(); toast('PIN lock turned off', 'The app opens without a PIN now.'); return; }
        sh.step = 'new'; renderSheet();
      });
      return;
    }
    if (sh.step === 'new') { d.first = d.entry; d.entry = ''; sh.step = 'confirm'; setTimeout(renderSheet, 120); return; }
    if (d.entry !== d.first) { d.entry = ''; d.first = ''; sh.step = 'new'; sh.err = 'The two PINs didn’t match. Choose one again.'; renderSheet(); return; }
    sh.busy = true;
    var salt = uid();
    hashPw(d.entry, salt).then(function (h) {
      m.pin = { salt: salt, hash: h, len: d.len }; if (m.lockAfter == null) m.lockAfter = 5; saveIndex();
      if (!m.bio && sh.purpose === 'set' && (sh.thenBio || BIO.avail)) { sh.busy = false; sh.step = 'bio'; S.sheet = sh; renderSheet(); renderView(); return; }
      closeSheet(); renderView(); toast(sh.purpose === 'change' ? 'PIN changed' : 'PIN lock is on', 'You’ll be asked for it when you open ' + BR.name + '.');
    });
  }
  var LOCK_AFTER = [[0, 'Every time you come back, or after 5 minutes idle'], [1, 'After 1 minute idle or away'], [5, 'After 5 minutes idle or away'], [15, 'After 15 minutes idle or away'], [60, 'After 1 hour idle or away']];
  function idleMinutes(m) { var a = m && m.lockAfter != null ? +m.lockAfter : 5; return a > 0 ? a : 5; }
  function securityCard(m) {
    var on = lockEnabled(m), bioOk = BIO.avail !== false;
    var bioHint = !bioOk ? 'Not available in this view. Tap to see where it works.' : !m.pin ? 'Unlock with your face or fingerprint. You’ll set a PIN first as the fallback.' : 'Unlock with your face or fingerprint instead of typing the PIN.';
    return '<section class="card"><div class="row between"><h2 class="h3">Security</h2><span class="pill ' + (on ? 'good' : 'info') + '">' + (on ? 'App lock on' : 'App lock off') + '</span></div>' +
      '<div class="setrow"><div class="grow"><span class="label">PIN lock</span><span class="hint">' + (m.pin ? 'On · ' + m.pin.len + ' digits' : 'Ask for a PIN when the app opens.') + '</span></div><div class="row" style="gap:6px">' + (m.pin ? '<button type="button" class="btn quiet sm" data-act="pin-change">Change</button><button type="button" class="btn ghost sm" data-act="pin-off">Turn off</button>' : '<button type="button" class="btn sm" data-act="pin-set">Set PIN</button>') + '</div></div>' +
      '<div class="setrow"><span class="tile" style="--c:var(--accent)">' + ic('face', 18) + '</span><div class="grow"><span class="label" id="bio-lbl">' + esc(bioName()) + '</span><span class="hint">' + esc(m.bio ? 'On. Use it on the lock screen; your PIN still works too.' : bioHint) + '</span></div>' +
        (m.bio ? '<button type="button" class="switch" role="switch" aria-labelledby="bio-lbl" aria-checked="true" data-act="bio-toggle"><span></span></button>' : '<button type="button" class="btn sm" data-act="bio-toggle">Turn on</button>') + '</div>' +
      (on ? '<div class="field"><label for="lock-after">Lock the app</label><select id="lock-after" class="input" data-lockafter="1">' + LOCK_AFTER.map(function (o) { return '<option value="' + o[0] + '"' + (+(m.lockAfter == null ? 5 : m.lockAfter) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select><span class="hint">Idle means you haven’t touched or typed in the app. It always locks when the app is opened fresh.</span></div>' : '') +
      '<div class="setrow"><div class="grow"><span class="label">Account password</span><span class="hint">' + (m.hash ? 'Set. Asked when you open this account from the account list, and works if you forget the PIN.' : 'Not set.') + '</span></div><button type="button" class="btn quiet sm" data-act="profile" data-pw="1">' + (m.hash ? 'Change' : 'Set') + '</button></div>' +
      (on ? '<button type="button" class="btn ghost block" data-act="lock-now">' + ic('lock', 16) + ' Lock now</button>' : '') +
      '<p class="hint">The lock keeps people out of the app on this device. Your trips aren’t encrypted, so someone who can open the browser’s storage directly could still read them.</p></section>';
  }

  /* =========================================================
     Manage profile
     ========================================================= */
  function sheetProfile(sh) {
    var d = sh.d, m = meta();
    var pwBlock = '';
    if (d.pwMode) {
      pwBlock = '<section class="card"><span class="label">' + (d.pwMode === 'set' ? 'Set a password' : d.pwMode === 'change' ? 'Change password' : 'Remove password') + '</span>' +
        (d.pwMode !== 'set' ? '<div class="field"><label for="pf-cur">Current password</label><input id="pf-cur" class="input" type="password" data-f="cur" autocomplete="current-password" value="' + esc(d.cur) + '"></div>' : '') +
        (d.pwMode !== 'remove' ? '<div class="field"><label for="pf-pw1">New password</label><input id="pf-pw1" class="input" type="password" data-f="pw1" autocomplete="new-password" value="' + esc(d.pw1) + '"><span class="hint">At least 4 characters. It can’t be reset, so pick one you’ll remember.</span></div><div class="field"><label for="pf-pw2">Confirm new password</label><input id="pf-pw2" class="input" type="password" data-f="pw2" autocomplete="new-password" value="' + esc(d.pw2) + '"></div>' : '') +
        '<button type="button" class="link" data-act="pf-pw" data-v="" style="align-self:flex-start">Cancel</button></section>';
    }
    return sheetHead('Your profile') +
      '<div class="row" style="gap:16px">' + avatar({ name: d.name || m.name, color: d.color, photo: d.photo }, 84) + '<div class="stack-xs"><label class="btn quiet sm">' + ic('camera', 16) + (d.photo ? 'Change picture' : 'Upload a picture') + '<input type="file" accept="image/*" class="sr-only" data-upload="profile-photo"></label>' + (d.photo ? '<button type="button" class="btn ghost sm" data-act="pf-photo-rm">Remove picture</button>' : '') + '</div></div>' +
      '<div class="field"><span class="label">Colour</span><div class="swatches" role="group" aria-label="Profile colour">' + AV.map(function (c) { return '<button type="button" class="swatch" style="--c:' + c + '" data-act="pf-color" data-c="' + c + '" aria-pressed="' + (d.color === c) + '" aria-label="Colour ' + c + '"></button>'; }).join('') + '</div><span class="hint">Shown when there’s no picture.</span></div>' +
      '<div class="field"><label for="pf-name">Name</label><input id="pf-name" class="input" data-f="name" maxlength="40" autocomplete="name" value="' + esc(d.name) + '"></div>' +
      '<div class="field"><label for="pf-home">Home currency</label><select id="pf-home" class="input" data-f="home">' + curOptions(d.home) + '</select><span class="hint">Used for new trips. Each trip keeps its own currencies.</span></div>' +
      '<div class="field"><span class="label">Password</span><div class="row wrap">' + (m.hash ? '<button type="button" class="btn quiet sm" data-act="pf-pw" data-v="change">Change password</button><button type="button" class="btn quiet sm" data-act="pf-pw" data-v="remove">Remove password</button>' : '<button type="button" class="btn quiet sm" data-act="pf-pw" data-v="set">Set a password</button>') + '</div></div>' + pwBlock +
      errLine(sh) + '<button type="button" class="btn block" data-act="pf-save" data-primary="1">Save profile</button>' +
      '<div class="duo"><button type="button" class="btn quiet" data-act="accounts">' + ic('users', 18) + ' Switch account</button><button type="button" class="btn quiet" data-act="signout">' + ic('logout', 18) + ' Sign out</button></div>' +
      (lockEnabled(m) ? '<button type="button" class="btn ghost block" data-act="lock-now">' + ic('lock', 16) + ' Lock now</button>' : '<div class="duo"><button type="button" class="btn ghost" data-act="pin-set">' + ic('lock', 16) + ' Set a PIN</button><button type="button" class="btn ghost" data-act="bio-toggle">' + ic('face', 16) + ' ' + esc(bioName().split(' or ')[0]) + '</button></div>');
  }

  /* =========================================================
     Reading receipts and booking documents (pdf.js + Tesseract.js, loaded on first use)
     ========================================================= */
  var OCR_LIB = Object.assign({
    tess: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
    worker: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
    core: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',
    lang: 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int',
    pdf: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
    pdfWorker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
  }, window.JT_OCR_LIB || {});
  var scriptCache = {};
  function loadScript(src) {
    if (scriptCache[src]) return scriptCache[src];
    scriptCache[src] = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = function () { res(); }; s.onerror = function () { delete scriptCache[src]; rej(new Error('load ' + src)); }; document.head.appendChild(s); });
    return scriptCache[src];
  }
  var OCR = {
    worker: null, onProgress: null,
    pdfLib: function () {
      return loadScript(OCR_LIB.pdf).then(function () {
        var lib = window.pdfjsLib; if (!lib) throw new Error('pdf.js');
        if (!lib.GlobalWorkerOptions.workerSrc) {
          try { lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob(['importScripts(' + JSON.stringify(OCR_LIB.pdfWorker) + ');'], { type: 'application/javascript' })); }
          catch (e) { lib.GlobalWorkerOptions.workerSrc = OCR_LIB.pdfWorker; }
        }
        return lib;
      });
    },
    tess: function () {
      var self = this; if (self.worker) return Promise.resolve(self.worker);
      return loadScript(OCR_LIB.tess).then(function () {
        return window.Tesseract.createWorker('eng', 1, { workerPath: OCR_LIB.worker, corePath: OCR_LIB.core, langPath: OCR_LIB.lang, logger: function (m) { if (self.onProgress && m && m.status) self.onProgress(m.status, m.progress || 0); } });
      }).then(function (w) { self.worker = w; return w; });
    },
    image: function (blob) { return this.tess().then(function (w) { return w.recognize(blob); }).then(function (r) { return (r && r.data && r.data.text) || ''; }); },
    pdf: function (blob) {
      var self = this;
      return blob.arrayBuffer().then(function (buf) { return self.pdfLib().then(function (lib) { return lib.getDocument({ data: buf }).promise; }); }).then(function (doc) {
        var n = Math.min(doc.numPages, 3), parts = [], chain = Promise.resolve();
        for (var i = 1; i <= n; i++) (function (i) { chain = chain.then(function () { return doc.getPage(i).then(function (pg) { return pg.getTextContent().then(function (tc) { parts.push(tc.items.map(function (it) { return it.str + (it.hasEOL ? '\n' : ' '); }).join('')); }); }); }); })(i);
        return chain.then(function () {
          var text = parts.join('\n');
          if (text.replace(/\s/g, '').length >= 40) return text;
          if (self.onProgress) self.onProgress('scanned pdf', 0);
          return doc.getPage(1).then(function (pg) {
            var vp = pg.getViewport({ scale: 2 }), cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
            return pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise.then(function () { return new Promise(function (res) { cv.toBlob(res, 'image/png'); }); });
          }).then(function (png) { return self.image(png); });
        });
      });
    },
    read: function (blob) { return /pdf/.test(blob.type || '') ? this.pdf(blob) : this.image(blob); },
    /* The largest picture inside the first pages of a PDF, such as the hotel photo on a confirmation. */
    pdfImage: function (blob) {
      var self = this;
      return blob.arrayBuffer().then(function (buf) { return self.pdfLib().then(function (lib) { return lib.getDocument({ data: buf }).promise; }); }).then(function (doc) {
        var lib = window.pdfjsLib, best = null, chain = Promise.resolve();
        for (var i = 1; i <= Math.min(doc.numPages, 2); i++) (function (i) {
          chain = chain.then(function () {
            return doc.getPage(i).then(function (pg) {
              return pg.getOperatorList().then(function (ops) {
                var names = [];
                ops.fnArray.forEach(function (fn, k) { if (fn === lib.OPS.paintImageXObject || fn === lib.OPS.paintJpegXObject) names.push(ops.argsArray[k][0]); });
                return Promise.all(names.map(function (n) {
                  return new Promise(function (res) {
                    var done = false; function fin(v) { if (!done) { done = true; res(v); } }
                    try { (String(n).indexOf('g_') === 0 ? pg.commonObjs : pg.objs).get(n, fin); } catch (e) { fin(null); }
                    setTimeout(function () { fin(null); }, 4000);
                  });
                })).then(function (imgs) {
                  imgs.forEach(function (im) { if (!im || !im.width) return; var r = im.width / im.height; if (im.width < 240 || im.height < 150 || r < 0.6 || r > 2.8) return; if (!best || im.width * im.height > best.width * best.height) best = im; });
                });
              });
            });
          });
        })(i);
        return chain.then(function () { return best ? pdfImgToBlob(best) : null; });
      }).catch(function () { return null; });
    }
  };
  function pdfImgToBlob(im) {
    try {
      var cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; var cx = cv.getContext('2d');
      if (im.bitmap) cx.drawImage(im.bitmap, 0, 0);
      else if (im.data) {
        var n = im.width * im.height, src = im.data, out = cx.createImageData(im.width, im.height), dst = out.data;
        if (src.length >= n * 4) { for (var a = 0; a < n * 4; a++) dst[a] = src[a]; }
        else if (src.length >= n * 3) { for (var i = 0, j = 0; i < n; i++, j += 3) { dst[i * 4] = src[j]; dst[i * 4 + 1] = src[j + 1]; dst[i * 4 + 2] = src[j + 2]; dst[i * 4 + 3] = 255; } }
        else return Promise.resolve(null);
        cx.putImageData(out, 0, 0);
      } else return Promise.resolve(null);
      return new Promise(function (res) { cv.toBlob(res, 'image/jpeg', 0.86); });
    } catch (e) { return Promise.resolve(null); }
  }
  /* Drawn pictures for bookings without a photo. */
  function bookingArt(type) {
    var g = function (id, a, b) { return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="320" height="140" fill="url(#' + id + ')"/>'; };
    var palm = function (x, s) { var k = s || 1; return '<g transform="translate(' + x + ' 108) scale(' + k + ')"><path d="M0 0 C2 -16 -2 -28 2 -44" stroke="#7A5134" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M2 -44 C-8 -52 -20 -50 -26 -44 C-16 -48 -6 -47 2 -44Z M2 -44 C10 -54 22 -54 28 -47 C18 -50 9 -48 2 -44Z M2 -44 C-4 -56 -2 -64 6 -68 C2 -60 2 -52 2 -44Z M2 -44 C-10 -42 -16 -34 -18 -28 C-10 -34 -4 -40 2 -44Z M2 -44 C12 -42 18 -34 20 -28 C12 -34 6 -40 2 -44Z" fill="#2E8A6C"/></g>'; };
    var svg;
    if (type === 'stay') {
      var win = ''; for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) win += '<rect x="' + (114 + c * 20) + '" y="' + (46 + r * 13) + '" width="12" height="7" rx="1.5" fill="' + ((r + c) % 3 === 0 ? '#F9D79A' : '#9CCFDA') + '"/>';
      svg = g('art-stay', '#F4AE84', '#FCE7D0') + '<circle cx="252" cy="50" r="19" fill="#FFF4DE" opacity=".95"/><path d="M0 96 Q60 84 120 94 T240 90 T320 94 V140 H0Z" fill="#E59B70" opacity=".45"/>' +
        '<rect x="104" y="36" width="92" height="72" rx="3" fill="#FFFDF8"/><rect x="100" y="31" width="100" height="8" rx="2" fill="#1F6B67"/>' + win + '<rect x="142" y="94" width="16" height="14" rx="1.5" fill="#1F6B67"/>' +
        '<rect y="108" width="320" height="32" fill="#F2D6B3"/><path d="M58 114 H262 V128 H58Z" fill="#7CC6D6"/><path d="M70 120h18M112 123h22M162 119h16M204 123h22" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>' + palm(64) + palm(240, 1.1) + palm(276, 0.8);
    } else if (type === 'flight') {
      svg = g('art-fl', '#86C3EA', '#E6F3FB') + '<ellipse cx="60" cy="104" rx="46" ry="14" fill="#FFFFFF" opacity=".9"/><ellipse cx="96" cy="110" rx="36" ry="11" fill="#FFFFFF" opacity=".9"/><ellipse cx="262" cy="96" rx="52" ry="15" fill="#FFFFFF" opacity=".85"/><ellipse cx="230" cy="40" rx="30" ry="8" fill="#FFFFFF" opacity=".7"/>' +
        '<path d="M10 82 Q70 76 118 68" stroke="#FFFFFF" stroke-width="3" opacity=".75" fill="none" stroke-linecap="round"/>' +
        '<g transform="rotate(-8 170 62)"><path d="M116 64 L214 58 Q230 57 236 62 Q230 67 214 66 L116 66 Z" fill="#FFFFFF"/><path d="M162 64 L142 88 L155 88 L186 65Z" fill="#DCE8F1"/><path d="M168 59 L152 42 L163 42 L190 59Z" fill="#DCE8F1"/><path d="M120 64 L108 48 L117 48 L130 63Z" fill="#1F6B67"/><path d="M196 60h22" stroke="#86C3EA" stroke-width="2" stroke-dasharray="3 3"/></g>';
    } else if (type === 'car') {
      svg = g('art-car', '#BFE3DE', '#EEF8F3') + '<circle cx="64" cy="44" r="16" fill="#FFF6DD"/><path d="M0 92 Q80 60 160 84 T320 76 V140 H0Z" fill="#8CC5A2"/><path d="M0 104 Q90 84 200 100 T320 96 V140 H0Z" fill="#6FB08A"/>' +
        '<rect y="112" width="320" height="28" fill="#5E6670"/><path d="M8 126h30M60 126h30M112 126h30M164 126h30M216 126h30M268 126h30" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>' +
        '<g transform="translate(120 82)"><path d="M6 26 V18 Q6 12 14 11 L26 10 L38 0 H66 L80 10 L92 12 Q98 13 98 19 V26 Z" fill="#C06D47"/><path d="M30 10 L40 3 H52 V10Z M56 3 H64 L74 10 H56Z" fill="#D9EEF4"/><circle cx="26" cy="27" r="7" fill="#2B2F33"/><circle cx="78" cy="27" r="7" fill="#2B2F33"/><circle cx="26" cy="27" r="2.6" fill="#C9CDD2"/><circle cx="78" cy="27" r="2.6" fill="#C9CDD2"/></g>';
    } else if (type === 'train') {
      svg = g('art-tr', '#CFE0F2', '#F2F6FB') + '<path d="M0 94 Q70 70 150 88 T320 80 V140 H0Z" fill="#A9C9B4"/><path d="M0 116 H320" stroke="#7A808A" stroke-width="3"/><path d="M0 122 H320" stroke="#7A808A" stroke-width="2"/>' +
        '<g transform="translate(60 70)"><rect x="0" y="6" width="190" height="38" rx="8" fill="#4C79B6"/><path d="M190 6 Q214 8 220 30 L220 44 H190Z" fill="#3E67A0"/>' + [14, 46, 78, 110, 142].map(function (x) { return '<rect x="' + x + '" y="14" width="22" height="12" rx="2" fill="#E6F0FA"/>'; }).join('') + '<rect x="0" y="32" width="220" height="4" fill="#F4F6F8"/><circle cx="30" cy="46" r="4" fill="#2B2F33"/><circle cx="90" cy="46" r="4" fill="#2B2F33"/><circle cx="150" cy="46" r="4" fill="#2B2F33"/><circle cx="200" cy="46" r="4" fill="#2B2F33"/></g>';
    } else if (type === 'tour') {
      svg = g('art-tour', '#E8D3EF', '#F8F0FA') + '<circle cx="250" cy="44" r="16" fill="#FFF6DD"/><path d="M0 104 Q80 90 160 100 T320 96 V140 H0Z" fill="#D9B8E3" opacity=".7"/>' +
        '<g transform="translate(92 34)" fill="#B2628A"><rect x="0" y="12" width="136" height="8" rx="2"/><path d="M8 0 H128 L136 12 H0Z" opacity=".85"/>' + [12, 40, 68, 96, 120].map(function (x) { return '<rect x="' + x + '" y="22" width="8" height="48"/>'; }).join('') + '<rect x="-6" y="70" width="148" height="8" rx="2"/></g>' +
        '<g transform="translate(28 96) rotate(-8)"><path d="M0 0 H70 V10 a6 6 0 0 0 0 12 V32 H0 V22 a6 6 0 0 0 0 -12Z" fill="#FFFFFF"/><path d="M20 4 V28" stroke="#B2628A" stroke-width="1.4" stroke-dasharray="2 3"/><path d="M28 12h30M28 19h20" stroke="#B2628A" stroke-width="2" stroke-linecap="round"/></g>';
    } else return POSTCARD;
    return '<svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + svg + '</svg>';
  }
  function autofillCard(sh) {
    var d = sh.d;
    return '<section class="card" style="gap:10px"><div class="row between"><span class="label">Fill in from your confirmation</span>' + ic('scan', 18) + '</div><p class="hint">Paste the confirmation email, or attach its PDF, a photo or a screenshot. Empty fields are filled in for you to check.</p>' +
      (sh.paste ? '<textarea id="bk-paste" class="input" data-f="pasteText" style="min-height:140px" placeholder="Paste the booking email or confirmation text here">' + esc(d.pasteText) + '</textarea><div class="row wrap"><button type="button" class="btn sm" data-act="bk-paste-read">Read pasted details</button><button type="button" class="btn ghost sm" data-act="bk-paste">Cancel</button></div>'
        : '<div class="row wrap"><button type="button" class="btn quiet sm" data-act="bk-paste">' + ic('copy', 16) + ' Paste details</button><label class="btn quiet sm">' + ic('upload', 16) + ' Attach PDF or photo<input type="file" accept="image/*,application/pdf,.pdf,.pkpass,application/vnd.apple.pkpass" multiple class="sr-only" data-upload="bk-docs"></label></div>') +
      ocrNote(sh.ocr) + '</section>';
  }
  var MONRE = 'jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec';
  function docLines(text) { return String(text || '').split(/\r?\n/).map(function (s) { return s.replace(/\s+/g, ' ').trim(); }).filter(Boolean); }
  function findDates(s) {
    var out = [], m, re;
    function push(y, mo, d, idx) { if (y < 100) y += 2000; var dt = new Date(y, mo, d); if (isNaN(dt) || dt.getMonth() !== mo || dt.getDate() !== d || y < 2000 || y > 2100) return; out.push({ ds: iso(dt), i: idx }); }
    re = /\b(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})\b/g; while ((m = re.exec(s))) push(+m[1], +m[2] - 1, +m[3], m.index);
    re = new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?[\\s\\-\\/.,]*(' + MONRE + ')[a-z]*\\.?[\\s\\-\\/.,]*(\\d{4})\\b', 'gi'); while ((m = re.exec(s))) push(+m[3], MON[m[2].toLowerCase()], +m[1], m.index);
    re = new RegExp('\\b(' + MONRE + ')[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b', 'gi'); while ((m = re.exec(s))) push(+m[3], MON[m[1].toLowerCase()], +m[2], m.index);
    re = /\b(\d{1,2})[\/.](\d{1,2})[\/.](20\d{2})\b/g; while ((m = re.exec(s))) { var a = +m[1], b = +m[2]; if (b > 12) push(+m[3], a - 1, b, m.index); else push(+m[3], b - 1, a, m.index); }
    return out.sort(function (x, y) { return x.i - y.i; });
  }
  function findTime(s) { var m = String(s).match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\s*(am|pm)?\b/i); if (!m) return ''; var h = +m[1], ap = (m[3] || '').toLowerCase(); if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0; return pad(h) + ':' + m[2]; }
  function findAmounts(lines, t) {
    var out = [];
    lines.forEach(function (ln) {
      var isTot = /(grand total|total price|total amount|amount paid|total paid|total charged|total due|balance due|amount due|to pay|total)/i.test(ln), m;
      AMT_RE.lastIndex = 0;
      while ((m = AMT_RE.exec(ln))) { var v = parseFloat((m[2] || m[3] || '').replace(/,/g, '')); if (v > 0) out.push({ v: v, cur: tokCur(m[1] || m[4], t), tot: isTot, ln: ln }); }
      AMT_RE.lastIndex = 0;
      if (isTot && !out.some(function (a) { return a.ln === ln; })) { var b = ln.match(/(?:total|amount|due|pay)[^0-9]{0,25}([0-9][0-9,]*(?:\.\d{1,2})?)/i); if (b) { var v2 = parseFloat(b[1].replace(/,/g, '')); if (v2 > 0) out.push({ v: v2, cur: '', tot: true, ln: ln }); } }
    });
    return out;
  }
  function pickTotal(amts) { var tot = amts.filter(function (a) { return a.tot; }), pool = tot.length ? tot : amts.filter(function (a) { return a.cur; }); if (!pool.length) return null; return pool.reduce(function (a, b) { return b.v > a.v ? b : a; }); }
  var PROVIDERS = [[/qatar airways/i, 'Qatar Airways'], [/emirates/i, 'Emirates'], [/etihad/i, 'Etihad'], [/flydubai/i, 'flydubai'], [/air arabia/i, 'Air Arabia'], [/indigo/i, 'IndiGo'], [/air india/i, 'Air India'], [/ryanair/i, 'Ryanair'], [/easyjet/i, 'easyJet'], [/lufthansa/i, 'Lufthansa'], [/turkish airlines/i, 'Turkish Airlines'], [/saudia/i, 'Saudia'], [/singapore airlines/i, 'Singapore Airlines'], [/cathay/i, 'Cathay Pacific'], [/japan airlines|\bjal\b/i, 'Japan Airlines'], [/all nippon|\bana\b/i, 'ANA'], [/airasia/i, 'AirAsia'], [/booking\.com/i, 'Booking.com'], [/agoda/i, 'Agoda'], [/airbnb/i, 'Airbnb'], [/expedia/i, 'Expedia'], [/hotels\.com/i, 'Hotels.com'], [/marriott/i, 'Marriott'], [/hilton/i, 'Hilton'], [/hyatt/i, 'Hyatt'], [/\bihg\b|holiday inn/i, 'IHG'], [/accor|novotel|ibis/i, 'Accor'], [/klook/i, 'Klook'], [/viator/i, 'Viator'], [/getyourguide/i, 'GetYourGuide'], [/hertz/i, 'Hertz'], [/\bavis\b/i, 'Avis'], [/\bsixt\b/i, 'Sixt'], [/europcar/i, 'Europcar'], [/trainline/i, 'Trainline'], [/12go/i, '12Go']];
  var TYPE_RULES = { flight: /flight|airline|airways|boarding|\bpnr\b|e-?ticket|departure|baggage|\bseat\b/gi, stay: /hotel|check-?in|check-?out|\broom\b|night|guest|resort|ryokan|hostel|airbnb|villa|accommodation/gi, car: /car rental|rent a car|pick-?up|drop-?off|vehicle|hertz|avis|sixt|europcar/gi, train: /\btrain\b|railway|\brail\b|coach|\bbus\b|ferry|platform/gi, tour: /ticket|\btour\b|admission|entry|attraction|museum|activity|klook|viator|getyourguide/gi };
  var CONF_STOP = /^(NUMBER|DETAILS|CONFIRMED|CONFIRMATION|BOOKING|RESERVATION|REFERENCE|SUMMARY|RECEIPT|INVOICE|STATUS|PENDING)$/;
  function parseDoc(text, t) {
    var lines = docLines(text), all = lines.join('\n'), f = { lines: lines };
    var cm, cre = /(?:confirmation|booking|reservation|itinerary|order|reference|\bref\b\.?|\bpnr\b|record locator)\s*(?:number|no\.?|code|id|#)?(?:\s+is)?\s*[:#.\-]?\s*([A-Z0-9][A-Z0-9\-]{4,18})/gi;
    while ((cm = cre.exec(all))) { var c = cm[1].toUpperCase(); if ((/\d/.test(c) && /[A-Z]/.test(c)) || /^\d{6,}$/.test(c) || (/^[A-Z]{5,8}$/.test(c) && !CONF_STOP.test(c))) { f.conf = c; break; } }
    var score = {}; Object.keys(TYPE_RULES).forEach(function (k) { score[k] = (all.match(TYPE_RULES[k]) || []).length; });
    var best = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; })[0]; if (score[best] > 0) f.type = best;
    PROVIDERS.some(function (p) { if (p[0].test(all)) { f.provider = p[1]; return true; } return false; });
    var startLn = /(check-?in|arriv|depart|pick[- ]?up|travel date|flight date|date of (?:visit|travel)|outbound|valid on|start)/i, endLn = /(check-?out|return|drop[- ]?off|until|inbound|end)/i, skipLn = /(book(?:ed|ing) (?:on|date)|issued|order date|paid on|payment date|date of issue|invoice date)/i;
    lines.forEach(function (ln) { var ds = findDates(ln); if (!ds.length) return; if (skipLn.test(ln)) return; if (!f.start && startLn.test(ln)) { f.start = ds[0].ds; f.time = f.time || findTime(ln); if (ds[1]) f.end = ds[1].ds; } else if (!f.end && endLn.test(ln)) f.end = ds[0].ds; });
    if (!f.start) {
      var pool = []; lines.forEach(function (ln) { if (!skipLn.test(ln)) findDates(ln).forEach(function (d) { if (pool.indexOf(d.ds) < 0) pool.push(d.ds); }); });
      pool.sort(); var fut = pool.filter(function (d) { return d >= addDays(today(), -2); }); var use = fut.length ? fut : pool;
      if (use[0]) f.start = use[0]; if (use[1]) f.end = f.end || use[1];
    }
    if (f.end && f.start && f.end < f.start) f.end = '';
    var tot = pickTotal(findAmounts(lines, t)); if (tot) f.total = tot;
    var route = all.match(/\b([A-Z]{3})\s*(?:-|–|—|→|>|to)\s*([A-Z]{3})\b/);
    if (f.type === 'flight' && route) f.name = route[1] + ' – ' + route[2];
    if (!f.name) { var st = lines.filter(function (l) { return /(hotel|resort|\binn\b|ryokan|villa|hostel|suites|apartments?|lodge|guest ?house)/i.test(l) && !/(check|booking|confirm|dear|thank)/i.test(l) && l.length <= 60; })[0]; if (st) f.name = st; }
    if (!f.name && f.provider) f.name = f.provider;
    var ad = lines.filter(function (l) { return l.length >= 12 && l.length <= 140 && /(\broad\b|\brd\b\.?|street|\bst\b\.?|avenue|\bave\b|lane|nagar|salai|marg|boulevard|blvd|district|chome|\b\d{6}\b|\b\d{3}-\d{4}\b)/i.test(l) && !/(check|booking|total|phone|tel|email|price|paid|confirm)/i.test(l); })[0];
    if (ad) f.address = ad.replace(/^(address|location)\s*[:\-]\s*/i, '');
    return f;
  }
  function parseReceipt(text, t) {
    var lines = docLines(text), r = {};
    var tot = pickTotal(findAmounts(lines, t)); if (tot) r.total = tot;
    var ds = findDates(lines.join('\n')); if (ds[0]) r.date = ds[0].ds;
    r.time = findTime(lines.join(' '));
    r.note = (lines.slice(0, 5).filter(function (l) { return /[A-Za-z]{3}/.test(l) && !/(receipt|invoice|tax|tel|phone|www|http|date|time|cashier|order|table|vat|gst|welcome)/i.test(l) && l.length <= 40; })[0] || '');
    if (r.note) r.note = tidyName(r.note);
    return r;
  }
  function ocrNote(o) {
    if (!o) return '';
    return '<p class="notice" id="ocr-msg" role="status" style="background:' + (o.busy ? 'var(--accent-soft)' : o.ok ? 'var(--good-soft)' : 'var(--warn-soft)') + '">' + esc(o.msg) + '</p>';
  }
  function ocrProgressText(status, p) {
    if (/load|init/i.test(status)) return 'Getting the reading tool ready. The first time, it downloads about 5 MB, then it’s cached.';
    if (/scanned/.test(status)) return 'This PDF is a scan, so reading the image…';
    if (/recogniz/i.test(status)) return 'Reading the text… ' + Math.round(p * 100) + '%';
    return 'Reading your file…';
  }
  function runOcr(blob, mode, photoId) {
    var sh = S.sheet; if (!sh) return;
    sh.ocr = { busy: true, msg: 'Reading your file…' }; renderSheet();
    OCR.onProgress = function (status, p) { if (S.sheet !== sh) return; sh.ocr.msg = ocrProgressText(status, p); var el = $('#ocr-msg'); if (el) el.textContent = sh.ocr.msg; };
    OCR.read(blob).then(function (text) {
      if (S.sheet !== sh) return;
      var t = trip(), found = mode === 'booking' ? fillBooking(sh, parseDoc(text, t), t) : fillSpend(sh, parseReceipt(text, t), t);
      if (mode === 'booking' && photoId && text.replace(/\s/g, '').length < 40) {
        if (!sh.d.cover) sh.d.cover = photoId;
        sh.d.photos = sh.d.photos.filter(function (x) { return x !== photoId; }).concat(sh.d.cover === photoId ? [] : [photoId]);
        sh.ocr = { ok: true, msg: 'This looks like a photo rather than a confirmation, so it’s now the booking picture.' }; renderSheet(); return;
      }
      sh.ocr = found.length ? { ok: true, msg: 'Filled from your file: ' + found.join(' · ') + '. Check them before saving.' } : { ok: false, msg: text.trim() ? 'Read the file, but couldn’t find ' + (mode === 'booking' ? 'booking details' : 'an amount') + ' to fill in. Add them yourself.' : 'No text found in this file. Try a sharper photo, or the PDF from the confirmation email.' };
      renderSheet();
    }).catch(function () {
      if (S.sheet !== sh) return;
      sh.ocr = { ok: false, msg: IS_TOP ? 'Couldn’t read this file. The reading tool needs an internet connection the first time. Your file is saved either way.' : 'Reading files works when ' + BR.name + ' is opened from its own web address or home-screen icon. Your file is saved either way.' };
      renderSheet();
    });
  }
  function fillBooking(sh, f, t) {
    var d = sh.d, out = [];
    if (f.type && !d.name && !sh.typeSet) { d.type = f.type; out.push(BKT[f.type].label.toLowerCase()); }
    if (f.name && !String(d.name).trim()) { d.name = f.name.slice(0, 60); out.push('name'); }
    if (f.provider && !String(d.provider).trim()) { d.provider = f.provider; out.push(f.provider); }
    if (f.conf && !String(d.conf).trim()) { d.conf = f.conf; out.push('code ' + f.conf); }
    if (f.start && (!d.id ? d.start === sh.initStart : false)) { d.start = f.start; out.push(fmtD(f.start, { day: 'numeric', month: 'short' }) + (f.end ? ' – ' + fmtD(f.end, { day: 'numeric', month: 'short' }) : '')); if (f.end && BKT[d.type].hasEnd && !d.end) d.end = f.end; }
    if (f.time && !d.time) d.time = f.time;
    if (f.address && !String(d.address || '').trim()) { d.address = f.address.slice(0, 160); out.push('address'); }
    var okCur = f.total && (!f.total.cur || f.total.cur === t.local || f.total.cur === t.home);
    if (f.total && !okCur) out.push('the total is in ' + f.total.cur + ' (' + f.total.v.toLocaleString() + '), not this trip’s currency, so enter it yourself');
    else if (f.total && !num(d.total)) { if (f.total.cur) d.cur = f.total.cur; d.total = String(f.total.v); out.push('total ' + money(f.total.v, d.cur, { show: true })); }
    else if (f.total && Math.abs(num(d.total) - f.total.v) > 0.01) out.push('the file shows a total of ' + (f.total.cur || d.cur) + ' ' + f.total.v.toLocaleString());
    return out;
  }
  function fillSpend(sh, r, t) {
    var d = sh.d, out = [];
    var okCur = r.total && (!r.total.cur || r.total.cur === t.local || r.total.cur === t.home);
    if (r.total && !okCur) out.push('the amount is in ' + r.total.cur + ' (' + r.total.v.toLocaleString() + '), not this trip’s currency, so enter it yourself');
    else if (r.total && !num(d.amt)) { if (r.total.cur) d.cur = r.total.cur; d.amt = String(r.total.v); out.push('amount ' + money(r.total.v, d.cur, { show: true })); }
    if (r.note && !String(d.note).trim()) { d.note = r.note; out.push('“' + r.note + '”'); if (d.cat === 'food' && !sh.catSet) d.cat = guessCat(r.note, catMemory(t)); }
    if (r.date && r.date !== d.date && Math.abs(diff(r.date, today())) < 400) { d.date = r.date; out.push(fmtD(r.date, { day: 'numeric', month: 'short' })); }
    if (r.time && (!d.id)) d.time = r.time;
    return out;
  }
  function docsField(sh) {
    var d = sh.d;
    return '<div class="field"><span class="label">Receipts and documents</span><span class="hint">Add the confirmation PDF, or a photo or screenshot of it. ' + esc(BR.name) + ' reads the code, dates and total for you.</span>' +
      '<div class="thumbs">' + d.photos.map(function (id, i) { return '<div class="thumb"><button type="button" class="thumb-open" data-act="lb" data-src="ed" data-i="' + i + '" aria-label="View image ' + (i + 1) + '">' + photoImg(id) + '</button><button type="button" class="rm" data-act="ph-rm" data-i="' + i + '" aria-label="Remove image ' + (i + 1) + '">' + ic('x', 14) + '</button><button type="button" class="rm pin" data-act="bk-cover-use" data-i="' + i + '" aria-label="Use image ' + (i + 1) + ' as the booking picture">' + ic('camera', 13) + '</button></div>'; }).join('') +
      (d.photos.length + d.files.length < 8 ? '<label class="thumb-add">' + ic('upload', 20) + '<span>Add file</span><input type="file" accept="image/*,application/pdf,.pdf,.pkpass,application/vnd.apple.pkpass" multiple class="sr-only" data-upload="bk-docs" aria-label="Add receipts or PDFs"></label>' : '') + '</div>' +
      (d.files.length ? '<div class="rows">' + d.files.map(function (f, i) { var pk = isPkpass(f); return '<div class="doc"><span class="tile" style="--c:' + (pk ? 'var(--ink)' : 'var(--bad)') + '">' + ic(pk ? 'wallet' : 'doc', 17) + '</span><span class="grow"><strong class="ellip">' + esc(f.name) + '</strong><span class="hint">' + (pk ? 'Apple Wallet pass' : 'PDF') + ' · ' + esc(kb(f.size || 0)) + '</span></span>' + (pk ? '<button type="button" class="btn quiet sm" data-act="pkpass-add" data-id="' + esc(f.id) + '">Add to Wallet</button>' : '<button type="button" class="btn quiet sm" data-act="doc-open" data-id="' + esc(f.id) + '">Open</button>') + '<button type="button" class="icon-btn sm" data-act="doc-rm" data-i="' + i + '" aria-label="Remove ' + esc(f.name) + '" style="border:0">' + ic('x', 14) + '</button></div>'; }).join('') + '</div>' : '') +
      (d.photos.length || d.files.length ? '<button type="button" class="btn quiet sm" data-act="ocr-run" style="align-self:flex-start"' + (sh.ocr && sh.ocr.busy ? ' disabled' : '') + '>' + ic('scan', 16) + ' Read details from the file</button>' : '') + '</div>';
  }

  Object.assign(SHEETS, { pin: sheetPin, profile: sheetProfile });

  Object.assign(ACT, {
    refresh: function () {
      save(); toast('Refreshing…');
      function go() { location.reload(); }
      try { if (IS_TOP && navigator.serviceWorker) navigator.serviceWorker.getRegistration().then(function (r) { return r ? r.update().catch(function () { }) : null; }).then(go, go); else setTimeout(go, 200); } catch (e) { go(); }
    },
    profile: function (el) {
      var m = meta(); if (!m) return;
      openSheet({ type: 'profile', d: { name: m.name, color: m.color || AV[0], photo: m.photo || null, home: S.p.home, pwMode: el && el.dataset && el.dataset.pw ? (m.hash ? 'change' : 'set') : null, cur: '', pw1: '', pw2: '' } });
    },
    'pf-color': function (el) { S.sheet.d.color = el.dataset.c; renderSheet(); },
    'pf-photo-rm': function () { S.sheet.d.photo = null; renderSheet(); },
    'pf-pw': function (el) { var d = S.sheet.d; d.pwMode = el.dataset.v || null; d.cur = d.pw1 = d.pw2 = ''; S.sheet.err = ''; renderSheet(); },
    'pf-save': function () {
      var sh = S.sheet, d = sh.d, m = meta();
      if (!String(d.name).trim()) return sheetErr('Add your name.');
      var mode = d.pwMode;
      if (mode && mode !== 'remove') { if (String(d.pw1).length < 4) return sheetErr('Use a password of at least 4 characters.'); if (d.pw1 !== d.pw2) return sheetErr('The two new passwords don’t match.'); }
      var check = mode && mode !== 'set' ? hashPw(d.cur, m.salt) : Promise.resolve(m.hash);
      check.then(function (h) {
        if (mode && mode !== 'set' && h !== m.hash) { sheetErr('Your current password isn’t right.'); return; }
        var next = mode === 'remove' ? Promise.resolve('') : mode ? hashPw(d.pw1, m.salt || (m.salt = uid())) : Promise.resolve(m.hash);
        return next.then(function (nh) {
          m.name = d.name.trim(); m.color = d.color; m.photo = d.photo || null; m.hash = nh || '';
          saveIndex(); S.p.home = d.home; save(); closeSheet(); renderView();
          toast('Profile saved', mode === 'remove' ? 'Password removed.' : mode ? 'Password updated.' : m.name);
        });
      });
    },
    'pin-set': function () { openSheet({ type: 'pin', purpose: 'set', step: 'new', d: { len: 4, entry: '', first: '' } }); },
    'pin-change': function () { openSheet({ type: 'pin', purpose: 'change', step: 'current', d: { len: (meta().pin || {}).len || 4, entry: '', first: '' } }); },
    'pin-off': function () { openSheet({ type: 'pin', purpose: 'remove', step: 'remove', d: { len: 4, entry: '', first: '' } }); },
    'pin-len': function (el) { var d = S.sheet.d; d.len = +el.dataset.v; d.entry = ''; renderSheet(); },
    kp: function (el) { var k = el.dataset.k; if (S.locked) lockKey(k); else if (S.sheet && S.sheet.type === 'pin') pinKey(k); },
    'bio-toggle': function () {
      var m = meta(); if (!m) return;
      if (m.bio) { delete m.bio; saveIndex(); renderView(); toast(bioName() + ' unlock turned off', 'Your PIN still locks the app.'); return; }
      if (BIO.avail === false) { openSheet({ type: 'pin', step: 'bio', d: {} }); return; }
      if (!m.pin) { openSheet({ type: 'pin', purpose: 'set', step: 'new', thenBio: true, d: { len: 4, entry: '', first: '' } }); return; }
      openSheet({ type: 'pin', step: 'bio', d: {} });
    },
    'bio-enroll': function () {
      var m = meta(); if (!m || !m.pin) return;
      bioEnroll(m).then(function () { closeSheet(); renderView(); toast(bioName() + ' unlock is on', 'Use it on the lock screen. Your PIN still works too.'); }, function (e) {
        if (e && e.name === 'NotAllowedError') toast('Not turned on', 'It was cancelled, or this browser didn’t allow it.');
        else { BIO.avail = false; renderSheet(); toast('Couldn’t turn it on', 'This device or browser doesn’t support it here.'); }
      });
    },
    'lock-now': function () { if (!lockEnabled(meta())) return; lockApp(); renderAll(); },
    'lock-pw': function () { var m = lockMeta(); signOut(true); S.locked = false; S.lock = null; S.lockPid = null; S.auth = { mode: 'signin', pick: m.id }; renderAll(); focusSoon('#si-pw'); },
    'lock-switch': function () { signOut(true); S.locked = false; S.lock = null; S.lockPid = null; renderAll(); },
    'lock-del': function () {
      var L = S.lock; if (!L.armed) { L.armed = true; renderView(); return; }
      var m = lockMeta(); signOut(true); S.locked = false; S.lock = null; S.lockPid = null; if (m) deleteProfile(m.id); renderAll(); gc(); toast('Account deleted', 'Its trips are gone from this device.');
    },
    'doc-open': function (el) {
      Photos.get(el.dataset.id).then(function (b) {
        if (!b) { toast('File not found on this device'); return; }
        var u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
      });
    },
    'toast-x': function () { clearTimeout(toastT); hideToast(); },
    'bk-paste': function () { var sh = S.sheet; sh.paste = !sh.paste; renderSheet(); if (sh.paste) focusSoon('#bk-paste'); },
    'bk-paste-read': function () {
      var sh = S.sheet, d = sh.d, t = trip(), text = String(d.pasteText || '').trim();
      if (!text) { sheetErr('Paste the confirmation text first.'); return; }
      var found = fillBooking(sh, parseDoc(text, t), t);
      if (!String(d.notes || '').trim()) { d.notes = text.slice(0, 1500); found.push('notes'); }
      sh.paste = false; d.pasteText = ''; sh.err = '';
      sh.ocr = found.length ? { ok: true, msg: 'Filled from the pasted text: ' + found.join(' · ') + '. Check them before saving.' } : { ok: false, msg: 'Couldn’t find booking details in that text. Fill them in yourself.' };
      renderSheet();
    },
    'bk-cover-use': function (el) { var d = S.sheet.d; d.cover = d.photos[+el.dataset.i]; renderSheet(); toast('Booking picture set'); },
    'bk-cover-rm': function () { S.sheet.d.cover = null; renderSheet(); },
    'doc-rm': function (el) { S.sheet.d.files.splice(+el.dataset.i, 1); renderSheet(); },
    'ocr-run': function () {
      var sh = S.sheet, d = sh.d, pdfs = (d.files || []).filter(function (f) { return !isPkpass(f); }), id = pdfs[0] ? pdfs[0].id : d.photos[0];
      if (!id) return;
      Photos.get(id).then(function (b) { if (!b) { sh.ocr = { ok: false, msg: 'That file isn’t on this device any more.' }; renderSheet(); return; } runOcr(b, sh.type === 'booking' ? 'booking' : 'spend'); });
    }
  });
  /* Uploads for documents and profile pictures */
  function handleDocs(files) {
    var sh = S.sheet; if (!sh || !sh.d) return;
    var d = sh.d, first = null;
    files = files.slice(0, Math.max(0, 8 - d.photos.length - d.files.length));
    if (!files.length) return;
    toast('Adding ' + plural(files.length, 'file') + '…');
    Promise.all(files.map(function (f) {
      if (isPkpass(f)) {
        if (f.size > 12 * 1024 * 1024) return Promise.resolve({ bad: 'too big' });
        var pid = 'doc_' + uid(), pblob = new Blob([f], { type: 'application/vnd.apple.pkpass' });
        return Photos.put(pid, pblob).then(function () { return { file: { id: pid, name: String(f.name || 'Pass.pkpass').slice(0, 80), size: f.size, mime: 'application/vnd.apple.pkpass' }, src: null }; });
      }
      var isPdf = /pdf/i.test(f.type) || /\.pdf$/i.test(f.name || '');
      if (isPdf) {
        if (f.size > 12 * 1024 * 1024) return Promise.resolve({ bad: 'too big' });
        var id = 'doc_' + uid(), blob = f.type ? f : new Blob([f], { type: 'application/pdf' });
        return Photos.put(id, blob).then(function () { return { file: { id: id, name: String(f.name || 'Document.pdf').slice(0, 80), size: f.size, mime: 'application/pdf' }, src: blob }; });
      }
      return shrink(f, 2000, false).then(function (b) { var id2 = 'ph_' + uid(); return Photos.put(id2, b).then(function () { return { photo: id2, src: f }; }); }).catch(function () { return { bad: 'unreadable' }; });
    })).then(function (res) {
      if (S.sheet !== sh) return;
      var bad = 0;
      var firstPhoto = null, pdf = null;
      res.forEach(function (r) { if (r.bad) bad++; else { if (r.file) { d.files.push(r.file); if (!pdf && r.src) pdf = r.src; if (isPkpass(r.file)) toast('Wallet pass attached', 'Add it to Apple Wallet from the Wallet section.'); } if (r.photo) d.photos.push(r.photo); if (!first && r.src) { first = r.src; firstPhoto = r.photo || null; } } });
      renderSheet();
      if (bad) toast('Couldn’t add ' + plural(bad, 'file'), 'Use a PDF under 12 MB, or a JPEG or PNG.');
      if (first) runOcr(first, 'booking', firstPhoto);
      if (pdf && !d.cover) OCR.pdfImage(pdf).then(function (img) {
        if (!img || S.sheet !== sh || d.cover) return null;
        return shrink(img, 1600, false).then(function (b) { var id = 'ph_' + uid(); return Photos.put(id, b).then(function () { if (S.sheet === sh && !d.cover) { d.cover = id; renderSheet(); toast('Picture added', 'Taken from your PDF.'); } }); });
      }).catch(function () { });
    });
  }
