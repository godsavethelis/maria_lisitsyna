/* ============================================================
   Maria Lisitsina — portfolio interactions
   ============================================================ */
(function () {
  'use strict';
  var M = window.MEDIA;

  /* External links — fill these in when available */
  var LINKS = {
    marina: 'https://malikova-gardens.com/',   // Marina Malikova
    school: 'https://detali.net/',             // Moscow School Details
    dom:    ''                                 // Dom na Brestskoy — no link yet
  };

  function mediaSrc(slug, n, ext) { return 'assets/media/' + slug + '/' + n + '.' + (ext || 'jpg'); }

  function inView(el) { var r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; }

  // play videos only while their frame is on screen
  var videoObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target.querySelector('video');
      if (!v) return;
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
  }, { threshold: 0.25 });

  function normItem(slug, it) {
    return {
      type: it.type || 'image',
      img: mediaSrc(slug, it.n, 'jpg'),
      mp4: it.type === 'video' ? mediaSrc(slug, it.n, 'mp4') : null,
      cap: it.cap || ''
    };
  }

  function stageHTML(it) {
    if (it.type === 'video') {
      return '<video class="ss__media" src="' + it.mp4 + '" poster="' + it.img +
        '" muted loop playsinline preload="none"></video>';
    }
    return '<img class="ss__media" src="' + it.img + '" alt="" loading="lazy">';
  }

  /* ---------- generic slideshow ---------- */
  function Slideshow(root, opts) {
    opts = opts || {};
    var items = opts.items || [];
    var i = opts.start || 0;
    var timer = null;

    root.innerHTML =
      '<div class="ss__frame">' +
        '<div class="ss__stage"></div>' +
        '<button class="ss__nav ss__prev" aria-label="Previous">‹</button>' +
        '<button class="ss__nav ss__next" aria-label="Next">›</button>' +
      '</div>' +
      '<div class="ss__counter"></div>' +
      '<p class="ss__cap"></p>';

    var stage = root.querySelector('.ss__stage');
    var cap = root.querySelector('.ss__cap');
    var counter = root.querySelector('.ss__counter');
    var frame = root.querySelector('.ss__frame');
    videoObserver.observe(frame);

    function render() {
      var it = items[i];
      if (!it) return;
      stage.innerHTML = stageHTML(it);
      var v = stage.querySelector('video');
      if (v && inView(frame)) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      cap.textContent = it.cap || '';
      cap.classList.toggle('is-empty', !it.cap);
      counter.textContent = (i + 1) + ' ⁄ ' + items.length;
      counter.style.display = items.length > 1 ? '' : 'none';
    }
    function go(n) { i = (n + items.length) % items.length; render(); }

    root.querySelector('.ss__prev').addEventListener('click', function () { go(i - 1); stopAuto(); });
    root.querySelector('.ss__next').addEventListener('click', function () { go(i + 1); stopAuto(); });

    function startAuto() { if (opts.auto && items.length > 1) { stopAuto(); timer = setInterval(function () { go(i + 1); }, opts.interval || 4800); } }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    if (opts.auto) {
      root.addEventListener('mouseenter', stopAuto);
      root.addEventListener('mouseleave', startAuto);
    }

    root.classList.toggle('ss--bare', !!opts.bare);
    if (items.length <= 1) root.classList.add('ss--single');

    render(); startAuto();

    return {
      go: go,
      get index() { return i; },
      setItems: function (newItems, start) {
        items = newItems; i = start || 0;
        root.classList.toggle('ss--single', items.length <= 1);
        render(); startAuto();
      }
    };
  }

  /* ---------- before / after ---------- */
  function initBeforeAfter() {
    var el = document.getElementById('beforeAfter');
    if (!el || !M) return;
    var items = M.beforeAfter.map(function (it) { return normItem('before-after', it); });
    var start = M.beforeAfter.findIndex(function (it) { return it.n === 4; });
    el.classList.add('ss');
    Slideshow(el, { items: items, auto: true, interval: 5200, start: start < 0 ? 0 : start });
  }

  /* ---------- zones of interest ---------- */
  function initZones() {
    var wrap = document.getElementById('zones');
    if (!wrap || !M) return;

    var grid = document.createElement('div');
    grid.className = 'zones__grid';
    var panel = document.createElement('div');
    panel.className = 'zones__panel';
    var ss = document.createElement('div');
    ss.className = 'ss zones__ss';
    panel.appendChild(ss);

    var show;
    M.zones.forEach(function (z, idx) {
      var card = document.createElement('button');
      card.className = 'zone-card';
      card.innerHTML =
        '<span class="zone-card__img"><img src="assets/media/zones-preview/' + z.id +
        '.jpg" alt="" loading="lazy"></span>' +
        '<span class="zone-card__label">' + z.label + '</span>';
      card.addEventListener('click', function () { open(idx); });
      grid.appendChild(card);
    });

    wrap.appendChild(grid);

    // progress slider
    var slider = document.createElement('div');
    slider.className = 'zones__slider';
    var thumb = document.createElement('div');
    thumb.className = 'zones__thumb';
    slider.appendChild(thumb);
    wrap.appendChild(slider);

    wrap.appendChild(panel);

    function updateThumb() {
      var sw = grid.scrollWidth, cw = grid.clientWidth;
      if (sw <= cw) { thumb.style.width = '100%'; thumb.style.left = '0'; return; }
      var ratio = cw / sw;
      var tw = slider.clientWidth * ratio;
      var maxLeft = slider.clientWidth - tw;
      var left = (grid.scrollLeft / (sw - cw)) * maxLeft;
      thumb.style.width = tw + 'px';
      thumb.style.left = left + 'px';
    }
    grid.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);

    function sliderSeek(clientX) {
      var rect = slider.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      grid.scrollLeft = p * (grid.scrollWidth - grid.clientWidth);
    }
    var dragging = false;
    slider.addEventListener('pointerdown', function (e) { dragging = true; slider.setPointerCapture(e.pointerId); sliderSeek(e.clientX); });
    slider.addEventListener('pointermove', function (e) { if (dragging) sliderSeek(e.clientX); });
    slider.addEventListener('pointerup', function () { dragging = false; });

    var cards = grid.querySelectorAll('.zone-card');
    function open(idx) {
      var z = M.zones[idx];
      var items = z.items.map(function (it) { return normItem(z.id, it); });
      cards.forEach(function (c, k) { c.classList.toggle('is-active', k === idx); });
      panel.classList.add('is-open');
      if (!show) show = Slideshow(ss, { items: items });
      else show.setItems(items, 0);
    }
    open(0); // forest open by default
    setTimeout(updateThumb, 100);
  }

  /* ---------- estate header slideshow ---------- */
  function initEstateHeader() {
    var el = document.getElementById('estateHero');
    if (!el || !M) return;
    var items = M.estateHeader.map(function (n) { return normItem('estate-header', { n: n, type: 'image' }); });
    el.classList.add('ss');
    Slideshow(el, { items: items, auto: true, interval: 3000, bare: true });
  }

  /* ---------- estate explore → lightbox ---------- */
  function initEstateExplore() {
    if (!M) return;
    var items = M.estateWatch.map(function (n) { return normItem('estate-watch', { n: n, type: 'image' }); });
    var startIdx = Math.max(0, M.estateWatch.indexOf(M.estateWatchCover));
    function open() { openLightbox(items, startIdx); }
    var b1 = document.getElementById('estateExplore');
    var b2 = document.getElementById('estatePreview');
    if (b1) b1.addEventListener('click', open);
    if (b2) b2.addEventListener('click', open);
  }

  /* ---------- malikova project toggle ---------- */
  function initMalikova() {
    var viewer = document.getElementById('malikovaViewer');
    var tabs = document.getElementById('malikovaTabs');
    if (!viewer || !M) return;
    viewer.classList.add('ss');

    function itemsFor(p) {
      return M.malikova['p' + p].map(function (n) { return normItem('malikova', { n: n, type: 'image' }); });
    }
    var startP = M.malikova.startProject || 1;
    var startItems = itemsFor(startP);
    var startIdx = Math.max(0, M.malikova['p' + startP].indexOf(M.malikova.startN));
    var show = Slideshow(viewer, { items: startItems, start: startIdx });

    var btns = tabs.querySelectorAll('button');
    function activate(p) {
      btns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-project') === String(p)); });
      show.setItems(itemsFor(p), 0);
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { activate(b.getAttribute('data-project')); });
    });
    activate(startP);
    show.setItems(startItems, startIdx); // keep requested start image
    btns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-project') === String(startP)); });
  }

  /* ---------- shared lightbox (slideshow) ---------- */
  var lb = document.getElementById('lightbox');
  var lbStage = document.getElementById('lbStage');
  var lbCap = document.getElementById('lbCaption');
  var lbItems = [], lbIdx = 0;

  function lbRender() {
    var it = lbItems[lbIdx];
    if (!it) return;
    lbStage.innerHTML = stageHTML(it).replace('ss__media', 'lightbox__media');
    var v = lbStage.querySelector('video');
    if (v) { v.setAttribute('controls', ''); v.removeAttribute('loop'); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    if (lbCap) { lbCap.textContent = it.cap || ''; lbCap.classList.toggle('is-empty', !it.cap); }
  }
  function openLightbox(items, start) {
    lbItems = items; lbIdx = start || 0;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbRender();
  }
  function lbClose() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; lbStage.innerHTML = '';
  }
  function lbStep(d) { lbIdx = (lbIdx + d + lbItems.length) % lbItems.length; lbRender(); }

  if (lb) {
    document.getElementById('lbClose').addEventListener('click', lbClose);
    document.getElementById('lbNext').addEventListener('click', function () { lbStep(1); });
    document.getElementById('lbPrev').addEventListener('click', function () { lbStep(-1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowRight') lbStep(1);
      if (e.key === 'ArrowLeft') lbStep(-1);
    });
  }

  /* ---------- external links ---------- */
  function initLinks() {
    document.querySelectorAll('[data-link]').forEach(function (a) {
      var key = a.getAttribute('data-link');
      var url = LINKS[key];
      if (url) { a.setAttribute('href', url); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); a.classList.add('link--active'); }
      else { a.removeAttribute('href'); a.classList.add('link--pending'); }
    });
  }

  /* ---------- nav + hero + reveal (base) ---------- */
  function initBase() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // assemble email at runtime (keeps it out of the raw HTML, defeats spam scrapers)
    var em = document.querySelector('.contact__email');
    if (em) {
      var addr = em.getAttribute('data-u') + '@' + em.getAttribute('data-d');
      em.setAttribute('href', 'mailto:' + addr);
      em.textContent = addr;
      em.style.cursor = 'pointer';
    }

    var nav = document.getElementById('nav');
    function navOnScroll() {
      var heroH = (document.querySelector('.hero') || {}).offsetHeight || window.innerHeight;
      nav.classList.toggle('scrolled', window.scrollY > heroH - 90);
    }
    window.addEventListener('scroll', navOnScroll, { passive: true });
    navOnScroll();

    var toggle = document.getElementById('menuToggle');
    var links = document.querySelector('.nav__links');
    if (toggle) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
        nav.classList.toggle('menu-open', links.classList.contains('open'));
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); nav.classList.remove('menu-open'); });
      });
    }

    // hero slideshow
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero__slide'));
    var dotsWrap = document.getElementById('heroDots');
    var idx = 0, timer;
    if (dotsWrap) {
      slides.forEach(function (_, k) {
        var b = document.createElement('button');
        if (k === 0) b.classList.add('on');
        b.addEventListener('click', function () { go(k); reset(); });
        dotsWrap.appendChild(b);
      });
    }
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
    function go(n) {
      slides[idx].classList.remove('is-active'); if (dots[idx]) dots[idx].classList.remove('on');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('is-active'); if (dots[idx]) dots[idx].classList.add('on');
    }
    function reset() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 5500); }
    if (slides.length > 1) reset();

    // reveal
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    function revealVisible() {
      revealEls.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in'); });
    }
    window.addEventListener('load', revealVisible); revealVisible();
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  }

  /* ---------- boot ---------- */
  initBase();
  initLinks();
  initBeforeAfter();
  initZones();
  initEstateHeader();
  initEstateExplore();
  initMalikova();
})();
