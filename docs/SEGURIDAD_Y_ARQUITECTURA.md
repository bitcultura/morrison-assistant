# Arquitectura y seguridad MORRISON 1.3

## Tres capas

1. **Inteligencia:** ChatGPT Plus en aplicación oficial, sin API OpenAI de pago. Reconocimiento y síntesis de voz local Web Speech sujetos al navegador y a la visibilidad de la PWA.
2. **Interfaz:** GitHub Pages con HTML/JavaScript, módulos `morrison-ops.js` y `morrison-connect.js`, PWA offline parcial, proyectos, agenda, notas, economía, voz, alertas de navegador y controles de respaldo.
3. **Operaciones:** MCP Railway existente + API n8n + PostgreSQL. Auth0 valida issuer, audience, firma JWT y scope de lectura. La escritura MCP de borradores requiere permiso Auth0 `write:workflows` o el claim RBAC equivalente, además del scope de lectura. Protección de prefijo MORRISON y tipos de nodo permitidos. No hay herramientas de activar/desactivar workflows BitCultura.

## Backend y sincronización privada

- `GET /morrison/v1/health`: comprobación pública de la API n8n desde Railway. Sin datos privados ni tokens.
- `GET /morrison/v1/snapshot` y `PUT /morrison/v1/snapshot`: requieren Bearer JWT Auth0 válido con `read:workflows`, desde la PWA permitida, y verifican su `sub` (hash SHA256 con issuer) para aislar registros.
- CORS solo desde `https://bitcultura.github.io`; rutas privadas no exponen ningún secreto y responden 401 sin autenticación.
- PostgreSQL existente con tabla separada `morrison_encrypted_snapshots`, un registro por usuario, revisión incremental y control de concurrencia optimista. No guarda contraseña ni datos en claro: recibe un sobre AES-GCM cifrado en el cliente.
- PWA obtiene tokens mediante Authorization Code con PKCE (`S256`), verifica `state`, conserva token de acceso en memoria y borra parámetros de código de la URL al volver. La cuenta debe crear y configurar un cliente público Auth0 SPA; **no** reutilizar el Client Secret de ChatGPT.
- Cifrado cliente AES-256-GCM y PBKDF2-SHA256 con 250 000 iteraciones y salt/IV aleatorios. La frase se mantiene en memoria mientras la página está abierta; no se guarda en DB. Una frase débil podría sufrir ataques offline si se filtra el sobre cifrado.
- Sincronización bidireccional cada 45 s solo con pestaña visible, sesión activa, frase de cifrado y sincronización inicial establecida. Si ambos equipos modifican datos sin conexión se pausa para evitar pérdida. No fusiona conflictos de forma automática.
- Datos locales `localStorage` **sin cifrar**; respaldo exportable manual cifrado. Se prohíbe ingresar datos bancarios, claves o información sensible.
- No hay notificaciones push permanentes ni micrófono con pantalla bloqueada. Las notificaciones del navegador solo funcionan con la app abierta y permiso concedido.

## Servicios, límites y costos

- Reutiliza Railway Hobby, n8n, FFmpeg y PostgreSQL existentes. El diagnóstico confirma conexión al DB, pero la sincronización real entre ambos Samsung requiere autorización Auth0 SPA y pruebas.
- Los 2 workflows MORRISON están inactivos; los 14 workflows BitCultura no se alteran.
- Control doméstico: únicamente abre URL HTTPS de un panel externo proporcionado por el usuario. No hay credenciales, controles de dispositivos ni comandos reales configurados.
- El repositorio GitHub es **público**: no incluir secretos ni datos privados. La configuración del Client ID público no es un secreto.
- Objetivo de costo adicional $0 sin crear nuevos servicios, sujeto al consumo dentro de los límites contratados de Railway.

## Validación

CI verifica sintaxis JS, pruebas de interfaz y persistencia en Chromium, flujos n8n definidos, simulación móvil Galaxy A16 y tablet A9, respuesta de salud Railway, rechazo OAuth 401, CORS restringido y rechazo de origen externo. **No sustituye** pruebas físicas con ambos equipos ni una prueba autenticada de sincronización de extremo a extremo.

[Puesta en marcha y pendientes reales](MORRISON_1_3_PUESTA_EN_MARCHA.md)
