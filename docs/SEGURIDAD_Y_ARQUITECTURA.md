# Arquitectura y seguridad MORRISON 1.2

## Componentes

- **Teléfono:** Galaxy A16 5G, comandos y voz en primer plano.
- **Tablet:** Galaxy Tab A9, panel ampliado y organización.
- **Frontend:** GitHub Pages, HTML + JavaScript, instalable como PWA, service worker de caché.
- **Inteligencia:** ChatGPT Plus exclusivamente por interfaz oficial; la API de OpenAI no está incluida.
- **Datos locales:** `localStorage` para proyectos, agenda, notas y entradas económicas. No hay cuentas ni backend de la PWA.
- **Respaldo:** exportación cifrada con AES-256-GCM, contraseña derivada por PBKDF2-SHA256, 210 000 iteraciones, sal aleatoria y IV aleatorio. Importación **sustituye** información de destino.
- **n8n:** solo plantilla independiente de lectura. No hay integración autenticada ni ejecución remota.
- **Notion/Google/GitHub/Railway:** accesibles desde ChatGPT cuando el usuario da permisos, **no** desde la página estática por compartir suscripción.

## Límites de seguridad

Los contenidos locales se almacenan sin cifrar mientras la app los utiliza. Los respaldos sí están cifrados. El repositorio es público. Se debe evitar guardar datos sensibles. El modelo de permiso elegido requiere aprobación de acciones sensibles; aún no existe un ejecutor remoto, por lo que no se pueden disparar esas acciones desde el panel.

## Próxima arquitectura

Necesita backend seguro e identidad: sincronización entre dos equipos con solución de conflictos, bitácora, permisos por acción y servidor sin costos extras confirmados. n8n conectado tiene acceso de lectura en ChatGPT, no escritura. No exponer tokens en el frontend para acelerar el desarrollo.

## Tracking técnico

El registro del trabajo se encuentra en [GitHub Issues](https://github.com/bitcultura/morrison-assistant/issues), con tareas por prioridad y criterios de aceptación. Los estados pendientes no equivalen a funciones probadas.
