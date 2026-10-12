# Plan de integración Firebase

La v7 todavía no se conecta a Firebase. Este orden evita simular seguridad desde el navegador.

1. **Validación funcional:** aprobar modelo de datos y matriz de permisos con la institución.
2. **Proyecto y entornos:** configurar Firebase para desarrollo y producción, activar Authentication y registrar dominios autorizados. No pegar claves privadas ni credenciales de servicio en el frontend.
3. **Autenticación:** definir método de acceso, recuperación de cuenta, ciclo de desactivación y asignación de roles desde un proceso confiable.
4. **Emuladores:** implementar y probar reglas de Firestore y Storage con casos positivos y negativos para cada rol.
5. **Datos iniciales:** cargar asignaturas, grupos y usuarios mediante un proceso controlado; no importar el `localStorage` de la maqueta.
6. **Lecturas:** reemplazar una sección a la vez por consultas reales, empezando por perfil y clases.
7. **Entregas:** subir archivos a Storage con rutas y límites definidos; guardar metadatos en Firestore; verificar pertenencia al grupo y propiedad de la entrega.
8. **Calificación:** permitir que solo docentes asignados cambien calificación y retroalimentación. Validar campos permitidos y registrar auditoría.
9. **Mensajes:** verificar participación antes de leer o enviar y definir política de moderación/retención.
10. **Revisión previa a producción:** probar acceso cruzado entre estudiantes, docentes no asignados, usuarios desactivados y roles modificados; revisar copias de seguridad, privacidad y recuperación.

## Requisito pendiente para conectar

Se necesitará el identificador del proyecto Firebase, los métodos de autenticación aprobados y la confirmación del esquema. Las reglas de ejemplo no deben improvisarse ni desplegarse sin pruebas; el frontend nunca será la única capa de autorización.
