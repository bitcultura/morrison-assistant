# MORRISON — Plan de implementación v1.0

**Equipos:** Samsung Galaxy A16 5G SM-A166M/DS (voz y movilidad); Samsung Galaxy Tab A9 SM-X110 (panel). **Costo adicional objetivo:** CLP $0, sin uso de API de OpenAI, servicios pagos ni despliegues Railway nuevos.

## Capa 1 — Inteligencia / identidad

**Preparado:** `01_PROMPT_MAESTRO_MORRISON.md`. Copiar a instrucciones del proyecto MORRISON en ChatGPT o usarlo como documento de referencia. Conversar por ChatGPT Plus en la aplicación oficial.

**Voz:** los botones de la web usan `speechSynthesis`; buscan voz española masculina entre las instaladas. Si no existe, el navegador elige otra. La escucha de palabra «Morrison» es experimental en navegadores compatibles, requiere micrófono y página visible, y no funciona garantizadamente con pantalla bloqueada. Para activación global permanente se necesita una etapa Android posterior, sujeta a restricciones de energía y privacidad.

## Capa 2 — Panel visual

**Programado y entregado:** PWA estática para navegador Android, `index.html`, `app.js`, `style.css`, `manifest.webmanifest`, `sw.js`, `icon.svg`.

- Vista de inicio con tarjetas de estado basadas en datos locales reales.
- Proyectos editables, agenda y lista de tareas con completado y eliminación, notas locales.
- Buscador guiado a fuentes oficiales y académicas (el usuario valida el resultado).
- Enlace directo a ChatGPT Plus. La PWA NO incorpora ChatGPT como API.
- Exportación e importación de respaldo JSON (transferencia manual entre dispositivos).
- Módulo n8n de comprobación de salud de un webhook aislado, sin alterar BitCultura.
- Módulo de hogar inteligente informativo, sin control de hardware habilitado.

**Para usar ahora:** abre `MORRISON_demostracion.html` en un navegador compatible (archivo de una sola pieza). Para instalar como PWA y habilitar todas las funciones web, hospeda la carpeta en HTTPS gratuito, por ejemplo GitHub Pages en un repositorio exclusivo nuevo creado por el usuario. No alojar información privada ni credenciales en un repositorio público. Los datos personales se guardan en el navegador mediante `localStorage`, no en el repositorio.

**Sincronización:** todavía no automática. Exportar JSON desde el primer dispositivo e importarlo en el segundo. Al editar ambos por separado, hay riesgo de sobrescribir cambios. La versión futura podrá añadir sincronización autenticada de extremo a extremo con una infraestructura gratuita viable, después de revisar privacidad y permisos.

## Capa 3 — Operaciones / n8n

**Verificado en solo lectura (15 octubre 2026):** la conexión disponible de BitCultura muestra 14 workflows, todos inactivos al momento de la consulta. Esto no demuestra que n8n esté caído. No se ejecutó, activó ni editó ningún workflow.

**Preparado:** `n8n/MORRISON-health-readonly.json` para importar en n8n en una nueva automatización. Responde JSON público mínimo y fijo de prueba; no lista workflows, no accede a credenciales y no realiza cambios. Activar solo después de importar y validar que el nuevo webhook no colisiona con otros.

**Conexión:** activar manualmente el workflow MORRISON, copiar su URL HTTPS de producción `/webhook/morrison-v1-health` al panel, pulsar «Probar conexión». Dependiendo de la configuración n8n, requerirá cabecera CORS apropiada o una publicación del panel en el origen permitido. **No colocar tokens o claves en la URL ni en JavaScript del navegador.**

**Próxima integración segura:** capa backend autenticada con n8n para leer estados, luego comandos bajo lista de permisos con aprobación humana. Requiere diseño de autenticación y conectividad adecuados; no se incluye acceso arbitrario a workflows.

## Criterios de aceptación

| Prueba | Criterio | Estado de entrega |
|---|---|---|
| Abre en pantalla tipo tablet | Panel sin desbordamiento horizontal | Probar en dispositivo real |
| Abre en móvil | Menú desplegable y tarjetas reordenadas | Probar en dispositivo real |
| Guardar tarea y actualizar estado | Persiste tras recargar, localStorage permitido | Código implementado; prueba de persistencia real pendiente en Android |
| Crear nota/proyecto | Se ve en el panel | Implementado |
| Exportar/importar | Traslada datos mediante JSON | Implementado |
| Verificar n8n | Respuesta `system=MORRISON`, `status=ready`, `readonly=true` | Pendiente activación voluntaria del workflow |
| Voz | Respuesta TTS y reconocimiento según navegador | Pendiente prueba en Android |
| Sincronización inmediata entre equipos | Datos idénticos sin copiar archivos | No implementada; requiere infraestructura adicional |
| Ejecutar acciones de n8n | Aprobación y registro antes de escritura | No implementado por seguridad |
| Dispositivos del hogar | Control de luces/cámaras | No implementado; sin dispositivos vinculados |

## Después de validar v1

1. Publicar PWA en un repositorio exclusivo y HTTPS gratuitos (GitHub Pages si la cuenta lo permite).
2. Importar y activar el webhook n8n MORRISON de solo lectura.
3. Probar navegador, micrófono y guardado en Galaxy A16 y Tab A9.
4. Diseñar sincronización segura; evitar subir datos sensibles a repositorios públicos.
5. Conectar calendario y fuentes de datos con autorización explícita y mínimo privilegio.
6. Evaluar activación Android a nivel del sistema únicamente si se puede hacer gratuitamente y respetando batería/permisos.