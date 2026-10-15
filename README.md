# MORRISON 1.3 — Asistente personal Android

**[Abrir MORRISON](https://bitcultura.github.io/morrison-assistant/)**

Centro de control personal para **Galaxy A16 5G** + **Galaxy Tab A9**. Usa ChatGPT Plus desde la aplicación oficial, sin atribuirle créditos de API.

## Capacidades publicadas

- Panel futurista PWA responsive con proyectos, agenda, tareas, notas y economía personal.
- Voz local y reconocimiento de comandos con el navegador **abierto**; selector de voces españolas instaladas.
- Alertas de tareas vencidas/hoy; notificaciones del navegador **solo mientras está abierta la aplicación**.
- Consulta **real** de disponibilidad del gateway Railway + n8n, sin contraseñas.
- Inicio de sesión Auth0 mediante OAuth PKCE con Client ID público de una **Single Page Application**, configurada por el propietario.
- Copia remota opcional **cifrada de extremo a extremo en el navegador** (AES-GCM/PBKDF2), almacenada sobre el PostgreSQL Railway existente; cada usuario queda aislado por JWT.
- Sincronización bidireccional con verificación de revisiones **cada 45 segundos mientras la PWA esté visible y la sesión activa**, deteniéndose si ambos equipos editan a la vez. Requiere terminar la configuración SPA de Auth0 y una primera carga/restauración por dispositivo.
- Guardar la dirección HTTPS de un panel externo de automatización del hogar y abrirlo; **sin control de hardware instalado ni credenciales guardadas**.
- Respaldo local cifrado exportable/importable; GitHub Actions prueba interfaz móvil/tablet y comprueba el endpoint protegido.
- Herramientas ChatGPT para crear y editar borradores MORRISON en n8n, con OAuth RBAC y restricciones de seguridad. **No** permiten activar workflows ni editar BitCultura.

## Requisitos para habilitar sincronización

Consulta **[Puesta en marcha MORRISON 1.3](docs/MORRISON_1_3_PUESTA_EN_MARCHA.md)**. El usuario debe configurar una aplicación Auth0 **Single Page Application** con Allowed Callback URL exacta: `https://bitcultura.github.io/morrison-assistant/`, Allowed Web Origins: `https://bitcultura.github.io`, habilitar acceso a API del MCP y pegar en el panel exclusivamente su **Client ID** público (no secreto).

En cada dispositivo inicia sesión con la misma cuenta Auth0, introduce la misma frase de cifrado y configura el primer respaldo/restauración. Nunca introduzcas claves de n8n, GitHub o Railway en la web.

## Estado verificado y límites

- Railway MCP, n8n, PostgreSQL y FFmpeg están operativos; el diagnóstico MCP confirma acceso real a PostgreSQL (`sync_db_ready=true`).
- El MCP maneja lectura/escritura autenticadas por RBAC solo de **borradores MORRISON**. Hay **dos workflows MORRISON inactivos**; no inventar una URL de producción activa.
- El servicio HTTP de salud es el gateway independiente en Railway; **no** implica que el workflow n8n de salud esté activo.
- ChatGPT Plus funciona por separado. No existe un proceso de inteligencia artificial autónomo dentro de la PWA.
- La escucha con pantalla bloqueada y notificaciones push permanentes requieren Android nativo u otro servicio; no están implementadas.
- No hay dispositivos inteligentes vinculados. Las pruebas automatizadas de Chromium no sustituyen comprobaciones físicas en ambos Samsung.
- Los datos de trabajo en `localStorage` no están cifrados mientras la PWA funciona. La copia remota y el respaldo descargado sí están cifrados.
- Reutiliza infraestructura Railway Hobby existente; **no se añadió un servicio nuevo ni API OpenAI de pago**, pero el consumo de recursos de Railway podría variar.
- El repositorio es **público**. Prohibido agregar tokens, claves, contraseñas, identificaciones privadas o URLs secretas.

## Más información

- [Arquitectura y seguridad](docs/SEGURIDAD_Y_ARQUITECTURA.md)
- [n8n — importación separada y permisos](docs/INTEGRACION_N8N_SEGURA.md)
- [OAuth y auditoría MCP](docs/OAUTH_MCP_MORRISON.md)
- [Plan y criterios de aceptación](docs/PLAN_IMPLEMENTACION.md)
- [Seguimiento de pruebas y despliegues](https://github.com/bitcultura/morrison-assistant/actions)

Para instalar en Android abre el enlace en Chrome → **Instalar aplicación** o **Añadir a pantalla de inicio**. Después de un despliegue usa Ajustes → Buscar actualización.
