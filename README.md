# MORRISON 1.2 — Asistente personal Android

**[Abrir MORRISON](https://bitcultura.github.io/morrison-assistant/?v=120)**

Panel personal para **Galaxy A16 5G** + **Galaxy Tab A9**, con costo adicional de software **$0**. Usa ChatGPT Plus por separado, **sin API OpenAI de pago**.

## Funcionalidades disponibles

- Panel oscuro adaptativo, instalable en ambos Android.
- Guardado local de proyectos, tareas y notas; carga guiada de nombres de proyectos (sin inventar sus avances).
- Voz de síntesis y reconocimiento experimentales **solo con la app abierta**. Comando probado «Morrison, abre proyectos»; la nueva versión añade «Morrison, abre economía» y «Morrison, agrega tarea ...» con confirmación.
- Economía personal: ingresos, gastos, balance de movimientos y meta CLP. Datos manuales, **no una promesa de ganancias**.
- Exportación e importación manual de archivos de respaldo **cifrados** con contraseña.
- Integración n8n de **salud/read-only** preparada como JSON, pero no importada ni activada.
- Actualización de PWA optimizada con controles y verificación automática de sintaxis en GitHub Actions.

## Importante

- **No existe sincronización automática** entre equipos. El respaldo cifrado es una transferencia manual que **sobrescribe** los datos del dispositivo de destino.
- Los datos locales normales **no están cifrados en reposo**. No introduzcas secretos ni datos bancarios en el panel.
- La activación con pantalla bloqueada, asistentes autónomos, control del hogar, conectores remotos y agenda compartida **no están implementados**.
- El repositorio es **público**; jamás agregar contraseñas, URL de webhook con secretos, tokens ni datos privados.

## Instalación y documentación

- [Instalación, actualización y pruebas Android](docs/INSTALACION_ANDROID_Y_PRUEBAS.md)
- [Arquitectura y seguridad](docs/SEGURIDAD_Y_ARQUITECTURA.md)
- [n8n — importación separada y permisos](docs/INTEGRACION_N8N_SEGURA.md)
- [Prompt maestro de personalidad](docs/PROMPT_MAESTRO.md)
- [Plan de implementación](docs/PLAN_IMPLEMENTACION.md)
- [Seguimiento de trabajo por prioridad](https://github.com/bitcultura/morrison-assistant/issues)

En Android abre el enlace con Chrome y elige **Instalar aplicación** o **Añadir a pantalla de inicio**. En **Ajustes → Buscar actualización** puedes verificar nuevas versiones sin borrar datos locales. Si existe caché antigua, entra mediante `?v=120#ajustes` y recarga.

## Verificación de calidad

`.github/workflows/pages.yml` valida sintaxis del JavaScript de la extensión y de los scripts integrados, el HTML básico y el manifiesto antes de publicar. Esto **no sustituye** probar voz, micrófono, guardado y sincronización manual en teléfonos reales.

## Integración con ChatGPT

MORRISON no es un cliente conectado a la API de ChatGPT. Abre la aplicación web oficial y aprovecha la suscripción Plus existente. Las autorizaciones de plugins dentro de ChatGPT **no son permisos transferibles al sitio público**.

La seguridad, confidencialidad de datos y el costo $0 mandan sobre acelerar funciones.
