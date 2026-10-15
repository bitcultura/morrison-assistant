# n8n: conexión MORRISON sin afectar BitCultura

**Estado: workflow preparado, pero NO importado, NO habilitado ni ejecutado.** El conector de BitCultura disponible en ChatGPT solo permite lecturas; por eso se requiere configuración dentro de n8n.

## Prueba read-only, sin credenciales

1. En tu n8n abre **Workflows → Import from File**.
2. Importa `n8n/MORRISON-health-readonly.json` desde este repositorio. **No pegues credenciales en GitHub**.
3. Comprueba que hay solo **Webhook GET** → **Respond to Webhook**; verifica la respuesta JSON fija.
4. Prueba primero con la URL de prueba que proporciona n8n. Mantén inactivo durante revisión.
5. Tras validar, activa solamente el workflow MORRISON dedicado. No cambies flujos de BitCultura.
6. Copia la URL **HTTPS de producción** del webhook fijo en MORRISON → Automatizaciones → Probar conexión. La web rechaza URLs con usuario/contraseña y parámetros; no necesitas token para este endpoint de salud.

Este webhook solo comprueba que ese endpoint responde. No demuestra que BitCultura funcione ni habilita acciones.

## Diseño de integración real (pendiente)

**No exponer el API token de n8n** ni el token de GitHub en el navegador público. Para automatizaciones y sincronización se necesita un backend autenticado que:
- valide identidad y permisos;
- cifre o limite datos privados;
- separe lectura de escritura;
- genere solicitud con identificador único, estado y expiración;
- espere aprobación explícita antes de acciones que cambian servicios;
- almacene auditoría y permita recuperación/reversión;
- tenga límites de uso y comprobación de costo adicional $0.

**No usar webhooks públicos de escritura con CORS `*` y sin autenticación.** Las plantillas presentes aquí no permiten ejecutar acciones. Integrar servicios solo tras configurar credenciales privadas y probar sus permisos.
