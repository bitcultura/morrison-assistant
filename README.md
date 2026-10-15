# MORRISON — asistente personal Android

Panel web gratuito para **Samsung Galaxy A16 5G** y **Galaxy Tab A9**. Versión inicial 1.1, independiente de otros proyectos.

## Abrir la aplicación

Sitio previsto: https://bitcultura.github.io/morrison-assistant/

> La URL funciona solo después de habilitar **Settings → Pages → Build and deployment → Source: GitHub Actions** y terminar correctamente el despliegue.

En Android: abre la URL en Chrome, menú **⋮ → Añadir a pantalla de inicio / Instalar aplicación** (opciones según versión del navegador).

## Qué funciona hoy

- Panel responsivo, proyectos, lista de tareas, agenda manual y notas.
- Guardado local en el navegador de **cada dispositivo**, con exportación/importación manual de respaldos JSON.
- Síntesis y reconocimiento experimental de voz cuando Android y el navegador los permiten.
- Atajo a ChatGPT (se utiliza la aplicación oficial con tu plan existente, **sin API incluida**).
- Accesos para buscar fuentes oficiales y académicas.
- Prueba de conexión optativa a un webhook n8n **MORRISON separado y de solo lectura**.

## Qué **no** funciona todavía

- La palabra «Morrison» no despierta el dispositivo con la pantalla bloqueada ni garantiza escucha en segundo plano.
- No hay sincronización automática entre tablet y teléfono ni memoria compartida con ChatGPT.
- No ejecuta acciones n8n, no controla equipos domésticos y no vigila servidores 24/7.
- Un estado de n8n solo es válido después de probar el webhook independiente.
- Ninguna API de IA de pago está conectada.

## Publicación

El workflow [pages.yml](.github/workflows/pages.yml) despliega el contenido estático de este repositorio en GitHub Pages. En **Settings → Pages**, escoger **GitHub Actions** como fuente; después revisar **Actions** para comprobar que la publicación finalizó correctamente. No es necesario contratar Railway ni servicios adicionales.

## Seguridad

**Este repositorio es público.** Nunca subas claves, tokens, contraseñas, respaldos personales ni URL con credenciales. Los datos que anotes se guardan en localStorage del navegador y pueden perderse al borrar datos de navegación. Haz respaldos regularmente. No guardes información altamente sensible: el almacenamiento local no está cifrado por MORRISON.

El ejemplo n8n en [n8n/MORRISON-health-readonly.json](n8n/MORRISON-health-readonly.json) devuelve únicamente un JSON público fijo para comprobar conectividad; **no** está importado ni activado automáticamente.

## Documentación

- [Personalidad y reglas de MORRISON](docs/PROMPT_MAESTRO.md)
- [Plan y limitaciones de implementación](docs/PLAN_IMPLEMENTACION.md)

Meta: costo adicional **CLP $0**, compatible con el uso de ChatGPT Plus en su app oficial. No equivale a un asistente Android con acceso de sistema ni a una integración API de ChatGPT.