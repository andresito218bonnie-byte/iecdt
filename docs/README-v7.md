# Aula Virtual IE Ciudad de Tunja — iteración 7

## Contenido

- `plataforma.html`: entrada de la aplicación.
- `css/plataforma.css`: identidad visual, vistas y componentes responsive.
- `js/plataforma.js`: navegación y lógica de demostración.
- `docs/matriz-permisos.md`: propuesta inicial de permisos.
- `docs/modelo-datos.md`: esquema de entidades y relaciones propuesto para revisar.
- `docs/ejemplo-datos.json`: ejemplo ilustrativo de documentos.
- `docs/plan-firebase.md`: orden recomendado para integrar Authentication, Firestore y Storage.

## Novedades de esta versión

- Nueva vista **Roles (demo)** con selector de Estudiante, Docente, Coordinación y Administración para revisar capacidades propuestas.
- Modelo de datos documentado para usuarios, roles, clases, matrículas, tareas, entregas, anuncios, materiales, conversaciones, asistencia y auditoría.
- Ejemplo de estructura de documentos y plan por etapas para la futura integración con Firebase.
- Se conserva el aula de asignatura, sus pestañas y el diálogo de entrega de tareas de la v6.

## Cómo probar

1. Descomprime el ZIP conservando las carpetas `css`, `js` y `docs`.
2. Abre `plataforma.html` en un navegador moderno. Si el navegador restringe funciones locales, sirve la carpeta con un servidor local.
3. Entra en **Mis clases** y selecciona una tarjeta para abrir el aula de esa asignatura.
4. En la pestaña **Tareas**, prueba el diálogo **Entregar tarea** con un archivo de ejemplo.
5. Abre **Roles (demo)** y cambia entre los cuatro perfiles para consultar la matriz resumida.

## Límites importantes

- Todo el contenido académico y las personas mostradas son datos ficticios.
- El selector de roles solo cambia una vista ilustrativa: no inicia sesión, no restringe acciones y no constituye seguridad.
- Las entregas solo guardan metadatos en el navegador; los archivos no se suben ni se envían al docente.
- `localStorage` no sincroniza usuarios ni debe contener información personal real, calificaciones, contraseñas o documentos de estudiantes.
- Firebase no está conectado. El esquema y las reglas deben revisarse con la institución antes de trabajar con datos reales.

## Estructura compacta

Se mantienen un HTML principal, un CSS y un JavaScript. Los documentos de arquitectura están separados en `docs/` para poder revisar el modelo sin inflar el código de interfaz.
