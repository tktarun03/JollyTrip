  /* =========================================================
     Start
     ========================================================= */
  /* No pinch or double-tap zoom: the viewport is fixed, and iOS gesture events are cancelled. Text size is in More → Appearance. */
  (function () {
    var vp = document.querySelector('meta[name="viewport"]');
    if (!vp) { vp = document.createElement('meta'); vp.name = 'viewport'; document.head.appendChild(vp); }
    vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (n) { document.addEventListener(n, function (e) { e.preventDefault(); }, { passive: false }); });
    document.addEventListener('touchmove', function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
    document.addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  })();
  Store.init();
  BR = cleanBrand(Store.get(APP.key + 'brand')); applyBrand();
  S.index = Store.get(APP.key + 'idx') || { v: 1, profiles: [] };
  if (!Array.isArray(S.index.profiles)) S.index = { v: 1, profiles: [] };
  S.legacy = legacyData();
  Photos.open();
  var sess = Store.get(APP.key + 'sess');
  if (sess && sess.pid && meta(sess.pid) && loadProfile(sess.pid) && lockEnabled(meta(sess.pid))) lockApp();
  renderAll();
  bioCheck().then(function () { if (S.locked || (S.p && S.tab === 'more' && !S.sheet)) renderView(); });
  Photos.ready.then(function () { gc(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      S.hiddenAt = Date.now();
      if (S.p && S.pid && !S.locked) { var j = snapJson(); if (j !== S.lastSnapJson && Date.now() - S.lastAutoAt >= 5 * 60000) snapshot('auto', '', j); }
    } else if (S.p && !S.locked && S.hiddenAt) {
      var m = meta(), after = m && m.lockAfter != null ? +m.lockAfter : 5;
      if (lockEnabled(m) && Date.now() - S.hiddenAt >= after * 60000) { lockApp(); renderAll(); }
    }
  });
  (function () {
    var seen = Store.get(APP.key + 'ver');
    if (seen !== APP_VERSION) {
      Store.set(APP.key + 'ver', APP_VERSION);
      if (seen || S.index.profiles.length) setTimeout(function () { toast('Updated to version ' + APP_VERSION, CHANGELOG[0].items[0], { label: 'What’s new', act: 'about' }); }, 900);
    }
  })();
  /* Auto-lock after a stretch with no touches, clicks, typing or scrolling. */
  S.lastActive = Date.now();
  ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(function (n) { document.addEventListener(n, function () { S.lastActive = Date.now(); }, { passive: true, capture: true }); });
  document.addEventListener('scroll', function () { S.lastActive = Date.now(); }, { passive: true, capture: true });
  setInterval(function () {
    if (!S.p || S.locked || document.visibilityState !== 'visible') return;
    var m = meta();
    if (lockEnabled(m) && Date.now() - S.lastActive >= idleMinutes(m) * 60000) { lockApp(); renderAll(); toast('Locked', 'No activity for ' + plural(idleMinutes(m), 'minute') + '.'); }
  }, 15000);
  var lastDay = today();
  setInterval(function () { if (today() !== lastDay) { lastDay = today(); renderView(); } }, 60000);
  /* Offline + install: only when hosted on its own (GitHub Pages), never inside Claude's frame. */
  if (IS_TOP && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { }); });
  }
