# Matriz inicial de permisos — Aula Virtual IE Ciudad de Tunja

## Propósito y alcance

Esta matriz es una **propuesta inicial para revisión institucional**, no una política aprobada ni una implementación de seguridad. La aplicación actual sigue siendo una demostración local: el selector visual, las vistas y los datos de ejemplo no autentican personas ni protegen información real.

## Matriz de capacidades

| Área / acción | Estudiante | Docente | Coordinación | Administración |
|---|---|---|---|---|
| Ver inicio y avisos institucionales publicados | Sí | Sí | Sí | Sí |
| Consultar clases asignadas o matriculadas | Solo sus clases | Solo clases asignadas | Todas las necesarias para coordinar | Según necesidad operativa |
| Consultar horario | Su horario | Su horario y clases asignadas | Horarios institucionales | Configuración de horarios |
| Ver tareas y materiales | De sus clases | De sus clases asignadas | Consulta para seguimiento académico | Sin edición académica por defecto |
| Crear/editar anuncios, tareas y materiales | No | En clases asignadas | Solo avisos o procesos autorizados | No por defecto |
| Entregar tareas | Solo sus entregas | No como estudiante | No | No |
| Calificar y comentar entregas | Ver solo sus resultados | En clases asignadas | Consulta o intervención según política aprobada | No por defecto |
| Registrar asistencia | No | En clases asignadas | Consultar y gestionar correcciones autorizadas | Configuración/soporte, no registro académico ordinario |
| Enviar mensajes | Dentro de canales autorizados | A estudiantes/grupos asignados y coordinación | A grupos/personas por función | Mensajes administrativos autorizados |
| Ver conversaciones privadas | Solo las propias | Solo las propias | No por defecto | No por defecto |
| Gestionar matrículas y asignaciones | No | No | Según delegación formal | Sí, si el proceso institucional lo asigna |
| Crear, desactivar o asignar roles de usuario | No | No | No por defecto | Sí, con registro de auditoría |
| Cambiar reglas de seguridad/configuración técnica | No | No | No | Solo personal técnico autorizado |

## Reglas de diseño que se deben conservar

1. **Mínimo privilegio:** cada usuario recibe únicamente los permisos que necesita para su función.
2. **Autorización en servidor:** ocultar un botón o una sección no constituye seguridad. Las comprobaciones deben aplicarse en las reglas de Firebase y, si se incorpora, en el backend.
3. **Propiedad de datos:** un estudiante solo puede leer sus entregas, calificaciones, horario y mensajes privados. No debe poder consultar documentos de otro estudiante cambiando un identificador.
4. **Alcance docente:** el acceso de un docente depende de las asignaturas y grupos que tenga asignados, no solo de tener el rol `docente`.
5. **Coordinación limitada por función:** las consultas y modificaciones deben definirse por proceso y quedar auditadas cuando corresponda.
6. **Administración no equivale a acceso ilimitado:** las operaciones sensibles deben estar restringidas, registradas y asignadas a personal autorizado.
7. **Datos sensibles:** no guardar contraseñas, calificaciones reales, documentos de identidad ni información de acudientes en `localStorage`.
8. **Auditoría y ciclo de vida:** registrar altas/bajas de roles, cambios de permisos, calificaciones y correcciones de asistencia; revocar accesos cuando cambien las asignaciones.
9. **Validación institucional:** confirmar esta matriz con directivos y responsables de protección de datos antes de conectarla a información real.

## Modelo de datos sugerido para la siguiente fase

- `users/{uid}`: nombre visible, estado de cuenta y datos mínimos del perfil; el rol no debe ser editable por el propio usuario.
- `classrooms/{classId}`: materia, grupo, docente(s) asignado(s), estudiantes matriculados y horario.
- `assignments/{assignmentId}`: `classId`, autor, instrucciones, fecha de vencimiento, estado y criterios de evaluación.
- `submissions/{submissionId}`: `assignmentId`, `studentUid`, referencias de archivo, comentario, fecha de entrega, calificación y retroalimentación.
- `announcements/{announcementId}` y `materials/{materialId}`: clase de alcance, autor y fechas.
- `conversations/{conversationId}` y `messages/{messageId}`: participantes explícitos y autorización por participante.
- `auditLogs/{eventId}`: actor, acción, recurso y fecha para operaciones sensibles; acceso restringido.

Las rutas y los nombres son orientativos, no una decisión final de esquema. Antes de implementar Firestore Storage Rules, hay que validar el modelo, los flujos de matrícula, los permisos por grupo y las políticas de retención.
