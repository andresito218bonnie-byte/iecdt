/* =========================================================
   data.js — TODO el contenido que se edita con frecuencia.
   No hay lógica aquí: solo datos. Para publicar una noticia,
   agregar un evento o cambiar un dato de contacto, edita este
   archivo y no toques el resto.
   ========================================================= */
window.SITIO = {

  /* ---------- Contacto (se usa en cabecera, pie y formularios) ---------- */
  contacto: {
    correo: 'info@institucion.edu.co',
    correoAdmisiones: 'admisiones@institucion.edu.co',
    correoSoporte: 'soporte@institucion.edu.co',
    telefono: '(601) 234 5678',
    telefonoLink: '+576012345678',
    celular: '(+57) 300 123 4567',
    direccion: 'Calle 123 # 45 - 67, Tunja, Boyacá',
    // Pega la URL de cada red. Si queda vacía, el enlace no se muestra.
    redes: [
      { nombre: 'Facebook', url: '' },
      { nombre: 'Instagram', url: '' },
      { nombre: 'YouTube', url: '' }
    ]
  },

  /* ---------- Documentos y páginas legales (pie de página) ---------- */
  legal: [
    { texto: 'Manual de convivencia', href: '/documentos/manual-convivencia.pdf', nueva: true },
    { texto: 'Sistema Institucional de Evaluación', href: '/documentos/sIEE.pdf', nueva: true },
    { texto: 'Políticas de privacidad', href: '/politicas-privacidad' },
    { texto: 'Tratamiento de datos personales', href: '/tratamiento-datos' },
    { texto: 'PQRS', href: '/pqrs' }
  ],

  /* ---------- Enlaces opcionales (vacío = el botón no aparece) ---------- */
  videoInstitucional: '',   // URL del video: activa el botón "Video institucional" del inicio
  cronogramaPDF: '',        // URL del PDF: activa "Descargar cronograma" en el calendario

  /* ---------- Suscripción por correo (noticias) ----------
     Pega aquí la URL del servicio que recibirá los correos (Mailchimp, Brevo, etc.).
     Mientras esté vacía, el cuadro "Suscríbete" no se muestra. */
  suscripcion: '',

  /* ---------- "Lo más leído" ----------
     Ids de noticias, en orden. Ej: ['feria-ciencias', 'campeones-baloncesto'].
     Vacío = el bloque no se muestra. */
  masLeidas: [],

  /* ---------- Formulario de inscripción (Google Forms) ---------- */
  formularioAdmision: 'https://docs.google.com/forms/d/e/1FAIpQLSeH1w_sf5rlU2LFz538Z5_Lo__ey0PWvKCal2VehwLyU-8fKw/viewform?usp=dialog',

  /* ---------- Barra "Última hora" de la página de noticias ---------- */
  avisos: [
    'Inscripciones abiertas para las Olimpiadas Matemáticas 2024',
    'El equipo de baloncesto clasifica a la final departamental',
    'Próxima semana: entrega de boletines'
  ],

  /* ---------- Planes de estudio (ventana del inicio) ---------- */
  planes: {
    preescolar: {
      titulo: 'Preescolar',
      lema: 'Exploración, juego y creatividad',
      areas: ['Dimensión cognitiva', 'Motricidad fina y gruesa', 'Expresión artística', 'Socioafectividad'],
      nota: 'Basado en los lineamientos pedagógicos de educación inicial.'
    },
    primaria: {
      titulo: 'Básica primaria',
      lema: 'Fundamentación y excelencia académica',
      areas: ['Lenguaje y matemáticas', 'Ciencias y sociales', 'Inglés progresivo', 'Informática básica']
    },
    media: {
      titulo: 'Básica y media',
      lema: 'Preparación profesional y Saber 11',
      areas: ['Ciencias avanzadas', 'Matemáticas superior', 'Filosofía y política', 'Orientación vocacional']
    }
  },

  /* ---------- Noticias ----------
     - La clave (ej. "feria-ciencias") es el id que va en la URL: noticias.html?id=feria-ciencias
     - Pon primero la más reciente. Con destacada:true la fijas arriba.
     - Las rutas de imagen se escriben igual que siempre (assets/img/...).
     - "contenido" admite HTML: <p class="lead-paragraph"> para la entrada,
       <h2> para subtítulos y <blockquote> para citas.
     - Opcional: extracto:"texto corto". Si no lo pones se toma el primer párrafo. */
  noticias: {
    'feria-ciencias': {
      titulo: 'Gran éxito en la Feria de Innovación y Robótica 2024',
      categoria: 'Ciencia y Tecnología',
      fecha: '24 de Octubre, 2024',
      autor: 'Coordinación Académica',
      imagen: 'assets/img/news-1.jpg',
      destacada: true,
      contenido: `
        <p class="lead-paragraph">El pasado viernes, las instalaciones de nuestro coliseo principal se transformaron en un verdadero epicentro de tecnología y creatividad.</p>
        <p>Con la participación de más de 150 estudiantes, el evento demostró que el talento y la pasión por las ciencias exactas están más vivos que nunca.</p>
        <h2>Proyectos que miran al futuro</h2>
        <p>Destacó un sistema de riego automatizado basado en sensores de humedad, programado íntegramente usando placas Arduino.</p>
        <blockquote>"Nuestro objetivo es que los estudiantes se conviertan en creadores de soluciones para su entorno". <br><strong>— Prof. Carlos Ramírez</strong></blockquote>
      `
    },
    'campeones-baloncesto': {
      titulo: 'Campeones en el torneo intercolegiado de baloncesto',
      categoria: 'Deportes',
      fecha: '20 de Octubre, 2024',
      autor: 'Departamento de Educación Física',
      imagen: 'assets/img/primaria.jpg',
      contenido: `
        <p class="lead-paragraph">En una final de infarto que se decidió en los últimos segundos, nuestro equipo representativo se coronó campeón regional.</p>
        <p>El marcador final de 54-52 refleja lo reñido que estuvo el encuentro contra el Instituto Técnico. Felicitamos a nuestros atletas por dejar en alto el nombre de nuestra institución.</p>
        <h2>El MVP del torneo</h2>
        <p>Andrés, de grado 11º, fue galardonado como el Jugador Más Valioso del campeonato tras anotar 24 puntos en el partido decisivo.</p>
      `
    }
  },

  /* ---------- Eventos del calendario ----------
     fecha: 'AAAA-MM-DD' (ej. '2027-02-10' es el 10 de febrero de 2027)
     tipo:  'blue'   = Académico
            'yellow' = Cultural / Deportivo */
  eventos: [
    { fecha: '2026-04-15', tipo: 'blue',   titulo: 'Feria de Ciencias',     hora: '07:00 AM', lugar: 'Aulas Múltiples' },
    { fecha: '2026-04-25', tipo: 'yellow', titulo: 'Torneo Relámpago',      hora: '09:00 AM', lugar: 'Cancha Principal' },
    { fecha: '2027-02-10', tipo: 'blue',   titulo: 'Regreso a Clases',      hora: '07:00 AM', lugar: 'Zonas Verdes' },
    { fecha: '2027-02-10', tipo: 'yellow', titulo: 'Fiesta de Bienvenida',  hora: '10:00 AM', lugar: 'Zonas Verdes' }
  ]
};
