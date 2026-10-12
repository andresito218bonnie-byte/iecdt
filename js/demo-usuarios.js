/* =========================================================
   demo-usuarios.js — DIRECTORIO FICTICIO de demostración.

   Lo cargan login.html (para saber quién entra y a dónde enviarlo)
   y plataforma.html (para mostrar su nombre, grado, clases, etc.).

   ► Todas las personas, correos y teléfonos son inventados.
   ► NO es seguridad: cualquiera que abra este archivo ve todo.
     Cuando se conecte Firebase, este archivo se reemplaza por
     Authentication + Firestore (ver docs/sesion-y-roles.md).

   Está organizado como el modelo de docs/modelo-datos.md
   (users, userRoles, classrooms) para que migrar sea directo.
   ========================================================= */
window.IE_DEMO = (() => {
  'use strict';

  /* ---------- Grupos (grado + letra) ---------- */
  const GRUPOS = {
    '11A': { grado: '11', grupo: 'A', alumnos: 30, director: 'docente.ctorres' },
    '10A': { grado: '10', grupo: 'A', alumnos: 28, director: 'docente.lgomez' },
    '9A':  { grado: '9',  grupo: 'A', alumnos: 32, director: null },
    '9B':  { grado: '9',  grupo: 'B', alumnos: 30, director: null }
  };

  /* ---------- Usuarios (clave = usuario en minúsculas) ---------- */
  const USUARIOS = {
    '2027.jperez': {
      uid: 'est-0001', usuario: '2027.jperez', nombre: 'Juan Pérez', rol: 'estudiante',
      grado: '11', grupo: 'A', correo: 'jperez@institucion.edu.co',
      acudiente: 'Marta Pérez (demo)', telefono: '300 000 0001', asistencia: 96
    },
    '2027.mcardenas': {
      uid: 'est-0002', usuario: '2027.mcardenas', nombre: 'María José Cárdenas', rol: 'estudiante',
      grado: '11', grupo: 'A', correo: 'mcardenas@institucion.edu.co',
      acudiente: 'Luis Cárdenas (demo)', telefono: '300 000 0002', asistencia: 98
    },
    'docente.lgomez': {
      uid: 'doc-0001', usuario: 'docente.lgomez', nombre: 'Laura Gómez', rol: 'docente', trato: 'profesora',
      area: 'Matemáticas y Estadística', correo: 'lgomez@institucion.edu.co', directorDe: '10A', asistencia: 94
    },
    'docente.arojas': {
      uid: 'doc-0002', usuario: 'docente.arojas', nombre: 'Andrés Rojas', rol: 'docente', trato: 'profesor',
      area: 'Ciencias Naturales', correo: 'arojas@institucion.edu.co', directorDe: null, asistencia: 93
    },
    'docente.ctorres': {
      uid: 'doc-0003', usuario: 'docente.ctorres', nombre: 'Camila Torres', rol: 'docente', trato: 'profesora',
      area: 'Lengua Castellana', correo: 'ctorres@institucion.edu.co', directorDe: '11A', asistencia: 95
    },
    'docente.msuarez': {
      uid: 'doc-0004', usuario: 'docente.msuarez', nombre: 'Michael Suárez', rol: 'docente', trato: 'profesor',
      area: 'Inglés', correo: 'msuarez@institucion.edu.co', directorDe: null, asistencia: 92
    },
    'docente.jsalinas': {
      uid: 'doc-0005', usuario: 'docente.jsalinas', nombre: 'Jorge Salinas', rol: 'docente', trato: 'profesor',
      area: 'Educación Física', correo: 'jsalinas@institucion.edu.co', directorDe: null, asistencia: 97
    }
  };

  /* ---------- Clases (classrooms) ----------
     sesiones: [día 0=lunes…4=viernes, hora 7…12]. La hora 9 es descanso. */
  const ESTILO = {
    est: ['background:#0A58CA;color:#fff', 'background:#FFD166;color:#063A86', '∑'],
    cie: ['background:#063A86;color:#fff', 'background:rgba(255,255,255,.16)', '⚗'],
    efi: ['background:#FFD166;color:#063A86', 'background:rgba(6,58,134,.12)', '●'],
    mat: ['background:#E8F0FC;color:#0A58CA', 'background:#fff', '÷'],
    len: ['background:#DCE7F8;color:#063A86', 'background:#fff', 'Aa'],
    ing: ['background:#0A58CA;color:#fff', 'background:#FFD166;color:#063A86', 'En']
  };
  const clase = (id, materia, grupo, aula, docente, est, sesiones, avance, unidad) =>
    ({ id, materia, grupo, aula, docente, estilo: ESTILO[est], sesiones, avance, unidad });

  const CLASES = [
    clase('est-11A', 'Estadística',       '11A', 'Aula 108', 'docente.lgomez',   'est', [[0, 10], [2, 10], [1, 11], [3, 11]],         68, 4),
    clase('cie-11A', 'Ciencias Naturales', '11A', 'Aula 204', 'docente.arojas',   'cie', [[3, 7], [0, 8], [1, 10], [4, 10]],           55, 4),
    clase('efi-11A', 'Educación Física',   '11A', 'Coliseo',   'docente.jsalinas', 'efi', [[0, 12], [2, 12]],                           80, 5),
    clase('mat-11A', 'Matemáticas',        '11A', 'Aula 110', 'docente.lgomez',   'mat', [[0, 7], [2, 7], [1, 8], [3, 8], [4, 11]],    62, 4),
    clase('len-11A', 'Lengua Castellana',  '11A', 'Aula 102', 'docente.ctorres',  'len', [[1, 7], [4, 7], [2, 8], [3, 10]],            48, 3),
    clase('ing-11A', 'Inglés',             '11A', 'Aula 301', 'docente.msuarez',  'ing', [[4, 8], [0, 11], [2, 11]],                   71, 4),
    // Otros grupos de la profesora Gómez (sin choques con sus clases de 11°A)
    clase('mat-10A', 'Matemáticas',        '10A', 'Aula 301', 'docente.lgomez',   'mat', [[0, 8], [2, 8], [4, 8]],                     58, 3),
    clase('mat-9A',  'Matemáticas',        '9A',  'Aula 204', 'docente.lgomez',   'mat', [[1, 7], [3, 7], [4, 7]],                     64, 4),
    clase('mat-9B',  'Matemáticas',        '9B',  'Aula 205', 'docente.lgomez',   'mat', [[0, 11], [2, 11], [4, 10]],                  60, 4)
  ];

  /* ---------- Listados de estudiantes (ficticios, estables) ---------- */
  const NOMBRES = ['Sofía', 'Mateo', 'Valentina', 'Santiago', 'Camila', 'Samuel', 'Isabella', 'Emiliano', 'Mariana', 'Tomás',
    'Daniela', 'Nicolás', 'Gabriela', 'Sebastián', 'Luciana', 'Julián', 'Paula', 'Andrés', 'Salomé', 'David',
    'Manuela', 'Felipe', 'Antonella', 'Joaquín', 'Sara', 'Martín', 'Juliana', 'Esteban', 'Laura', 'Simón'];
  const APELLIDOS = ['Ramírez', 'Torres', 'Castro', 'Vargas', 'Mendoza', 'Ríos', 'Herrera', 'Ortiz', 'Salazar', 'Acosta',
    'Navarro', 'Cortés', 'Molina', 'Parra', 'Quintero', 'Rojas', 'Silva', 'Beltrán', 'Duarte', 'Pardo',
    'Guerrero', 'Suárez', 'Medina', 'Aguirre', 'León', 'Cuervo', 'Moreno', 'Peña', 'Camargo', 'Bernal'];

  const semilla = (txt) => { let h = 2166136261; for (const c of txt) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const azar = (seed) => { let s = seed || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
  const apellidoDe = (n) => n.split(' ').slice(-1)[0];
  const cache = {};

  function roster(grupoKey) {
    if (cache[grupoKey]) return cache[grupoKey];
    const g = GRUPOS[grupoKey];
    if (!g) return [];
    const rnd = azar(semilla(grupoKey));
    const usados = new Set();
    const out = [];
    Object.values(USUARIOS).filter((u) => u.rol === 'estudiante' && u.grado + u.grupo === grupoKey)
      .forEach((u) => { out.push({ uid: u.uid, nombre: u.nombre, cuenta: true }); usados.add(u.nombre); });
    while (out.length < g.alumnos) {
      const nombre = `${NOMBRES[Math.floor(rnd() * NOMBRES.length)]} ${APELLIDOS[Math.floor(rnd() * APELLIDOS.length)]}`;
      if (usados.has(nombre)) continue;
      usados.add(nombre);
      out.push({ uid: `${grupoKey}-${out.length + 1}`, nombre });
    }
    out.sort((a, b) => apellidoDe(a.nombre).localeCompare(apellidoDe(b.nombre), 'es') || a.nombre.localeCompare(b.nombre, 'es'));
    return (cache[grupoKey] = out);
  }

  /* ---------- Consultas ---------- */
  const normaliza = (t) => String(t || '').trim().toLowerCase();

  // Acepta el usuario institucional o el correo institucional.
  function buscar(texto) {
    const t = normaliza(texto);
    if (!t) return null;
    if (USUARIOS[t]) return USUARIOS[t];
    return Object.values(USUARIOS).find((u) => u.correo === t) || null;
  }
  const perfil = buscar;

  function clasesDe(usuario) {
    const u = buscar(usuario);
    if (!u) return [];
    if (u.rol === 'docente') return CLASES.filter((c) => c.docente === u.usuario);
    if (u.rol === 'estudiante') return CLASES.filter((c) => c.grupo === u.grado + u.grupo);
    return [];
  }

  const nombreDocente = (c) => (USUARIOS[c.docente] ? USUARIOS[c.docente].nombre : 'Docente');
  const etiquetaGrupo = (key) => (GRUPOS[key] ? `${GRUPOS[key].grado}°${GRUPOS[key].grupo}` : key);
  const directorDe = (key) => { const d = GRUPOS[key] && GRUPOS[key].director; return d && USUARIOS[d] ? USUARIOS[d].nombre : null; };

  /* Adónde envía el login a cada rol. Los roles que aún no tienen vista
     (coordinación, administración) se agregan aquí cuando existan. */
  const DESTINOS = { estudiante: 'plataforma.html', docente: 'plataforma.html' };
  const destino = (rol) => DESTINOS[rol] || null;

  const cuentas = () => Object.values(USUARIOS).map((u) => ({
    usuario: u.usuario, nombre: u.nombre, rol: u.rol, uid: u.uid,
    detalle: u.rol === 'estudiante' ? `Estudiante · ${u.grado}°${u.grupo}` : `Docente · ${u.area}`
  }));

  return {
    aviso: 'Datos ficticios de demostración. Sin seguridad real.',
    grupos: GRUPOS, usuarios: USUARIOS, clases: CLASES,
    buscar, perfil, clasesDe, roster, nombreDocente, etiquetaGrupo, directorDe, destino, cuentas
  };
})();
