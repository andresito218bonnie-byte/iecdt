# Modelo de datos propuesto — Aula Virtual IE Ciudad de Tunja

**Estado:** borrador técnico para revisión. No está conectado a Firebase y no representa una política institucional aprobada.

## Principios

- Identificadores estables; las relaciones usan `uid`, `classId`, `assignmentId` y similares, no nombres visibles.
- Separar el perfil básico de la asignación de roles. El usuario no puede asignarse su propio rol.
- Mantener matrículas y asignaciones docentes como relaciones explícitas por grupo/asignatura.
- Guardar fechas como timestamps y definir zona horaria institucional (propuesta inicial: `America/Bogota`).
- Los archivos van en Cloud Storage; Firestore guarda metadatos y rutas, no bytes ni contenido binario.
- Las calificaciones y entregas son privadas para el estudiante propietario; docentes acceden solo a clases/grupos asignados.
- Los datos de ejemplo del frontend no deben migrarse automáticamente a datos institucionales reales.

## Colecciones propuestas en Cloud Firestore

### `users/{uid}`

Campos mínimos: `displayName`, `email`, `status` (`active`/`disabled`), `createdAt`, `updatedAt`. Evitar guardar contraseñas, números de documento o datos sensibles que no sean necesarios. La autenticación se delega a Firebase Authentication.

### `userRoles/{uid}`

`roles`: arreglo controlado por personal autorizado (`student`, `teacher`, `coordination`, `admin`), `updatedAt`, `updatedBy`. En una primera implementación conviene un rol institucional principal y permisos adicionales explícitos solo si el flujo lo requiere. No permitir escritura del propio documento por el usuario.

### `classrooms/{classId}`

`subjectName`, `grade`, `group`, `room`, `schedule[]`, `teacherUids[]`, `studentUids[]`, `status`, `createdAt`, `updatedAt`. Si la matrícula crece, mover las listas a subcolecciones de membresía para evitar documentos grandes y facilitar las reglas.

### `classrooms/{classId}/members/{uid}`

`membershipRole` (`student`/`teacher`), `status`, `joinedAt`, `assignedBy`. Esta relación define el alcance de acceso; un rol global por sí solo no concede acceso a todas las clases.

### `assignments/{assignmentId}`

`classId`, `title`, `instructions`, `createdBy`, `dueAt`, `status`, `maxScore`, `createdAt`, `updatedAt`. La regla debe comprobar que `createdBy` sea docente asignado al `classId` y que el estudiante pertenezca al grupo para consultar/entregar.

### `submissions/{submissionId}`

`assignmentId`, `classId`, `studentUid`, `fileRefs[]`, `comment`, `submittedAt`, `status`, `score`, `feedback`, `gradedBy`, `gradedAt`. El cliente estudiante no debe poder establecer o cambiar `score`, `feedback`, `gradedBy` ni `gradedAt`.

### `announcements/{announcementId}` y `materials/{materialId}`

Campos comunes: `classId` (o alcance institucional explícito), `createdBy`, `title`, `body`/`fileRefs`, `publishedAt`, `status`. Validar que el autor pueda publicar en el alcance elegido.

### `conversations/{conversationId}` y `conversations/{conversationId}/messages/{messageId}`

La conversación contiene `participantUids[]`, `createdAt`, `updatedAt`, `contextClassId` opcional. Los mensajes contienen `senderUid`, `body`, `createdAt`, `readBy[]`. Solo participantes autorizados pueden leer/escribir. Coordinación y administración no deben leer conversaciones privadas automáticamente.

### `attendance/{recordId}`

`classId`, `studentUid`, `sessionAt`, `status`, `recordedBy`, `updatedAt`, `correctionReason` opcional. Solo docentes asignados registran asistencia y las correcciones autorizadas deben quedar auditadas.

### `auditLogs/{eventId}`

`actorUid`, `action`, `resourceType`, `resourceId`, `createdAt`, `details` mínimos. Restringir escritura a servicios/funciones confiables para eventos críticos; no permitir que un usuario altere o elimine los registros.

## Índices y consultas a definir

- Tareas por `classId` y `dueAt`.
- Entregas por `assignmentId` y `studentUid`.
- Conversaciones por `participantUids` y `updatedAt`.
- Horarios por grupo/docente y día de la semana.

Los índices exactos dependen de las consultas reales y deben probarse en el emulador de Firebase.

## Decisiones que la institución debe validar

1. ¿Un usuario puede tener varios roles al mismo tiempo?
2. ¿Quién puede consultar notas y asistencia: docente titular, director de grupo, coordinación y acudientes?
3. ¿Se requieren cuentas de acudientes y qué datos pueden consultar?
4. ¿Cómo se gestionan cambios de grupo, retiro de estudiantes y docentes sustitutos?
5. ¿Cuál es la política de retención/eliminación de entregas, mensajes y auditoría?
6. ¿Quién administra los permisos técnicos y revisa accesos privilegiados?

No conectar datos reales hasta resolver estas preguntas y revisar reglas con datos de prueba.
