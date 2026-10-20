/*
 * Becky's mailbox - app logic
 * Content lives in letters.js, this file only handles behaviour.
 *
 * Handy URL options for testing:
 * ?date=2026-10-18 pretend today is that date
 * ?reset=1 forget which letters were opened
 */
(function () {
  "use strict";

  var CFG = window.MAILBOX_CONFIG || {};
  var LETTERS = (CFG.letters || []).slice().sort(function (a, b) { return a.day - b.day; });
  var DAYS_BEFORE = typeof CFG.daysBefore === "number" ? CFG.daysBefore : 7;
  var NAME = CFG.recipient || "Becky";
  var STORE_KEY = "mailbox:opened:" + (CFG.birthday || "");
  var DAY_MS = 86400000;
  var SVGNS = "http://www.w3.org/2000/svg";

  var PALETTE = [
    { c: "#f8c3d2", c2: "#ee9fb6", c3: "#fcd9e3", accent: "#e0789a" },
    { c: "#d9cdf5", c2: "#b9a6e8", c3: "#e9e2fb", accent: "#9b80d9" },
    { c: "#cdeedf", c2: "#a3dbc3", c3: "#e2f6ec", accent: "#5fb592" },
    { c: "#ffe0cc", c2: "#f8bf9e", c3: "#fff0e6", accent: "#e59468" },
    { c: "#fff0b8", c2: "#f0d47e", c3: "#fff8da", accent: "#d1a52c" },
    { c: "#cfe6fb", c2: "#a4cdf2", c3: "#e4f1fd", accent: "#5c9fd8" }
  ];

  var params = new URLSearchParams(window.location.search);
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(id) { return document.getElementById(id); }

  var el = {
    title: $("title"),
    subtitle: $("subtitle"),
    hint: $("hint"),
    mailbox: $("mailbox"),
    badge: $("badge"),
    badgeCount: $("badgeCount"),
    stack: $("stack"),
    web: $("web"),
    slotLetter: $("slotLetter"),
    doorArea: $("doorArea"),
    archiveBtn: $("archiveBtn"),
    archiveCount: $("archiveCount"),
    stage: $("stage"),
    stageBackdrop: $("stageBackdrop"),
    stageHint: $("stageHint"),
    envFly: $("envFly"),
    envelope: $("envelope"),
    envLabel: $("envLabel"),
    archive: $("archive"),
    archiveGrid: $("archiveGrid"),
    archiveEmpty: $("archiveEmpty"),
    reader: $("reader"),
    readerScroll: $("readerScroll"),
    readerClose: $("readerClose"),
    letter: $("letter"),
    bunting: $("bunting"),
    letterNum: $("letterNum"),
    letterDate: $("letterDate"),
    letterTitle: $("letterTitle"),
    letterBody: $("letterBody"),
    letterSign: $("letterSign"),
    photosPage: $("photosPage"),
    photos: $("photos"),
    lightbox: $("lightbox"),
    lbImg: $("lbImg"),
    lbCap: $("lbCap"),
    lbPrev: $("lbPrev"),
    lbNext: $("lbNext"),
    confetti: $("confetti"),
    floaties: $("floaties")
  };

  /* ---------- Dates ---------- */

  function parseDate(str) {
    var p = String(str).split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function addDays(d, n) {
    var r = new Date(d.getTime());
    r.setDate(r.getDate() + n);
    return r;
  }

  function daysBetween(a, b) {
    return Math.round((b - a) / DAY_MS);
  }

  function today() {
    var forced = params.get("date");
    if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) return parseDate(forced);
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function fmt(d, opts) {
    try { return d.toLocaleDateString(CFG.locale || "en-US", opts); }
    catch (e) { return d.toDateString(); }
  }

  /* ---------- Storage ---------- */

  if (params.has("reset")) {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
  }

  function loadOpened() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }

  function markOpened(id) {
    var list = loadOpened();
    if (list.indexOf(id) === -1) list.push(id);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }

  /* ---------- State ---------- */

  function idOf(letter) { return letter.id || "day-" + letter.day; }

  function computeState() {
    var now = today();
    var birthday = parseDate(CFG.birthday);
    var start = addDays(birthday, -DAYS_BEFORE);
    var opened = loadOpened();
    var s = {
      today: now, birthday: birthday, start: start,
      arrived: [], unread: [], read: [], upcoming: [],
      daysToStart: daysBetween(now, start),
      daysToBirthday: daysBetween(now, birthday)
    };

    LETTERS.forEach(function (letter, index) {
      var item = {
        letter: letter,
        id: idOf(letter),
        index: index,
        date: addDays(start, letter.day),
        palette: PALETTE[index % PALETTE.length],
        isBirthday: letter.birthday === true || letter.day === DAYS_BEFORE
      };
      if (item.date <= now) {
        s.arrived.push(item);
        if (opened.indexOf(item.id) !== -1) { item.status = "read"; s.read.push(item); }
        else { item.status = "unread"; s.unread.push(item); }
      } else {
        item.status = "upcoming";
        s.upcoming.push(item);
      }
    });
    return s;
  }

  /* ---------- Mailbox rendering ---------- */

  var STACK_POS = [
    { x: 98, y: 228, r: -7 },
    { x: 104, y: 221, r: 6 },
    { x: 93, y: 215, r: -3 },
    { x: 108, y: 210, r: 9 }
  ];

  function svg(tag, attrs) {
    var node = document.createElementNS(SVGNS, tag);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function renderStack(items) {
    el.stack.textContent = "";
    items.slice(0, STACK_POS.length).forEach(function (item, i) {
      var p = STACK_POS[i];
      var pal = item.palette;
      var g = svg("g", { transform: "rotate(" + p.r + " " + (p.x + 22) + " " + (p.y + 14) + ")" });
      g.appendChild(svg("rect", { x: p.x, y: p.y, width: 44, height: 28, rx: 2, fill: pal.c, stroke: pal.c2, "stroke-width": 1.2 }));
      g.appendChild(svg("path", { d: "M" + p.x + " " + p.y + " L" + (p.x + 22) + " " + (p.y + 13) + " L" + (p.x + 44) + " " + p.y, fill: "none", stroke: pal.c2, "stroke-width": 1.2 }));
      g.appendChild(svg("circle", { cx: p.x + 22, cy: p.y + 13, r: 2.6, fill: "#e0789a" }));
      el.stack.appendChild(g);
    });
    el.web.style.display = items.length ? "none" : "";
    el.slotLetter.style.display = items.length ? "" : "none";
  }

  function plural(n, one, many) { return n === 1 ? one : many; }

  function subtitleText(s) {
    if (s.daysToStart > 0) return "Je te prépare quelque chose de cute...";
    if (s.daysToBirthday === 0) return "Bonne fête mon amour! ♡";
    if (s.daysToBirthday > 0) return s.daysToBirthday + " " + plural(s.daysToBirthday, "jour", "jours") + " avant ton anniversaire ♡";
    return "Tes lettres d'anniversaires ♡";
  }

  function hintText(s) {
    var n = s.unread.length;
    if (n === 1) return "Tu as du couriers! Tap sur la mailbox ♡";
    if (n > 1) return "Tu as " + n + " lettres en attente! Tap sur la mailbox ♡";
    if (s.daysToStart > 0) {
      return "Ta boite postale est vide… ta première lettre arrive " +
        (s.daysToStart === 1 ? "demain." : "dans " + s.daysToStart + " jours.");
    }
    if (s.upcoming.length) {
      var d = daysBetween(s.today, s.upcoming[0].date);
      return "Tout est lu! une autre lettre arrive" + (d === 1 ? "demain" : "dans " + d + " jours") + " ♡";
    }
    return "Toutes les lettres ont étées lues. Relit les quand tu veux ♡";
  }

  function render() {
    var s = computeState();
    var n = s.unread.length;
    renderStack(s.unread);
    el.mailbox.classList.toggle("has-mail", n > 0);
    el.badge.hidden = n === 0;
    el.badgeCount.textContent = n;
    el.subtitle.textContent = subtitleText(s);
    el.hint.textContent = hintText(s);
    el.archiveCount.textContent = s.read.length;
    el.mailbox.setAttribute("aria-label", n ? "Mailbox with " + n + " new " + plural(n, "letter", "letters") + ". Open it." : "Mailbox, no new letters");
    return s;
  }

  function restart(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  /* ---------- Overlays ---------- */

  var focusStack = [];

  function updateLock() {
    var open = [el.stage, el.archive, el.reader, el.lightbox].some(function (o) { return !o.hidden; });
    document.documentElement.classList.toggle("is-locked", open);
  }

  function showOverlay(node, focusTarget) {
    focusStack.push(document.activeElement);
    node.hidden = false;
    void node.offsetWidth;
    node.classList.add("is-visible");
    updateLock();
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  function hideOverlay(node, done) {
    if (node.hidden) { if (done) done(); return; }
    node.classList.remove("is-visible");
    setTimeout(function () {
      node.hidden = true;
      updateLock();
      var back = focusStack.pop();
      if (back && document.contains(back) && back.focus) back.focus({ preventScroll: true });
      if (done) done();
    }, reduceMotion ? 10 : 380);
  }

  /* ---------- Delivery: mailbox -> envelope ---------- */

  var flow = null;
  var flyAnim = null;

  function styleEnvelope(node, pal) {
    node.style.setProperty("--c", pal.c);
    node.style.setProperty("--c2", pal.c2);
    node.style.setProperty("--c3", pal.c3);
  }

  function onMailboxTap() {
    if (flow) return;
    var s = render();
    if (!s.unread.length) {
      restart(el.mailbox, "wiggle");
      restart(el.hint, "pop");
      return;
    }
    deliver(s.unread[0]);
  }

  function deliver(item) {
    flow = { item: item, phase: "flying" };
    styleEnvelope(el.envelope, item.palette);
    el.envelope.classList.remove("is-open");
    el.stageHint.classList.remove("is-visible");
    el.mailbox.classList.remove("wiggle");
    el.mailbox.classList.add("is-opening");
    if (flyAnim) { flyAnim.cancel(); flyAnim = null; }

    setTimeout(function () {
      showOverlay(el.stage);
      var from = el.doorArea.getBoundingClientRect();
      var to = el.envFly.getBoundingClientRect();
      var dx = from.left + from.width / 2 - (to.left + to.width / 2);
      var dy = from.top + from.height / 2 - (to.top + to.height / 2);
      var sc = Math.max(0.12, (from.width * 0.75) / to.width);

      var finish = function () {
        el.mailbox.classList.remove("is-opening");
        if (!flow) return;
        flow.phase = "ready";
        el.stageHint.classList.add("is-visible");
        el.envelope.focus({ preventScroll: true });
      };

      if (!el.envFly.animate || reduceMotion) { finish(); return; }

      flyAnim = el.envFly.animate([
        { transform: "translate(" + dx + "px," + dy + "px) scale(" + sc + ") rotate(0deg)", opacity: 0 },
        { transform: "translate(" + dx + "px," + (dy - 70) + "px) scale(" + (sc * 1.5) + ") rotate(-14deg)", opacity: 1, offset: 0.3 },
        { transform: "translate(0px,0px) scale(1) rotate(-2deg)", opacity: 1 }
      ], { duration: 1150, easing: "cubic-bezier(.22,.9,.25,1)", fill: "both" });
      flyAnim.onfinish = finish;
    }, reduceMotion ? 0 : 480);
  }

  function openEnvelope() {
    if (!flow || flow.phase !== "ready") return;
    flow.phase = "opening";
    el.stageHint.classList.remove("is-visible");
    el.envelope.classList.add("is-open");
    var item = flow.item;

    setTimeout(function () {
      markOpened(item.id);
      flow = null;
      render();
      openReader(item, true);
      // the envelope disappears, so closing the reader should go back to the mailbox
      focusStack.pop();
      el.stage.classList.remove("is-visible");
      setTimeout(function () {
        el.stage.hidden = true;
        el.envelope.classList.remove("is-open");
        if (flyAnim) { flyAnim.cancel(); flyAnim = null; }
        updateLock();
      }, 400);
    }, reduceMotion ? 60 : 1350);
  }

  function cancelDelivery() {
    if (!flow || flow.phase === "opening") return;
    flow = null;
    el.mailbox.classList.remove("is-opening");
    hideOverlay(el.stage, function () {
      if (flyAnim) { flyAnim.cancel(); flyAnim = null; }
    });
  }

  /* ---------- Reader ---------- */

  var currentPhotos = [];

  function openReader(item, celebrate) {
    var l = item.letter;
    var pal = item.palette;
    el.letter.style.setProperty("--accent", pal.accent);

    el.letterNum.textContent = "Lettre " + (item.index + 1) + " de " + LETTERS.length;
    el.letterDate.textContent = fmt(item.date, { weekday: "long", month: "long", day: "numeric" });
    el.letterTitle.textContent = l.title || "";

    el.letterBody.textContent = "";
    String(l.text || "").split(/\n\s*\n/).forEach(function (para) {
      if (!para.trim()) return;
      var p = document.createElement("p");
      p.textContent = para.trim();
      el.letterBody.appendChild(p);
    });
    el.letterSign.textContent = l.signature != null ? l.signature : (CFG.signature || "");

    currentPhotos = (l.photos || []).filter(function (p) { return p && p.src; });
    renderPhotoStack();
    el.photosPage.hidden = currentPhotos.length === 0;
    el.letter.classList.toggle("has-photos", currentPhotos.length > 0);

    el.bunting.hidden = !item.isBirthday;
    if (item.isBirthday && !el.bunting.childElementCount) {
      var colors = ["#f8c3d2", "#d9cdf5", "#cdeedf", "#ffe0cc", "#fff0b8", "#cfe6fb"];
      for (var i = 0; i < 14; i++) {
        var flag = document.createElement("i");
        flag.style.setProperty("--c", colors[i % colors.length]);
        el.bunting.appendChild(flag);
      }
    }

    el.readerScroll.scrollTop = 0;
    showOverlay(el.reader, el.readerClose);
    if (celebrate) confetti(item.isBirthday ? 110 : 40);
  }

  function closeReader() {
    hideOverlay(el.reader, function () {
      var s = render();
      if (el.archive.hidden && s.unread.length) restart(el.hint, "pop");
    });
  }

  /* ---------- Archive ---------- */

  function miniEnvelope(item, read) {
    var m = document.createElement("span");
    m.className = "mini-env" + (read ? " is-read" : "");
    styleEnvelope(m, item.palette);
    return m;
  }

  function renderArchive() {
    var s = computeState();
    var items = s.arrived.concat(CFG.showUpcoming === false ? [] : s.upcoming);
    el.archiveGrid.textContent = "";
    el.archiveEmpty.hidden = s.arrived.length > 0;

    items.forEach(function (item) {
      var card;
      var shortDate = fmt(item.date, { weekday: "short", month: "short", day: "numeric" });

      if (item.status === "upcoming") {
        card = document.createElement("div");
        card.className = "archive-card is-sealed";
        card.appendChild(miniEnvelope(item, false));
        var t = document.createElement("strong");
        t.textContent = "Sealed";
        var d = document.createElement("small");
        d.textContent = "Arrives " + shortDate;
        card.appendChild(t);
        card.appendChild(d);
      } else {
        card = document.createElement("button");
        card.type = "button";
        card.className = "archive-card";
        card.appendChild(miniEnvelope(item, item.status === "read"));
        var title = document.createElement("strong");
        title.textContent = item.status === "read" ? (item.letter.title || "Letter " + (item.index + 1)) : "A new letter!";
        card.appendChild(title);
        if (item.status === "unread") {
          var tag = document.createElement("span");
          tag.className = "tag";
          tag.textContent = "In your mailbox";
          card.appendChild(tag);
        } else {
          var small = document.createElement("small");
          small.textContent = shortDate;
          card.appendChild(small);
        }
        card.addEventListener("click", function () {
          if (item.status === "read") openReader(item, false);
          else hideOverlay(el.archive, function () { deliver(item); });
        });
      }
      el.archiveGrid.appendChild(card);
    });
  }

  function openArchive() {
    renderArchive();
    showOverlay(el.archive, el.archive.querySelector(".icon-btn"));
  }

  /* ---------- Photo stack ---------- */

  // each photo gets its own tilt so the pile looks hand-placed
  var TILTS = [-4, 3, -2, 5, -6, 2, -3, 6, -1, 4];

  function renderPhotoStack() {
    var n = currentPhotos.length;
    el.photos.textContent = "";
    if (!n) return;

      var stack = document.createElement("div");
    stack.className = "photo-stack";
    var counter = document.createElement("p");
    counter.className = "stack-counter";
    var expand = document.createElement("button");
    expand.type = "button";
    expand.className = "stack-expand";
    expand.textContent = "\u2922 Enlarge";

    // order[0] is the photo on top of the pile
    var order = currentPhotos.map(function (_, i) { return i; });
    var busy = false;

        var cards = currentPhotos.map(function (photo, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "polaroid";
      b.style.setProperty("--r", TILTS[i % TILTS.length] + "deg");
      var img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || photo.caption || "A memory";
      img.decoding = "async";
      if (i > 2) img.loading = "lazy";
      var cap = document.createElement("span");
      cap.textContent = photo.caption || "";
      b.appendChild(img);
      b.appendChild(cap);
      b.addEventListener("click", function () {
        if (order[0] !== i || busy) return;
        if (n === 1) { openLightbox(i); return; }
        next();
      });
      stack.appendChild(b);
      return b;
    });

        function layout() {
      order.forEach(function (photoIndex, pos) {
        var c = cards[photoIndex];
        c.style.zIndex = n - pos;
        c.style.setProperty("--depth", Math.min(pos, 4));
        c.classList.toggle("is-top", pos === 0);
        c.tabIndex = pos === 0 ? 0 : -1;
        c.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
        c.setAttribute("aria-label", n > 1 ? "Photo " + (photoIndex + 1) + " of " + n + ". Show the next photo" : "Enlarge photo");
      });
      counter.textContent = n > 1 ? (order[0] + 1) + " / " + n + " \u00b7 tap the photo for the next one" : "";
    }

      // the top photo slides away, then tucks itself under the pile
    function next() {
      busy = true;
      var top = cards[order[0]];
      var hadFocus = document.activeElement === top;
      top.classList.add("is-leaving");
      setTimeout(function () {
        order.push(order.shift());
        top.classList.remove("is-leaving");
        layout();
        if (hadFocus) cards[order[0]].focus({ preventScroll: true });
        busy = false;
      }, reduceMotion ? 10 : 420);
    }

        expand.addEventListener("click", function () { openLightbox(order[0]); });

    // swipe the pile on phones
    var startX = null;
    stack.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stack.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40 && n > 1 && !busy) { e.preventDefault(); next(); }
    });

    layout();
    el.photos.appendChild(stack);
    el.photos.appendChild(counter);
    el.photos.appendChild(expand);
  }

  /* ---------- Lightbox ---------- */

  var lbIndex = 0;

  function showPhoto() {
    var p = currentPhotos[lbIndex];
    if (!p) return;
    el.lbImg.src = p.src;
    el.lbImg.alt = p.alt || p.caption || "A memory";
    el.lbCap.textContent = p.caption || "";
    var many = currentPhotos.length > 1;
    el.lbPrev.hidden = !many;
    el.lbNext.hidden = !many;
  }

  function openLightbox(i) {
    lbIndex = i;
    showPhoto();
    showOverlay(el.lightbox, el.lightbox.querySelector(".lb-close"));
  }

  function stepPhoto(dir) {
    if (currentPhotos.length < 2) return;
    lbIndex = (lbIndex + dir + currentPhotos.length) % currentPhotos.length;
    showPhoto();
  }

  /* ---------- Little effects ---------- */

  var CONFETTI_COLORS = ["#ee94ae", "#b39fe5", "#7fcfae", "#f5b48a", "#f0cf5a", "#86bdf0"];
  var CONFETTI_SHAPES = ["♥", "♡", "✿", "✦", "❀", "●"];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function confetti(n) {
    if (reduceMotion) return;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.textContent = CONFETTI_SHAPES[i % CONFETTI_SHAPES.length];
      s.style.left = rand(0, 100) + "%";
      s.style.setProperty("--c", CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
      s.style.setProperty("--s", rand(12, 26) + "px");
      s.style.setProperty("--x", rand(-90, 90) + "px");
      s.style.setProperty("--rot", rand(-360, 360) + "deg");
      s.style.setProperty("--d", rand(2.4, 4.4) + "s");
      s.style.animationDelay = rand(0, 0.7) + "s";
      s.addEventListener("animationend", function () { this.remove(); });
      el.confetti.appendChild(s);
    }
  }

  function makeFloaties() {
    var shapes = ["♡", "♥", "✦", "✿"];
    var colors = ["#f3a9bf", "#c3b2ee", "#a8dfc6", "#f8c8a8"];
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span");
      s.textContent = shapes[i % shapes.length];
      s.style.left = rand(2, 98) + "%";
      s.style.setProperty("--c", colors[i % colors.length]);
      s.style.setProperty("--s", rand(12, 24) + "px");
      s.style.setProperty("--x", rand(-40, 40) + "px");
      s.style.setProperty("--d", rand(16, 30) + "s");
      s.style.setProperty("--delay", rand(-30, 0) + "s");
      el.floaties.appendChild(s);
    }
  }

  /* ---------- Events ---------- */

  el.mailbox.addEventListener("click", onMailboxTap);
  el.mailbox.addEventListener("animationend", function (e) {
    if (e.animationName === "wiggle") el.mailbox.classList.remove("wiggle");
  });
  el.envelope.addEventListener("click", openEnvelope);
  el.stageBackdrop.addEventListener("click", cancelDelivery);
  el.archiveBtn.addEventListener("click", openArchive);
  el.readerClose.addEventListener("click", closeReader);
  el.lbPrev.addEventListener("click", function (e) { e.stopPropagation(); stepPhoto(-1); });
  el.lbNext.addEventListener("click", function (e) { e.stopPropagation(); stepPhoto(1); });
  el.lightbox.addEventListener("click", function (e) {
    if (e.target === el.lbPrev || e.target === el.lbNext) return;
    hideOverlay(el.lightbox);
  });

  document.querySelectorAll("[data-close='archive']").forEach(function (b) {
    b.addEventListener("click", function () { hideOverlay(el.archive); });
  });

  // swipe between photos on phones
  var touchX = null;
  el.lightbox.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  el.lightbox.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 45) { stepPhoto(dx < 0 ? 1 : -1); e.preventDefault(); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!el.lightbox.hidden) hideOverlay(el.lightbox);
      else if (!el.reader.hidden) closeReader();
      else if (!el.archive.hidden) hideOverlay(el.archive);
      else if (!el.stage.hidden) cancelDelivery();
    } else if (!el.lightbox.hidden && e.key === "ArrowRight") {
      stepPhoto(1);
    } else if (!el.lightbox.hidden && e.key === "ArrowLeft") {
      stepPhoto(-1);
    }
  });

  // a new letter can arrive while the page stays open (midnight)
  function refresh() { if (!flow && document.visibilityState !== "hidden") render(); }
  document.addEventListener("visibilitychange", refresh);
  setInterval(refresh, 60000);

  /* ---------- Start ---------- */

  el.title.textContent = NAME + "'s Mailbox";
  el.envLabel.textContent = "Pour " + NAME + " ♡";
  document.title = NAME + "'s Mailbox";
  makeFloaties();
  render();
})();
