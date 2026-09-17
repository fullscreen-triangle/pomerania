/* ==========================================================================
   tacat extension proposal — page behaviour
   Two jobs only: build the on-this-page table of contents, and remember the
   reader's theme choice. No dependencies, no network, no build step.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- theme ---------- */

  var KEY = 'tacat-ext-theme';

  function applyTheme(t) {
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  try {
    applyTheme(localStorage.getItem(KEY));
  } catch (e) {
    /* localStorage unavailable (file:// in some browsers, private mode) —
       fall back to the OS preference, which the stylesheet already handles. */
  }

  function currentTheme() {
    var explicit = document.documentElement.getAttribute('data-theme');
    if (explicit) return explicit;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function mountThemeToggle() {
    var host = document.querySelector('[data-theme-toggle]');
    if (!host) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn';
    btn.style.cssText =
      'width:100%;padding:0.35rem 0.6rem;border-radius:7px;cursor:pointer;' +
      'border:1px solid var(--border);background:var(--surface-2);' +
      'color:var(--text);font-size:0.78rem;font-weight:650;font-family:inherit;';

    function label() {
      btn.textContent = currentTheme() === 'dark' ? 'Light theme' : 'Dark theme';
    }
    label();

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      label();
    });

    host.appendChild(btn);
  }

  /* ---------- on-this-page navigation ---------- */

  function mountToc() {
    var host = document.querySelector('[data-toc]');
    if (!host) return;

    var heads = document.querySelectorAll('.page h2[id]');
    if (!heads.length) {
      var lbl = document.querySelector('.toc-label');
      if (lbl) lbl.style.display = 'none';
      return;
    }

    var links = [];
    Array.prototype.forEach.call(heads, function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      /* Section headings read "3. Title"; the number is already carried by the
         heading text, so it needs no extra decoration here. */
      a.textContent = h.textContent.trim();
      host.appendChild(a);
      links.push({ a: a, h: h });
    });

    /* Highlight whichever section the reader is currently inside. rAF-throttled
       because scroll fires far more often than the DOM needs updating. */
    var ticking = false;

    function sync() {
      ticking = false;
      var best = 0;
      for (var i = 0; i < links.length; i++) {
        /* 96px allows for the heading's own scroll-margin plus a little slack,
           so a heading counts as "reached" just before it hits the top. */
        if (links[i].h.getBoundingClientRect().top <= 96) best = i;
      }
      for (var j = 0; j < links.length; j++) {
        links[j].a.classList.toggle('active', j === best);
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(sync);
      }
    }, { passive: true });

    sync();
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    mountThemeToggle();
    mountToc();
  });
})();
