/* =========================================================
   PivaiTech — Main JavaScript (compatible / consolidated)
   - Avoids optional chaining (?.) and nullish coalescing (??)
   - Prevents blank page if browser is older
   ========================================================= */

(function () {
  'use strict';

  /* -----------------------------
     Utilities
  ----------------------------- */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts || false); }
  function hasIO() { return 'IntersectionObserver' in window; }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /* -----------------------------
     0) Page-ready hook (CSS entry transitions)
     CRITICAL for your CSS: body starts opacity:0 until page-loaded :contentReference[oaicite:1]{index=1}
  ----------------------------- */
  on(document, 'DOMContentLoaded', function () {
    document.body.classList.add('page-loaded');
  });

  /* -----------------------------
     1) Header + Dropdowns (mega menus & language)
  ----------------------------- */
  (function () {
    var headerGrid = document.getElementById('headerGrid');
    if (!headerGrid) return;

    var megas = qsa('.menu-item.mega');
    var langWrap = qs('.lang');
    var langToggle = qs('.lang-toggle');
    var langMenu = qs('.lang-menu');

    function updateAnchors() {
      var gridBox = headerGrid.getBoundingClientRect();
      var cap = 1040;
      var width = Math.min(cap, Math.round(gridBox.width));
      var left = Math.round(gridBox.left);
      var top = Math.round(gridBox.bottom + 14);

      document.documentElement.style.setProperty('--panel-left', left + 'px');
      document.documentElement.style.setProperty('--panel-top', top + 'px');
      document.documentElement.style.setProperty('--panel-width', width + 'px');
    }

    function closeAll(exceptEl) {
      for (var i = 0; i < megas.length; i++) {
        var mi = megas[i];
        if (mi === exceptEl) continue;
        mi.classList.remove('open');
        var t = qs('.dropdown-toggle', mi);
        if (t) t.setAttribute('aria-expanded', 'false');
      }

      if (langWrap && exceptEl !== langWrap) {
        langWrap.classList.remove('open');
        if (langToggle) langToggle.setAttribute('aria-expanded', 'false');
      }
    }

    function clampMegaIntoViewport(panel) {
      var gridBox = headerGrid.getBoundingClientRect();
      var panelWidth = Math.min(1040, gridBox.width);

      var left = gridBox.left;
      var pad = 12;
      if (left + panelWidth > window.innerWidth - pad) left = window.innerWidth - pad - panelWidth;
      if (left < pad) left = pad;

      panel.style.setProperty('--panel-left', Math.round(left) + 'px');
      panel.style.setProperty('--panel-top', Math.round(gridBox.bottom + 14) + 'px');
      panel.style.setProperty('--panel-width', Math.round(panelWidth) + 'px');
    }

    updateAnchors();
    on(window, 'resize', updateAnchors, { passive: true });
    on(window, 'scroll', updateAnchors, { passive: true });

    // Mega menus
    megas.forEach(function (mi) {
      var btn = qs('.dropdown-toggle', mi);
      var panel = qs('.mega-panel', mi);
      if (!btn || !panel) return;

      on(btn, 'click', function (e) {
        e.preventDefault();
        var willOpen = !mi.classList.contains('open');
        closeAll(mi);
        mi.classList.toggle('open', willOpen);
        btn.setAttribute('aria-expanded', String(willOpen));
        if (willOpen) clampMegaIntoViewport(panel);
      });

      on(btn, 'keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!mi.classList.contains('open')) btn.click();
        }
      });

      on(mi, 'keydown', function (e) {
        if (e.key === 'Escape') {
          mi.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    });

    // Click outside closes
    on(document, 'click', function (e) {
      var insideMega = e.target.closest && e.target.closest('.menu-item.mega');
      var insideLang = e.target.closest && e.target.closest('.lang');
      if (!insideMega && !insideLang) closeAll(null);
    });

    // Language positioning
    function positionLang() {
      if (!langToggle || !langMenu) return;
      var box = langToggle.getBoundingClientRect();
      var width = langMenu.offsetWidth || 68;
      var left = Math.round(box.left + (box.width - width) / 2);
      var top = Math.round(box.bottom + 10);
      langMenu.style.setProperty('--lang-left', left + 'px');
      langMenu.style.setProperty('--lang-top', top + 'px');
    }

    on(langToggle, 'click', function (e) {
      e.preventDefault();
      if (!langWrap) return;
      var willOpen = !langWrap.classList.contains('open');
      closeAll(langWrap);
      langWrap.classList.toggle('open', willOpen);
      langToggle.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) positionLang();
    });

    on(window, 'resize', function () {
      if (langWrap && langWrap.classList.contains('open')) positionLang();
    }, { passive: true });

    if (langMenu) {
      qsa('button[data-lang]', langMenu).forEach(function (b) {
        on(b, 'click', function () {
          var code = b.getAttribute('data-lang') || 'EN';
          var codeEl = langWrap ? qs('.code', langWrap) : null;
          if (codeEl) codeEl.textContent = code;

          if (langWrap) langWrap.classList.remove('open');
          if (langToggle) langToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Live preview in mega panels
    qsa('.mega3').forEach(function (panel) {
      var img = qs('.preview img', panel);
      var title = qs('.preview h4', panel);
      var desc = qs('.preview p', panel);
      if (!img || !title || !desc) return;

      qsa('.mega-link', panel).forEach(function (link) {
        on(link, 'mouseenter', function () {
          qsa('.mega-link', panel).forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');

          var newImg = link.getAttribute('data-preview-img');
          var newTitle = link.getAttribute('data-preview-title') || link.textContent.trim();
          var newDesc = link.getAttribute('data-preview-desc') || '';

          if (newImg) img.src = newImg;
          title.textContent = newTitle;
          desc.textContent = newDesc;
        });
      });
    });
  })();

  /* -----------------------------
     2) Reveal-on-scroll (single observer)
  ----------------------------- */
  (function () {
    var els = qsa('[data-reveal]');
    if (!els.length) return;

    if (!hasIO() || reducedMotion()) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        entry.target.classList.remove('reveal-hidden');
        entry.target.classList.add('reveal-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    els.forEach(function (el) { io.observe(el); });
  })();

  /* -----------------------------
     3) Smooth scroll for [data-scrollto] and .c-jump-btn
  ----------------------------- */
  (function () {
    var header = qs('.site-header');

    function headerOffset() {
      if (!header) return 0;
      var pos = getComputedStyle(header).position;
      return (pos === 'fixed' || pos === 'sticky') ? header.offsetHeight : 0;
    }

    function focusAfterScroll(target) {
      var restore = !target.hasAttribute('tabindex');
      target.setAttribute('tabindex', '-1');
      setTimeout(function () {
        target.focus({ preventScroll: true });
        if (restore) target.removeAttribute('tabindex');
      }, 450);
    }

    on(document, 'click', function (e) {
      if (!e.target.closest) return;
      var trigger = e.target.closest('[data-scrollto], .c-jump-btn[href^="#"]');
      if (!trigger) return;

      var sel = trigger.hasAttribute('data-scrollto')
        ? trigger.getAttribute('data-scrollto')
        : trigger.getAttribute('href');

      var target = sel ? qs(sel) : null;
      if (!target) return;

      e.preventDefault();

      var attr = trigger.getAttribute('data-offset');
      var offset = (attr !== null && attr !== '') ? Number(attr) : headerOffset();

      var y = target.getBoundingClientRect().top + window.scrollY - offset - 5;
      window.scrollTo({ top: y, behavior: 'smooth' });

      if (target.classList.contains('contact-form')) target.classList.add('visible');
      focusAfterScroll(target);
    });
  })();

  /* -----------------------------
     4) Footer fade-in (optional)
  ----------------------------- */
  (function () {
    var footer = qs('.footer');
    if (!footer || !hasIO()) return;

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        footer.classList.add('in-view');
        obs.unobserve(footer);
      });
    }, { threshold: 0.2 });

    io.observe(footer);
  })();

  /* -----------------------------
     5) Metrics count-up (.stat-value)
  ----------------------------- */
  (function () {
    var items = qsa('.stat-value');
    if (!items.length) return;

    var reduce = reducedMotion();

    function countUp(el) {
      if (el.getAttribute('data-done')) return;
      el.setAttribute('data-done', '1');

      var target = parseFloat(el.getAttribute('data-target') || '0');
      var suffix = el.getAttribute('data-suffix') || '';
      var raw = el.getAttribute('data-target') || '';
      var decimals = raw.indexOf('.') >= 0 ? 1 : 0;

      if (reduce) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }

      var duration = 1400;
      var start = performance.now();

      function ease(t) { return 1 - Math.pow(1 - t, 3); }

      function tick(now) {
        var p = Math.min(1, (now - start) / duration);
        el.textContent = (target * ease(p)).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    var triggers = qsa('#metrics, .stat');
    if (!triggers.length || !hasIO()) {
      items.forEach(countUp);
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        items.forEach(countUp);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    triggers.forEach(function (t) { io.observe(t); });
  })();

  /* -----------------------------
     6) Scroll-snap gallery with dots (#sgRail / #sgDots)
  ----------------------------- */
  (function () {
    var rail = document.getElementById('sgRail');
    var dotsWrap = document.getElementById('sgDots');
    if (!rail || !dotsWrap) return;

    var GAP = 16;
    var figures = Array.prototype.slice.call(rail.children);

    function perView() { return (window.innerWidth <= 600) ? 1 : (window.innerWidth <= 900) ? 2 : 3; }
    function itemWidth() { return figures[0] ? (figures[0].getBoundingClientRect().width + GAP) : 0; }
    function pages() { return Math.max(1, Math.ceil(figures.length / perView())); }

    function setActive(i) {
      qsa('button', dotsWrap).forEach(function (b, idx) {
        b.setAttribute('aria-selected', idx === i ? 'true' : 'false');
      });
    }

    function goTo(i) {
      var max = pages() - 1;
      var idx = Math.max(0, Math.min(i, max));
      rail.scrollTo({ left: idx * itemWidth() * perView(), behavior: 'smooth' });
      setActive(idx);
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < pages(); i++) {
        (function (idx) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', 'Go to set ' + (idx + 1));
          on(b, 'click', function () { goTo(idx); });
          dotsWrap.appendChild(b);
        })(i);
      }
    }

    function indexFromScroll() {
      var iw = itemWidth();
      if (!iw) return 0;
      return Math.round(rail.scrollLeft / (iw * perView()));
    }

    buildDots();
    setActive(0);

    on(rail, 'scroll', function () {
      clearTimeout(rail._t);
      rail._t = setTimeout(function () { setActive(indexFromScroll()); }, 60);
    });

    on(window, 'resize', function () {
      buildDots();
      setActive(indexFromScroll());
    }, { passive: true });
  })();

  /* -----------------------------
     7) Contact page regions + 8) contact form + 9) team slider + 10) team bio
     (These only run if matching DOM exists, so safe on homepage)
  ----------------------------- */

  // Regions
  (function () {
    var regions = qsa('.regions-grid .region');
    if (!regions.length) return;

    var reduce = reducedMotion();

    regions.forEach(function (d) {
      on(d, 'toggle', function () {
        if (!d.open) return;
        regions.forEach(function (other) {
          if (other !== d) other.removeAttribute('open');
        });
      });
    });

    regions.forEach(function (d) {
      var panel = qs('.region-body', d);
      if (!panel) return;

      if (d.open) {
        panel.style.maxHeight = 'none';
        panel.style.opacity = '1';
      }

      on(d, 'toggle', function () {
        if (reduce) {
          panel.style.maxHeight = d.open ? 'none' : '0px';
          panel.style.opacity = d.open ? '1' : '0';
          panel.style.paddingTop = d.open ? '14px' : '0px';
          panel.style.paddingBottom = d.open ? '18px' : '0px';
          return;
        }

        if (d.open) {
          panel.style.maxHeight = panel.scrollHeight + 'px';
          panel.style.opacity = '1';
          panel.style.paddingTop = '14px';
          panel.style.paddingBottom = '18px';
        } else {
          panel.style.maxHeight = panel.scrollHeight + 'px';
          panel.getBoundingClientRect();
          panel.style.maxHeight = '0px';
          panel.style.opacity = '0';
          panel.style.paddingTop = '0px';
          panel.style.paddingBottom = '0px';
        }
      });

      on(panel, 'transitionend', function (ev) {
        if (ev.propertyName !== 'max-height') return;
        if (d.open) panel.style.maxHeight = 'none';
      });
    });
  })();

  // Contact form
  (function () {
    var form = qs('.cf-form');
    if (form) {
      var feedback = qs('.cf-feedback', form);

      on(form, 'submit', function (e) {
        e.preventDefault();
        var hp = qs('.cf-hp', form);
        if (hp && hp.value) return;

        var name = qs('#cf-name', form);
        var email = qs('#cf-email', form);
        var msg = qs('#cf-message', form);

        var ok = name && name.value.trim() && email && email.checkValidity && email.checkValidity() && msg && msg.value.trim();

        if (!ok) {
          if (feedback) {
            feedback.hidden = false;
            feedback.style.color = '#c62828';
            feedback.textContent = 'Please complete all required fields with a valid email.';
          }
          return;
        }

        if (feedback) {
          feedback.hidden = false;
          feedback.style.color = '#1b5e20';
          feedback.textContent = 'Thanks — your message has been sent.';
        }
        form.reset();
      });
    }

    var contactSection = qs('.contact-form');
    if (!contactSection || !hasIO()) return;

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        contactSection.classList.add('visible');
        obs.unobserve(contactSection);
      });
    }, { threshold: 0.2 });

    io.observe(contactSection);
  })();

  // Team slider
  (function () {
    var track = document.getElementById('teamTrack');
    if (!track) return;

    var btnPrev = qs('.team-arrow.is-left');
    var btnNext = qs('.team-arrow.is-right');

    function step() { return Math.max(238, Math.round(track.clientWidth * 0.9)); }
    function go(dir) { track.scrollBy({ left: dir * step(), behavior: 'smooth' }); }

    on(btnPrev, 'click', function () { go(-1); });
    on(btnNext, 'click', function () { go(1); });
  })();

  // Team bio panel
  (function () {
    var grid = qs('.team-grid');
    var panel = qs('#teamBio');
    if (!grid || !panel) return;

    var nameEl = qs('.team-bio__name', panel);
    var roleEl = qs('.team-bio__role', panel);
    var textEl = qs('.team-bio__text', panel);
    var lnEl = qs('.team-bio__ln', panel);
    var closeBtn = qs('.team-bio__close', panel);

    var openFor = null;

    function openPanelFor(btn) {
      if (nameEl) nameEl.textContent = btn.getAttribute('data-name') || '';
      if (roleEl) roleEl.textContent = btn.getAttribute('data-role') || '';
      if (textEl) textEl.textContent = btn.getAttribute('data-bio') || '';
      if (lnEl) lnEl.href = btn.getAttribute('data-linkedin') || '#';

      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      openFor = btn;

      qsa('.member', grid).forEach(function (m) {
        m.classList.toggle('is-active', m === btn);
      });
    }

    function closePanel() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      qsa('.member', grid).forEach(function (m) { m.classList.remove('is-active'); });
      openFor = null;
    }

    on(grid, 'click', function (e) {
      if (!e.target.closest) return;
      var btn = e.target.closest('.member');
      if (!btn) return;
      if (openFor === btn) closePanel(); else openPanelFor(btn);
    });

    on(closeBtn, 'click', function (e) {
      e.preventDefault();
      closePanel();
    });

    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
    });
  })();

})();

// Scroll fade-in for sections (and stagger groups)
(() => {
  if (!('IntersectionObserver' in window)) return;

  const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (!revealTargets.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });

  revealTargets.forEach(el => observer.observe(el));
})();