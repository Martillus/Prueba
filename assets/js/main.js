/* ==========================================================================
   DESPACHO EXTRA LEGAL — interacción
   Sin dependencias. Todo el movimiento respeta prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ------------------------------------------------------------------ */
  /* Portada de carga                                                    */
  /* ------------------------------------------------------------------ */
  function boot() {
    var el = $('.boot');
    if (!el) return;
    var close = function () {
      el.classList.add('is-done');
      document.body.classList.add('is-loaded');
      window.setTimeout(function () { el.remove(); }, 700);
    };
    if (REDUCED) { close(); return; }
    window.setTimeout(close, 1150);
  }

  /* ------------------------------------------------------------------ */
  /* Guilloche — el entramado de seguridad de un visado                  */
  /* ------------------------------------------------------------------ */
  function guilloche() {
    $$('.guilloche').forEach(function (host) {
      var petals = parseInt(host.dataset.petals || '26', 10);
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 400 400');
      svg.setAttribute('aria-hidden', 'true');
      var frag = '';
      for (var i = 0; i < petals; i++) {
        var rot = (360 / petals) * i;
        frag += '<ellipse cx="200" cy="200" rx="184" ry="76" fill="none" ' +
                'stroke="currentColor" stroke-width=".7" ' +
                'transform="rotate(' + rot.toFixed(2) + ' 200 200)"/>';
      }
      for (var j = 0; j < 5; j++) {
        frag += '<circle cx="200" cy="200" r="' + (40 + j * 34) + '" fill="none" ' +
                'stroke="currentColor" stroke-width=".5" stroke-dasharray="1 6"/>';
      }
      svg.innerHTML = frag;
      host.appendChild(svg);
    });
  }

  /* ------------------------------------------------------------------ */
  /* El sello de registro                                                */
  /* ------------------------------------------------------------------ */
  var stampSeq = 0;
  function stamps() {
    $$('.sello').forEach(function (host) {
      var id = 'sello-ring-' + (++stampSeq);
      var ring = host.dataset.sello ||
        'DESPACHO EXTRA LEGAL · SERRANO 93 · MADRID · EXTRANJERÍA · ';
      var top = host.dataset.top || 'EXP.';
      var mid = host.dataset.mid || 'RESUELTO';
      var bot = host.dataset.bot || 'FAVORABLE';
      host.innerHTML =
        '<svg viewBox="0 0 200 200" aria-hidden="true">' +
          '<defs><path id="' + id + '" fill="none" ' +
            'd="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs>' +
          '<circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".85"/>' +
          '<circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/>' +
          '<g class="sello__ring"><text font-family="Courier Prime, monospace" font-size="11.5" ' +
            'letter-spacing="1.6" fill="currentColor" opacity=".9">' +
            '<textPath href="#' + id + '" startOffset="0">' + ring + ring + '</textPath></text></g>' +
          '<text x="100" y="86" text-anchor="middle" font-family="Courier Prime, monospace" ' +
            'font-size="10" letter-spacing="2.4" fill="currentColor" opacity=".75">' + top + '</text>' +
          '<text x="100" y="107" text-anchor="middle" font-family="Newsreader, serif" ' +
            'font-size="20" fill="currentColor">' + mid + '</text>' +
          '<text x="100" y="124" text-anchor="middle" font-family="Courier Prime, monospace" ' +
            'font-size="9" letter-spacing="2.2" fill="currentColor" opacity=".75">' + bot + '</text>' +
          '<path d="M46 138 h108" stroke="currentColor" stroke-width="1" opacity=".5"/>' +
        '</svg>';
    });
  }

  /* ------------------------------------------------------------------ */
  /* Titulares por líneas                                                */
  /* ------------------------------------------------------------------ */
  function splitLines() {
    $$('.lines').forEach(function (el) {
      if (el.dataset.split === 'done') return;
      var parts = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = parts.map(function (p, i) {
        return '<span style="--d:' + (i * 0.09).toFixed(2) + 's"><i>' + p.trim() + '</i></span>';
      }).join('');
      el.dataset.split = 'done';
    });
  }

  /* ------------------------------------------------------------------ */
  /* Revelado al desplazar                                               */
  /* ------------------------------------------------------------------ */
  function reveals() {
    var targets = $$('[data-anim], .lines, .step, .sec-head, .stars, .bars, [data-count]');
    if (REDUCED || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-revealed'); });
      $$('[data-count]').forEach(function (el) {
        el.textContent = el.dataset.sep === 'es'
          ? el.dataset.count.replace('.', ',') : el.dataset.count;
      });
      return;
    }
    // Reparto escalonado dentro de cada grupo
    $$('[data-stagger]').forEach(function (group) {
      var step = parseFloat(group.dataset.stagger) || 0.09;
      $$('[data-anim]', group).forEach(function (el, i) {
        el.style.setProperty('--d', (i * step).toFixed(2) + 's');
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        if (e.target.hasAttribute('data-count')) count(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* Contadores */
  function count(el) {
    var to = parseFloat(el.dataset.count);
    var dec = (el.dataset.count.split('.')[1] || '').length;
    var t0 = null, dur = 1500;
    var sep = el.dataset.sep === 'es';
    function frame(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1);
      var v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = dec ? v.toFixed(dec).replace('.', sep ? ',' : '.') : Math.round(v).toString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ */
  /* Cabecera + progreso                                                 */
  /* ------------------------------------------------------------------ */
  function header() {
    var head = $('.head');
    var bar  = $('.progress');
    var top  = $('.totop');
    var last = 0;
    function onScroll() {
      var y = window.scrollY;
      if (head) {
        head.classList.toggle('is-stuck', y > 28);
        head.classList.toggle('is-hidden', y > 420 && y > last && !document.body.classList.contains('is-menu'));
      }
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? clamp(y / h, 0, 1) : 0) + ')';
      }
      if (top) top.classList.toggle('is-on', y > 700);
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (top) top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Menú móvil                                                          */
  /* ------------------------------------------------------------------ */
  function menu() {
    var btn = $('.burger');
    var box = $('.menu');
    if (!btn || !box) return;
    $$('.menu__list a', box).forEach(function (a, i) {
      a.style.transitionDelay = (0.16 + i * 0.055) + 's';
    });
    function toggle(force) {
      var on = force !== undefined ? force : !document.body.classList.contains('is-menu');
      document.body.classList.toggle('is-menu', on);
      document.body.style.overflow = on ? 'hidden' : '';
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      box.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    btn.addEventListener('click', function () { toggle(); });
    $$('a', box).forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggle(false);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Cursor                                                              */
  /* ------------------------------------------------------------------ */
  function cursor() {
    if (!FINE || REDUCED) return;
    var dot  = document.createElement('div'); dot.className = 'cursor';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.body.classList.add('has-cursor');
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var hit = e.target.closest('a, button, .index__row, .quote, input, textarea, select, summary');
      document.body.classList.toggle('is-hover', !!hit);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Botones magnéticos                                                  */
  /* ------------------------------------------------------------------ */
  function magnetic() {
    if (!FINE || REDUCED) return;
    $$('[data-magnet]').forEach(function (el) {
      var str = parseFloat(el.dataset.magnet) || 0.28;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * str;
        var y = (e.clientY - r.top - r.height / 2) * str;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Inclinación de láminas                                              */
  /* ------------------------------------------------------------------ */
  function tilt() {
    if (!FINE || REDUCED) return;
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 6;
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          'perspective(900px) rotateY(' + (px * max).toFixed(2) + 'deg) rotateX(' + (-py * max).toFixed(2) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* GSAP + ScrollTrigger                                                */
  /* Láminas que se expanden al entrar en pantalla y paralaje continuo.  */
  /* Si el CDN no carga, todo cae al motor vanilla de scrollFx().        */
  /* ------------------------------------------------------------------ */
  var GSAP_ON = false;
  function gsapFx() {
    if (REDUCED || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    GSAP_ON = true;
    document.documentElement.classList.add('gsap-on');

    /* La lámina se abre: el marco crece y la foto suelta su zoom.
       Es el gesto del expediente que se despliega sobre la mesa. */
    $$('[data-gsap="expand"]').forEach(function (fig) {
      var img = fig.querySelector('img');
      var from = parseFloat(fig.dataset.from) || 0.82;

      gsap.fromTo(fig,
        { scale: from, yPercent: 3 },
        {
          scale: 1, yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: fig, start: 'top 94%', end: 'top 30%', scrub: 0.7 }
        });

      if (!img) return;

      gsap.fromTo(img,
        { scale: 1.45 },
        {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: fig, start: 'top 94%', end: 'top 28%', scrub: 0.7 }
        });

      /* Y sigue respirando mientras cruza la pantalla */
      gsap.fromTo(img,
        { yPercent: -7 },
        {
          yPercent: 7, ease: 'none',
          scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* Paralaje genérico */
    $$('[data-parallax]').forEach(function (el) {
      var sp = (parseFloat(el.dataset.parallax) || 0.08) * 100;
      gsap.fromTo(el,
        { yPercent: -sp },
        {
          yPercent: sp, ease: 'none',
          scrollTrigger: { trigger: el.dataset.trigger ? el.closest(el.dataset.trigger) : el,
                           start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* Deriva del guilloche, más lenta que el contenido */
    $$('.guilloche').forEach(function (el) {
      gsap.fromTo(el,
        { yPercent: -12 },
        {
          yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* Titulares que suben un poco más despacio que su sección */
    $$('[data-gsap="drift"]').forEach(function (el) {
      gsap.fromTo(el,
        { yPercent: 6 },
        {
          yPercent: -6, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* La línea del expediente se traza con el scroll */
    var path = $('.path'), line = $('.path__line i');
    if (path && line) {
      gsap.fromTo(line,
        { scaleY: 0 },
        {
          scaleY: 1, ease: 'none', transformOrigin: 'top',
          scrollTrigger: { trigger: path, start: 'top 72%', end: 'bottom 78%', scrub: 0.5 }
        });
    }

    /* Las cifras se separan levemente entre sí */
    $$('.stats .stat').forEach(function (el, i) {
      gsap.fromTo(el,
        { yPercent: 5 + i * 2.5 },
        {
          yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'top 45%', scrub: 0.8 }
        });
    });

    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Paralaje y trazado de la línea del proceso (respaldo sin GSAP)      */
  /* ------------------------------------------------------------------ */
  function scrollFx() {
    if (GSAP_ON) return;
    var par  = $$('[data-parallax]');
    var line = $('.path__line i');
    var path = $('.path');
    if (REDUCED || (!par.length && !line)) return;
    var ticking = false;
    function run() {
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var sp = parseFloat(el.dataset.parallax) || 0.08;
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-mid * sp).toFixed(1) + 'px,0)';
      });
      if (line && path) {
        var pr = path.getBoundingClientRect();
        var p = clamp((vh * 0.72 - pr.top) / pr.height, 0, 1);
        line.style.setProperty('--p', p.toFixed(3));
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    }, { passive: true });
    window.addEventListener('resize', run);
    run();
  }

  /* ------------------------------------------------------------------ */
  /* Cintas continuas                                                    */
  /* ------------------------------------------------------------------ */
  function loops() {
    $$('.marquee__track, .rail-x__track').forEach(function (t) {
      if (t.dataset.dup === 'done') return;
      t.innerHTML += t.innerHTML;
      t.dataset.dup = 'done';
    });
  }

  /* ------------------------------------------------------------------ */
  /* Lámina que sigue al cursor sobre el índice                          */
  /* ------------------------------------------------------------------ */
  function peek() {
    var rows = $$('[data-peek]');
    if (!rows.length || !FINE || REDUCED) return;
    var box = document.createElement('div');
    box.className = 'peek';
    box.innerHTML = '<img alt="">';
    document.body.appendChild(box);
    var img = $('img', box);
    var tx = 0, ty = 0, cx = 0, cy = 0, on = false;
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        img.src = row.dataset.peek;
        on = true;
        box.classList.add('is-on');
      });
      row.addEventListener('mouseleave', function () {
        on = false;
        box.classList.remove('is-on');
      });
    });
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      if (on) box.style.left = cx.toFixed(1) + 'px', box.style.top = cy.toFixed(1) + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------------------ */
  /* Acordeón                                                            */
  /* ------------------------------------------------------------------ */
  function accordion() {
    $$('.acc').forEach(function (acc) {
      var solo = acc.dataset.solo !== 'off';
      $$('.acc__btn', acc).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var panel = document.getElementById(btn.getAttribute('aria-controls'));
          var open = btn.getAttribute('aria-expanded') === 'true';
          if (solo) {
            $$('.acc__btn', acc).forEach(function (b) {
              if (b === btn) return;
              b.setAttribute('aria-expanded', 'false');
              var p = document.getElementById(b.getAttribute('aria-controls'));
              if (p) p.classList.remove('is-open');
            });
          }
          btn.setAttribute('aria-expanded', open ? 'false' : 'true');
          if (panel) panel.classList.toggle('is-open', !open);
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Horario en vivo (Europa/Madrid)                                     */
  /* ------------------------------------------------------------------ */
  var SCHEDULE = [null, [10, 19], [10, 19], [10, 19], [10, 19], [10, 19], null]; // dom..sáb
  function hours() {
    var host = $$('[data-open-state]');
    var list = $$('.hours li');
    if (!host.length && !list.length) return;
    var f = new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false
    });
    var parts = {};
    f.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var map = { 'dom': 0, 'lun': 1, 'mar': 2, 'mié': 3, 'mie': 3, 'jue': 4, 'vie': 5, 'sáb': 6, 'sab': 6 };
    var key = (parts.weekday || '').toLowerCase().replace('.', '').slice(0, 3);
    var d = map[key];
    if (d === undefined) d = new Date().getDay();
    var mins = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
    var today = SCHEDULE[d];
    var open = !!today && mins >= today[0] * 60 && mins < today[1] * 60;

    host.forEach(function (el) {
      var dot = $('.dot', el);
      var txt = $('[data-open-text]', el);
      if (dot) dot.classList.toggle('dot--off', !open);
      if (txt) {
        if (open) {
          txt.textContent = 'Abierto ahora · cierra a las ' + today[1] + ':00';
        } else {
          var n = d, i = 0;
          while (i < 7 && !SCHEDULE[(n + 1) % 7]) { n++; i++; }
          var nextDay = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][(n + 1) % 7];
          var soon = today && mins < today[0] * 60;
          txt.textContent = soon
            ? 'Cerrado · abre hoy a las ' + today[0] + ':00'
            : 'Cerrado · abre el ' + nextDay + ' a las 10:00';
        }
      }
    });
    list.forEach(function (li) {
      if (parseInt(li.dataset.day, 10) === d) li.classList.add('is-today');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Formulario → WhatsApp                                               */
  /* ------------------------------------------------------------------ */
  var WA = '34662457185';
  function form() {
    var f = $('#consulta');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[required]', f).forEach(function (i) {
        var wrap = i.closest('.field') || i.closest('.check');
        var bad = i.type === 'checkbox' ? !i.checked : !i.value.trim();
        if (i.type === 'email' && i.value.trim()) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value);
        if (wrap) wrap.classList.toggle('field--err', bad);
        if (bad && ok) { i.focus(); ok = false; }
        if (bad) ok = false;
      });
      if (!ok) return;
      var v = function (n) { var el = f.elements[n]; return el ? el.value.trim() : ''; };
      var msg =
        'Hola, escribo desde la web de Despacho Extra Legal.\n\n' +
        'Nombre: ' + v('nombre') + '\n' +
        'Email: ' + v('email') + '\n' +
        (v('telefono') ? 'Teléfono: ' + v('telefono') + '\n' : '') +
        (v('nacionalidad') ? 'Nacionalidad: ' + v('nacionalidad') + '\n' : '') +
        'Trámite: ' + v('tramite') + '\n\n' +
        'Consulta:\n' + v('mensaje');
      var out = $('#form-ok');
      if (out) out.hidden = false;
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
    $$('.field__i', f).forEach(function (i) {
      i.addEventListener('input', function () {
        var w = i.closest('.field');
        if (w) w.classList.remove('field--err');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Paso entre folios                                                   */
  /* ------------------------------------------------------------------ */
  function transitions() {
    var curtain = $('.curtain');
    if (!curtain || REDUCED) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (a.target === '_blank' || a.hasAttribute('download') ||
          href.charAt(0) === '#' || /^(mailto|tel|https?|wa):/i.test(href) ||
          e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (a.host && a.host !== window.location.host) return;
      e.preventDefault();
      curtain.classList.add('is-in');
      window.setTimeout(function () { window.location.href = href; }, 460);
    });
    window.addEventListener('pageshow', function (e) {
      curtain.classList.remove('is-in');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Detalles                                                            */
  /* ------------------------------------------------------------------ */
  function misc() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    // Las fotos remotas caen a una lámina local si no cargan
    $$('img[data-fallback]').forEach(function (img) {
      var swap = function () {
        if (img.dataset.fell) return;
        img.dataset.fell = '1';
        img.src = img.dataset.fallback;
      };
      img.addEventListener('error', swap);
      // Puede haber fallado ya, antes de que este script se ejecutase
      if (img.complete && img.naturalWidth === 0) swap();
    });
  }

  /* ------------------------------------------------------------------ */
  function init() {
    splitLines();
    guilloche();
    stamps();
    loops();
    reveals();
    header();
    menu();
    cursor();
    magnetic();
    tilt();
    gsapFx();
    scrollFx();
    peek();
    accordion();
    hours();
    form();
    transitions();
    misc();
    boot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
