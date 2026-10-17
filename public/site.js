/* DealerBuddy: menu, dropdowns, scroll-driven steps, toggle, product finder, claims slider,
   ribbons that draw in, reveals and forms. Native scrolling throughout (no scroll library). */
(function () {
  'use strict';
  window.DB_OK = true;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- mobile menu ---------- */
  var mbtn = $('#menu-btn'), mnav = $('#mnav');
  if (mbtn && mnav) {
    var setMenu = function (open) {
      mnav.classList.toggle('open', open); root.classList.toggle('menu-open', open);
      mbtn.setAttribute('aria-expanded', String(open));
      mbtn.innerHTML = open ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg><span class="sr">Close menu</span>'
                            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><span class="sr">Open menu</span>';
      mnav.inert = !open;
    };
    mnav.inert = true;
    mbtn.addEventListener('click', function () { setMenu(!mnav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); mbtn.focus(); } });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- dropdowns: hover on desktop, click and keyboard everywhere ---------- */
  $$('.dd').forEach(function (dd) {
    var b = $('button', dd);
    b.addEventListener('click', function () {
      var open = !dd.classList.contains('open');
      $$('.dd.open').forEach(function (x) { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); });
      dd.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) $$('.dd.open').forEach(function (x) { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.dd.open').forEach(function (x) { x.classList.remove('open'); var b = $('button', x); b.setAttribute('aria-expanded', 'false'); b.focus(); }); });

  /* ---------- reveals and ribbons that draw in (transform/opacity only) ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.filter(function (e) { return e.isIntersecting; }).forEach(function (e, k) {
        if (e.target.hasAttribute('data-r')) e.target.style.transitionDelay = Math.min(k * 0.08, 0.32) + 's';
        e.target.classList.add('in'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('[data-r], .draw').forEach(function (el) { io.observe(el); });
  } else {
    $$('[data-r], .draw').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- "How do we move your dealership forward?": one step per viewport of scroll ---------- */
  var how = $('#how');
  if (how) {
    var tabs = $$('.how-tabs li', how), arts = $$('.how-copy .panel', how), figs = $$('.how-media figure', how), trigs = $$('.trig', how);
    var show = function (i) {
      [tabs, arts, figs].forEach(function (list) { list.forEach(function (el, k) { el.classList.toggle('on', k === i); }); });
      tabs.forEach(function (t, k) { $('button', t).setAttribute('aria-selected', String(k === i)); });
      arts.forEach(function (a, k) { a.setAttribute('aria-hidden', String(k !== i)); });
    };
    tabs.forEach(function (t, i) {
      $('button', t).addEventListener('click', function () {
        // on wide screens a tab scrolls to its part of the track; on phones it switches in place
        if (getComputedStyle(trigs[0]).display !== 'none') trigs[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        show(i);
      });
    });
    if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) show(trigs.indexOf(e.target)); });
      }, { rootMargin: '-50% 0px -50% 0px' });
      trigs.forEach(function (t) { tio.observe(t); });
    }
    show(0);
  }

  /* ---------- Dealerships / Fleets toggle ---------- */
  $$('[data-seg]').forEach(function (seg) {
    var btns = $$('button', seg);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        $$('[data-pane]').forEach(function (p) {
          var on = p.getAttribute('data-pane') === b.getAttribute('data-for');
          p.hidden = !on;
          if (on) $$('[data-r]', p).forEach(function (el) { el.classList.add('in'); });
        });
      });
    });
  });

  /* ---------- product finder ---------- */
  var fd = $('#finder');
  if (fd && window.DB_PRODUCTS) {
    var P = window.DB_PRODUCTS, list = $('#fd-list'), count = $('#fd-count');
    var update = function () {
      var who = (fd.querySelector('input[name="who"]:checked') || {}).value;
      var worries = $$('input[name="worry"]:checked', fd).map(function (i) { return i.value; });
      var picks = [];
      if (who === 'fleet') picks.push('fleet');
      worries.forEach(function (w) { if (picks.indexOf(w) < 0) picks.push(w); });
      if (!picks.length) picks = who === 'fleet' ? ['fleet'] : ['mechanical-warranty'];
      list.innerHTML = '';
      picks.forEach(function (slug) {
        var p = P[slug]; if (!p) return;
        var li = document.createElement('li');
        li.innerHTML = '<a href="' + p.href + '"><img src="' + p.icon + '" alt="" width="44" height="44"><span><b></b><small></small></span>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
        $('b', li).textContent = p.name; $('small', li).textContent = p.card;
        list.appendChild(li);
      });
      count.firstChild.nodeValue = String(picks.length);
      $('small', count).textContent = picks.length === 1 ? 'product fits' : 'products fit';
    };
    fd.addEventListener('change', update);
    update();
  }

  /* ---------- claims slider ---------- */
  $$('[data-slider]').forEach(function (box) {
    var slides = $$('.slide', box), bars = $$('.sl-bar i', box), n = $('.sl-head .n', box), i = 0;
    var go = function (k) {
      i = (k + slides.length) % slides.length;
      slides.forEach(function (s, j) { s.classList.toggle('on', j === i); s.setAttribute('aria-hidden', String(j !== i)); s.inert = j !== i; });
      bars.forEach(function (b, j) { b.classList.toggle('on', j <= i); });
      n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    };
    $('[data-prev]', box).addEventListener('click', function () { go(i - 1); });
    $('[data-next]', box).addEventListener('click', function () { go(i + 1); });
    box.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
    go(0);
  });

  /* ---------- forms: check, then let Netlify Forms receive them ---------- */
  $$('form[data-check]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var bad = null;
      $$('[required]', form).forEach(function (f) {
        var box = f.parentNode.querySelector('.err');
        var ok = f.value.trim() && (f.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim()));
        if (!ok) {
          if (!box) { box = document.createElement('p'); box.className = 'err'; box.id = f.id + '-err'; f.parentNode.appendChild(box); }
          box.textContent = f.type === 'email' && f.value.trim() ? 'Enter a valid email address.' : 'This field is required.';
          f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', box.id);
          bad = bad || f;
        } else if (box) { box.remove(); f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); }
      });
      if (bad) { e.preventDefault(); bad.focus(); return; }
      // on Netlify, post in the background and thank the visitor in place
      if (location.protocol.indexOf('http') === 0 && window.fetch) {
        e.preventDefault();
        var btn = $('button[type=submit]', form); btn.disabled = true;
        fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
          .then(function (r) { if (!r.ok) throw new Error(r.status); form.innerHTML = '<div class="sent" role="status"><h2>Thank you.</h2><p>We\'ve received your message and will be in touch within one working day.</p></div>'; })
          .catch(function () { btn.disabled = false; form.submit(); });
      }
    });
  });

  /* ---------- year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
