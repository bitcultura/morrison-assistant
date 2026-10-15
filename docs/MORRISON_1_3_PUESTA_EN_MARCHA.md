# MORRISON 1.3 — Puesta en marcha de las seis capas operativas

**Estado de implementación (15-10-2026):** PWA publicada en GitHub Pages; módulo `morrison-connect.js` integrado. Railway MCP expone comprobación pública `GET /morrison/v1/health` y almacenamiento cifrado privado `GET/PUT /morrison/v1/snapshot`. Reutiliza PostgreSQL existente mediante `MORRISON_DATABASE_URL`; diagnóstico MCP `sync_db_ready=true` confirmó conexión real con PostgreSQL. Las dos automatizaciones MORRISON en n8n **siguen inactivas** y no se modificó BitCultura. No afirmar sincronización probada entre Samsung hasta completar los pasos de abajo.

## 1. Comprobar salud operativa
En [MORRISON](https://bitcultura.github.io/morrison-assistant/) → Automatizaciones → «Comprobar conexión». Utiliza el gateway Railway `https://bitcultura-n8n-mcp-production.up.railway.app/morrison/v1/health`.

La respuesta `{"system":"MORRISON","status":"ready","readonly":true}` (más metadatos) implica que el servidor puede consultar n8n mediante su API privada. Es **diferente** del webhook de n8n `/webhook/morrison-v1-health`, que sigue inactivo; no confundir la disponibilidad del gateway con un workflow activado.

## 2. Configurar Auth0 para el panel web

ChatGPT usa su propio cliente OAuth: **no** son permisos transferibles al sitio GitHub Pages. No incorporar jamás el secreto del cliente OAuth, contraseñas, API keys ni tokens en GitHub.

La cuenta administradora debe crear una aplicación **Applications → Create Application → Single Page Web Applications** en el **mismo tenant** `dev-67r1qkd7ajuaxlr0`.

- Tipo **Single Page Application**, flujo Authorization Code + PKCE.
- **Allowed Callback URLs:** `https://bitcultura.github.io/morrison-assistant/`
- **Allowed Logout URLs:** `https://bitcultura.github.io/morrison-assistant/`
- **Allowed Web Origins:** `https://bitcultura.github.io`
- **Allowed Origins (CORS):** `https://bitcultura.github.io`
- API audience: `https://bitcultura-n8n-mcp-production.up.railway.app`; debe aceptar el scope de lectura `read:workflows` para el usuario autorizado.
- Asignar el rol `MORRISON MCP Editor` **solo** al usuario autorizado, si corresponde. Mantener Enable RBAC y Add Permissions in the Access Token.
- Copiar exclusivamente el **Client ID público** (no Client Secret) a MORRISON → Automatizaciones.

En MORRISON pulsa «Iniciar sesión Auth0». El navegador utiliza OAuth PKCE (`code_challenge_method=S256`), código de un solo uso, verificación `state` y token de acceso **solo en memoria**; al recargar puede ser necesario volver a iniciar sesión.

Si Auth0 rechaza el flujo, revisar Allowed Callback URLs/Web Origins y que la API permita a esa aplicación. No activar Implicit Flow ni insertar un secreto en la PWA.

## 3. Sincronización cifrada entre Samsung Galaxy A16 y Galaxy Tab A9

- En el primer equipo, entra con Auth0, escribe una **frase de cifrado de 12 o más caracteres**, pulsa «Consultar respaldo remoto» y luego «Subir copia cifrada». No se guarda la frase en la base de datos ni navegador.
- En el segundo equipo, inicia sesión con **la misma cuenta** y escribe **la misma frase de cifrado**. Pulsa «Restaurar copia remota» y confirma el reemplazo.
- Activa «Sincronizar automáticamente» en ambos equipos, con el panel abierto y sesión activa. El navegador comprobará diferencias cada 45 segundos mientras esté visible.
- El servidor almacena solo un sobre cifrado AES-GCM con PBKDF2-SHA256 (250 000 iteraciones). La identidad se verifica mediante JWT Auth0 y cada usuario tiene un registro independiente con control de versión.
- **Si hay cambios simultáneos**, la sincronización se detiene en lugar de sobrescribirlos. Exporta respaldo cifrado local antes de resolver diferencias; la app todavía no hace fusión inteligente.
- Si cierras la PWA o expira el token, no hay sincronización en segundo plano; debes volver a iniciar sesión. Esta limitación evita crear la falsa impresión de un proceso permanente.
- **Importante:** los datos usados por la app continúan sin cifrarse en el almacenamiento local del navegador, aunque la copia del servidor sí está cifrada.

## 4. Voz e inteligencia

En Ajustes → Voz MORRISON se puede seleccionar y probar una voz española instalada. Preferir una voz masculina **depende de que Android la tenga**; ni el género ni la calidad pueden prometerse.

Los comandos de voz locales necesitan la página abierta y permisos de micrófono. ChatGPT Plus se abre por separado y no incorpora créditos de API. La escucha con pantalla bloqueada requiere una aplicación Android nativa y autorizaciones del sistema, no realizables solamente con una PWA.

## 5. Alertas y aprobaciones

Agenda → «Revisar tareas pendientes» comprueba tareas de hoy o vencidas. «Permitir notificaciones» solicita autorización al navegador y emite avisos mientras la página esté abierta. No se han configurado notificaciones push de servidor ni avisos garantizados con la aplicación cerrada.

Las operaciones remotas no se ejecutan por una frase de voz libre: las de escritura siguen limitadas por los scopes y permisos Auth0 y una lista segura de borradores MORRISON. No habilitar acciones sensibles sin confirmación.

## 6. Dispositivos y pruebas

En Hogar inteligente se puede guardar y abrir **únicamente una URL HTTPS** de un controlador externo compatible, sin contraseñas o tokens. **No hay dispositivos vinculados ni órdenes remotas habilitadas** porque no se han identificado los equipos y protocolos reales.

GitHub Actions ejecuta pruebas sintácticas y automatizadas en Chromium para móvil de 412×915 y tablet 800×1280, navegación, proyectos, tareas, economía, alertas y límites de OAuth. Un emulador **no sustituye** pruebas reales en los Samsung, especialmente micrófono, voz, permisos de notificación y batería.

## Seguridad y costos
- Reutiliza Railway Hobby, PostgreSQL y n8n ya existentes. No se han creado servicios de pago ni se usa la API OpenAI; el **consumo de recursos del plan Railway existente podría variar**, y debe vigilarse.
- Mantener el repositorio público **sin secretos**.
- CORS del gateway privado restringido exactamente a `https://bitcultura.github.io`; cada copia requiere JWT Auth0 y tabla separada de datos cifrados.
- El servidor no conoce la frase de cifrado ni descifra los registros.
- Los 14 workflows de BitCultura no deben activarse ni modificarse como parte de MORRISON.
