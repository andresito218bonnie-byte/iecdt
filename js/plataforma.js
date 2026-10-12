/* ===== Sesión y perfil: los entrega login.html (ver docs/sesion-y-roles.md) =====
   Demo: el perfil sale de js/demo-usuarios.js. Con Firebase saldrá de Authentication + Firestore. */
const DEMO=window.IE_DEMO;
function resolveSession(){
  let s=null;try{s=JSON.parse(sessionStorage.getItem('portalSesion')||'null')}catch(_){}
  // Solo para revisar el diseño sin pasar por el login: plataforma.html?demo=docente | estudiante
  const demo=new URLSearchParams(location.search).get('demo');
  if(!s&&(demo==='docente'||demo==='estudiante')){const u=DEMO.cuentas().find(c=>c.rol===demo);if(u){s={uid:u.uid,usuario:u.usuario,nombre:u.nombre,rol:u.rol};try{sessionStorage.setItem('portalSesion',JSON.stringify(s))}catch(_){}}}
  // El rol sale del directorio, no de lo guardado en el navegador (el usuario no puede cambiarse el rol).
  const p=s&&DEMO.perfil(s.usuario);
  if(!p||!DEMO.destino(p.rol)){try{sessionStorage.removeItem('portalSesion')}catch(_){}document.documentElement.style.visibility='hidden';location.replace('login.html?next='+encodeURIComponent('plataforma.html'+location.hash));return null}
  return p}
const ME=resolveSession()||{rol:'estudiante',uid:'sin-sesion',usuario:'',nombre:'',grado:'',grupo:'',asistencia:0,area:''};
const GR=ME.rol==='docente'?ME.area:`${ME.grado}°${ME.grupo}`;
const ini=n=>String(n).trim().split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
const TN=m=>{const c=DEMO.clasesDe(ME.usuario).find(x=>x.materia===m);return c?DEMO.nombreDocente(c):'Docente'};

/* ===== Clases, horario y agenda a partir del directorio (una sola fuente para estudiante y docente) ===== */
const DIAS=['Lun','Mar','Mié','Jue','Vie'];
function proxLabel(ses,now=new Date()){const wd=(now.getDay()+6)%7,h=now.getHours()+now.getMinutes()/60;let b=null;
  ses.forEach(([d,hr])=>{let df=(d-wd+7)%7;if(df===0&&hr+1<=h)df=7;const k=df*24+hr;if(!b||k<b.k)b={k,d,hr,df}});
  if(!b)return 'Sin horario';const t=`${b.hr}:00`;return b.df===0?`Hoy · ${t}`:b.df===1?`Mañana · ${t}`:`${DIAS[b.d]} · ${t}`}
// [0 nombre,1 aula,2 próxima sesión,3 avance,4 unidad,5 estilo,6 estilo chip,7 símbolo,8 hoy,9 docente,10 clase]
const tupla=c=>{const wd=(new Date().getDay()+6)%7;
  const nom=ME.rol==='docente'?`${c.materia} · ${DEMO.etiquetaGrupo(c.grupo)}`:(c.materia==='Estadística'?`Estadística · ${GR}`:c.materia);
  return [nom,c.aula,proxLabel(c.sesiones),c.avance,c.unidad,c.estilo[0],c.estilo[1],c.estilo[2],c.sesiones.some(([d])=>d===wd)?1:0,DEMO.nombreDocente(c),c]};
function CLS(){return DEMO.clasesDe(ME.usuario).map(tupla)}
const LET='ABCEFGHIJKLMNOPQRSTUVWXYZ';
function horGrid(){const r=[...Array(6)].map(()=>Array(5).fill('-'));r[2]=Array(5).fill('D');
  S.clases.forEach((c,k)=>c[10].sesiones.forEach(([d,h])=>{const i=h-7;if(i>=0&&i<6&&i!==2&&d>=0&&d<5)r[i][d]=LET[k]}));return r.map(x=>x.join(''))}
function horX(){const o={};S.clases.forEach((c,k)=>{o[LET[k]]=['b'+(k%4+1),c[0],c[1]]});return o}
const isNowCell=(i,j)=>{const n=new Date();return (n.getDay()+6)%7===j&&n.getHours()===7+i};
function agendaHoy(){const n=new Date(),wd=(n.getDay()+6)%7,h=n.getHours(),L=[];
  S.clases.forEach(c=>c[10].sesiones.forEach(([d,hr])=>{if(d===wd)L.push([hr,c])}));
  return L.sort((a,b)=>a[0]-b[0]).map(([hr,c])=>[String(hr).padStart(2,'0')+':00',c[0],c[1],hr<h?'done':hr===h?'active':'later'])}
const VIEW=v=>(ME.rol==='docente'&&window.VDOC.V[v])||V[v];
const greetName=()=>{const f=(S.profileName||'').trim().split(/\s+/)[0]||'';return ME.rol==='docente'?`${ME.trato||'docente'} ${f}`:f};
const profileSub=()=>ME.rol==='docente'?`Docente · ${ME.area}`:`Estudiante · Grado ${GR}`;
function perfilRows(){
  if(ME.rol==='docente')return[['Usuario institucional',ME.usuario],['Correo',ME.correo],['Área',ME.area],['Grupos a cargo',[...new Set(S.clases.map(c=>DEMO.etiquetaGrupo(c[10].grupo)))].join(', ')],['Director de grupo',ME.directorDe?DEMO.etiquetaGrupo(ME.directorDe):'No asignado']];
  return[['Usuario institucional',ME.usuario],['Correo',ME.correo],['Grado',GR],['Director de grupo',DEMO.directorDe(ME.grado+ME.grupo)||'No asignado'],['Acudiente',ME.acudiente],['Teléfono',ME.telefono]]}
function perfilLogros(ent){
  if(ME.rol==='docente')return[[ME.asistencia+'%','Asistencia prom.'],[window.VDOC.porCalificar(),'Por calificar'],[new Set(S.clases.map(c=>c[10].grupo)).size,'Grupos']];
  return[[ME.asistencia+'%','Asistencia'],[ent,'Tareas entregadas'],[S.clases.length,'Clases activas']]}
function logout(){try{sessionStorage.removeItem('portalSesion');sessionStorage.removeItem('ie-nombre-visible')}catch(_){}location.href='login.html'}
const IC={inicio:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',clases:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 9h16"/>',horario:'<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',tareas:'<path d="M5 12l5 5 9-10"/>',mensajes:'<path d="M3 6h18v12H3zM3 7l9 6 9-6"/>',perfil:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',roles:'<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',buscar:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'};
const ico=k=>`<svg class="i" viewBox="0 0 24 24">${IC[k]}</svg>`;
const NAV=[['inicio','Inicio'],['clases','Mis clases'],['horario','Horario'],['tareas','Tareas'],['mensajes','Mensajes'],['perfil','Mi perfil'],['roles','Roles (demo)']];
const NAVD=[['inicio','Inicio'],['clases','Mis grupos'],['horario','Horario'],['tareas','Tareas'],['mensajes','Mensajes'],['perfil','Mi perfil'],['roles','Roles (demo)']];
const NV=()=>ME.rol==='docente'?NAVD:NAV;
const MAT={'Ciencias Naturales':['#FFF3D1','#8A6500'],'Matemáticas':['#E8F0FC','#0A58CA'],'Estadística · 11°A':['#E8F0FC','#0A58CA'],'Educación Física':['#E8F0FC','#0A58CA']};
const S={v:'inicio',cf:'all',cq:'',wk:0,tq:'',mq:'',sel:0,pref:[1,1,0],profileName:ME.nombre,
classIndex:0,classTab:'anuncios',submission:{taskId:null,files:[],comment:''},submissions:{},roleDemo:ME.rol,d:window.VDOC.estadoInicial(),
tasks:[
{id:'gr',t:'Guía de repaso — Unidad 4',m:'Ciencias Naturales',due:12,col:0,p:0},
{id:'ee',t:'Ejercicios de ecuaciones',m:'Matemáticas',due:16,col:0,p:0},
{id:'pe',t:'Proyecto de estadística',m:'Estadística · 11°A',due:14,col:1,p:60},
{id:'il',t:'Informe de laboratorio',m:'Ciencias Naturales',due:19,col:1,p:25},
{id:'cu',t:'Cuestionario de la Unidad 3',m:'Matemáticas',col:2,p:100,sent:'05 oct',graded:true},
{id:'rc',t:'Rutina de acondicionamiento',m:'Educación Física',col:2,p:100,sent:'01 oct',graded:false}],
clases:CLS(),
hor:[],
th:ME.rol==='docente'?window.VDOC.hilos():[{av:ini(TN('Estadística')),st:'background:#0A58CA;color:#fff',n:TN('Estadística')+' · Estadística',s:'Guía del proyecto de estadística',tm:'9:12',u:1,h:TN('Estadística')+' · Estadística · '+GR,ms:[['in','Hola, ya está disponible la guía del proyecto. Revisen los criterios de evaluación antes del 14 de octubre.'],['out','Gracias, profe. ¿La entrega es individual o en parejas?'],['in','En parejas. Cualquier duda, escríbanme por aquí.']]},
{av:ini(TN('Ciencias Naturales')),st:'background:#FFD166;color:#063A86',n:TN('Ciencias Naturales')+' · Ciencias',s:'Guía de repaso — Unidad 4',tm:'Ayer',u:1,h:TN('Ciencias Naturales')+' · Ciencias Naturales · '+GR,ms:[['in','Ya está publicada la guía de repaso de la Unidad 4. Vence el 12 de octubre.']]},
{av:'CO',st:'background:#E3ECF8;color:#063A86',n:'Coordinación',s:'Cronograma de exámenes finales',tm:'Lun',u:0,h:'Coordinación · Institucional',ms:[['in','Ya está disponible el cronograma de exámenes finales.']]}]};
const pend=()=>S.tasks.filter(t=>t.col<2);
const unread=()=>S.th.filter(t=>t.u).length;
const mc=m=>(MAT[m]||MAT['Matemáticas']);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Persistencia local de demostración: no sustituye una base de datos ni sincroniza usuarios. */
const DEMO_STORAGE_KEY=`ie-cdt-aula-demo-v3:${ME.uid}`;
function loadDemoState(){try{const raw=localStorage.getItem(DEMO_STORAGE_KEY);if(!raw)return;const saved=JSON.parse(raw);if(Array.isArray(saved.tasks))S.tasks=saved.tasks;if(Array.isArray(saved.th))S.th=saved.th;if(Array.isArray(saved.pref))S.pref=saved.pref;if(ME.rol==='docente'&&saved.docente&&Array.isArray(saved.docente.tareas))S.d=saved.docente;if(Number.isInteger(saved.wk))S.wk=saved.wk;if(typeof saved.v==='string'&&NV().some(([id])=>id===saved.v)||saved.v==='clase')S.v=saved.v;if(['estudiante','docente','coordinacion','administracion'].includes(saved.roleDemo))S.roleDemo=saved.roleDemo;
if(Number.isInteger(saved.classIndex))S.classIndex=Math.max(0,Math.min(S.clases.length-1,saved.classIndex));
if(['anuncios','tareas','materiales','participantes','asistencia'].includes(saved.classTab))S.classTab=saved.classTab;
if(saved.submissions&&typeof saved.submissions==='object')S.submissions=saved.submissions;
}catch(_){}}
function saveDemoState(){try{localStorage.setItem(DEMO_STORAGE_KEY,JSON.stringify({tasks:S.tasks,th:S.th,pref:S.pref,wk:S.wk,v:S.v,classIndex:S.classIndex,classTab:S.classTab,submissions:S.submissions,roleDemo:S.roleDemo,docente:S.d}));if(S.profileName!==ME.nombre)sessionStorage.setItem('ie-nombre-visible',S.profileName)}catch(_){}}

function nav(){$('#nav').innerHTML=NV().map(([id,l])=>{const b=id==='tareas'?(ME.rol==='docente'?window.VDOC.porCalificar():pend().length):id==='mensajes'?unread():0;
return `<button class="n ${(S.v===id||(S.v==='clase'&&id==='clases'))?'on':''}" data-go="${id}">${ico(id)}<span>${l}</span>${b?`<span class="chip" style="${id==='tareas'?'background:#FFD166;color:#063A86':'background:#0A58CA;color:#fff'};padding:3px 9px">${b}</span>`:''}</button>`}).join('');
$('#exam').style.display=S.v==='inicio'?'':'none'}
const $=s=>document.querySelector(s);

const V={
inicio(){
const p=pend().slice().sort((a,b)=>a.due-b.due),dueSoon=p.filter(t=>t.due<=12).length;
const stat=(ic,n,l,kind)=>`<article class="home-stat"><span class="home-stat__icon ${kind}">${ico(ic)}</span><div><strong>${n}</strong><span>${l}</span></div></article>`;
const agenda=agendaHoy();
return `<section class="home-top"><div class="home-welcome"><span class="eyebrow"><span class="eyebrow__dot"></span> AULA VIRTUAL · ${GR}</span><h1 class="s">Hola, estudiante. <span class="home-wave">✦</span></h1><p>Un buen día para aprender algo nuevo. Aquí tienes lo más importante de tu semana.</p></div><div class="home-tools"><label class="srch home-search">${ico('buscar')}<input id="gs" placeholder="Buscar una tarea…" aria-label="Buscar tareas"></label><span id="current-date" class="home-date"></span></div></section>
<section class="home-hero"><div class="home-hero__copy"><span class="home-hero__tag"><span class="home-live-dot"></span> TU JORNADA ACADÉMICA</span><h2 class="s">Cada paso cuenta.</h2><p>Organiza tus clases, avanza con tus entregas y mantente al día con tus docentes.</p><div class="home-hero__actions"><button class="home-primary" data-go="horario">Consultar horario <span aria-hidden="true">↗</span></button><button class="home-secondary" data-go="clases">Explorar mis clases</button></div></div><div class="home-hero__art" aria-hidden="true"><div class="orbit orbit--one"></div><div class="orbit orbit--two"></div><div class="home-book"><span>IE</span><i></i><i></i><i></i></div><span class="art-star art-star--one">✦</span><span class="art-star art-star--two">✧</span><span class="art-note">APRENDER<br/>· CRECER ·</span></div><div class="home-hero__foot"><span><b>Institución Educativa</b> Ciudad de Tunja</span><span>Conocimiento que abre caminos</span></div></section>
<section class="home-stats" aria-label="Resumen académico">${stat('clases',S.clases.length,'Clases activas','blue')}${stat('tareas',p.length,'Tareas pendientes','gold')}${stat('mensajes',unread(),'Mensajes nuevos','sky')}${stat('horario',ME.asistencia+'%','Asistencia registrada','navy')}</section>
<section class="home-content"><div class="home-panel home-tasks"><div class="home-panel__head"><div><span class="home-kicker">PARA TENER EN CUENTA</span><h2 class="s">Tus tareas</h2><p>${dueSoon?`${dueSoon} con fecha de entrega próxima`:'Tu lista de entregas está bajo control'}</p></div><button class="home-text-link" data-go="tareas">Ver todas <span aria-hidden="true">→</span></button></div>
${p.slice(0,4).map(t=>`<article class="home-task"><button class="bx" data-act="done" data-id="${t.id}" aria-label="Marcar ${esc(t.t)} como entregada"></button><div class="home-task__body"><strong>${esc(t.t)}</strong><span>${esc(t.m)}</span></div><span class="home-due ${t.due<=12?'is-soon':''}"><b>${String(t.due).padStart(2,'0')}</b><small>OCT</small></span></article>`).join('')||'<div class="home-empty"><span>✓</span><b>¡Todo al día!</b><p>No tienes tareas pendientes por ahora.</p></div>'}
<div class="home-panel__foot"><span class="home-foot-dot"></span> Recuerda revisar las instrucciones antes de entregar.</div></div>
<div class="home-side-stack"><div class="home-panel home-agenda"><div class="home-panel__head"><div><span class="home-kicker">PLANEA TU DÍA</span><h2 class="s">Horario de hoy</h2></div><button class="home-round-link" data-go="horario" aria-label="Ver horario completo">↗</button></div><div class="home-agenda__list">${agenda.map(([time,name,room,status])=>`<article class="home-agenda__item ${status==='active'?'is-active':''} ${status==='done'?'is-done':''}"><div class="home-agenda__time">${time}</div><span class="home-agenda__line"><i></i></span><div class="home-agenda__details"><strong>${name}</strong><span>${room}</span></div>${status==='active'?'<span class="home-now">EN JORNADA</span>':''}</article>`).join('')||'<p class="lesson-muted" style="padding:8px 4px">Hoy no hay clases programadas.</p>'}</div><button class="home-agenda__all" data-go="horario">Ver semana completa <span>→</span></button></div>
<div class="home-quote"><span class="home-quote__mark">“</span><p>La educación es el pasaporte hacia el futuro.</p><span class="home-quote__source">UN DÍA A LA VEZ · UN LOGRO A LA VEZ</span><span class="home-quote__spark" aria-hidden="true">✳</span></div></div></section>
<div class="home-bottom-note"><span class="home-bottom-note__icon">i</span><p><b>Recuerda:</b> esta plataforma es una demostración visual. Los horarios, porcentajes y actividades mostrados son datos de ejemplo.</p></div>`},
clases(){const q=S.cq.toLowerCase(),L=S.clases.filter(c=>(S.cf==='all'||c[8])&&(!q||(c[0]+' '+c[1]).toLowerCase().includes(q)));
return `<div class="hd"><div><h1 class="s">Mis clases</h1><p class="sub">Consulta tus asignaturas y el avance de cada unidad.</p></div><div class="class-tools"><label class="srch">${ico('buscar')}<input id="cq" placeholder="Buscar asignatura…" value="${esc(S.cq)}" aria-label="Buscar asignatura"></label><div class="filter-pills"><button class="pill ${S.cf==='all'?'on':''}" data-cf="all">Todas</button><button class="pill ${S.cf==='hoy'?'on':''}" data-cf="hoy">Hoy</button></div></div></div>
<div class="grid3 class-grid">${L.map(c=>`<article class="cl class-card" role="button" tabindex="0" data-class-open="${S.clases.indexOf(c)}" aria-label="Abrir clase ${esc(c[0])}"><div class="cb" style="${c[5]}"><span class="chip" style="${c[6]}">${c[2]}</span><span class="s class-symbol">${c[7]}</span></div><div class="class-card__body"><h3 class="s">${c[0]}</h3><div class="class-teacher">${esc(c[9])} · ${c[1]}</div><div class="pg" role="progressbar" aria-label="Avance de ${esc(c[0])}" aria-valuenow="${c[3]}" aria-valuemin="0" aria-valuemax="100"><i style="width:${c[3]}%"></i></div><div class="class-progress-label"><span>Unidad ${c[4]} de 6</span><strong>${c[3]}%</strong></div><div class="class-card__foot"><span>Ver aula y actividades</span><span aria-hidden="true">↗</span></div></div></article>`).join('')||'<div class="card class-empty"><b>No encontramos asignaturas</b><p>Prueba con otro nombre o cambia el filtro.</p></div>'}</div>`},

clase(){
const c=S.clases[S.classIndex]||S.clases[0],name=c[0].replace(/ · \d+°[A-Z]$/,''),doc=c[9];
const taskMap={'Estadística':'pe','Ciencias Naturales':'gr','Matemáticas':'ee','Educación Física':'rc'};
const mappedId=Object.entries(taskMap).find(([subject])=>name.toLowerCase().includes(subject.toLowerCase()))?.[1];
const task=S.tasks.find(t=>t.id===mappedId);
const taskId=task?task.id:'';
const taskTitle=task?task.t:'Actividad de clase';
const due=task?`${String(task.due).padStart(2,'0')} de octubre`:'Fecha por confirmar';
const announcements=[
{when:'Hace 2 horas',text:`Ya está disponible el material de ${name}. Revisa los criterios de trabajo y las instrucciones antes de la próxima clase.`},
{when:'Ayer',text:`Recuerda traer tus materiales y repasar los conceptos vistos en la última sesión de ${name}.`}
];
const tabs=[['anuncios','Anuncios'],['tareas','Tareas'],['materiales','Materiales'],['participantes','Participantes']];
let body='';
if(S.classTab==='anuncios')body=`<div class="lesson-posts">${announcements.map((a,i)=>`<article class="card lesson-post"><div class="lesson-post__by"><span class="av lesson-teacher-avatar">${esc(ini(doc))}</span><div><b>${esc(doc)}</b><span>${a.when}</span></div></div><p>${a.text}</p></article>`).join('')}</div>`;
if(S.classTab==='tareas')body=`<div class="lesson-posts"><article class="card lesson-assignment"><div><span class="lesson-kicker">ACTIVIDAD ASIGNADA</span><h2 class="s">${esc(taskTitle)}</h2><p>Desarrolla la actividad siguiendo las instrucciones compartidas por el docente. Revisa tu trabajo antes de enviarlo.</p><div class="lesson-chips"><span class="chip chip-gold">Vence ${due}</span><span class="chip">${task?`${task.p||0}% de avance`:'Pendiente'}</span><span class="chip">${task&&task.col===2?'Entregada':'Pendiente'}</span></div></div><button class="lesson-primary" data-act="${taskId?'submit-task':'no-task'}" data-id="${taskId}">Entregar tarea <span>→</span></button></article></div>`;
if(S.classTab==='materiales')body=`<div class="card lesson-materials"><h2 class="h">Materiales recientes</h2><button class="lesson-file" data-act="material-info"><span class="lesson-file__type pdf">PDF</span><span><b>Guía de ${esc(name)}</b><small>Material de demostración · PDF</small></span><span class="lesson-file__arrow">↗</span></button><button class="lesson-file" data-act="material-info"><span class="lesson-file__type xls">XLS</span><span><b>Base de datos de práctica</b><small>Material de demostración · Hoja de cálculo</small></span><span class="lesson-file__arrow">↗</span></button><p class="lesson-muted">Los archivos reales estarán disponibles cuando se conecte el almacenamiento institucional.</p></div>`;
if(S.classTab==='participantes')body=`<div class="card lesson-people"><h2 class="h">Participantes de la clase</h2>${[[ini(doc),doc,'Docente de la asignatura'],...DEMO.roster(ME.grado+ME.grupo).map(s=>[ini(s.nombre),s.uid===ME.uid?S.profileName+' (tú)':s.nombre,'Estudiante · Grado '+GR])].map((p,i)=>`<div class="lesson-person"><span class="av ${i===0?'lesson-teacher-avatar':'lesson-student-avatar'}">${esc(p[0])}</span><span><b>${esc(p[1])}</b><small>${esc(p[2])}</small></span>${i===0?'<span class="lesson-person-tag">DOCENTE</span>':''}</div>`).join('')}<p class="lesson-muted">Nombres y participantes ilustrativos; no representan un listado institucional real.</p></div>`;
return `<section class="lesson-page"><button class="lesson-back" data-act="back-classes"><span aria-hidden="true">←</span><span>Volver a Mis clases</span></button>
<header class="lesson-hero"><div class="lesson-hero__symbol s">${esc(c[7])}</div><div class="lesson-hero__copy"><span class="chip lesson-grade">${GR}</span><h1 class="s">${esc(name)}</h1><div class="lesson-meta"><span>${esc(doc)}</span><span>${esc(c[2]||'Horario por confirmar')}</span><span>${esc(c[1]||'Aula por confirmar')}</span></div></div><div class="lesson-hero__decor" aria-hidden="true"></div></header>
<nav class="lesson-tabs" aria-label="Secciones de la clase">${tabs.map(([id,label])=>`<button class="tb ${S.classTab===id?'on':''}" data-class-tab="${id}" aria-pressed="${S.classTab===id}">${label}</button>`).join('')}</nav>
<div class="lesson-layout"><section class="lesson-main">${body}</section><aside class="lesson-aside"><article class="card lesson-next"><span class="lesson-kicker">PRÓXIMA ENTREGA</span><h2 class="s">${esc(taskTitle)}</h2><p>Vence ${due}</p><button class="lesson-primary" data-act="${taskId?'submit-task':'no-task'}" data-id="${taskId}">Entregar tarea <span>→</span></button></article><article class="card lesson-materials-mini"><h2 class="h">Materiales recientes</h2><button class="lesson-file" data-act="material-info"><span class="lesson-file__type pdf">PDF</span><span><b>Guía de ${esc(name)}</b><small>PDF · Demostración</small></span></button><button class="lesson-file" data-act="material-info"><span class="lesson-file__type xls">XLS</span><span><b>Material de práctica</b><small>XLS · Demostración</small></span></button></article><p class="lesson-demo-note">Aula de ejemplo. Publicaciones, materiales y participantes son datos simulados.</p></aside></div></section>`;
},
horario(){const M=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const now=new Date(),a=new Date(now.getFullYear(),now.getMonth(),now.getDate());a.setDate(a.getDate()-((a.getDay()+6)%7)+7*S.wk);const z=new Date(a);z.setDate(a.getDate()+4);
const lb=a.getMonth()===z.getMonth()?`${a.getDate()} al ${z.getDate()} de ${M[z.getMonth()]}`:`${a.getDate()} de ${M[a.getMonth()]} al ${z.getDate()} de ${M[z.getMonth()]}`;
const X=horX();
const H=[7,8,9,10,11,12];
return `<div class="hd"><div><h1 class="s">Horario</h1><p class="sub">Semana del ${lb}.</p></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="pill" data-wk="-1">← Anterior</button><button class="pill ${S.wk===0?'on':''}" data-wk="0">Esta semana</button><button class="pill" data-wk="1">Siguiente →</button></div></div>
<div class="card sc" style="padding:24px"><div class="g"><div></div>${['Lunes','Martes','Miércoles','Jueves','Viernes'].map(d=>`<div class="d">${d}</div>`).join('')}</div>
${horGrid().map((r,i)=>`<div class="g"><div class="t">${H[i]}:00</div>${[...r].map((c,j)=>{if(c==='D')return '<div class="b b5">Descanso</div>';if(c==='-')return '<div class="b b5">—</div>';const x=X[c],now=S.wk===0&&isNowCell(i,j);return `<div class="b ${x[0]}" ${now?'style="box-shadow:0 0 0 3px #FFD166"':''}>${x[1]}<small>${x[2]}${now?' · Hoy':''}</small></div>`}).join('')}</div>`).join('')}</div>`},

tareas(){const q=S.tq.toLowerCase(),C=['Por entregar','En progreso','Entregadas'],B=[['#FFD166','#063A86'],['#DCE7F8','#0A58CA'],['#063A86','#fff']];
return `<div class="hd"><div><h1 class="s">Tareas</h1><p class="sub">Arrastra cada tarea de columna a medida que avanzas.</p></div><label class="srch">${ico('buscar')}<input id="tq" placeholder="Buscar tareas" value="${esc(S.tq)}"></label></div>
<div class="grid3" style="align-items:start">${C.map((n,c)=>{const L=S.tasks.filter(t=>t.col===c&&(!q||(t.t+t.m).toLowerCase().includes(q)));
return `<div class="col" data-col="${c}"><div class="ch"><span class="s" style="font-size:20px;color:var(--navy);font-weight:500">${n}</span><span class="chip" style="background:${B[c][0]};color:${B[c][1]}">${S.tasks.filter(t=>t.col===c).length+(c===2?7:0)}</span></div>
${L.map(t=>{const k=mc(t.m);return `<div class="ct" draggable="true" tabindex="0" data-id="${t.id}" ${c===2?'style="opacity:.8"':''}><span class="chip" style="background:${k[0]};color:${k[1]}">${t.m}</span><div style="font-weight:700;color:var(--navy);font-size:17px;margin-top:14px">${t.t}</div>${c===1?`<div class="pg"><i style="width:${t.p}%"></i></div>`:''}
<div class="ft"><span>${c===2?'Entregada '+(t.sent||'hoy'):'Vence '+t.due+' oct'}</span><span style="color:${c===0&&t.due<=12?'#B45309':'var(--blue)'}">${c===2?(t.graded?'✓ Calificada':'✓ Enviada'):c===1?t.p+'%':t.due<=12?'Vence pronto':'Sin iniciar'}</span></div>
${c<2?`<button data-act="mv" data-id="${t.id}" style="margin-top:14px;font-size:13px;font-weight:700;color:var(--blue)">${c===0?'Empezar':'Marcar entregada'} →</button>`:''}</div>`}).join('')||'<p style="color:var(--mut);padding:12px 8px;font-size:14px">Sin tareas aquí.</p>'}</div>`}).join('')}</div>`},

mensajes(){const q=S.mq.toLowerCase(),T=S.th.map((t,i)=>[t,i]).filter(([t])=>!q||(t.n+t.s).toLowerCase().includes(q)),t=S.th[S.sel]||S.th[0];
return `<div class="hd"><div><h1 class="s">Mensajes</h1><p class="sub">${unread()?unread()+' mensajes nuevos.':'Estás al día.'}</p></div><button class="chip" data-act="new" style="background:var(--gold);color:var(--navy);padding:13px 24px;font-size:14px">+ Nuevo mensaje</button></div>
<div class="msg" style="display:grid;grid-template-columns:400px 1fr;gap:24px;align-items:stretch">
<div style="background:#fff;border-radius:20px;padding:16px;box-shadow:var(--sh)"><label class="srch" style="width:100%;margin-bottom:12px;background:var(--bg);box-shadow:none"><input id="mq" placeholder="Buscar mensajes..." value="${esc(S.mq)}"></label>
${T.map(([m,i])=>`<button class="m ${i===S.sel?'on':''}" data-sel="${i}"><div class="av" style="${m.st}">${m.av}</div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:8px"><b style="color:var(--navy)">${esc(m.n)}</b><span style="font-size:12px;color:${m.u?'var(--blue)':'var(--mut)'};font-weight:${m.u?700:400}">${m.tm}</span></div><div style="font-size:14px;color:#4A5A6A;margin-top:3px;${m.u?'font-weight:700':''}">${esc(m.s)}</div></div></button>`).join('')||'<p style="color:var(--mut);padding:12px">Sin resultados.</p>'}</div>
<div style="background:#fff;border-radius:20px;box-shadow:var(--sh);display:flex;flex-direction:column;min-height:560px"><div style="padding:22px 28px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px"><div class="av" style="${t.st}">${t.av}</div><div><div class="s" style="font-size:22px;color:var(--navy);font-weight:500">${esc(t.s)}</div><div style="font-size:13px;color:var(--mut)">${esc(t.h)}</div></div></div>
<div id="chat" style="flex:1;padding:28px;display:flex;flex-direction:column;gap:16px;overflow:auto;max-height:520px">${t.ms.map(([w,x])=>`<div class="bb" style="${w==='in'?'background:#F4F7FB;align-self:flex-start':'background:var(--blue);color:#fff;align-self:flex-end'}">${esc(x)}</div>`).join('')||'<p style="color:var(--mut);margin:auto">Escribe el primer mensaje.</p>'}</div>
<div style="padding:20px 28px;border-top:1px solid var(--line);display:flex;gap:12px"><input id="rp" placeholder="Escribe tu respuesta..." style="flex:1;background:var(--bg);border:0;border-radius:999px;min-height:48px;padding:0 22px"><button data-act="send" style="background:var(--gold);color:var(--navy);font-weight:700;border-radius:999px;min-height:48px;padding:0 26px">Enviar</button></div></div></div>`},

roles(){
const profiles={
 estudiante:{label:'Estudiante',desc:'Consulta su propia información académica y entrega actividades de sus clases.',can:['Consultar clases y materiales de sus grupos matriculados','Ver su horario, tareas y calificaciones','Entregar archivos y comentarios en sus propias tareas','Enviar mensajes en conversaciones autorizadas'],cannot:['Modificar calificaciones','Ver entregas o datos privados de otros estudiantes','Crear usuarios o cambiar roles']},
 docente:{label:'Docente',desc:'Gestiona únicamente las asignaturas y grupos que tenga asignados.',can:['Publicar anuncios, materiales y tareas en clases asignadas','Consultar entregas de estudiantes de sus grupos','Calificar y comentar entregas autorizadas','Registrar asistencia de sus grupos asignados'],cannot:['Acceder a grupos no asignados','Administrar roles institucionales','Leer conversaciones privadas ajenas']},
 coordinacion:{label:'Coordinación',desc:'Consulta y gestiona procesos académicos dentro de las responsabilidades que apruebe la institución.',can:['Consultar horarios y datos académicos necesarios para seguimiento','Supervisar procesos y reportes autorizados','Gestionar correcciones o excepciones si existe delegación formal','Comunicarse con los grupos según su función'],cannot:['Acceder por defecto a toda conversación privada','Cambiar configuración técnica o roles globales sin autorización']},
 administracion:{label:'Administración',desc:'Administra cuentas y asignaciones operativas; no recibe automáticamente permiso ilimitado sobre contenido académico.',can:['Crear, desactivar y asignar cuentas según el procedimiento aprobado','Gestionar matrículas y asignaciones autorizadas','Resolver incidencias de acceso','Consultar registros de auditoría según su autorización'],cannot:['Editar calificaciones por defecto','Consultar archivos personales sin necesidad y autorización','Cambiar reglas de seguridad sin perfil técnico autorizado']}
};
const r=profiles[S.roleDemo]||profiles.estudiante;
return `<div class="hd"><div><h1 class="s">Roles y permisos</h1><p class="sub">Diseño inicial del acceso por perfil. La selección solo cambia esta vista de demostración.</p></div><span class="chip" style="background:#FFF3D1;color:#805D00">SIN SEGURIDAD REAL</span></div>
<section class="card role-demo"><div class="role-demo__intro"><span class="lesson-kicker">VISTA PREVIA DE PERFILES</span><h2 class="s">¿Qué puede hacer cada usuario?</h2><p>Selecciona un perfil para revisar las capacidades propuestas. En producción, los permisos se validarán en Firebase, no solo en la interfaz.</p></div><div class="role-picker" role="group" aria-label="Perfil de demostración">${Object.entries(profiles).map(([id,x])=>`<button class="pill ${S.roleDemo===id?'on':''}" data-role="${id}" aria-pressed="${S.roleDemo===id}">${x.label}</button>`).join('')}</div><div class="role-summary"><span class="role-summary__icon">${ico('roles')}</span><div><h3 class="s">${r.label}</h3><p>${r.desc}</p></div></div><div class="role-columns"><section><h3>Acciones previstas</h3><ul class="role-list role-list--yes">${r.can.map(x=>`<li><span>✓</span>${x}</li>`).join('')}</ul></section><section><h3>Acciones restringidas</h3><ul class="role-list role-list--no">${r.cannot.map(x=>`<li><span>×</span>${x}</li>`).join('')}</ul></section></div><p class="role-warning"><b>Nota:</b> esta pantalla es una herramienta de diseño, no un control de acceso. No introduzcas información real. La matriz completa y el modelo propuesto están documentados en <code>docs/</code>.</p></section>`},
perfil(){const P=ME.rol==='docente'?['Avisos de nuevas entregas','Mensajes de estudiantes','Resumen semanal por correo']:['Avisos de nuevas tareas','Mensajes de docentes','Resumen semanal por correo'],ent=S.tasks.filter(t=>t.col===2).length+7;
const lg=(n,l)=>`<div><div class="s" style="font-size:40px;color:var(--blue);font-weight:700;line-height:1">${n}</div><div style="font-size:13px;color:var(--mut);font-weight:600;margin-top:4px">${l}</div></div>`;
return `<div class="card" style="padding:0;overflow:hidden;margin-bottom:24px"><div style="height:150px;background:linear-gradient(135deg,#0A58CA,#063A86);position:relative"><div style="position:absolute;right:-40px;top:-70px;width:240px;height:240px;border-radius:50%;background:rgba(255,209,102,.2)"></div></div>
<div style="padding:0 40px 32px;display:flex;align-items:flex-end;gap:24px;margin-top:-52px;flex-wrap:wrap"><div class="s profile-avatar">${esc(S.profileName.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase())}</div><div class="profile-heading"><h1 class="s">${esc(S.profileName)}</h1><div style="color:var(--mut);margin-top:4px">${profileSub()}</div></div><button class="chip profile-edit" data-act="edit-profile">Editar perfil</button></div></div>
<div class="g2" style="display:grid;grid-template-columns:1.2fr 1fr;gap:24px"><div class="card"><h3 class="h" style="margin-bottom:6px">Información personal</h3>
${perfilRows().map(([a,b])=>`<div class="f"><span>${a}</span><b>${esc(b)}</b></div>`).join('')}</div>
<div style="display:grid;gap:24px"><div class="card"><h3 class="h" style="margin-bottom:16px">Logros</h3><div style="display:flex;gap:20px">${perfilLogros(ent).map(([n,l])=>lg(n,l)).join('')}</div></div>
<div class="card"><h3 class="h" style="margin-bottom:6px">Preferencias</h3>${P.map((p,i)=>`<div class="f"><span>${p}</span><button class="tg ${S.pref[i]?'on':''}" data-pf="${i}" role="switch" aria-checked="${!!S.pref[i]}" aria-label="${p}"><i></i></button></div>`).join('')}
<button class="profile-password" data-act="password-info">Cambiar contraseña <span aria-hidden="true">→</span></button><button class="profile-password" data-act="logout">Cerrar sesión <span aria-hidden="true">→</span></button></div></div></div>`}
};

function render(){const a=document.activeElement,id=a&&a.id,pos=a&&a.selectionStart,val=a&&a.value;
saveDemoState();nav();$('#view').innerHTML=VIEW(S.v)();
const sideName=document.getElementById('sidebar-profile-name');if(sideName)sideName.textContent=S.profileName;const sm=document.getElementById('sidebar-profile-meta');if(sm)sm.textContent=ME.rol==='docente'?ME.area:`Grado ${GR}`;const sa=document.getElementById('sidebar-profile-av');if(sa)sa.textContent=ini(S.profileName);
const dateLabel=document.getElementById('current-date');
if(dateLabel) dateLabel.textContent=new Intl.DateTimeFormat('es-CO',{weekday:'short',day:'numeric',month:'long'}).format(new Date());
const welcome=$('#view .home-welcome h1');if(welcome){const hour=new Date().getHours();const greeting=hour<12?'Buenos días':hour<18?'Buenas tardes':'Buenas noches';welcome.innerHTML=`${greeting}, ${esc(greetName())}. <span class="home-wave">✦</span>`;}
if(id){const e=document.getElementById(id);if(e){e.focus();if(val!==undefined&&e.tagName==='INPUT'&&e.id!=='rp'||e&&e.id==='rp'){e.value=val}try{e.setSelectionRange(pos,pos)}catch(_){}}}
const c=$('#chat');if(c)c.scrollTop=c.scrollHeight}
function go(v){S.v=v;location.hash=v;render();scrollTo(0,0)}
function notify(message){let n=document.getElementById('app-notice');if(!n){n=document.createElement('div');n.id='app-notice';n.className='app-notice';n.setAttribute('role','status');n.setAttribute('aria-live','polite');document.body.appendChild(n)}n.textContent=message;n.classList.add('show');clearTimeout(window.__noticeTimer);window.__noticeTimer=setTimeout(()=>n.classList.remove('show'),2400)}
function move(id,col){const t=S.tasks.find(x=>x.id===id);if(!t)return;t.col=col;if(col===2){t.p=100;t.sent=new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'short'}).format(new Date());t.graded=false}else if(col===0){t.p=0;delete t.sent;t.graded=false;}else if(!t.p||t.p===100)t.p=10;render();notify(col===2?'Tarea marcada como entregada (demo).':col===1?'Tarea movida a En progreso.':'Tarea devuelta a Por entregar.')}

document.addEventListener('click',e=>{const el=e.target.closest('[data-go],[data-act],[data-cf],[data-wk],[data-sel],[data-pf],[data-class-open],[data-class-tab],[data-role]');if(!el)return;const d=el.dataset;
if(d.classOpen!==undefined){S.classIndex=+d.classOpen;S.classTab='anuncios';return go('clase')}
if(d.role){S.roleDemo=d.role;return render()}
if(d.classTab){S.classTab=d.classTab;return render()}
if(d.go)return go(d.go);
if(d.cf){S.cf=d.cf;return render()}
if(d.wk!==undefined){S.wk=d.wk==='0'?0:S.wk+Number(d.wk);return render()}
if(d.pf!==undefined){S.pref[+d.pf]=+!S.pref[+d.pf];render();notify('Preferencia de demostración actualizada');return}
if(d.sel!==undefined){S.sel=+d.sel;if(S.th[S.sel])S.th[S.sel].u=0;return render()}
if(d.act==='done')return move(d.id,2);
if(d.act==='mv'){const t=S.tasks.find(x=>x.id===d.id);return move(d.id,t.col+1)}
if(d.act==='logout')return logout();
if(d.act==='edit-profile')return editProfile();
if(d.act==='back-classes')return go('clases');
if(d.act==='submit-task')return openSubmission(d.id);
if(d.act==='no-task')return notify('No hay una tarea asignada de demostración para esta materia todavía.');
if(d.act==='material-info')return notify('Este material es ilustrativo; aún no hay archivos institucionales conectados.');
if(d.act==='password-info')return notify('La gestión de contraseñas estará disponible cuando se conecte la autenticación institucional.');
if(d.act==='new'){S.th.unshift({av:'NM',st:'background:#E3ECF8;color:#063A86',n:'Nuevo mensaje',s:'Sin asunto',tm:'Ahora',u:0,h:'Para: Coordinación',ms:[]});S.sel=0;S.mq='';return render()}
if(d.act==='send')return send()});
function editProfile(){
  if(document.getElementById('profile-dialog'))return;
  const overlay=document.createElement('div');overlay.id='profile-dialog';overlay.className='dialog-backdrop';
  overlay.innerHTML=`<form class="profile-dialog" id="profile-form" aria-labelledby="profile-dialog-title"><button type="button" class="dialog-close" data-act="close-dialog" aria-label="Cerrar">×</button><span class="home-kicker">PERFIL DE DEMOSTRACIÓN</span><h2 id="profile-dialog-title" class="s">Editar nombre visible</h2><p>Este cambio solo se guarda en este navegador. No modifica una cuenta institucional real.</p><label for="profile-name-input">Nombre para mostrar</label><input id="profile-name-input" name="profileName" maxlength="60" required value="${esc(S.profileName)}"><div class="dialog-actions"><button type="button" class="pill" data-act="close-dialog">Cancelar</button><button type="submit" class="profile-save">Guardar cambios</button></div></form>`;
  document.body.appendChild(overlay);overlay.querySelector('input').focus();
}
function closeProfileDialog(){const d=document.getElementById('profile-dialog');if(d)d.remove()}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProfileDialog()});
document.addEventListener('submit',e=>{if(e.target.id!=='profile-form')return;e.preventDefault();const input=document.getElementById('profile-name-input'),name=input&&input.value.trim();if(!name){input?.focus();return}S.profileName=name.slice(0,60);closeProfileDialog();render();notify('Nombre visible actualizado en esta demostración.');});
document.addEventListener('click',e=>{if(e.target.id==='profile-dialog')closeProfileDialog();const close=e.target.closest('[data-act="close-dialog"]');if(close)closeProfileDialog()});
function openSubmission(taskId){
  const task=S.tasks.find(t=>t.id===taskId)||S.tasks.find(t=>t.col<2);
  if(!task){notify('No hay una tarea pendiente para entregar.');return}
  S.submission={taskId:task.id,files:[],comment:''};
  const prior=S.submissions[task.id]||{};
  const overlay=document.createElement('div');overlay.id='submission-dialog';overlay.className='dialog-backdrop';
  const due=task.due?`Vence ${task.due} oct`:'Fecha por confirmar';
  overlay.innerHTML=`<form class="submission-dialog" id="submission-form" aria-labelledby="submission-title"><div class="submission-head"><div><span class="chip submission-subject">${esc(task.m)}</span><h2 id="submission-title" class="s">Entregar tarea</h2></div><button type="button" class="dialog-close" data-act="close-submission" aria-label="Cerrar">×</button></div>
  <div class="submission-summary"><b>${esc(task.t)}</b><p>Adjunta tu trabajo y añade un comentario para el docente si lo necesitas.</p><div class="lesson-chips"><span class="chip chip-gold">${due}</span><span class="chip">5.0 puntos</span><span class="chip">${task.col===2?'Entregada':'Pendiente'}</span></div></div>
  <label class="lesson-kicker" for="submission-file">ENVIAR MI TAREA</label><label class="submission-drop" id="submission-drop" for="submission-file"><span class="submission-drop__icon">↑</span><strong>Arrastra tu archivo aquí</strong><span>o <u>haz clic para buscarlo</u></span><small>PDF, Word o imagen · Máximo 10 MB por archivo</small></label><input id="submission-file" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" multiple hidden>
  <div id="submission-files" class="submission-files"></div>
  <label class="submission-comment-label" for="submission-comment">Comentario para tu docente (opcional)</label><textarea id="submission-comment" rows="3" maxlength="1000" placeholder="Escribe un comentario..." class="submission-comment">${esc(prior.comment||'')}</textarea>
  <p class="submission-disclaimer">Demostración local: los archivos no se suben a un servidor ni se envían al docente.</p>
  <div class="dialog-actions"><button type="button" class="pill" data-act="close-submission">Cancelar</button><button type="submit" class="submission-confirm">Confirmar entrega</button></div></form>`;
  document.body.appendChild(overlay);
  const fileInput=overlay.querySelector('#submission-file');
  fileInput.addEventListener('change',()=>addSubmissionFiles(fileInput.files));
  const drop=overlay.querySelector('#submission-drop');
  drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('is-over')});
  drop.addEventListener('dragleave',()=>drop.classList.remove('is-over'));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('is-over');addSubmissionFiles(e.dataTransfer.files)});
  renderSubmissionFiles();
}
function addSubmissionFiles(files){
  const allowed=/\.(pdf|doc|docx|png|jpe?g)$/i;
  for(const f of files){
    if(!allowed.test(f.name)){notify('Tipo de archivo no permitido. Usa PDF, Word o imagen.');continue}
    if(f.size>10*1024*1024){notify(`${f.name} supera el límite de 10 MB.`);continue}
    if(!S.submission.files.some(x=>x.name===f.name&&x.size===f.size))S.submission.files.push({name:f.name,size:f.size,type:f.type||''});
  }
  renderSubmissionFiles();
}
function renderSubmissionFiles(){
  const root=document.getElementById('submission-files');if(!root)return;
  root.innerHTML=S.submission.files.map((f,i)=>`<div class="submission-file"><span class="submission-file__type">${esc((f.name.split('.').pop()||'FILE').toUpperCase().slice(0,4))}</span><span class="submission-file__info"><b>${esc(f.name)}</b><small>${(f.size/1024).toFixed(0)} KB · Listo para entregar</small></span><button type="button" data-act="remove-submission-file" data-index="${i}" aria-label="Quitar ${esc(f.name)}">×</button></div>`).join('');
}
function closeSubmission(){const d=document.getElementById('submission-dialog');if(d)d.remove()}
document.addEventListener('submit',e=>{
 if(e.target.id!=='submission-form')return;
 e.preventDefault();
 const task=S.tasks.find(t=>t.id===S.submission.taskId);if(!task)return;
 if(!S.submission.files.length){notify('Adjunta al menos un archivo antes de confirmar.');document.getElementById('submission-file')?.focus();return}
 const comment=document.getElementById('submission-comment')?.value.trim()||'';
 S.submissions[task.id]={files:S.submission.files.map(f=>({name:f.name,size:f.size})),comment,submittedAt:new Date().toISOString()};
 task.col=2;task.p=100;task.sent=new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'short'}).format(new Date());task.graded=false;
 closeSubmission();render();notify('Entrega registrada en esta demostración; no se ha enviado al docente.');
});
document.addEventListener('click',e=>{
 if(e.target.id==='submission-dialog')closeSubmission();
 const close=e.target.closest('[data-act="close-submission"]');if(close)closeSubmission();
 const remove=e.target.closest('[data-act="remove-submission-file"]');if(remove){S.submission.files.splice(+remove.dataset.index,1);renderSubmissionFiles()}
});
function send(){const i=$('#rp'),v=i&&i.value.trim();if(!v)return;S.th[S.sel].ms.push(['out',v]);S.th[S.sel].tm='Ahora';i.value='';render();$('#rp').focus();notify('Mensaje añadido a la conversación de demostración.')}
document.addEventListener('input',e=>{if(e.target.id==='tq'){S.tq=e.target.value;render()}if(e.target.id==='mq'){S.mq=e.target.value;render()}if(e.target.id==='cq'){S.cq=e.target.value;render()}});
document.addEventListener('keydown',e=>{if(e.target.id==='rp'&&e.key==='Enter')send();
const classCard=e.target.closest('[data-class-open]');
if(classCard&&(e.key==='Enter'||e.key===' ')){e.preventDefault();S.classIndex=+classCard.dataset.classOpen;S.classTab='anuncios';go('clase');}
if(e.target.id==='gs'&&e.key==='Enter'){S.tq=e.target.value;go('tareas')}});
let dragId=null;
document.addEventListener('dragstart',e=>{const c=e.target.closest('.ct');if(!c)return;dragId=c.dataset.id;c.classList.add('drag');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragId)});
document.addEventListener('dragend',()=>{document.querySelectorAll('.drag,.over').forEach(x=>x.classList.remove('drag','over'))});
document.addEventListener('dragover',e=>{const c=e.target.closest('.col');if(c&&dragId){e.preventDefault();document.querySelectorAll('.over').forEach(x=>x!==c&&x.classList.remove('over'));c.classList.add('over')}});
document.addEventListener('drop',e=>{const c=e.target.closest('.col');if(c&&dragId){e.preventDefault();move(dragId,+c.dataset.col);dragId=null}});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(V[h]&&h!==S.v){S.v=h;render()}});
{const h=location.hash.slice(1);if(V[h])S.v=h}
{const nv=sessionStorage.getItem('ie-nombre-visible');if(nv)S.profileName=nv}
loadDemoState();
render();

// Accesibilidad básica para mover tareas sin arrastrar (teclado o dispositivos táctiles).
document.addEventListener('keydown', e => {
  const card = e.target.closest('.ct');
  if (!card || (e.key !== 'Enter' && e.key !== ' ')) return;
  if (e.target !== card) return;
  e.preventDefault();
  const task = S.tasks.find(t => t.id === card.dataset.id);
  if (task && task.col < 2) move(task.id, task.col + 1);
});
