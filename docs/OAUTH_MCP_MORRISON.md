# MORRISON — OAuth y permisos del MCP n8n

> **Actualización comprobada — 15 octubre 2026:** autorización de escritura MORRISON resuelta mediante verificación conjunta del JWT `scope=read:workflows` y los permisos RBAC `permissions: [read:workflows, write:workflows]` de Auth0. Las dos cuentas del complemento devolvieron `write_tool_authorized=true`. Se creó mediante MCP el workflow inactivo MORRISON «Capacidades públicas» (ID `pyA9VhZQ1yer67iC`) y se editó exitosamente su respuesta fija a `version:2`. Verificación posterior: 16 workflows en n8n, 2 MORRISON inactivos, cuatro servicios Railway en línea. **No** se activó ningún workflow ni se implementó sincronización automática de la PWA. El resto del documento registra etapas y decisiones previas, algunas ya superadas.


**15-10-2026 — estado verificado:** la API Auth0 tiene los permisos `read:workflows` y `write:workflows`; el usuario creó y asignó el rol `MORRISON MCP Editor` y habilitó RBAC. El MCP Railway está desplegado; las cuatro herramientas de lectura funcionan y la corrección de autorización por herramienta (OAuth step-up) está **desplegada y verificada en código vivo**. El token de ChatGPT **no está demostrado que incluya** `write:workflows` y el catálogo actual del plugin solo muestra las cuatro herramientas de lectura.

## Arquitectura y principio de mínimo privilegio

- El MCP usa Auth0 OAuth y valida JWT (issuer, audience, firma RS256).
- Todas las llamadas requieren `read:workflows`.
- **Solo** `n8n_create_workflow` y `n8n_update_workflow` pueden tener alcance de escritura, y también exigen `write:workflows`.
- Su código limita la escritura a nombres que comienzan por MORRISON, drafts de 1–5 nodos con tipos `webhook`/ `respondToWebhook`, webhook solo GET y prohíbe edición de workflows activos.
- `n8n_activate_workflow` y `n8n_deactivate_workflow` **no** se exponen al cliente. No habilitar ejecución ni activación durante la primera prueba.
- Los workflows de BitCultura permanecen fuera de alcance.

## Bloqueo de permisos identificado y corrección aplicada

**Histórico (resuelto el 15-10-2026):** el servidor publicaba ambos scopes en `scopes_supported` pero el desafío inicial solo anunciaba lectura y una llamada de escritura fallaba con error JSON-RPC HTTP 200. Ya se desplegó la mejora: `tools/list` anuncia herramientas read/write con sus scopes, y `tools/call` responde HTTP 403 + `WWW-Authenticate` solo para escritura si falta `write:workflows`. El reto inicial continúa requiriendo únicamente lectura.

**Implementado en Railway:** mantener `read:workflows` para lecturas y enviar un desafío **HTTP 403** con `WWW-Authenticate: Bearer error="insufficient_scope", scope="read:workflows write:workflows", resource_metadata="https://bitcultura-n8n-mcp-production.up.railway.app/.well-known/oauth-protected-resource"` exclusivamente en las solicitudes a herramientas de escritura sin permiso. Los clientes MCP compatibles pueden ampliar la autorización en ese momento, sin exigir escritura durante la conexión inicial. Ver la guía oficial de MCP de `scopeChallenge` / `403 insufficient_scope`.

### Cambio concreto ya desplegado en Railway

No fue necesario modificar el desafío inicial de lectura. Se actualizaron **únicamente los dos bloques** indicados en el `index.tsx` del servicio `bitcultura-n8n-mcp`, conservando la validación JWT y `safeMorrisonDraft`. Esta sección conserva el código aplicado como registro para futuras auditorías.

En `tools/list`, mostrar las herramientas de edición con su esquema OAuth propio, incluso si el token actual es de solo lectura:

```ts
const visibleTools = tools.filter((t:any) =>
  READ_TOOLS.has(t.name) || WRITE_TOOLS.has(t.name)
).map((t:any) => ({
  ...t,
  securitySchemes: [{
    type: "oauth2",
    scopes: WRITE_TOOLS.has(t.name)
      ? ["read:workflows", "write:workflows"]
      : ["read:workflows"]
  }]
}));
return json({jsonrpc:"2.0",id,result:{tools:visibleTools}});
```

En `tools/call`, **antes** de invocar `callTool`, responder con un desafío de privilegio cuando falte el scope de escritura:

```ts
if (WRITE_TOOLS.has(name) && !writeAuthenticated) {
  return json(
    {error:"insufficient_scope",error_description:"Se requiere el permiso MORRISON write:workflows"},
    403,
    {"www-authenticate":
      'Bearer error="insufficient_scope", scope="read:workflows write:workflows", resource_metadata="' +
      oauthMetadataUrl + '"'}
  );
}
if (!READ_TOOLS.has(name) && !WRITE_TOOLS.has(name)) {
  return json({jsonrpc:"2.0",id,error:{code:-32601,message:"Tool not found"}});
}
```

**Comprobar que el bloque de `tools/call` sigue dentro de la verificación de JWT de lectura.** La función `callTool` ya ejecuta `safeMorrisonDraft` para los dos nombres de escritura. Tras el despliegue, una llamada con token read-only debe devolver HTTP 403 y un token con ambos scopes debe ver las herramientas de escritura. No incluir tokens en logs ni capturas.

**Alternativa operativa para un MCP personal:** anunciar ambos scopes en el desafío inicial y volver a autorizar el plugin ChatGPT. Solicita más permisos de los necesarios al conectarse, por lo que es menos recomendable; la pertenencia al rol Auth0 debe seguir comprobada.

## Comprobaciones antes de cambiar producción

1. Confirmar en Auth0 **Applications → APIs → [API MCP] → Settings**: RBAC y Add Permissions in the Access Token activados (usuario confirmó ambos).
2. Confirmar **User Management → Roles → MORRISON MCP Editor**: contiene ambos permisos y el usuario correcto está asignado (usuario confirmó).
3. Comprobar que el token de una **nueva** autorización solicita y obtiene `write:workflows` en el claim `scope` (no basta con `permissions`; el MCP actual lee `payload.scope`).
4. [x] Modificar el código MCP conservando allowlist y validación. Desplegado mediante staging en Railway el 15-10-2026; verificada disponibilidad posterior de los cuatro métodos de lectura.
5. Repetir las cuatro herramientas de lectura del MCP.
6. Mostrar que sin `write:workflows` las herramientas de escritura siguen bloqueadas.
7. [x] El borrador `MORRISON v1 — Salud pública mínima / solo lectura` ya fue importado manualmente y está inactivo en n8n. La prueba futura de escritura por MCP debe utilizar otro borrador de laboratorio; no duplicar el workflow.
8. [x] Verificado por el plugin el 15-10-2026: workflow ID `nCX68jGOGH5MBz3j`, inactivo, dos nodos esperados, ninguno con credenciales. La prueba HTTP de webhook permanece pendiente hasta que el workflow escuche en test o se active como producción. **Nunca usar un workflow BitCultura como prueba de escritura**.

## Qué NO hacer

- No publicar claves de n8n/Auth0/Railway en repositorio público, formularios de MORRISON o capturas.
- No conceder escritura a todos los usuarios ni desactivar la validación de JWT.
- No cambiar el prefijo MORRISON ni añadir nodos de código arbitrario, HTTP genérico o ejecución de comandos sin una revisión posterior.
- No confundir un `health` HTTP 200 con autorización de escritura o con un workflow ejecutado.
- No activar el workflow piloto antes de revisar la URL y acordar la prueba.

## Enlaces útiles

- [MCP — Auth con desafíos de alcance por herramienta](https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization)
- [Auth0 — scopes de API](https://auth0.com/docs/get-started/apis/scopes/api-scopes)
- [Archivo del workflow de salud](../n8n/MORRISON-health-readonly.json)
- [Panel n8n](https://n8n-production-d5cb.up.railway.app/)

## Prueba HTTP pendiente

**Prueba completada:** el endpoint `GET /webhook-test/morrison-v1-health` devolvió HTTP 200 el 15-10-2026 a las 16:05:40 UTC. La ejecución n8n `49` del workflow `nCX68jGOGH5MBz3j` figura `status=success`, modo `manual`, finalizada. Posteriores llamadas de prueba devolvieron 404 porque el webhook temporal ya no estaba registrado. **Esto verifica la ejecución inicial y la respuesta HTTP 200, pero no demuestra una conexión permanente ni confirma el JSON final enviado al navegador**. El workflow permanece inactivo en producción, y desde este chat solo está accesible el MCP de consulta (hasta renovar OAuth para escribir). No atribuir este 404 a una caída de Railway.
