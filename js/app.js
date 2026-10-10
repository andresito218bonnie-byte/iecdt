/* =========================================================
   app.js — única lógica del sitio público.
   Lee los datos de js/data.js (window.SITIO) y activa solo el
   módulo de la página actual, según <body data-page="...">:
     inicio · noticias · calendario · login
   Cabecera y pie se dibujan aquí una sola vez para todas las páginas.
   ========================================================= */
(() => {
  'use strict';

  const D = window.SITIO || {};
  const C = D.contacto || {};
  const body = document.body;
  const PAGE = body.dataset.page || 'inicio';
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Desde otras páginas, los anclajes del inicio llevan el prefijo index.html
  const HOME = PAGE === 'inicio' ? '' : 'index.html';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const year = new Date().getFullYear();
  let scan = () => {}; // initMotion() lo reemplaza: anima el contenido que se pinta después

  /* =======================================================
     1 · CABECERA Y PIE COMPARTIDOS
     ======================================================= */
  const ICON_BARS = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const ICON_CLOSE = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const manual = (D.legal || []).find((l) => /manual/i.test(l.texto));

  function brand() {
    return `<a class="brand" href="index.html">
      <img src="assets/logo.png" alt="" width="52" height="52">
      <span class="brand__text"><span class="brand__name">IE Ciudad de Tunja</span><span class="brand__tag">Colegio de Educación Tradicional</span></span>
    </a>`;
  }

  function headerFull() {
    const link = (href, texto, key) =>
      `<li class="nav__item"><a class="nav__link${PAGE === key ? ' is-active' : ''}" href="${href}" data-nav="${key}">${texto}</a></li>`;
    return `
      <a class="skip" href="#contenido">Saltar al contenido</a>
      <div class="topbar"><div class="wrap">
        <div class="topbar__group">
          <a href="mailto:${esc(C.correo)}">${esc(C.correo)}</a>
          <a href="tel:${esc(C.telefonoLink)}">${esc(C.telefono)}</a>
        </div>
        <div class="topbar__group topbar__group--strong">
          <a href="login.html?rol=estudiante">Portal Estudiantes</a>
          <a href="login.html?rol=docente">Portal Docentes</a>
        </div>
      </div></div>
      <nav class="nav" aria-label="Principal"><div class="wrap">
        ${brand()}
        <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú">${ICON_BARS}</button>
        <ul class="nav__menu" id="menu">
          ${link(PAGE === 'inicio' ? '#inicio' : 'index.html', 'Inicio', 'inicio')}
          <li class="nav__item">
            <a class="nav__link" href="${HOME}#historia" data-nav="institucional">Institucional</a>
            <div class="nav__sub">
              <a href="${HOME}#historia">Nuestra historia</a>
              <a href="${HOME}#mision">Misión y visión</a>
              ${manual ? `<a href="${esc(manual.href)}" target="_blank" rel="noopener">Manual de convivencia</a>` : ''}
            </div>
          </li>
          ${link(HOME + '#academico', 'Académico', 'academico')}
          ${link('calendario.html', 'Calendario', 'calendario')}
          ${link('noticias.html', 'Noticias', 'noticias')}
          <li class="nav__item nav__portal"><a class="nav__link" href="login.html?rol=estudiante">Portal Estudiantes</a></li>
          <li class="nav__item nav__portal"><a class="nav__link" href="login.html?rol=docente">Portal Docentes</a></li>
          <li class="nav__item"><a class="btn btn--yellow" href="${HOME}#inscripcion">Matricúlate 2027</a></li>
        </ul>
      </div></nav>`;
  }

  function headerMin() {
    return `<nav class="nav" aria-label="Principal"><div class="wrap">
      ${brand()}
      <a class="btn btn--outline" id="hdr-back" href="index.html">← Volver al sitio</a>
    </div></nav>`;
  }

  function footerFull() {
    const redes = (C.redes || []).filter((r) => r.url)
      .map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.nombre)}</a>`).join('');
    const legal = (D.legal || []).filter((l) => l !== manual)
      .map((l) => `<a href="${esc(l.href)}"${l.nueva ? ' target="_blank" rel="noopener"' : ''}>${esc(l.texto)}</a>`).join('');
    return `<footer class="footer"><div class="wrap">
      <div class="footer__grid">
        <div>
          <div class="footer__brand">IE Ciudad <em>de Tunja</em></div>
          <p class="footer__about">Comprometidos con la excelencia académica y la formación en valores para construir un futuro brillante.</p>
        </div>
        <div>
          <h2>Explora</h2>
          <div class="footer__links">
            <a href="${HOME}#historia">Nuestra historia</a>
            <a href="${HOME}#mision">Misión y visión</a>
            ${manual ? `<a href="${esc(manual.href)}" target="_blank" rel="noopener">Manual de convivencia</a>` : ''}
            <a href="${HOME}#inscripcion">Admisiones</a>
          </div>
        </div>
        <div>
          <h2>Contacto</h2>
          <div class="footer__links">
            <a href="mailto:${esc(C.correo)}">${esc(C.correo)}</a>
            <a href="tel:${esc(C.telefonoLink)}">${esc(C.telefono)}</a>
            <span>${esc(C.direccion)}</span>
            ${redes}
          </div>
        </div>
      </div>
      <div class="footer__legal">
        <span>© ${year} Institución Educativa Ciudad de Tunja. Todos los derechos reservados.</span>
        <nav aria-label="Legal">${legal}</nav>
      </div>
    </div></footer>`;
  }

  function footerMin() {
    return `<footer class="footer footer--min"><div class="wrap">
      <div class="footer__brand">IE Ciudad <em>de Tunja</em></div>
      <span>© ${year} Colegio Ciudad de Tunja</span>
    </div></footer>`;
  }

  function renderShell() {
    body.insertAdjacentHTML('afterbegin', body.dataset.header === 'min' ? headerMin() : headerFull());
    body.insertAdjacentHTML('beforeend', body.dataset.footer === 'min' ? footerMin() : footerFull());

    const nav = $('.nav');
    const toggle = $('.nav__toggle');
    if (!nav || !toggle) return;
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      toggle.innerHTML = open ? ICON_CLOSE : ICON_BARS;
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* =======================================================
     2 · UTILIDADES DE CONTENIDO (eventos y noticias)
     ======================================================= */
  const eventos = () => (D.eventos || []).map((e) => {
    const [y, mo, d] = e.fecha.split('-').map(Number);
    return { ...e, y, m: mo - 1, d, date: new Date(y, mo - 1, d) };
  }).sort((a, b) => a.date - b.date);

  const eventHTML = (e, i = 0) => `
    <div class="event" style="--i:${i}">
      <div class="event__date"><div class="event__day">${e.d}</div><div class="event__month">${MESES[e.m].slice(0, 3).toUpperCase()}</div></div>
      <div><h3 class="event__title">${esc(e.titulo)}</h3><div class="event__meta">${esc(e.hora)} · ${esc(e.lugar)}</div></div>
    </div>`;

  const noticias = () => Object.entries(D.noticias || {}).map(([id, n]) => ({ id, ...n }));
  const newsURL = (id) => `noticias.html?id=${encodeURIComponent(id)}`;

  function extracto(n, max = 120) {
    if (n.extracto) return n.extracto;
    const tmp = document.createElement('div');
    tmp.innerHTML = n.contenido || '';
    const txt = ((tmp.querySelector('p') || tmp).textContent || '').replace(/\s+/g, ' ').trim();
    return txt.length > max ? txt.slice(0, max).replace(/\s+\S*$/, '') + '…' : txt;
  }

  /* =======================================================
     3 · MÓDULO: INICIO
     ======================================================= */
  function initHome() {
    // Slider del hero
    const slides = $$('.hero__slide');
    if (slides.length > 1 && !reduceMotion) {
      let i = 0;
      setInterval(() => {
        slides[i].classList.remove('is-active');
        i = (i + 1) % slides.length;
        slides[i].classList.add('is-active');
      }, 5000);
    }

    // Botón de video (solo si hay URL en data.js)
    const video = $('#video-link');
    if (video && D.videoInstitucional) { video.href = D.videoInstitucional; video.hidden = false; }

    // Ventana con el plan de estudios
    const dlg = $('#plan-modal');
    if (dlg && typeof dlg.showModal === 'function') {
      $$('[data-plan]').forEach((btn) => btn.addEventListener('click', () => {
        const p = (D.planes || {})[btn.dataset.plan];
        if (!p) return;
        $('#plan-content', dlg).innerHTML = `
          <div class="modal__head">
            <span class="eyebrow eyebrow--yellow">Plan de estudios</span>
            <h2 id="plan-title">${esc(p.titulo)}</h2>
            <p>${esc(p.lema)}</p>
          </div>
          <div class="modal__body">
            <ul>${p.areas.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
            ${p.nota ? `<p class="modal__note">${esc(p.nota)}</p>` : ''}
          </div>`;
        dlg.showModal();
      }));
      dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    }

    // Inscripción: el formulario solo se carga cuando se abre
    const applyBtn = $('#apply-btn');
    const panel = $('#inscripcion');
    if (applyBtn && panel) {
      const frame = $('iframe', panel);
      const open = (scroll) => {
        if (!frame.src) frame.src = D.formularioAdmision;
        panel.hidden = false;
        applyBtn.setAttribute('aria-expanded', 'true');
        applyBtn.textContent = 'Ocultar formulario';
        if (scroll) panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      };
      const close = () => {
        panel.hidden = true;
        applyBtn.setAttribute('aria-expanded', 'false');
        applyBtn.textContent = 'Iniciar proceso ahora →';
      };
      applyBtn.addEventListener('click', () => (panel.hidden ? open(true) : close()));
      $('#apply-external').href = D.formularioAdmision;
      const fromHash = () => { if (location.hash === '#inscripcion') open(true); };
      fromHash();
      window.addEventListener('hashchange', fromHash);
    }

    // Noticias recientes (desde data.js)
    const feed = $('#home-news');
    if (feed) {
      const list = noticias();
      const [first, ...rest] = [...list.filter((n) => n.destacada), ...list.filter((n) => !n.destacada)];
      if (first) {
        feed.innerHTML = `
          <a class="card card--feature" href="${newsURL(first.id)}">
            <img src="${esc(first.imagen)}" alt="" loading="lazy">
            <div class="card__body">
              <span class="eyebrow">${esc(first.categoria)}</span>
              <h3 class="card__title">${esc(first.titulo)}</h3>
              <p class="card__text">${esc(extracto(first))}</p>
              <span class="meta">${esc(first.fecha)}</span>
            </div>
          </a>
          ${rest.slice(0, 2).map((n) => `
            <a class="card card--row" href="${newsURL(n.id)}">
              <div><span class="eyebrow">${esc(n.categoria)}</span><h3 class="card__title">${esc(n.titulo)}</h3></div>
              <span class="meta">${esc(n.fecha)}</span>
            </a>`).join('')}`;
      } else {
        feed.innerHTML = '<p class="empty">Pronto publicaremos novedades.</p>';
      }
    }

    // Próximos eventos
    const up = $('#upcoming-events');
    if (up) {
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      const prox = eventos().filter((e) => e.date >= hoy).slice(0, 3);
      up.innerHTML = prox.length ? prox.map(eventHTML).join('') : '<p class="empty">No hay eventos próximos. Consulta el calendario completo.</p>';
    }

    // Resalta en el menú la sección que se está viendo
    const links = $$('[data-nav]');
    const sections = $$('[data-section]');
    if ('IntersectionObserver' in window && sections.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === en.target.dataset.section));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => io.observe(s));
    }
  }

  /* =======================================================
     4 · MÓDULO: NOTICIAS (listado + detalle en la misma página)
     ======================================================= */
  function initNews() {
    const listView = $('#news-list-view');
    const artView = $('#news-article-view');
    const main = $('#news-main');
    const aside = $('#news-aside');
    if (!listView || !artView) return;

    const all = noticias();
    const PAGE_SIZE = 6;
    const state = { cat: null, page: 1 };
    const baseTitle = document.title;

    // Barra "Última hora"
    const ticker = $('#ticker');
    if (ticker && (D.avisos || []).length) {
      $('.ticker__track', ticker).textContent = D.avisos.join(' · ');
      ticker.hidden = false;
    }

    const gridCard = (n) => `
      <a class="card card--grid" href="${newsURL(n.id)}" data-news="${esc(n.id)}">
        <img src="${esc(n.imagen)}" alt="" loading="lazy">
        <div class="card__body"><span class="eyebrow">${esc(n.categoria)}</span><h3 class="card__title">${esc(n.titulo)}</h3><span class="meta">${esc(n.fecha)}</span></div>
      </a>`;

    function renderList() {
      const featured = all.find((n) => n.destacada) || all[0];
      let html = '<h1 class="page-title">Noticias</h1>';
      let pool;
      if (state.cat) {
        pool = all.filter((n) => n.categoria === state.cat);
        html += `<h2 class="news__sub" style="margin-top:0">${esc(state.cat)} <button type="button" class="link" data-cat-clear>Ver todas</button></h2>`;
      } else {
        pool = all.filter((n) => n !== featured);
        if (featured) {
          html += `<a class="card card--navy" href="${newsURL(featured.id)}" data-news="${esc(featured.id)}">
            <img src="${esc(featured.imagen)}" alt="">
            <div class="card__body"><span class="eyebrow">${esc(featured.categoria)}</span><h2 class="card__title">${esc(featured.titulo)}</h2><span class="meta">${esc(featured.fecha)} · Por ${esc(featured.autor)}</span></div>
          </a>`;
        }
        if (pool.length) html += '<h2 class="news__sub">Noticias recientes</h2>';
      }
      const pages = Math.max(1, Math.ceil(pool.length / PAGE_SIZE));
      state.page = Math.min(state.page, pages);
      const slice = pool.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
      html += slice.length ? `<div class="recents">${slice.map(gridCard).join('')}</div>` : (all.length ? '' : '<p class="empty">Aún no hay noticias publicadas.</p>');
      if (pages > 1) {
        html += `<nav class="pager" aria-label="Paginación">${Array.from({ length: pages }, (_, i) =>
          `<button type="button" class="pager__num${i + 1 === state.page ? ' is-current' : ''}" data-page="${i + 1}" aria-label="Página ${i + 1}"${i + 1 === state.page ? ' aria-current="page"' : ''}>${i + 1}</button>`).join('')}</nav>`;
      }
      main.innerHTML = html;
      renderAside();
      scan(main);
    }

    function renderAside() {
      const cats = {};
      all.forEach((n) => { cats[n.categoria] = (cats[n.categoria] || 0) + 1; });
      const pop = (D.masLeidas || []).map((id) => all.find((n) => n.id === id)).filter(Boolean);
      aside.innerHTML = `
        ${pop.length ? `<h2>Lo más leído</h2><ol class="aside__list">${pop.map((n, i) => `
          <li><a class="popular" href="${newsURL(n.id)}" data-news="${esc(n.id)}"><span class="popular__n">${i + 1}</span><span><strong>${esc(n.titulo)}</strong><span>${esc(n.fecha)}</span></span></a></li>`).join('')}</ol>` : ''}
        <h2>Categorías</h2>
        <ul class="aside__list cats">${Object.entries(cats).map(([c, k]) =>
          `<li><button type="button" data-cat="${esc(c)}"${state.cat === c ? ' class="is-current" aria-pressed="true"' : ' aria-pressed="false"'}><span>${esc(c)}</span><span>${k}</span></button></li>`).join('')}</ul>
        ${D.suscripcion ? `<form class="subscribe" action="${esc(D.suscripcion)}" method="post" target="_blank">
          <h2>Suscríbete</h2><p>Recibe las noticias en tu correo.</p>
          <label for="sub-email">Tu correo</label><input class="input" id="sub-email" name="email" type="email" required autocomplete="email">
          <button class="btn btn--yellow btn--block" type="submit">Unirme</button></form>` : ''}`;
      scan(aside);
    }

    function renderArticle(id) {
      const n = all.find((x) => x.id === id);
      if (!n) {
        artView.innerHTML = `<section class="section section--page"><div class="wrap article">
          <a class="article__back" href="noticias.html" data-news-back>← Volver a noticias</a>
          <h1>Noticia no encontrada</h1><p class="lead" style="margin-top:16px">La noticia que buscas no existe o fue retirada.</p>
          <a class="btn btn--blue" href="noticias.html" data-news-back style="margin-top:32px">Ver otras noticias</a></div></section>`;
        document.title = 'Noticia no encontrada | IE Ciudad de Tunja';
        scan(artView);
        return;
      }
      const otras = all.filter((x) => x.id !== id).slice(0, 2);
      artView.innerHTML = `
        <section class="section section--page" style="padding-bottom:0"><div class="wrap article">
          <a class="article__back" href="noticias.html" data-news-back>← Volver a noticias</a>
          <span class="eyebrow">${esc(n.categoria)}</span>
          <h1>${esc(n.titulo)}</h1>
          <div class="byline"><span class="byline__avatar" aria-hidden="true">IE</span><div><div class="byline__name">${esc(n.autor)}</div><div class="byline__date">${esc(n.fecha)}</div></div></div>
        </div>
        ${n.imagen ? `<div class="wrap article__img"><img src="${esc(n.imagen)}" alt=""></div>` : ''}
        <article class="wrap prose">${n.contenido}</article></section>
        ${otras.length ? `<section class="section section--white"><div class="wrap">
          <h2 class="h2--md" style="margin-bottom:0">También te podría interesar</h2>
          <div class="related__grid">${otras.map((o) => `
            <a class="related__item" href="${newsURL(o.id)}" data-news="${esc(o.id)}">
              <img src="${esc(o.imagen)}" alt="" loading="lazy"><span class="eyebrow">${esc(o.categoria)}</span>
              <h3>${esc(o.titulo)}</h3><span class="meta">${esc(o.fecha)}</span></a>`).join('')}</div></div></section>` : ''}`;
      document.title = `${n.titulo} | IE Ciudad de Tunja`;
      scan(artView);
    }

    // Decide qué vista mostrar según ?id=
    function route() {
      const id = new URLSearchParams(location.search).get('id');
      if (id) {
        renderArticle(id);
        listView.hidden = true; artView.hidden = false;
        if (ticker) ticker.hidden = true;
      } else {
        renderList();
        artView.hidden = true; listView.hidden = false;
        if (ticker && (D.avisos || []).length) ticker.hidden = false;
        document.title = baseTitle;
      }
      window.scrollTo(0, 0);
    }

    function go(url) {
      try { history.pushState({}, '', url); } catch (_) { location.href = url; return; }
      route();
    }

    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-news], [data-news-back]');
      if (card && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
        e.preventDefault();
        go(card.hasAttribute('data-news-back') ? 'noticias.html' : newsURL(card.dataset.news));
        return;
      }
      const cat = e.target.closest('[data-cat]');
      if (cat) { state.cat = state.cat === cat.dataset.cat ? null : cat.dataset.cat; state.page = 1; renderList(); return; }
      if (e.target.closest('[data-cat-clear]')) { state.cat = null; state.page = 1; renderList(); return; }
      const pg = e.target.closest('[data-page]');
      if (pg) { state.page = Number(pg.dataset.page); renderList(); main.scrollIntoView({ block: 'start' }); }
    });
    window.addEventListener('popstate', route);
    route();
  }

  /* =======================================================
     5 · MÓDULO: CALENDARIO
     ======================================================= */
  function initCalendar() {
    const grid = $('#cal-grid');
    if (!grid) return;
    const title = $('#cal-title');
    const list = $('#cal-events');
    const listTitle = $('#cal-list-title');
    const evs = eventos();
    const hoy = new Date();
    let y = hoy.getFullYear();
    let m = hoy.getMonth();
    let sel = null;

    function draw() {
      const lead = (new Date(y, m, 1).getDay() + 6) % 7; // semana desde el lunes
      const dias = new Date(y, m + 1, 0).getDate();
      title.textContent = `${MESES[m]} ${y}`;
      listTitle.textContent = `Eventos de ${MESES[m]}`;

      let html = '<div class="cal__cell" aria-hidden="true"></div>'.repeat(lead);
      for (let d = 1; d <= dias; d++) {
        const idx = lead + d - 1;
        const es = evs.filter((e) => e.d === d && e.m === m && e.y === y);
        const esHoy = d === hoy.getDate() && m === hoy.getMonth() && y === hoy.getFullYear();
        const cls = `cal__cell${esHoy ? ' is-today' : ''}${sel === d ? ' is-selected' : ''}`;
        const num = `<span class="cal__num">${d}</span>`;
        if (!es.length) { html += `<div class="${cls}" style="--i:${idx}">${num}</div>`; continue; }
        const dots = [...new Set(es.map((e) => e.tipo))].map((t) => `<span class="dot${t === 'yellow' ? ' dot--yellow' : ''}"></span>`).join('');
        html += `<button type="button" class="${cls}" style="--i:${idx}" data-day="${d}" aria-pressed="${sel === d}" aria-label="${d} de ${MESES[m]}, ${es.length} ${es.length > 1 ? 'eventos' : 'evento'}">${num}<span class="cal__dots">${dots}</span></button>`;
      }
      html += '<div class="cal__cell" aria-hidden="true"></div>'.repeat((7 - ((lead + dias) % 7)) % 7); // completa la última fila
      grid.innerHTML = html;

      const delMes = evs.filter((e) => e.m === m && e.y === y);
      const visibles = sel ? delMes.filter((e) => e.d === sel) : delMes;
      list.innerHTML = visibles.length ? visibles.map(eventHTML).join('') : '<p class="empty">No hay eventos programados para este mes.</p>';
    }

    let animTimer;
    const mover = (delta) => {
      m += delta;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      sel = null;
      draw();
      grid.classList.add('anim');
      list.classList.add('fresh');
      title.classList.remove('tick');
      void title.offsetWidth; // reinicia la animación del título
      title.classList.add('tick');
      clearTimeout(animTimer);
      animTimer = setTimeout(() => { grid.classList.remove('anim'); list.classList.remove('fresh'); }, 1200);
    };
    $('#cal-prev').addEventListener('click', () => mover(-1));
    $('#cal-next').addEventListener('click', () => mover(1));
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-day]');
      if (!b) return;
      const d = Number(b.dataset.day);
      sel = sel === d ? null : d;
      draw();
    });

    const pdf = $('#cal-pdf');
    if (pdf && D.cronogramaPDF) { pdf.href = D.cronogramaPDF; pdf.hidden = false; }
    draw();
  }

  /* =======================================================
     6 · MÓDULO: LOGIN Y RECUPERAR CONTRASEÑA
     (maqueta: aún no valida contra un servidor; guarda una
      sesión simulada que lee plataforma.html)
     ======================================================= */
  function initLogin() {
    const vLogin = $('#view-login');
    const vRecover = $('#view-recover');
    if (!vLogin || !vRecover) return;
    const bandLogin = $('#band-login');
    const bandRecover = $('#band-recover');
    const perks = $('#perks');
    const back = $('#hdr-back');
    const titleLogin = document.title;

    function showView() {
      const rec = location.hash === '#recuperar';
      vLogin.hidden = rec; bandLogin.hidden = rec; perks.hidden = rec;
      vRecover.hidden = !rec; bandRecover.hidden = !rec;
      $('.login').classList.toggle('login--single', rec);
      back.textContent = rec ? '← Volver al inicio de sesión' : '← Volver al sitio';
      back.setAttribute('href', rec ? '#acceso' : 'index.html');
      document.title = rec ? 'Recuperar contraseña | IE Ciudad de Tunja' : titleLogin;
      if (rec) { $('#paso-solicitar').hidden = false; $('#paso-confirmacion').hidden = true; }
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', showView);

    // --- Inicio de sesión
    const tabs = $$('[role="tab"]', vLogin);
    const user = $('#usuario');
    const pass = $('#password');
    const err = $('#login-error');
    let rol = 'estudiante';
    const rolURL = new URLSearchParams(location.search).get('rol');
    if (rolURL === 'docente' || rolURL === 'estudiante') rol = rolURL;

    function setRol(r) {
      rol = r;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.role === r)));
      user.placeholder = r === 'docente' ? 'Ej: docente.jperez' : 'Ej: 2027.jperez';
    }
    setRol(rol);
    tabs.forEach((t) => t.addEventListener('click', () => setRol(t.dataset.role)));

    const toggle = $('#pw-toggle');
    toggle.addEventListener('click', () => {
      const oculto = pass.type === 'password';
      pass.type = oculto ? 'text' : 'password';
      toggle.textContent = oculto ? 'Ocultar' : 'Mostrar';
      toggle.setAttribute('aria-pressed', String(oculto));
    });

    $('#form-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const u = user.value.trim();
      const p = pass.value.trim();
      if (!u || !p) { err.textContent = 'Por favor completa usuario y contraseña.'; err.hidden = false; return; }
      err.hidden = true;
      const visible = u.replace(/[._]/g, ' ').replace(/\d+/g, '').trim() || (rol === 'docente' ? 'Docente' : 'Estudiante');
      sessionStorage.setItem('portalSesion', JSON.stringify({
        usuario: u,
        nombre: visible.charAt(0).toUpperCase() + visible.slice(1),
        rol
      }));
      window.location.href = 'plataforma.html';
    });

    // --- Recuperar contraseña
    const recInput = $('#usuario-recuperar');
    const recErr = $('#recover-error');
    $('#form-recuperar').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = recInput.value.trim();
      if (v.length < 3) { recErr.hidden = false; return; }
      recErr.hidden = true;
      $('#confirm-usuario').textContent = v;
      $('#paso-solicitar').hidden = true;
      $('#paso-confirmacion').hidden = false;
    });
    const reenviar = $('#btn-reenviar');
    reenviar.addEventListener('click', () => {
      reenviar.disabled = true;
      reenviar.textContent = 'Enlace reenviado';
      setTimeout(() => { reenviar.disabled = false; reenviar.textContent = 'No recibí el correo, reenviar'; }, 4000);
    });

    showView();
  }


  /* =======================================================
     7 · MOVIMIENTO: scroll, parallax, cursor y hover
     Se desactiva solo si el visitante pidió "reducir movimiento".
     ======================================================= */
  function initMotion() {
    const html = document.documentElement;
    if (reduceMotion || !('IntersectionObserver' in window)) { html.classList.add('ready'); return; }
    html.classList.add('motion');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine) html.classList.add('motion-fine');
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    /* --- Qué se anima y cómo: [selector, variante, retraso extra en ms] --- */
    const RV = [
      ['.hero__copy > :not(h1)', 'up'],
      ['.hero__arch, .band__media', 'arch'],
      ['.hero__badge', 'pop', 1100],
      ['.band .wrap > :not(h1)', 'up'],
      ['.eyebrow, .lead, .section-head > p, .mv p, .rows, .split .btn, .feed .btn, .article__back, .byline', 'up'],
      ['.strip__item, .level, .step, .values li, .timeline__row, .event, .perks li, .related__item, .recents > *, .card, .footer__grid > *', 'up'],
      ['.photo__frame', 'mask'],
      ['.cal__board, .login__card, .aside > *, .apply, .prose, .article__img', 'scale']
    ];
    const SPLIT = '.hero h1, .band h1, .page-title, .article h1, .h2, .h2--md';
    // Parallax: [selector, velocidad, modo] — "scroll" = según lo desplazado; "view" = según su posición en pantalla
    const PAR = [['.hero__media', 0.1, 'scroll'], ['.hero__copy', 0.2, 'scroll'], ['.photo__frame img', 0.05, 'view'], ['.band__media img', 0.04, 'view']];
    const par = [];
    const parSeen = new WeakSet();
    const scrub = [];

    // Divide un título en palabras para que suban una a una
    function split(el) {
      let i = 0;
      const out = document.createDocumentFragment();
      const walk = (src, dst) => src.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { dst.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            const inner = document.createElement('span');
            w.className = 'sw';
            inner.textContent = tok;
            inner.style.setProperty('--i', i++);
            w.appendChild(inner);
            dst.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          const c = n.cloneNode(false);
          dst.appendChild(c);
          walk(n, c);
        }
      });
      walk(el, out);
      el.textContent = '';
      el.appendChild(out);
      el.classList.add('is-split');
    }

    const byDom = (a, b) => (a.target.compareDocumentPosition(b.target) & 2 ? 1 : -1);

    // Entrada al hacer scroll (escalonada cuando varios aparecen a la vez)
    // Un elemento recortado del todo (clip-path) no cuenta como "visible" para el observador:
    // por eso mask/arch se vigilan a través de su contenedor.
    const watch = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).sort(byDom).forEach((en, i) => {
        io.unobserve(en.target);
        (watch.get(en.target) || [en.target]).forEach((el) => {
          const delay = Math.min(i, 7) * 85 + Number(el.dataset.delay || 0);
          if (el.classList.contains('is-split')) { el.style.setProperty('--base', delay + 'ms'); el.classList.add('seen'); return; }
          el.style.transitionDelay = delay + 'ms';
          el.classList.add('seen');
          // al terminar, se libera el elemento para que sus hovers normales funcionen
          setTimeout(() => { el.classList.remove('rv'); el.style.transitionDelay = ''; }, delay + 1500);
        });
        watch.delete(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    // Contadores
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        const el = en.target;
        const to = Number(el.dataset.count);
        const from = Number(el.dataset.from || 0);
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / 1700);
          el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });

    scan = (scope = document) => {
      $$(SPLIT, scope).forEach((el) => {
        if (el.dataset.rv || el.closest('.modal')) return;
        el.dataset.rv = 'split';
        split(el);
        io.observe(el);
      });

      const picked = new Map();
      RV.forEach(([sel, variant, delay]) => $$(sel, scope).forEach((el) => { if (!el.dataset.rv) picked.set(el, { variant, delay }); }));
      picked.forEach(({ variant, delay }, el) => {
        // si un ancestro ya se anima, el hijo viaja con él
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { if (picked.has(p) || p.dataset.rv) return; }
        el.dataset.rv = variant;
        if (delay) el.dataset.delay = delay;
        el.classList.add('rv');
        const clipped = variant === 'mask' || variant === 'arch';
        const target = clipped ? el.parentElement : el;
        watch.set(target, [...(watch.get(target) || []), el]);
        io.observe(target);
      });

      $$('[data-count]', scope).forEach((el) => {
        if (el.dataset.ready) return;
        el.dataset.ready = '1';
        el.textContent = el.dataset.from || '0';
        cio.observe(el);
      });

      $$('[data-scrub]', scope).forEach((el) => {
        if (el.dataset.ready) return;
        el.dataset.ready = '1';
        el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="wl">${esc(w)}</span>`).join(' ');
        scrub.push({ el, words: $$('.wl', el), lit: -1 });
      });

      PAR.forEach(([sel, speed, mode]) => $$(sel, scope).forEach((el) => {
        if (parSeen.has(el)) return;
        parSeen.add(el);
        par.push({ el, speed, mode });
      }));

    };

    /* --- Bucle de scroll: progreso, cabecera, parallax y texto que se ilumina --- */
    const bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    body.appendChild(bar);
    const nav = $('.nav');
    let ticking = false;

    function frame() {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      bar.style.setProperty('--p', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
      if (nav) nav.classList.toggle('is-scrolled', y > 8);

      par.forEach(({ el, speed, mode }) => {
        if (mode === 'scroll') { if (y < vh * 1.5) el.style.translate = `0 ${(y * speed).toFixed(1)}px`; return; }
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        el.style.translate = `0 ${clamp(-(r.top + r.height / 2 - vh / 2) * speed, -42, 42).toFixed(1)}px`;
      });

      scrub.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        const p = clamp((vh * 0.9 - r.top) / (vh * 0.45 + r.height * 0.4), 0, 1);
        const n = Math.round(p * s.words.length);
        if (n === s.lit) return;
        s.words.forEach((w, i) => w.classList.toggle('lit', i < n));
        s.lit = n;
      });
    }
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    window.addEventListener('load', request);

    scan(document);
    frame();
    // dos frames: así el primer pintado ya muestra los estados iniciales
    requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add('ready')));

    /* --- Halo tenue, inclinación 3D, foco de luz e imán (solo con ratón) --- */
    if (!fine) return;
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    body.appendChild(glow);

    let tx = -300, ty = -300, gx = tx, gy = ty, raf = 0, shown = false;
    const loop = () => {
      gx += (tx - gx) * 0.1; gy += (ty - gy) * 0.1;
      glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.4 ? requestAnimationFrame(loop) : 0;
    };

    const TILT = '.card--feature, .card--navy, .card--grid, .level';
    const SPOT = '.card, .strip__item, .event';
    let cur = null, mag = null;

    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; gx = tx; gy = ty; glow.classList.add('on'); }
      if (!raf) raf = requestAnimationFrame(loop);

      const t = e.target instanceof Element ? e.target : null;
      const el = t && t.closest(`${TILT}, ${SPOT}`);
      if (el !== cur) { if (cur) { cur.style.removeProperty('--rx'); cur.style.removeProperty('--ry'); } cur = el; }
      if (el) {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (el.matches(TILT)) {
          el.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
          el.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
        }
      }

      const b = t && t.closest('.btn:not([disabled])');
      if (b !== mag) { if (mag) mag.style.translate = ''; mag = b; }
      if (b) {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1)}px`;
      }
    }, { passive: true });

    html.addEventListener('mouseleave', () => { shown = false; glow.classList.remove('on'); });
  }

  /* =======================================================
     8 · ARRANQUE
     ======================================================= */
  renderShell();
  ({ inicio: initHome, noticias: initNews, calendario: initCalendar, login: initLogin }[PAGE] || (() => {}))();
  try {
    initMotion();
  } catch (err) {
    // si algo falla, el sitio se muestra sin animaciones en lugar de quedar oculto
    console.error(err);
    document.documentElement.classList.remove('motion', 'motion-fine');
    document.documentElement.classList.add('ready');
  }
})();
