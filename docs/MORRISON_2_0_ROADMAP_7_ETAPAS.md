# MORRISON 2.0 — Programa de 7 etapas (JARVIS)

**Creado:** 2026-11-03. **Modalidad:** desarrollo por hitos, no ejecución automática en segundo plano. **Estado:** planificado. **Destino:** Samsung Galaxy A16 5G SM-A166M/DS y Galaxy Tab A9 SM-X110. **Repositorio:** [bitcultura/morrison-assistant](https://github.com/bitcultura/morrison-assistant).

## Reglas invariables

1. **Gasto adicional objetivo CLP $0**; no activar facturación de API, planes o recursos nuevos sin autorización. El uso de servicios Railway ya existentes puede generar consumo: controlar y detener ante límites.
2. Datos cifrados antes de respaldo remoto. Jamás incluir claves, contraseñas, tokens ni documentos privados en el repositorio GitHub público.
3. Las operaciones relevantes requieren propuesta visible, aprobación independiente y registro. Los 14 workflows originales de BitCultura no se editan ni se ejecutan para MORRISON.
4. OpenJarvis es una referencia modular, no una instalación completa aprobada en Railway o Android. ChatGPT Plus no incluye acceso gratuito a la API de OpenAI.
5. Respetar las restricciones de Android: PWA sin escucha garantizada con pantalla bloqueada y sin push permanente.
6. **No implementar todo a la vez.** Cada fase se cierra cuando pasa sus criterios; los rangos de fecha son objetivos de planificación y se ajustan a las pruebas reales.

## Cronograma y dependencias

| Etapa | Periodo objetivo | Entrega | Estado |
|---|---|---|---|
| 1 | 2026-11-03 a 2026-11-09 | Base estable y respaldo seguro | Por validar |
| 2 | 2026-11-10 a 2026-11-23 | Cerebro conversacional integrado | Programada |
| 3 | 2026-11-24 a 2026-12-07 | Voz masculina estilo JARVIS | Programada |
| 4 | 2026-12-08 a 2026-12-21 | Agente con herramientas y autorizaciones | Programada |
| 5 | 2026-12-22 a 2027-01-11 | Memoria, proyectos e investigación | Programada |
| 6 | 2027-01-12 a 2027-02-01 | Android avanzado | Programada |
| 7 | 2027-02-02 a 2027-02-15 | Calidad, seguridad y lanzamiento | Programada |

## Estado de partida verificado / afirmaciones acotadas

- Implementados: PWA GitHub Pages, acceso Auth0 PKCE, respaldo remoto cifrado con control de revisión, UI de voz y consultas a Wikipedia, módulo de proyectos/tareas/notas, servicio MCP y n8n.
- El usuario confirmó anteriormente respaldo revisión 1 restaurado en tablet y proyectos/tareas iguales; **no** equivale a una prueba de sincronización bidireccional en vivo.
- Railway: MCP, n8n, PostgreSQL y FFmpeg en línea al revisar el proyecto. Esto no demuestra que las herramientas finales estén integradas.
- La sincronización solo opera con la PWA visible, sesión Auth0 activa y frase de cifrado presente en memoria; se debe comprobar con ambos Samsung.
- No está implementado un cerebro generativo integrado, Kokoro integrado ni herramienta de agentes con escritura aprobada de extremo a extremo.

## Plan detallado

### Etapa 1 — Base estable y respaldo seguro

**Ventana:** 2026-11-03 → 2026-11-09. **Dependencia:** Ninguna; se ejecuta primero.
**Issues existentes relacionados:** [#1](https://github.com/bitcultura/morrison-assistant/issues/1), [#2](https://github.com/bitcultura/morrison-assistant/issues/2).

**Trabajo técnico**
- [ ] Auditar PWA instalada, controles de actualización y service worker sin borrar localStorage.
- [ ] Prueba real de sincronización A16↔Tab A9 con tarea temporal, revisión CAS y recuperación de conflictos.
- [ ] Revisar JWT Auth0, tokens en memoria, protección de endpoint y bitácora de incidentes.
- [ ] Congelar una referencia de datos cifrados antes de cualquier modificación estructural.

**Criterios para cerrar**
- [ ] Crear tarea temporal en A16 → aparece en A9 con revisión incrementada.
- [ ] Modificar la misma entidad en ambos dispositivos simultáneamente → se detecta conflicto y no se pierde información.
- [ ] Reinicio/actualización del servicio no borra tareas ni modifica la revisión remota por sí solo.

### Etapa 2 — Cerebro conversacional integrado

**Ventana:** 2026-11-10 → 2026-11-23. **Dependencia:** Etapa 1 aprobada.
**Issues existentes relacionados:** nueva fase independiente.

**Trabajo técnico**
- [ ] Diseñar interfaz de diálogo en Inicio con historial local de conversaciones y control de borrar.
- [ ] Implementar adaptador sustituible /morrison/v2/chat detrás de autenticación; nunca guardar claves en JavaScript público.
- [ ] Comparar proveedor con cuota gratuita con motor local viable; introducir límite duro de solicitudes y rechazo al agotarse.
- [ ] Empezar con preguntas genéricas sin adjuntar proyectos privados; envío de contexto personal solo tras opt-in explícito.
- [ ] Diferenciar respuesta confirmada, respuesta inferida y herramienta no disponible.

**Criterios para cerrar**
- [ ] Responder tres turnos seguidos dentro de MORRISON, con historial de la sesión.
- [ ] Sin clave o sin cuota: no cobra, no simula éxito y presenta modo local.
- [ ] No expone claves ni transmite notas privadas sin autorización.

### Etapa 3 — Voz masculina estilo JARVIS

**Ventana:** 2026-11-24 → 2026-12-07. **Dependencia:** Etapa 2 operativa para consultas.
**Issues existentes relacionados:** [#6](https://github.com/bitcultura/morrison-assistant/issues/6).

**Trabajo técnico**
- [ ] Probar Kokoro-82M em_alex con español en Galaxy A16 y Tab A9 (tiempos, memoria, batería).
- [ ] Conservar Web Speech Android como respaldo y selector persistente por dispositivo.
- [ ] Interrupción segura, indicador visible de grabación, manejo de micrófono denegado y permiso granular.
- [ ] No activar micrófono en segundo plano desde una PWA.

**Criterios para cerrar**
- [ ] La misma pregunta puede formularse por voz y obtener respuesta hablada dentro de MORRISON.
- [ ] Cambio de voz funciona o explica incompatibilidad sin bloquear consultas.
- [ ] Al salir de la PWA se detiene el micrófono.

### Etapa 4 — Agente con herramientas y autorizaciones

**Ventana:** 2026-12-08 → 2026-12-21. **Dependencia:** Etapa 2; motor de diálogo + identidad validada.
**Issues existentes relacionados:** [#3](https://github.com/bitcultura/morrison-assistant/issues/3), [#4](https://github.com/bitcultura/morrison-assistant/issues/4), [#7](https://github.com/bitcultura/morrison-assistant/issues/7), [#9](https://github.com/bitcultura/morrison-assistant/issues/9).

**Trabajo técnico**
- [ ] Registro explícito de herramientas: consultar agenda, tareas, estado n8n, proyectos; no acceso arbitrario.
- [ ] Separar leer → preparar propuesta → confirmar → ejecutar → auditar.
- [ ] Mantener BitCultura aislado y workflows MORRISON inactivos hasta aprobación explícita.
- [ ] Hacer idempotentes las operaciones y controlar permisos por acción y usuario.

**Criterios para cerrar**
- [ ] MORRISON puede consultar una tarea y preparar un recordatorio.
- [ ] Ninguna escritura se ejecuta sin aprobación explícita.
- [ ] Un intento no autorizado da rechazo y queda auditado.

### Etapa 5 — Memoria, proyectos e investigación

**Ventana:** 2026-12-22 → 2027-01-11. **Dependencia:** Etapas 2 y 4.
**Issues existentes relacionados:** [#5](https://github.com/bitcultura/morrison-assistant/issues/5), [#8](https://github.com/bitcultura/morrison-assistant/issues/8).

**Trabajo técnico**
- [ ] Separar historial de conversación, memoria elegida por usuario, datos de proyectos y registros operativos.
- [ ] Índice de documentos solo en almacenamiento privado autorizado y separado por proyecto.
- [ ] Investigar con fuentes primarias, fecha, enlaces y posibilidad de corregir o eliminar memorias.
- [ ] Registrar procedencia/fecha/estado de verificación; no almacenar información sensible en repositorio público.

**Criterios para cerrar**
- [ ] Contestar una pregunta sobre un proyecto mostrando fuente y fecha.
- [ ] El usuario puede corregir o borrar la memoria de MORRISON.
- [ ] MORRISON reconoce cuándo no tiene datos suficientes.

### Etapa 6 — Android avanzado

**Ventana:** 2027-01-12 → 2027-02-01. **Dependencia:** Etapas 1–5 estabilizadas.
**Issues existentes relacionados:** [#6](https://github.com/bitcultura/morrison-assistant/issues/6).

**Trabajo técnico**
- [ ] Evaluar accesorio Android nativo (si viable) para accesos rápidos, avisos y activación por palabra.
- [ ] Analizar restricciones de batería, servicio en primer plano y permiso de micrófono por cada Samsung.
- [ ] Desactivar escucha permanente por defecto; no intentar eludir controles de Android.
- [ ] Mantener PWA como alternativa principal si no puede ejecutarse gratis y de forma fiable.

**Criterios para cerrar**
- [ ] Prueba real documentada en A16 y Tab A9 de las funciones que sí soporta Android.
- [ ] Permisos visibles, opción de apagar micrófono y consumo de batería medido.
- [ ] Si voz con pantalla apagada no es viable, documentar límite sin prometerla.

### Etapa 7 — Calidad, seguridad y lanzamiento

**Ventana:** 2027-02-02 → 2027-02-15. **Dependencia:** Todas las anteriores.
**Issues existentes relacionados:** [#1](https://github.com/bitcultura/morrison-assistant/issues/1), [#2](https://github.com/bitcultura/morrison-assistant/issues/2), [#3](https://github.com/bitcultura/morrison-assistant/issues/3), [#4](https://github.com/bitcultura/morrison-assistant/issues/4), [#5](https://github.com/bitcultura/morrison-assistant/issues/5), [#6](https://github.com/bitcultura/morrison-assistant/issues/6), [#7](https://github.com/bitcultura/morrison-assistant/issues/7), [#8](https://github.com/bitcultura/morrison-assistant/issues/8), [#9](https://github.com/bitcultura/morrison-assistant/issues/9).

**Trabajo técnico**
- [ ] Pruebas Android, CI y pruebas adversarias de herramientas, autenticación, privacidad y conflictos.
- [ ] Medir latencia, errores de voz, consumo de memoria, disponibilidad y límites de cuota.
- [ ] Documento de arquitectura final, recuperación de respaldos, guía simple de uso y bitácora de versiones.
- [ ] Publicar solo tras controles de seguridad y aprobación; plan de retorno a versión anterior.

**Criterios para cerrar**
- [ ] Demostración completa voz → respuesta → herramienta autorizada → auditoría.
- [ ] Pruebas automáticas en verde y pruebas manuales de ambos Samsung.
- [ ] Sin gastos adicionales no autorizados ni filtración de credenciales o documentos.

## Política de releases

- Toda modificación pasa por validación estática y pruebas CI. Cambios de base de datos, Auth0, MCP o n8n se ejecutan por separado, nunca ocultos en una actualización visual.
- Primero se prueban tareas sintéticas; luego se solicita aprobación para pruebas con datos reales.
- No marcar una etapa como completada porque se creó un issue, un documento o una pantalla: requiere la prueba funcional indicada.
- **Prioridad próxima:** etapa 1 (sincronización sin pérdidas); después conversación segura y sin costo no autorizado (etapa 2).

## Mapa de seguimiento

Issues históricos existentes: [#1](https://github.com/bitcultura/morrison-assistant/issues/1), [#2](https://github.com/bitcultura/morrison-assistant/issues/2), [#3](https://github.com/bitcultura/morrison-assistant/issues/3), [#4](https://github.com/bitcultura/morrison-assistant/issues/4), [#5](https://github.com/bitcultura/morrison-assistant/issues/5), [#6](https://github.com/bitcultura/morrison-assistant/issues/6), [#7](https://github.com/bitcultura/morrison-assistant/issues/7), [#8](https://github.com/bitcultura/morrison-assistant/issues/8), [#9](https://github.com/bitcultura/morrison-assistant/issues/9).
