/* Un gol entre todos · interacciones
   Sin dependencias. Todo el contenido es visible sin JavaScript. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Barra de progreso y sección activa ---------- */
  var bar = $('#progress');
  var navLinks = $$('[data-nav]');
  var navList = $('.bar__nav');
  var sections = navLinks.map(function (a) { return document.getElementById(a.dataset.nav); });
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';

      var line = window.innerHeight * 0.35;
      var current = null;
      sections.forEach(function (s) {
        if (s && s.getBoundingClientRect().top <= line) current = s.id;
      });
      setCurrent(current);
      ticking = false;
    });
  }

  var lastCurrent;
  function setCurrent(id) {
    if (id === lastCurrent) return;
    lastCurrent = id;
    navLinks.forEach(function (a) {
      if (a.dataset.nav === id) {
        a.setAttribute('aria-current', 'true');
        // Mantener visible el enlace activo en la barra desplazable del móvil
        if (navList && navList.scrollWidth > navList.clientWidth) {
          var li = a.parentElement;
          var target = li.offsetLeft - (navList.clientWidth - li.offsetWidth) / 2;
          navList.scrollTo({ left: Math.max(0, target), behavior: reduce.matches ? 'auto' : 'smooth' });
        }
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Revelado al entrar en pantalla (una sola vez) ---------- */
  var revealables = $$('[data-reveal]');
  var drawables = $$('.layers, .gantt');
  if ('IntersectionObserver' in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          // pequeño margen para que el revelado del bloque termine antes de dibujar
          setTimeout(function () { e.target.classList.add('is-drawn'); }, 180);
          io2.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    drawables.forEach(function (el) { io2.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
    drawables.forEach(function (el) { el.classList.add('is-drawn'); });
  }

  /* ---------- Pestañas accesibles (línea de tiempo y modelos) ---------- */
  function initTabs(list) {
    var tabs = $$('[role="tab"]', list);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = panels[j];
        if (!p) return;
        if (on) {
          var wasHidden = p.hidden;
          p.hidden = false;
          if (wasHidden) {
            p.classList.remove('is-entering');
            void p.offsetWidth; // reinicia la animación
            p.classList.add('is-entering');
          }
        } else {
          p.hidden = true;
        }
      });
      if (focus) tabs[i].focus();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length, to = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') to = (i + 1) % n;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (i - 1 + n) % n;
        else if (k === 'Home') to = 0;
        else if (k === 'End') to = n - 1;
        if (to !== null) { e.preventDefault(); select(to, true); }
      });
    });

    var start = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    // primera selección sin animación
    tabs.forEach(function (t, j) { var p = panels[j]; if (p) p.hidden = j !== Math.max(0, start); });
  }
  $$('[role="tablist"]').forEach(initTabs);

  /* ---------- Capas de violencia ---------- */
  var layers = $('#layers');
  var keys = $$('.layer__key');
  var notes = $$('[data-note]');
  function showNote(name) {
    notes.forEach(function (n) { n.classList.toggle('is-on', n.dataset.note === name); });
  }
  if (layers) {
    showNote('');
    keys.forEach(function (k) {
      k.addEventListener('click', function () {
        var name = k.dataset.layer;
        var on = layers.dataset.layer !== name;
        layers.dataset.layer = on ? name : '';
        keys.forEach(function (o) { o.setAttribute('aria-pressed', o === k && on ? 'true' : 'false'); });
        showNote(on ? name : '');
      });
    });
  }

  /* ---------- Propuesta: resaltar la conexión con la Mesa ---------- */
  var hub = $('#hub');
  if (hub) {
    $$('.line:not(.line--mesa)', hub).forEach(function (card) {
      var on = function () { hub.dataset.on = card.dataset.line; };
      var off = function () { delete hub.dataset.on; };
      card.addEventListener('mouseenter', on);
      card.addEventListener('mouseleave', off);
    });
  }

  /* ---------- Gantt: selección de etapa ---------- */
  var gantt = $('#gantt');
  if (gantt) {
    var stageBtns = $$('.gantt__stages button', gantt);
    stageBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        gantt.dataset.stage = b.dataset.stage;
        stageBtns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      });
    });
  }
})();
