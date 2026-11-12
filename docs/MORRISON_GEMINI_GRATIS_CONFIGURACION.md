# MORRISON 2.0 — Activar Gemini gratuito de forma segura

**Estado: preparado, NO activado.** La app ya incluye el panel «MORRISON 2.0 · Conversación» y el gateway Railway tiene `POST /morrison/v2/chat`. La pasarela requiere sesión Auth0 de MORRISON Web, nunca expone la clave de Google en GitHub ni en el teléfono y se mantiene apagada mientras falte cualquiera de estas variables:

- `MORRISON_GEMINI_API_KEY` (secreto, configurar **solo** en Railway; nunca agregar al repositorio, chat, n8n público o navegador).
- `MORRISON_AI_ENABLED=1` (interruptor de habilitación; NO establecer hasta verificar cuenta sin facturación y servicio sano).

## Modelo y límites

- Modelo elegido: `gemini-3.5-flash-lite` (estable, nivel gratuito documentado en noviembre de 2026).
- Cada usuario dispone de **15 consultas por día** en el gateway: límite interno para evitar uso ilimitado, no una garantía de costo cero si la cuenta de Google estuviera asociada a facturación.
- Máximo de 8 turnos por solicitud, 1200 caracteres por turno y respuesta acotada.
- No se habilita Google Search grounding, ejecución de código, herramientas externas ni funciones multimodales; exclusivamente `generateContent` de texto.
- No hay reintentos automáticos con modelos de pago.
- La clave nunca se envía al teléfono. El token Auth0 vive únicamente en memoria mientras la aplicación esté abierta.
- **Privacidad:** Google puede utilizar las preguntas procesadas por el nivel gratuito para mejorar sus productos. MORRISON muestra consentimiento separado y no envía automáticamente tareas, notas, finanzas ni recuerdos. No se debe escribir información confidencial en las preguntas externas.

## Único procedimiento manual necesario para autorizar la cuenta gratuita

1. Abrir [Google AI Studio — API Keys](https://aistudio.google.com/apikey) con la cuenta Google elegida.
2. Crear o seleccionar un proyecto en **Free Tier**, sin cuenta de facturación vinculada. Si aparece **Set up billing / Configurar facturación**, no activarla.
3. Crear una clave de API para ese proyecto. No pegarla en ChatGPT, GitHub ni en MORRISON Web.
4. Abrir [Railway](https://railway.com/dashboard), proyecto **BitCultura Automation**, servicio **bitcultura-n8n-mcp**, sección **Variables**.
5. Crear variable secreta `MORRISON_GEMINI_API_KEY` con el valor copiado. La clave debe permanecer oculta y restringida a la API Gemini cuando sea posible.
6. **Antes de activar**, confirmar que **Postgres, n8n y bitcultura-n8n-mcp están online**, que las pruebas previas no muestran regresiones, y que no hay facturación habilitada en el proyecto de Google.
7. Agregar `MORRISON_AI_ENABLED=1` solo después de esa revisión; desplegar y confirmar estado del endpoint. Para apagar inmediatamente, quitar la variable o establecer `MORRISON_AI_ENABLED=0`.
8. En MORRISON: **Ajustes → Buscar actualización**, **Automatizaciones → Iniciar sesión Auth0**, después **Inicio → MORRISON 2.0 · Conversación**. Marcar el consentimiento de IA externa solo cuando se desee enviar preguntas generales. Primera prueba: «¿Por qué la Luna tiene fases?».

## Aceptación

- Sin credenciales: `POST /morrison/v2/chat` responde 401, sin invocar Google.
- Autenticado pero sin variables: responde `provider_not_enabled`, sin invocar Google.
- Con cuenta gratuita verificada, variables y permiso del usuario: responde usando `gemini-3.5-flash-lite`.
- Agotada la cuota interna: 429. Si Google agota su cuota gratuita: 503, **sin cambiar a un modelo de pago**.
- Los datos locales y el respaldo cifrado siguen operativos de forma independiente.
- Validar prueba real en Galaxy A16 y Tab A9, no solo simulación de Playwright.

**No activar IA solo porque la cuenta muestre créditos promocionales, porque se pueden agotar. El objetivo es un proyecto Free Tier sin facturación.**

Fuentes oficiales:
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/billing
- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
