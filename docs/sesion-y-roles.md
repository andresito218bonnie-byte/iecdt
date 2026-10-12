# Sesión, roles y enrutamiento (v8)

Cómo `login.html` decide **a dónde va cada usuario** y de dónde sale su **nombre, grado y demás información**.

> **Es una demostración.** El directorio (`js/demo-usuarios.js`) es ficticio y vive en el navegador: cualquiera que abra el archivo ve todo y el login no valida contraseñas. No es seguridad. Sirve para validar el diseño y los flujos; la parte real llega con Firebase (ver más abajo).

## Flujo

```
login.html ──(usuario + contraseña)──► autenticar()  ──► perfil (con su rol)
                                           │
                                           ├─ sin perfil ─► "No encontramos ese usuario"
                                           └─ con perfil ─► sessionStorage["portalSesion"]
                                                            └─► DESTINOS[rol]  (plataforma.html)

plataforma.html ──► lee portalSesion ──► busca el perfil por usuario ──► pinta la vista del rol
        └─ sin sesión ─► login.html?next=plataforma.html
```

- **El rol lo manda el directorio, no el navegador.** Si alguien edita `portalSesion` y cambia `rol`, la plataforma lo ignora y usa el rol del perfil.
- **Pestaña equivocada:** si un docente elige "Estudiante" en el login, igual entra como docente. La pestaña es solo una ayuda.
- **`?next=`:** solo se acepta volver a `plataforma.html` (con `#vista` opcional). Cualquier otra dirección se ignora.
- **Sesión activa:** si ya hay sesión, `login.html` ofrece "Continuar" o "Cambiar de cuenta".
- **Salir:** botón en el panel lateral (escritorio) y en *Mi perfil* (móvil). Borra `portalSesion`.

## Contrato de la sesión (`sessionStorage["portalSesion"]`)

```json
{ "uid": "doc-0001", "usuario": "docente.lgomez", "nombre": "Laura Gómez", "rol": "docente", "inicio": 1790000000000 }
```

Solo lleva lo mínimo. Grado, correo, acudiente, clases, etc. **no se copian** al navegador: la plataforma los consulta por `usuario`/`uid`. El nombre que el usuario cambia con *Editar perfil* se guarda en `sessionStorage` (no en `localStorage`), como pide el README de la v7.

## Qué ve cada rol

| Rol | Destino | Vista |
|---|---|---|
| `estudiante` | `plataforma.html` | Sus clases (por su grado y grupo), horario, tareas, mensajes, perfil con grado, director de grupo y acudiente |
| `docente` | `plataforma.html` | **Solo** los grupos que tiene asignados: tareas con entregas y calificación, asistencia, anuncios, materiales, participantes, horario de dictado, mensajes |
| `coordinacion`, `administracion` | *(sin vista aún)* | Se añaden en `DESTINOS` de `demo-usuarios.js` cuando existan sus vistas |

## Cuentas de demostración

Se muestran en `login.html` mientras `modoDemo: true` (en `js/data.js`). Cualquier contraseña funciona.

| Usuario | Rol | Contenido |
|---|---|---|
| `2027.jperez` | Estudiante 11°A | Juan Pérez |
| `2027.mcardenas` | Estudiante 11°A | María José Cárdenas |
| `docente.lgomez` | Docente | Laura Gómez · Matemáticas y Estadística · 5 clases en 4 grupos (la más completa) |
| `docente.arojas` | Docente | Andrés Rojas · Ciencias Naturales · 1 grupo |
| `docente.ctorres` | Docente | Camila Torres · Lengua · 1 grupo · directora de 11°A |
| `docente.msuarez` | Docente | Michael Suárez · Inglés · 1 grupo |
| `docente.jsalinas` | Docente | Jorge Salinas · Educación Física · 1 grupo |

Para revisar el diseño sin pasar por el login: `plataforma.html?demo=docente` o `?demo=estudiante`. Quitar esta línea de `resolveSession()` al ir a producción.

## Cómo se agrega una persona o un grupo

Todo está en `js/demo-usuarios.js`:

1. **Usuario:** añadir una entrada en `USUARIOS` (`rol`, `nombre`, y `grado`/`grupo` si es estudiante o `area`/`trato` si es docente).
2. **Grupo:** añadir una entrada en `GRUPOS` con su número de alumnos. Los listados se generan solos y de forma estable.
3. **Clase:** añadir una línea con `clase(id, materia, grupo, aula, docente, estilo, sesiones, avance, unidad)`. El horario sale de `sesiones` (`[día 0–4, hora 7–12]`; la hora 9 es descanso). El estudiante la ve por su grupo y el docente por su usuario.

## Pasar a Firebase (cuando llegue el momento)

El plan de `docs/plan-firebase.md` sigue vigente. Los puntos de cambio están aislados:

| Hoy (demo) | Con Firebase |
|---|---|
| `autenticar()` en `js/app.js` (login) | `signInWithEmailAndPassword` y leer `userRoles/{uid}` |
| `resolveSession()` en `js/plataforma.js` | `onAuthStateChanged` + `users/{uid}`; si no hay usuario, redirigir a `login.html` |
| `IE_DEMO.clasesDe()` / `roster()` | Consultas a `classrooms` y `memberships` |
| `S.d` (tareas, notas, asistencia en `localStorage`) | Colecciones `assignments`, `submissions`, `attendance` con las reglas de `docs/matriz-permisos.md` |
| `?demo=` y `modoDemo` | Se eliminan |

Lo que **no** se debe llevar a producción: validar el rol en el navegador (hay que hacerlo en las reglas de Firestore) y guardar calificaciones o datos personales en `localStorage`.
