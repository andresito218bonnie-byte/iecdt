/* =========================================================
   plataforma-docente.js — Vista de DOCENTE del aula virtual (v8)

   Recupera lo que tenía la versión anterior (grupos a cargo, tareas
   con entregas, calificar, asistencia, anuncios, materiales, mensajes)
   con el diseño de la v7. Se carga ANTES de plataforma.js, que lo usa
   así: S.d (estado), VDOC.V (vistas) y VDOC.hilos() (mensajes).

   Alcance: el docente solo ve las clases que tiene asignadas
   (IE_DEMO.clasesDe), como pide docs/matriz-permisos.md.
   Demo: las entregas y notas se guardan en localStorage del navegador
   (por usuario); no se envían a nadie ni hay seguridad real.
   ========================================================= */
window.VDOC = (() => {
  'use strict';
  const DM = window.IE_DEMO;
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /* ---------- Utilidades ---------- */
  const semilla = (t) => { let h = 2166136261; for (const c of String(t)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const azar = (seed) => { let s = seed || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
  const claseObj = (id) => DM.clases.find((c) => c.id === id);
  const grupoDe = (c) => DM.etiquetaGrupo(c.grupo);
  const rosterDe = (c) => DM.roster(c.grupo);
  const nombreClase = (c) => `${c.materia} · ${grupoDe(c)}`;
  const hoyKey = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; };
  const fechaCorta = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${String(d).padStart(2, '0')} ${MESES[m - 1]}`; };
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  /* ---------- Datos iniciales (demostración) ---------- */
  // [id, clase, título, vence, estado, entregas base, calificadas base]
  const LAURA = [
    ['pe',   'est-11A', 'Proyecto de estadística',      '14 oct', 'abierta',  18, 6],
    ['ee',   'mat-11A', 'Ejercicios de ecuaciones',     '16 oct', 'abierta',   0, 0],
    ['cu',   'mat-11A', 'Cuestionario de la Unidad 3',  '05 oct', 'cerrada',  30, 30],
    ['tp',   'est-11A', 'Taller de probabilidad',       '08 oct', 'cerrada',  30, 30],
    ['ta9',  'mat-9A',  'Taller de álgebra',            '13 oct', 'abierta',  22, 10],
    ['qz9',  'mat-9B',  'Quiz corto — Unidad 3',        '07 oct', 'cerrada',  30, 30],
    ['gr10', 'mat-10A', 'Guía de funciones lineales',   '15 oct', 'abierta',  11, 0],
    ['en9',  'mat-9A',  'Ensayo: matemáticas en la vida', '—',    'borrador',  0, 0]
  ];
  const OTROS = {
    'Ciencias Naturales': [['Informe de laboratorio', '19 oct', 'abierta', 14, 4], ['Guía de repaso — Unidad 4', '12 oct', 'cerrada', 30, 30]],
    'Lengua Castellana': [['Ensayo argumentativo', '17 oct', 'abierta', 10, 0], ['Lectura guiada', '06 oct', 'cerrada', 30, 30]],
    'Inglés': [['Writing: my future plans', '15 oct', 'abierta', 16, 8], ['Listening quiz', '03 oct', 'cerrada', 30, 30]],
    'Educación Física': [['Rutina de acondicionamiento', '18 oct', 'abierta', 25, 25]]
  };

  function estadoInicial() {
    if (ME.rol !== 'docente') return null;
    const tareas = [];
    if (ME.usuario === 'docente.lgomez') {
      LAURA.forEach(([id, claseId, t, due, estado, e0, c0]) => tareas.push({ id, claseId, t, due, estado, e0, c0, max: 5, desc: '' }));
    } else {
      DM.clasesDe(ME.usuario).forEach((c) => (OTROS[c.materia] || []).forEach(([t, due, estado, e0, c0], i) => {
        const n = rosterDe(c).length;
        tareas.push({ id: `${c.id}-${i}`, claseId: c.id, t, due, estado, e0: Math.min(e0, n), c0: Math.min(c0, e0, n), max: 5, desc: '' });
      }));
    }
    return { tareas, notas: {}, anuncios: {}, materiales: {}, asistencia: {} };
  }

  function hilos() {
    const cl = DM.clasesDe(ME.usuario);
    const a = cl[0] ? rosterDe(cl[0]) : [];
    const b = cl[cl.length - 1] ? rosterDe(cl[cl.length - 1]) : [];
    const e1 = a[1] ? a[1].nombre : 'Estudiante';
    const e2 = b[4] ? b[4].nombre : 'Estudiante';
    const ac = a[2] ? a[2].nombre : 'Estudiante';
    const g1 = cl[0] ? grupoDe(cl[0]) : '', g2 = cl[0] ? grupoDe(cl[cl.length - 1]) : '';
    const ini0 = estadoInicial(), t0 = ini0 && ini0.tareas[0] ? ini0.tareas[0].t : 'la actividad'; // no usar S aquí: hilos() se llama al crear S
    return [
      { av: 'CA', st: 'background:#E3ECF8;color:#063A86', n: 'Coordinación Académica', s: 'Entrega de planillas del periodo', tm: '9:05', u: 1, h: 'Coordinación Académica · Institucional',
        ms: [['in', `Buen día, ${ME.trato || 'docente'}. Recuerde cargar las planillas de calificaciones antes del viernes.`]] },
      { av: ini(e1), st: 'background:#0A58CA;color:#fff', n: e1, s: `Duda sobre ${t0.toLowerCase()}`, tm: '8:41', u: 1, h: `${e1} · ${g1}`,
        ms: [['in', `Buenos días, ${ME.trato || 'profe'}. ¿La entrega de “${t0}” es individual o en parejas?`]] },
      { av: ini(ac), st: 'background:#FFD166;color:#063A86', n: `Acudiente de ${ac}`, s: 'Solicitud de reunión', tm: 'Ayer', u: 0, h: `Acudiente de ${ac} · ${g1}`,
        ms: [['in', 'Quisiera conocer el avance de mi hijo/a. ¿Podríamos coordinar una breve reunión?'], ['out', 'Con gusto. Puede acercarse el jueves en el horario de atención.']] },
      { av: ini(e2), st: 'background:#063A86;color:#fff', n: e2, s: 'Entrega fuera de plazo', tm: 'Lun', u: 0, h: `${e2} · ${g2}`,
        ms: [['in', 'Disculpe, no pude subir el taller a tiempo por un problema de conexión.'], ['out', 'Tranquilo/a. Envíelo hoy y lo recibo con observación.']] },
      { av: 'SC', st: 'background:#E3ECF8;color:#063A86', n: 'Secretaría Académica', s: 'Reporte de asistencia mensual', tm: 'Vie', u: 0, h: 'Secretaría · Institucional',
        ms: [['in', 'Se abrió el formulario del reporte mensual de asistencia por grupo.']] }
    ];
  }

  /* ---------- Entregas y conteos (derivados de forma estable) ---------- */
  function entregasDe(t) {
    const c = claseObj(t.claseId);
    const orden = rosterDe(c).map((s) => [azar(semilla(t.id + s.uid))(), s]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    const notas = S.d.notas[t.id] || {};
    return orden.map((s, i) => {
      const rnd = azar(semilla(t.id + s.uid + 'n'));
      const propia = notas[s.uid];
      const entrego = i < t.e0;
      const base = entrego && i < t.c0;
      const apellido = s.nombre.split(' ').slice(-1)[0];
      return {
        uid: s.uid, nombre: s.nombre, entrego,
        archivo: entrego ? `Trabajo_${apellido}.pdf` : '',
        score: propia ? propia.score : base ? +(3 + rnd() * 2).toFixed(1) : null,
        feedback: propia ? propia.feedback : '',
        estado: !entrego ? 'sin' : (propia || base) ? 'calificada' : 'entregada'
      };
    });
  }
  function conteo(t) {
    const L = entregasDe(t);
    return { total: L.length, entregas: L.filter((x) => x.entrego).length, calificadas: L.filter((x) => x.estado === 'calificada').length };
  }
  const columna = (t) => {
    if (t.estado === 'borrador') return 0;
    const k = conteo(t);
    if (k.entregas > k.calificadas) return 2;
    return t.estado === 'cerrada' ? 3 : 1;
  };
  const porCalificar = () => S.d.tareas.reduce((a, t) => { if (t.estado === 'borrador') return a; const k = conteo(t); return a + (k.entregas - k.calificadas); }, 0);
  const tareasDeClase = (id) => S.d.tareas.filter((t) => t.claseId === id);
  const pendientesDeClase = (id) => tareasDeClase(id).reduce((a, t) => { if (t.estado === 'borrador') return a; const k = conteo(t); return a + k.entregas - k.calificadas; }, 0);

  /* ---------- Vistas ---------- */
  const stat = (ic, n, l, kind) => `<article class="home-stat"><span class="home-stat__icon ${kind}">${ico(ic)}</span><div><strong>${n}</strong><span>${l}</span></div></article>`;
  const avatar = (txt, cls = 'lesson-student-avatar') => `<span class="av ${cls}">${esc(txt)}</span>`;

  const V = {
    inicio() {
      const pend = S.d.tareas.filter((t) => t.estado !== 'borrador').map((t) => ({ t, k: conteo(t) }))
        .filter((x) => x.k.entregas > x.k.calificadas).sort((a, b) => (b.k.entregas - b.k.calificadas) - (a.k.entregas - a.k.calificadas));
      const grupos = new Set(S.clases.map((c) => c[10].grupo)).size;
      const agenda = agendaHoy();
      const sinLeer = S.th.filter((x) => x.u).length;
      return `<section class="home-top"><div class="home-welcome"><span class="eyebrow"><span class="eyebrow__dot"></span> AULA VIRTUAL · DOCENTE</span><h1 class="s">Hola. <span class="home-wave">✦</span></h1><p>Un buen día para acompañar a tus grupos. Aquí tienes lo más importante de tu semana.</p></div><div class="home-tools"><label class="srch home-search">${ico('buscar')}<input id="gs" placeholder="Buscar una tarea…" aria-label="Buscar tareas"></label><span id="current-date" class="home-date"></span></div></section>
<section class="home-hero"><div class="home-hero__copy"><span class="home-hero__tag"><span class="home-live-dot"></span> TU JORNADA DOCENTE</span><h2 class="s">Cada clase cuenta.</h2><p>Revisa entregas, registra asistencia y mantén a tus grupos al día.</p><div class="home-hero__actions"><button class="home-primary" data-go="tareas">Revisar entregas <span aria-hidden="true">↗</span></button><button class="home-secondary" data-go="clases">Ver mis grupos</button></div></div><div class="home-hero__art" aria-hidden="true"><div class="orbit orbit--one"></div><div class="orbit orbit--two"></div><div class="home-book"><span>IE</span><i></i><i></i><i></i></div><span class="art-star art-star--one">✦</span><span class="art-star art-star--two">✧</span><span class="art-note">ENSEÑAR<br/>· INSPIRAR ·</span></div><div class="home-hero__foot"><span><b>Institución Educativa</b> Ciudad de Tunja</span><span>Conocimiento que abre caminos</span></div></section>
<section class="home-stats" aria-label="Resumen docente">${stat('clases', grupos, 'Grupos a cargo', 'blue')}${stat('tareas', porCalificar(), 'Entregas por calificar', 'gold')}${stat('mensajes', sinLeer, 'Mensajes nuevos', 'sky')}${stat('horario', ME.asistencia + '%', 'Asistencia promedio', 'navy')}</section>
<section class="home-content"><div class="home-panel home-tasks"><div class="home-panel__head"><div><span class="home-kicker">PARA REVISAR</span><h2 class="s">Por calificar</h2><p>${pend.length ? `${pend.length} actividad${pend.length > 1 ? 'es' : ''} con entregas pendientes` : 'No tienes entregas pendientes'}</p></div><button class="home-text-link" data-go="tareas">Ver todas <span aria-hidden="true">→</span></button></div>
${pend.slice(0, 4).map(({ t, k }) => `<article class="home-task"><span class="home-stat__icon blue">${ico('tareas')}</span><div class="home-task__body"><strong>${esc(t.t)}</strong><span>${esc(nombreClase(claseObj(t.claseId)))} · ${k.entregas - k.calificadas} sin calificar</span></div><button class="home-text-link" data-t="grade" data-id="${t.id}">Calificar <span aria-hidden="true">→</span></button></article>`).join('') || '<div class="home-empty"><span>✓</span><b>¡Todo calificado!</b><p>No hay entregas pendientes por ahora.</p></div>'}
<div class="home-panel__foot"><span class="home-foot-dot"></span> Las calificaciones de esta demostración se guardan solo en tu navegador.</div></div>
<div class="home-side-stack"><div class="home-panel home-agenda"><div class="home-panel__head"><div><span class="home-kicker">TUS CLASES DE HOY</span><h2 class="s">Horario de hoy</h2></div><button class="home-round-link" data-go="horario" aria-label="Ver horario completo">↗</button></div><div class="home-agenda__list">${agenda.map(([time, name, room, status]) => `<article class="home-agenda__item ${status === 'active' ? 'is-active' : ''} ${status === 'done' ? 'is-done' : ''}"><div class="home-agenda__time">${time}</div><span class="home-agenda__line"><i></i></span><div class="home-agenda__details"><strong>${esc(name)}</strong><span>${esc(room)}</span></div>${status === 'active' ? '<span class="home-now">EN CLASE</span>' : ''}</article>`).join('') || '<p class="lesson-muted" style="padding:8px 4px">Hoy no tienes clases programadas.</p>'}</div><button class="home-agenda__all" data-go="horario">Ver semana completa <span>→</span></button></div>
<div class="home-quote"><span class="home-quote__mark">“</span><p>Enseñar es sembrar hoy lo que otros cosecharán mañana.</p><span class="home-quote__source">UN GRUPO A LA VEZ · UNA CLASE A LA VEZ</span><span class="home-quote__spark" aria-hidden="true">✳</span></div></div></section>
<div class="home-bottom-note"><span class="home-bottom-note__icon">i</span><p><b>Recuerda:</b> esta plataforma es una demostración. Los grupos, estudiantes y entregas mostrados son datos de ejemplo.</p></div>`;
    },

    clases() {
      const q = S.cq.toLowerCase();
      const L = S.clases.filter((c) => !q || (c[0] + ' ' + c[1]).toLowerCase().includes(q));
      return `<div class="hd"><div><h1 class="s">Mis grupos</h1><p class="sub">Las clases y grupos que tienes asignados.</p></div><div class="class-tools"><label class="srch">${ico('buscar')}<input id="cq" placeholder="Buscar grupo o asignatura…" value="${esc(S.cq)}" aria-label="Buscar grupo"></label></div></div>
<div class="grid3 class-grid">${L.map((c) => {
        const k = c[10], n = rosterDe(k).length, pend = pendientesDeClase(k.id), i = S.clases.indexOf(c);
        return `<article class="cl class-card" role="button" tabindex="0" data-class-open="${i}" aria-label="Abrir aula de ${esc(c[0])}"><div class="cb" style="${c[5]}"><span class="chip" style="${c[6]}">${esc(c[2])}</span><span class="s class-symbol">${c[7]}</span></div><div class="class-card__body"><h3 class="s">${esc(c[0])}</h3><div class="class-teacher">${n} estudiantes · ${esc(c[1])}</div><div class="pg" role="progressbar" aria-label="Avance de ${esc(c[0])}" aria-valuenow="${c[3]}" aria-valuemin="0" aria-valuemax="100"><i style="width:${c[3]}%"></i></div><div class="class-progress-label"><span>Unidad ${c[4]} de 6</span><strong>${c[3]}%</strong></div><div class="class-card__foot"><span>${pend ? `${pend} por calificar` : 'Todo al día'}</span><span aria-hidden="true">↗</span></div></div></article>`;
      }).join('') || '<div class="card class-empty"><b>No encontramos grupos</b><p>Prueba con otro nombre.</p></div>'}</div>`;
    },

    clase() {
      const c = S.clases[S.classIndex] || S.clases[0];
      const k = c[10], R = rosterDe(k), id = k.id, tareas = tareasDeClase(id), pend = pendientesDeClase(id);
      const tabs = [['anuncios', 'Anuncios'], ['tareas', 'Tareas'], ['materiales', 'Materiales'], ['participantes', 'Participantes'], ['asistencia', 'Asistencia']];
      let body = '';

      if (S.classTab === 'anuncios') {
        const posts = S.d.anuncios[id] || [
          { cuando: 'Hace 2 horas', texto: `Ya está disponible el material de ${k.materia}. Revisen los criterios de trabajo antes de la próxima clase.` },
          { cuando: 'Ayer', texto: `Recuerden traer sus materiales y repasar los conceptos vistos en la última sesión de ${k.materia}.` }
        ];
        body = `<article class="card composer"><label class="lesson-kicker" for="ann-text">NUEVO ANUNCIO PARA ${esc(grupoDe(k))}</label><textarea id="ann-text" class="submission-comment" rows="3" maxlength="600" placeholder="Escribe un anuncio para el grupo…"></textarea><div class="dialog-actions" style="margin-top:14px"><button class="submission-confirm" data-t="post">Publicar anuncio</button></div></article>
<div class="lesson-posts">${posts.map((a) => `<article class="card lesson-post"><div class="lesson-post__by">${avatar(ini(ME.nombre), 'lesson-teacher-avatar')}<div><b>${esc(ME.nombre)}</b><span>${esc(a.cuando)}</span></div></div><p>${esc(a.texto)}</p></article>`).join('')}</div>`;
      }

      if (S.classTab === 'tareas') {
        body = `<div class="lesson-posts"><div class="lesson-bar"><h2 class="h">Tareas de esta clase</h2><button class="submission-confirm" data-t="new-task" data-c="${id}">+ Nueva tarea</button></div>
${tareas.map((t) => {
          const q = conteo(t);
          return `<article class="card lesson-assignment"><div><span class="lesson-kicker">${t.estado === 'borrador' ? 'BORRADOR' : t.estado === 'cerrada' ? 'CERRADA' : 'ABIERTA'}</span><h2 class="s">${esc(t.t)}</h2><div class="pg" aria-hidden="true"><i style="width:${pct(q.entregas, q.total)}%"></i></div><div class="lesson-chips"><span class="chip chip-gold">Vence ${esc(t.due)}</span><span class="chip">${q.entregas}/${q.total} entregas</span><span class="chip">${q.calificadas} calificadas</span><span class="chip">${t.max}.0 puntos</span></div></div>${t.estado === 'borrador' ? `<button class="lesson-primary" data-t="publish" data-id="${t.id}">Publicar tarea <span>→</span></button>` : `<button class="lesson-primary" data-t="grade" data-id="${t.id}">${q.entregas > q.calificadas ? 'Calificar entregas' : 'Ver entregas'} <span>→</span></button>`}</article>`;
        }).join('') || '<div class="card class-empty"><b>Aún no hay tareas</b><p>Crea la primera con “Nueva tarea”.</p></div>'}</div>`;
      }

      if (S.classTab === 'materiales') {
        const mats = S.d.materiales[id] || [{ n: `Guía de ${k.materia}`, ext: 'PDF', info: 'Material de demostración' }, { n: 'Base de datos de práctica', ext: 'XLS', info: 'Material de demostración' }];
        body = `<div class="card lesson-materials"><div class="lesson-bar"><h2 class="h">Materiales de la clase</h2><label class="submission-confirm file-btn" for="mat-file">+ Añadir material</label><input id="mat-file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" hidden></div>
${mats.map((m) => `<div class="lesson-file"><span class="lesson-file__type ${/XLS/i.test(m.ext) ? 'xls' : 'pdf'}">${esc(m.ext)}</span><span><b>${esc(m.n)}</b><small>${esc(m.info)}</small></span></div>`).join('')}
<p class="lesson-muted">Demostración: los archivos no se suben a un servidor; solo se registra su nombre en este navegador.</p></div>`;
      }

      if (S.classTab === 'participantes') {
        body = `<div class="card lesson-people"><h2 class="h">Participantes · ${R.length} estudiantes</h2><div class="lesson-person">${avatar(ini(ME.nombre), 'lesson-teacher-avatar')}<span><b>${esc(ME.nombre)}</b><small>Docente de la asignatura</small></span><span class="lesson-person-tag">DOCENTE</span></div>
${R.map((s) => `<div class="lesson-person">${avatar(ini(s.nombre))}<span><b>${esc(s.nombre)}</b><small>Estudiante · Grado ${esc(grupoDe(k))}</small></span></div>`).join('')}
<p class="lesson-muted">Listado ficticio; no representa un listado institucional real.</p></div>`;
      }

      if (S.classTab === 'asistencia') {
        const hoy = hoyKey();
        const reg = ((S.d.asistencia[id] = S.d.asistencia[id] || {})[hoy] = S.d.asistencia[id][hoy] || { m: {}, guardada: false });
        const mark = (uid) => reg.m[uid] || 'P';
        const cnt = { P: 0, A: 0, T: 0 };
        R.forEach((s) => cnt[mark(s.uid)]++);
        const fecha = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
        body = `<div class="card lesson-people"><div class="lesson-bar"><div><h2 class="h">Asistencia</h2><p class="lesson-muted" style="margin:4px 0 0;text-transform:capitalize">${esc(fecha)}</p></div><div class="att-summary"><span class="chip" style="background:#E3F5EA;color:#16734A">${cnt.P} presentes</span><span class="chip" style="background:#FDE8E8;color:#B42318">${cnt.A} ausentes</span><span class="chip" style="background:#FFF3D1;color:#6B4E00">${cnt.T} tarde</span></div></div>
<div class="att-tools"><button class="pill" data-t="att-all">Marcar todos presentes</button>${reg.guardada ? '<span class="chip" style="background:#E3F5EA;color:#16734A">✓ Guardada</span>' : ''}</div>
${R.map((s) => `<div class="lesson-person att-row">${avatar(ini(s.nombre))}<span><b>${esc(s.nombre)}</b></span><div class="att-group" role="group" aria-label="Asistencia de ${esc(s.nombre)}">${[['P', 'Presente'], ['T', 'Tarde'], ['A', 'Ausente']].map(([v, l]) => `<button class="att-btn att-${v} ${mark(s.uid) === v ? 'on' : ''}" data-t="att" data-uid="${s.uid}" data-v="${v}" aria-pressed="${mark(s.uid) === v}" title="${l}">${v}</button>`).join('')}</div></div>`).join('')}
<div class="dialog-actions"><button class="submission-confirm" data-t="att-save">Guardar asistencia</button></div></div>`;
      }

      return `<section class="lesson-page"><button class="lesson-back" data-act="back-classes"><span aria-hidden="true">←</span><span>Volver a Mis grupos</span></button>
<header class="lesson-hero"><div class="lesson-hero__symbol s">${esc(c[7])}</div><div class="lesson-hero__copy"><span class="chip lesson-grade">${esc(grupoDe(k))}</span><h1 class="s">${esc(k.materia)}</h1><div class="lesson-meta"><span>${R.length} estudiantes</span><span>${esc(c[2])}</span><span>${esc(c[1])}</span></div></div><div class="lesson-hero__decor" aria-hidden="true"></div></header>
<nav class="lesson-tabs" aria-label="Secciones de la clase">${tabs.map(([t, l]) => `<button class="tb ${S.classTab === t ? 'on' : ''}" data-class-tab="${t}" aria-pressed="${S.classTab === t}">${l}</button>`).join('')}</nav>
<div class="lesson-layout"><section class="lesson-main">${body}</section><div class="lesson-aside"><article class="card lesson-next"><span class="lesson-kicker">POR CALIFICAR</span><h2 class="s">${pend} entrega${pend === 1 ? '' : 's'}</h2><p>${pend ? 'Hay trabajos de este grupo esperando tu revisión.' : 'No hay entregas pendientes en este grupo.'}</p><button class="lesson-primary" data-t="grade-next" data-c="${id}">${pend ? 'Revisar entregas' : 'Ver tareas'} <span>→</span></button></article>
<article class="card"><h2 class="h" style="margin-bottom:6px">Resumen del grupo</h2><div class="f"><span>Estudiantes</span><b>${R.length}</b></div><div class="f"><span>Tareas abiertas</span><b>${tareas.filter((t) => t.estado === 'abierta').length}</b></div><div class="f"><span>Avance del curso</span><b>${c[3]}%</b></div></article>
<p class="lesson-demo-note">Aula de ejemplo. Estudiantes, entregas y calificaciones son datos simulados.</p></div></div></section>`;
    },

    tareas() {
      const q = S.tq.toLowerCase();
      const cols = ['Borradores', 'Abiertas', 'Por calificar', 'Calificadas'];
      const bg = [['#E3ECF8', '#063A86'], ['#DCE7F8', '#0A58CA'], ['#FFD166', '#063A86'], ['#063A86', '#fff']];
      return `<div class="hd"><div><h1 class="s">Tareas</h1><p class="sub">Seguimiento de las actividades de tus grupos.</p></div><div class="class-tools"><label class="srch">${ico('buscar')}<input id="tq" placeholder="Buscar tareas" value="${esc(S.tq)}"></label><button class="submission-confirm" data-t="new-task">+ Nueva tarea</button></div></div>
<div class="grid4" style="align-items:start">${cols.map((nombre, ci) => {
        const L = S.d.tareas.filter((t) => columna(t) === ci && (!q || (t.t + nombreClase(claseObj(t.claseId))).toLowerCase().includes(q)));
        return `<div class="col"><div class="ch"><span class="s" style="font-size:20px;color:var(--navy);font-weight:500">${nombre}</span><span class="chip" style="background:${bg[ci][0]};color:${bg[ci][1]}">${S.d.tareas.filter((t) => columna(t) === ci).length}</span></div>
${L.map((t) => {
          const k = conteo(t), cl = claseObj(t.claseId), pen = k.entregas - k.calificadas;
          const accion = ci === 0 ? ['publish', 'Publicar'] : ci === 2 ? ['grade', `Calificar ${pen}`] : ['grade', 'Ver entregas'];
          return `<div class="ct ct-static"><span class="chip" style="background:#E8F0FC;color:#0A58CA">${esc(nombreClase(cl))}</span><div style="font-weight:700;color:var(--navy);font-size:16px;line-height:1.35;margin-top:12px">${esc(t.t)}</div>${ci === 0 ? '' : `<div class="pg" aria-hidden="true"><i style="width:${pct(k.entregas, k.total)}%"></i></div>`}<div class="ft"><span>${ci === 0 ? 'Sin publicar' : 'Vence ' + esc(t.due)}</span><span style="color:var(--blue)">${ci === 0 ? '—' : `${k.entregas}/${k.total}`}</span></div><button data-t="${accion[0]}" data-id="${t.id}" style="margin-top:14px;font-size:13px;font-weight:700;color:var(--blue)">${accion[1]} →</button></div>`;
        }).join('') || '<p style="color:var(--mut);padding:12px 8px;font-size:14px">Sin tareas.</p>'}</div>`;
      }).join('')}</div>`;
    }
  };

  /* ---------- Diálogos ---------- */
  function cerrarDlg() { document.getElementById('docente-dialog')?.remove(); }
  function abrirDlg(html) {
    cerrarDlg();
    const o = document.createElement('div');
    o.id = 'docente-dialog'; o.className = 'dialog-backdrop'; o.innerHTML = html;
    document.body.appendChild(o);
    (o.querySelector('[autofocus],input:not([type=hidden]),textarea,select') || o.querySelector('button'))?.focus();
  }

  function dlgNuevaTarea(claseId) {
    const d = new Date(); d.setDate(d.getDate() + 7);
    const por = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    abrirDlg(`<form class="submission-dialog" id="task-form" aria-labelledby="task-title"><div class="submission-head"><div><span class="chip submission-subject">NUEVA ACTIVIDAD</span><h2 id="task-title" class="s">Crear tarea</h2></div><button type="button" class="dialog-close" data-t="close-dlg" aria-label="Cerrar">×</button></div>
<label class="lesson-kicker" for="tf-clase">GRUPO</label><select id="tf-clase" name="claseId" class="field-input">${S.clases.map((c) => `<option value="${c[10].id}" ${c[10].id === claseId ? 'selected' : ''}>${esc(c[0])}</option>`).join('')}</select>
<label class="lesson-kicker field-gap" for="tf-titulo">TÍTULO</label><input id="tf-titulo" name="titulo" class="field-input" maxlength="80" required placeholder="Ej: Taller de fracciones">
<label class="lesson-kicker field-gap" for="tf-desc">INSTRUCCIONES</label><textarea id="tf-desc" name="desc" class="submission-comment" rows="3" maxlength="800" placeholder="Describe lo que deben entregar…"></textarea>
<div class="two-cols"><div><label class="lesson-kicker field-gap" for="tf-fecha">FECHA DE ENTREGA</label><input id="tf-fecha" name="fecha" type="date" class="field-input" required value="${por}"></div><div><label class="lesson-kicker field-gap" for="tf-max">VALOR</label><select id="tf-max" name="max" class="field-input"><option value="5" selected>5.0 puntos</option><option value="10">10.0 puntos</option></select></div></div>
<label class="check-row"><input type="checkbox" name="publicar" checked> Publicar ahora para los estudiantes</label>
<p class="submission-disclaimer">Demostración local: la tarea se guarda solo en este navegador.</p>
<div class="dialog-actions"><button type="button" class="pill" data-t="close-dlg">Cancelar</button><button type="submit" class="submission-confirm">Crear tarea</button></div></form>`);
  }

  function dlgCalificar(taskId) {
    const t = S.d.tareas.find((x) => x.id === taskId);
    if (!t) return;
    const cl = claseObj(t.claseId), k = conteo(t);
    const orden = { entregada: 0, calificada: 1, sin: 2 };
    const L = entregasDe(t).sort((a, b) => orden[a.estado] - orden[b.estado]);
    abrirDlg(`<form class="submission-dialog grade-dialog" id="grade-form" data-id="${t.id}" aria-labelledby="grade-title"><div class="submission-head"><div><span class="chip submission-subject">${esc(nombreClase(cl))}</span><h2 id="grade-title" class="s">Entregas</h2></div><button type="button" class="dialog-close" data-t="close-dlg" aria-label="Cerrar">×</button></div>
<div class="submission-summary"><b>${esc(t.t)}</b><p>${k.entregas} de ${k.total} estudiantes entregaron · ${k.calificadas} calificadas · valor ${t.max}.0 puntos · vence ${esc(t.due)}.</p></div>
<div class="gr-list">${L.map((e) => e.entrego ? `<div class="gr-row"><div class="gr-who">${avatar(ini(e.nombre))}<span><b>${esc(e.nombre)}</b><small>${esc(e.archivo)} · ${e.estado === 'calificada' ? 'Calificada' : 'Por calificar'}</small></span></div><label class="sr-only" for="sc-${e.uid}">Nota de ${esc(e.nombre)}</label><input id="sc-${e.uid}" name="sc-${e.uid}" class="gr-score" type="number" min="0" max="${t.max}" step="0.1" inputmode="decimal" placeholder="0–${t.max}" value="${e.score ?? ''}"><label class="sr-only" for="fb-${e.uid}">Comentario para ${esc(e.nombre)}</label><input id="fb-${e.uid}" name="fb-${e.uid}" class="gr-fb" maxlength="200" placeholder="Comentario (opcional)" value="${esc(e.feedback || '')}"></div>` : `<div class="gr-row gr-row--none"><div class="gr-who">${avatar(ini(e.nombre))}<span><b>${esc(e.nombre)}</b><small>Sin entregar</small></span></div></div>`).join('')}</div>
<p class="submission-disclaimer">Demostración local: las calificaciones se guardan solo en este navegador y no llegan a los estudiantes.</p>
<div class="dialog-actions">${t.estado === 'abierta' && k.entregas === k.calificadas ? `<button type="button" class="pill" data-t="close-task" data-id="${t.id}">Cerrar tarea</button>` : ''}<button type="button" class="pill" data-t="close-dlg">Cancelar</button><button type="submit" class="submission-confirm">Guardar calificaciones</button></div></form>`);
  }

  /* ---------- Acciones ---------- */
  function primeraPendiente(claseId) {
    return S.d.tareas.find((t) => (!claseId || t.claseId === claseId) && t.estado !== 'borrador' && (() => { const k = conteo(t); return k.entregas > k.calificadas; })());
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-t]');
    if (el && ME.rol === 'docente') {
      const d = el.dataset;
      switch (d.t) {
        case 'close-dlg': cerrarDlg(); break;
        case 'new-task': dlgNuevaTarea(d.c || (S.v === 'clase' && S.clases[S.classIndex] ? S.clases[S.classIndex][10].id : '')); break;
        case 'grade': dlgCalificar(d.id); break;
        case 'grade-next': {
          const t = primeraPendiente(d.c);
          if (t) dlgCalificar(t.id); else { S.classTab = 'tareas'; render(); notify('No hay entregas pendientes en este grupo.'); }
          break;
        }
        case 'publish': {
          const t = S.d.tareas.find((x) => x.id === d.id);
          if (t) { t.estado = 'abierta'; if (t.due === '—') t.due = fechaCorta(hoyKey()); render(); notify('Tarea publicada (demostración).'); }
          break;
        }
        case 'close-task': {
          const t = S.d.tareas.find((x) => x.id === d.id);
          if (t) { t.estado = 'cerrada'; cerrarDlg(); render(); notify('Tarea cerrada.'); }
          break;
        }
        case 'post': {
          const ta = document.getElementById('ann-text'), txt = ta && ta.value.trim();
          if (!txt) { ta && ta.focus(); notify('Escribe el anuncio antes de publicarlo.'); break; }
          const id = S.clases[S.classIndex][10].id;
          (S.d.anuncios[id] = S.d.anuncios[id] || [
            { cuando: 'Hace 2 horas', texto: `Ya está disponible el material de ${S.clases[S.classIndex][10].materia}. Revisen los criterios de trabajo antes de la próxima clase.` },
            { cuando: 'Ayer', texto: `Recuerden traer sus materiales y repasar los conceptos vistos en la última sesión de ${S.clases[S.classIndex][10].materia}.` }
          ]).unshift({ cuando: 'Ahora', texto: txt.slice(0, 600) });
          render(); notify('Anuncio publicado en esta demostración.');
          break;
        }
        case 'att': {
          const id = S.clases[S.classIndex][10].id, reg = S.d.asistencia[id][hoyKey()];
          reg.m[d.uid] = d.v; reg.guardada = false; render();
          break;
        }
        case 'att-all': {
          const id = S.clases[S.classIndex][10].id;
          S.d.asistencia[id][hoyKey()] = { m: {}, guardada: false }; render();
          break;
        }
        case 'att-save': {
          const id = S.clases[S.classIndex][10].id, reg = S.d.asistencia[id][hoyKey()];
          reg.guardada = true; render();
          const R = rosterDe(S.clases[S.classIndex][10]), a = R.filter((s) => reg.m[s.uid] === 'A').length;
          notify(`Asistencia guardada: ${R.length - a} presentes y ${a} ausentes (demostración).`);
          break;
        }
      }
      return;
    }
    if (e.target.id === 'docente-dialog') cerrarDlg();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarDlg(); });

  document.addEventListener('change', (e) => {
    if (e.target.id !== 'mat-file' || ME.rol !== 'docente') return;
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { notify('El archivo supera 20 MB.'); return; }
    const id = S.clases[S.classIndex][10].id;
    const ext = (f.name.split('.').pop() || 'FILE').toUpperCase().slice(0, 4);
    (S.d.materiales[id] = S.d.materiales[id] || [{ n: `Guía de ${S.clases[S.classIndex][10].materia}`, ext: 'PDF', info: 'Material de demostración' }, { n: 'Base de datos de práctica', ext: 'XLS', info: 'Material de demostración' }])
      .unshift({ n: f.name, ext, info: `${Math.max(1, Math.round(f.size / 1024))} KB · añadido ahora (no se sube)` });
    render(); notify('Material registrado (demostración: el archivo no se sube).');
  });

  document.addEventListener('submit', (e) => {
    if (ME.rol !== 'docente') return;
    if (e.target.id === 'task-form') {
      e.preventDefault();
      const f = e.target.elements, titulo = f.titulo.value.trim();
      if (!titulo) { f.titulo.focus(); return; }
      S.d.tareas.unshift({ id: 't' + Date.now().toString(36), claseId: f.claseId.value, t: titulo, due: fechaCorta(f.fecha.value), estado: f.publicar.checked ? 'abierta' : 'borrador', e0: 0, c0: 0, max: +f.max.value, desc: f.desc.value.trim() });
      cerrarDlg(); render(); notify(f.publicar.checked ? 'Tarea creada y publicada (demostración).' : 'Tarea guardada como borrador.');
    }
    if (e.target.id === 'grade-form') {
      e.preventDefault();
      const t = S.d.tareas.find((x) => x.id === e.target.dataset.id);
      if (!t) return;
      const f = e.target.elements, previo = entregasDe(t);
      const nuevas = {};
      let n = 0;
      for (const e1 of previo) {
        if (!e1.entrego) continue;
        const sc = f['sc-' + e1.uid], fb = f['fb-' + e1.uid];
        const raw = sc.value.trim();
        if (raw === '') continue;
        const v = Math.round(parseFloat(raw.replace(',', '.')) * 10) / 10;
        if (!(v >= 0 && v <= t.max)) { notify(`La nota de ${e1.nombre} debe estar entre 0 y ${t.max}.`); sc.focus(); return; }
        if (e1.score !== v || (e1.feedback || '') !== fb.value.trim()) { nuevas[e1.uid] = { score: v, feedback: fb.value.trim().slice(0, 200) }; n++; }
      }
      S.d.notas[t.id] = Object.assign(S.d.notas[t.id] || {}, nuevas);
      cerrarDlg(); render(); notify(n ? `${n} calificación${n > 1 ? 'es' : ''} guardada${n > 1 ? 's' : ''} (demostración).` : 'No hubo cambios que guardar.');
    }
  });

  return { V, estadoInicial, hilos, porCalificar };
})();
